const DEFAULT_MAX_CHARS = 12000;

export function cleanNotes(rawNotes) {
  if (typeof rawNotes !== "string") {
    throw new TypeError("Notes must be a string.");
  }

  return rawNotes
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \u00a0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function chunkNotes(notes, maxChars = DEFAULT_MAX_CHARS) {
  const cleaned = cleanNotes(notes);

  if (cleaned.length <= maxChars) {
    return [cleaned];
  }

  const paragraphs = cleaned.split(/\n{2,}/);
  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;

    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) chunks.push(current);

    if (paragraph.length <= maxChars) {
      current = paragraph;
    } else {
      const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [paragraph];
      current = "";
      for (const sentence of sentences) {
        const candidate = current ? `${current} ${sentence.trim()}` : sentence.trim();
        if (candidate.length > maxChars && current) {
          chunks.push(current);
          current = sentence.trim();
        } else {
          current = candidate;
        }
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}
