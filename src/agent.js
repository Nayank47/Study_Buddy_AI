import { generateWithClaude } from "./claudeClient.js";
import { toJsonOutput, toMarkdownOutput } from "./formatter.js";
import { generateMockFlashcards } from "./mockClient.js";
import { parseJsonResponse } from "./parser.js";
import { chunkNotes, cleanNotes } from "./preprocessor.js";
import { validateFlashcards } from "./validator.js";

export async function createFlashcards(rawNotes, options = {}) {
  const notes = cleanNotes(rawNotes);
  const chunks = chunkNotes(notes, options.maxChunkChars);
  const selectedNotes = chunks[0];

  if (chunks.length > 1) {
    options.onWarning?.(
      `Input was split into ${chunks.length} chunks. v1 processes the first chunk; raise maxChunkChars or add merge logic for longer notes.`
    );
  }

  const rawResponse = options.mock
    ? await generateMockFlashcards(selectedNotes)
    : await generateWithClaude(selectedNotes, options);

  const parsed = parseJsonResponse(rawResponse);
  const result = validateFlashcards(parsed, selectedNotes);

  if (result.errors.length) {
    const message = [
      "Generated flashcards did not pass validation.",
      ...result.errors.map((error) => `- ${error}`)
    ].join("\n");
    const error = new Error(message);
    error.validation = result;
    throw error;
  }

  return {
    flashcards: result.flashcards,
    warnings: result.warnings,
    rawResponse,
    json: toJsonOutput(result.flashcards),
    markdown: toMarkdownOutput(result.flashcards)
  };
}
