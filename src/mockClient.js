const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "before",
  "between",
  "could",
  "every",
  "from",
  "have",
  "into",
  "more",
  "other",
  "should",
  "than",
  "that",
  "their",
  "there",
  "these",
  "this",
  "through",
  "when",
  "where",
  "which",
  "while",
  "with",
  "would"
]);

export async function generateMockFlashcards(notes) {
  const sentences = notes
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 35);

  const cards = [];
  const usedTopics = new Set();

  for (const sentence of sentences) {
    const topic = extractTopic(sentence);
    const topicKey = topic.toLowerCase();

    if (usedTopics.has(topicKey)) continue;
    usedTopics.add(topicKey);

    cards.push({
      question: `What should you remember about ${topic}?`,
      answer: sentence.replace(/\s+/g, " "),
      topic,
      difficulty: cards.length < 3 ? "easy" : cards.length < 8 ? "medium" : "hard",
      sourceHint: sentence.slice(0, 80)
    });

    if (cards.length === 12) break;
  }

  while (cards.length < 8) {
    const index = cards.length + 1;
    cards.push({
      question: `What is key study point ${index} from these notes?`,
      answer: sentences[index - 1] ?? "Review the original notes for this supporting detail.",
      topic: `Study point ${index}`,
      difficulty: "medium",
      sourceHint: "Generated in mock mode"
    });
  }

  return JSON.stringify({ flashcards: cards }, null, 2);
}

function extractTopic(sentence) {
  const words = sentence
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word.toLowerCase()));

  return titleCase(words.slice(0, 3).join(" ") || "this concept");
}

function titleCase(value) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (char) => char.toUpperCase());
}
