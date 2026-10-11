import fs from "node:fs";
import path from "node:path";
import { pipeline } from "@huggingface/transformers";

interface ResumeChunk {
  id: string;
  section: string;
  topic: string;
  text: string;
}

async function main() {
  const dataDir = path.join(process.cwd(), "data");
  const chunksPath = path.join(dataDir, "chunks.json");
  const outputPath = path.join(dataDir, "embeddings.json");

  const chunks: ResumeChunk[] = JSON.parse(
    fs.readFileSync(chunksPath, "utf-8")
  );

  // Load the embedding model once for this script.
  const extractor = await pipeline(
    "feature-extraction",
    "sentence-transformers/all-MiniLM-L6-v2"
  );

  const embeddings = [];

  for (const chunk of chunks) {
    const output = await extractor(chunk.text, {
      pooling: "mean",
      normalize: true,
    });

    embeddings.push({
      ...chunk,
      embedding: Array.from(output.data as Float32Array),
    });

    console.log(`Embedded: ${chunk.topic}`);
  }

  fs.writeFileSync(
    outputPath,
    JSON.stringify(embeddings),
    "utf-8"
  );

  console.log(`\nGenerated ${embeddings.length} embeddings.`);
  console.log(`Saved to: ${outputPath}`);
}

main().catch((error) => {
  console.error("Embedding generation failed:", error);
  process.exitCode = 1;
});