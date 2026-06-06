export const FLASHCARD_SCHEMA = {
  type: "object",
  required: ["flashcards"],
  additionalProperties: false,
  properties: {
    flashcards: {
      type: "array",
      minItems: 8,
      maxItems: 15,
      items: {
        type: "object",
        required: ["question", "answer"],
        additionalProperties: false,
        properties: {
          question: { type: "string", minLength: 12 },
          answer: { type: "string", minLength: 8 },
          topic: { type: "string" },
          difficulty: { enum: ["easy", "medium", "hard"] },
          sourceHint: { type: "string" }
        }
      }
    }
  }
};

export function exampleFlashcardShape() {
  return {
    flashcards: [
      {
        question: "What single concept should this flashcard ask about?",
        answer: "A concise answer supported directly by the notes.",
        topic: "Optional topic label",
        difficulty: "medium",
        sourceHint: "Optional short phrase from the notes"
      }
    ]
  };
}
