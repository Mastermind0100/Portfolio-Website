import { pipeline } from "@huggingface/transformers";
import type { FeatureExtractionPipeline } from "@huggingface/transformers";
import fs from "node:fs";
import path from "node:path";

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

interface ResumeChunk {
  id: string;
  section: string;
  topic: string;
  text: string;
  embedding: number[];
}

const embeddingsPath = path.join(
  process.cwd(),
  "data",
  "embeddings.json"
);

const chunks: ResumeChunk[] = JSON.parse(
  fs.readFileSync(embeddingsPath, "utf-8")
);

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      "sentence-transformers/all-MiniLM-L6-v2"
    ) as Promise<FeatureExtractionPipeline>;
  }

  return extractorPromise;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .trim();
}

const stopWords = new Set([
  "a", "an", "and", "are", "did", "do", "does", "for", "he", "her",
  "his", "how", "i", "in", "is", "it", "me", "my", "of", "on", "or",
  "she", "the", "their", "them", "they", "this", "to", "was", "we",
  "were", "what", "when", "where", "which", "who", "why", "you", "your",
]);

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/\s+/)
    .filter((word) => word.length > 1 && !stopWords.has(word));
}

const sectionIntents = [
  {
    section: "Education",
    terms: new Set([
      "academic", "college", "degree", "education", "educational",
      "graduate", "graduated", "qualification", "school", "studied",
      "studies", "study", "university",
    ]),
  },
  {
    section: "Work Experience",
    terms: new Set(["career", "employment", "experience", "job", "work", "worked"]),
  },
  {
    section: "Internship Experience",
    terms: new Set(["intern", "interned", "internship"]),
  },
  {
    section: "Selected Projects",
    terms: new Set(["project", "projects"]),
  },
  {
    section: "Technical Skills",
    terms: new Set(["expertise", "skill", "skills", "stack", "technology"]),
  },
  {
    section: "Publications",
    terms: new Set(["paper", "papers", "publication", "publications", "published"]),
  },
];

export async function retrieveResumeChunks(
  question: string,
  topK = 4
) {
  if (!question.trim()) return [];

  const extractor = await getExtractor();

  const output = await extractor(question, {
    pooling: "mean",
    normalize: true,
  });

  const queryEmbedding = Array.from(
    output.data as Float32Array
  );

  // 1. Rank chunks by semantic similarity.
  const semanticRanking = chunks
    .map((chunk) => ({
      ...chunk,
      semanticScore: chunk.embedding.reduce(
        (sum, value, index) =>
          sum + value * queryEmbedding[index],
        0
      ),
    }))
    .sort((a, b) => b.semanticScore - a.semanticScore);

  // 2. Rank chunks by keyword relevance.
  const queryWords = new Set(tokenize(question));
  const intendedSections = new Set(
    sectionIntents
      .filter(({ terms }) => [...queryWords].some((word) => terms.has(word)))
      .map(({ section }) => normalizeText(section))
  );

  const keywordRanking = chunks
    .map((chunk) => {
      const searchableText = normalizeText(
        `${chunk.section} ${chunk.topic} ${chunk.text}`
      );

      const chunkWords = new Set(tokenize(searchableText));

      let matches = 0;

      for (const word of queryWords) {
        if (chunkWords.has(word)) matches++;
      }

      const sectionMatch = intendedSections.has(normalizeText(chunk.section));

      return {
        ...chunk,
        keywordScore:
          (queryWords.size > 0 ? matches / queryWords.size : 0) +
          (sectionMatch ? 1 : 0),
      };
    })
    .sort((a, b) => b.keywordScore - a.keywordScore);

  // 3. Fuse rankings using Reciprocal Rank Fusion.
  const k = 60;
  const fusedScores = new Map<string, number>();

  for (const [index, chunk] of semanticRanking.entries()) {
    fusedScores.set(
      chunk.id,
      (fusedScores.get(chunk.id) ?? 0) + 1 / (k + index + 1)
    );
  }

  for (const [index, chunk] of keywordRanking.entries()) {
    fusedScores.set(
      chunk.id,
      (fusedScores.get(chunk.id) ?? 0) + 1 / (k + index + 1)
    );
  }

  const semanticScores = new Map(
    semanticRanking.map((chunk) => [
      chunk.id,
      chunk.semanticScore,
    ])
  );

  const keywordScores = new Map(
    keywordRanking.map((chunk) => [
      chunk.id,
      chunk.keywordScore,
    ])
  );

  const rankedChunks = chunks
    .map((chunk) => ({
      ...chunk,
      score:
        (fusedScores.get(chunk.id) ?? 0) +
        (intendedSections.has(normalizeText(chunk.section)) ? 0.02 : 0),
      semanticScore: semanticScores.get(chunk.id) ?? 0,
      keywordScore: keywordScores.get(chunk.id) ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  const sectionMatches = rankedChunks.filter((chunk) =>
    intendedSections.has(normalizeText(chunk.section))
  );

  return (sectionMatches.length > 0 ? sectionMatches : rankedChunks).slice(
    0,
    topK
  );
}
