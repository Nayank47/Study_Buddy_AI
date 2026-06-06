export function toJsonOutput(flashcards) {
  return JSON.stringify({ flashcards }, null, 2);
}

export function toMarkdownOutput(flashcards, { title = "Study Buddy Flashcards" } = {}) {
  const lines = [`# ${title}`, ""];

  for (const [index, card] of flashcards.entries()) {
    lines.push(`## ${index + 1}. ${card.question}`);
    lines.push("");
    lines.push(`**Answer:** ${card.answer}`);
    if (card.topic) lines.push(`**Topic:** ${card.topic}`);
    if (card.difficulty) lines.push(`**Difficulty:** ${card.difficulty}`);
    if (card.sourceHint) lines.push(`**Source hint:** ${card.sourceHint}`);
    lines.push("");
  }

  return lines.join("\n");
}

export function toConsoleList(flashcards) {
  return flashcards
    .map((card, index) => {
      const metadata = [card.topic, card.difficulty].filter(Boolean).join(" | ");
      return [
        `${index + 1}. ${card.question}`,
        `   ${card.answer}`,
        metadata ? `   (${metadata})` : ""
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}
