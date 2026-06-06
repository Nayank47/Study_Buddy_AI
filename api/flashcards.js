import { createFlashcards } from "../src/agent.js";
import { notesFromRequest } from "../src/requestNotes.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
    const notes = await notesFromRequest(body ?? {});
    const warnings = [];

    const result = await createFlashcards(notes, {
      mock: body?.mock === true,
      model: body?.model,
      onWarning: (warning) => warnings.push(warning)
    });

    response.status(200).json({
      flashcards: result.flashcards,
      warnings: [...warnings, ...result.warnings],
      json: result.json,
      markdown: result.markdown
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}
