import { retrieveResumeChunks } from "../lib/retriever";

async function main() {
  const question =
    process.argv.slice(2).join(" ") ||
    "What experience does Atharva have with RAG?";

  const results = await retrieveResumeChunks(question);

  console.log(`\nQuestion: ${question}\n`);

  for (const [index, chunk] of results.entries()) {
    console.log(`--- Result ${index + 1} ---`);
    console.log(`Topic: ${chunk.topic}`);
    console.log(`Section: ${chunk.section}`);
    console.log(`Score: ${chunk.score.toFixed(4)}`);
    console.log(chunk.text);
    console.log();
  }
}

main().catch(console.error);