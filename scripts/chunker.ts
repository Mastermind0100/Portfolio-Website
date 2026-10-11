import fs from "fs";
import path from "path";

interface ResumeChunk {
  id: string;
  section: string;
  topic: string;
  text: string;
}

const resumePath = path.join(process.cwd(), "data", "resume.md");
const outputPath = path.join(process.cwd(), "data", "chunks.json");

const markdown = fs.readFileSync(resumePath, "utf-8");

const lines = markdown.split("\n");

const chunks: ResumeChunk[] = [];

let currentSection = "";
let currentTopic = "";
let currentContent: string[] = [];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function saveChunk() {
  const text = currentContent
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!text) return;

  const topic = currentTopic || currentSection || "general";

  chunks.push({
    id: `${slugify(currentSection)}-${slugify(topic)}-${chunks.length + 1}`,
    section: currentSection,
    topic,
    text,
  });

  currentContent = [];
}

for (const line of lines) {
  const trimmed = line.trim();

  // # Section
  if (/^# /.test(trimmed)) {
    saveChunk();

    currentSection = trimmed.replace(/^# /, "").trim();
    currentTopic = "";

    continue;
  }

  // ## Topic
  if (/^## /.test(trimmed)) {
    saveChunk();

    currentTopic = trimmed.replace(/^## /, "").trim();

    continue;
  }

  // ### Subtopic
  if (/^### /.test(trimmed)) {
    saveChunk();

    const subtopic = trimmed.replace(/^### /, "").trim();

    currentTopic = currentTopic
      ? `${currentTopic} — ${subtopic}`
      : subtopic;

    continue;
  }

  currentContent.push(line);
}

saveChunk();

fs.writeFileSync(
  outputPath,
  JSON.stringify(chunks, null, 2),
  "utf-8"
);

console.log(`Created ${chunks.length} chunks.`);
console.log(`Output: ${outputPath}`);