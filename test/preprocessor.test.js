import test from "node:test";
import assert from "node:assert/strict";
import { cleanNotes, chunkNotes } from "../src/preprocessor.js";

test("cleanNotes normalizes whitespace", () => {
  assert.equal(cleanNotes(" A\t messy\r\n\r\n\r\n note. "), "A messy\n\n note.");
});

test("chunkNotes splits long notes without dropping content", () => {
  const chunks = chunkNotes("First paragraph has a useful sentence.\n\nSecond paragraph has another useful sentence.", 45);
  assert.equal(chunks.length, 2);
  assert.match(chunks.join("\n"), /First paragraph/);
  assert.match(chunks.join("\n"), /Second paragraph/);
});
