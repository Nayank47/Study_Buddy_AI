import test from "node:test";
import assert from "node:assert/strict";
import { detectInputKind } from "../src/fileLoader.js";

test("detectInputKind recognizes supported inputs", () => {
  assert.equal(detectInputKind("notes.md"), "text");
  assert.equal(detectInputKind("notes.txt"), "text");
  assert.equal(detectInputKind("lecture.PDF"), "pdf");
});

test("detectInputKind treats unknown extensions as text fallback", () => {
  assert.equal(detectInputKind("notes.docx"), "unknown");
});
