import { exampleFlashcardShape, FLASHCARD_SCHEMA } from "./schema.js";

export function buildFlashcardPrompt(notes, { minCards = 8, maxCards = 15 } = {}) {
  return [
    {
      role: "user",
      content: `You are a Study Buddy Agent that converts messy student notes into study-ready flashcards.

Create ${minCards}-${maxCards} high-quality Q&A flashcards from the notes.

Rules:
- Use only information supported by the notes.
- Make every card atomic: one concept, fact, definition, cause, comparison, or process step.
- Avoid vague questions like "What is important about this topic?"
- Avoid duplicates and near-duplicates.
- Prefer answerable questions a student could review without seeing the notes.
- Keep answers concise but complete.
- Include difficulty when it is useful: easy, medium, or hard.
- Include a short topic label when it helps organize the set.

Return only valid JSON. Do not wrap it in markdown.

JSON schema:
${JSON.stringify(FLASHCARD_SCHEMA, null, 2)}

Example shape:
${JSON.stringify(exampleFlashcardShape(), null, 2)}

Notes:
${notes}`
    }
  ];
}
