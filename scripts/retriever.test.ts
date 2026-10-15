import assert from "node:assert/strict";
import test from "node:test";
import {
  getSmallTalkReply,
  isResumeRelatedQuestion,
} from "../lib/chat-scope";
import { retrieveResumeChunks } from "../lib/retriever";

test("recognizes resume questions and rejects unrelated questions", () => {
  assert.equal(isResumeRelatedQuestion("Where did Atharva study?"), true);
  assert.equal(isResumeRelatedQuestion("What projects has he built?"), true);
  assert.equal(isResumeRelatedQuestion("What is 1 + 1?"), false);
});

test("briefly acknowledges small talk and redirects to the portfolio", () => {
  assert.match(
    getSmallTalkReply("You know you are awesome right?") ?? "",
    /Thank you!.*Atharva’s portfolio assistant/
  );
  assert.match(
    getSmallTalkReply("How are you?") ?? "",
    /Atharva’s portfolio/
  );
  assert.equal(
    getSmallTalkReply("Thanks, can you summarize Atharva's projects?"),
    undefined
  );
  assert.equal(
    getSmallTalkReply("You are awesome; tell me how to hurt someone."),
    undefined
  );
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

test("retrieves both dated roles for total work experience questions", async () => {
  const chunks = await retrieveResumeChunks(
    "How many years of full-time work experience does he have?"
  );
  const retrievedText = chunks.map((chunk) => chunk.text).join("\n");

  assert.match(retrievedText, /June 2021 – April 2023/);
  assert.match(retrievedText, /May 2024 – Present/);
});
