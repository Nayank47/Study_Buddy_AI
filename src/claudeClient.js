import { buildFlashcardPrompt } from "./prompt.js";

const DEFAULT_MODEL = "claude-sonnet-4-5";

export async function generateWithClaude(notes, options = {}) {
  const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
  const model = options.model ?? process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY. Set it in your environment or run with --mock.");
  }

  let Anthropic;
  try {
    ({ default: Anthropic } = await import("@anthropic-ai/sdk"));
  } catch (error) {
    throw new Error(
      "Missing dependency @anthropic-ai/sdk. Run npm install before using the real Claude API.",
      { cause: error }
    );
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: options.maxTokens ?? 4000,
    temperature: options.temperature ?? 0.2,
    messages: buildFlashcardPrompt(notes, options)
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("Claude returned an empty response.");
  }

  return text;
}
