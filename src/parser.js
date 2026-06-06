export function parseJsonResponse(text) {
  const trimmed = text.trim();
  const direct = tryParse(trimmed);
  if (direct) return direct;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    const parsed = tryParse(fenced[1].trim());
    if (parsed) return parsed;
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const parsed = tryParse(trimmed.slice(start, end + 1));
    if (parsed) return parsed;
  }

  throw new Error("Could not parse model response as JSON.");
}

function tryParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
