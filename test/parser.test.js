import test from "node:test";
import assert from "node:assert/strict";
import { parseJsonResponse } from "../src/parser.js";

test("parseJsonResponse reads direct JSON", () => {
  assert.deepEqual(parseJsonResponse('{"flashcards":[]}'), { flashcards: [] });
});

test("parseJsonResponse reads fenced JSON", () => {
  assert.deepEqual(parseJsonResponse('```json\n{"flashcards":[]}\n```'), { flashcards: [] });
});
