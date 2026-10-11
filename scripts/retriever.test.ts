import assert from "node:assert/strict";
import test from "node:test";
import { isResumeRelatedQuestion } from "../lib/chat-scope";
import { retrieveResumeChunks } from "../lib/retriever";

test("recognizes resume questions and rejects unrelated questions", () => {
  assert.equal(isResumeRelatedQuestion("Where did Atharva study?"), true);
  assert.equal(isResumeRelatedQuestion("What projects has he built?"), true);
  assert.equal(isResumeRelatedQuestion("What is 1 + 1?"), false);
});

test("retrieves education evidence for education questions", async () => {
  const chunks = await retrieveResumeChunks("Where did Atharva study?");

  assert.ok(chunks.length > 0, "expected at least one resume chunk");
  assert.ok(
    chunks.some((chunk) => chunk.section === "Education"),
    "expected an education section result"
  );
});

test("retrieves project evidence for project questions", async () => {
  const chunks = await retrieveResumeChunks("What projects has Atharva built?");

  assert.ok(chunks.length > 0, "expected at least one resume chunk");
  assert.ok(
    chunks.some((chunk) => chunk.section === "Selected Projects"),
    "expected a selected projects result"
  );
});
