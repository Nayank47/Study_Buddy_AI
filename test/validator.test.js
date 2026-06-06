import test from "node:test";
import assert from "node:assert/strict";
import { validateFlashcards } from "../src/validator.js";

test("validateFlashcards accepts well-formed unique cards", () => {
  const flashcards = Array.from({ length: 8 }, (_, index) => ({
    question: `What is supported concept number ${index + 1}?`,
    answer: `Supported concept number ${index + 1} appears in the source notes.`,
    topic: `Concept ${index + 1}`,
    difficulty: "medium"
  }));

  const result = validateFlashcards(
    { flashcards },
    "Supported concept number appears in the source notes. ".repeat(8)
  );

  assert.equal(result.errors.length, 0);
  assert.equal(result.flashcards.length, 8);
});

test("validateFlashcards rejects duplicate cards", () => {
  const duplicate = {
    question: "What is the duplicate supported concept?",
    answer: "The duplicate supported concept appears in source notes."
  };

  const result = validateFlashcards(
    { flashcards: Array.from({ length: 8 }, () => duplicate) },
    "The duplicate supported concept appears in source notes."
  );

  assert.ok(result.errors.some((error) => error.includes("duplicate")));
});
