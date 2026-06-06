const MIN_QUESTION_LENGTH = 12;
const MIN_ANSWER_LENGTH = 8;

export function validateFlashcards(payload, sourceNotes) {
  const errors = [];
  const warnings = [];

  if (!payload || typeof payload !== "object") {
    return { flashcards: [], errors: ["Response must be a JSON object."], warnings };
  }

  if (!Array.isArray(payload.flashcards)) {
    return { flashcards: [], errors: ["Response must include a flashcards array."], warnings };
  }

  const seen = new Set();
  const sourceVocabulary = significantWords(sourceNotes);
  const flashcards = [];

  for (const [index, rawCard] of payload.flashcards.entries()) {
    const cardErrors = [];
    const question = normalizeText(rawCard?.question ?? "");
    const answer = normalizeText(rawCard?.answer ?? "");
    const topic = normalizeText(rawCard?.topic ?? "");
    const sourceHint = normalizeText(rawCard?.sourceHint ?? "");
    const difficulty = normalizeDifficulty(rawCard?.difficulty);

    if (question.length < MIN_QUESTION_LENGTH) {
      cardErrors.push("question is too short");
    }
    if (answer.length < MIN_ANSWER_LENGTH) {
      cardErrors.push("answer is too short");
    }
    if (!question.endsWith("?")) {
      cardErrors.push("question must end with a question mark");
    }

    const duplicateKey = normalizeForDedupe(`${question} ${answer}`);
    if (seen.has(duplicateKey)) {
      cardErrors.push("duplicate or near-duplicate card");
    }

    const supportScore = estimateSupport(answer, sourceVocabulary);
    if (supportScore < 0.2) {
      warnings.push(`Card ${index + 1} may not be well supported by the notes.`);
    }

    if (cardErrors.length) {
      warnings.push(`Dropped card ${index + 1}: ${cardErrors.join(", ")}.`);
      continue;
    }

    seen.add(duplicateKey);
    flashcards.push(removeEmptyFields({ question, answer, topic, difficulty, sourceHint }));
  }

  if (flashcards.length < 8) {
    errors.push(`Expected at least 8 valid flashcards, got ${flashcards.length}.`);
  }
  if (flashcards.length > 15) {
    errors.push(`Expected at most 15 flashcards, got ${flashcards.length}.`);
  }

  return { flashcards, errors, warnings };
}

function normalizeText(value) {
  return String(value).replace(/\s+/g, " ").trim();
}

function normalizeDifficulty(value) {
  return ["easy", "medium", "hard"].includes(value) ? value : undefined;
}

function normalizeForDedupe(value) {
  return [...significantWords(value)].sort().join(" ");
}

function significantWords(value) {
  return new Set(
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 || /\d/.test(word))
  );
}

function estimateSupport(answer, sourceVocabulary) {
  const answerWords = [...significantWords(answer)];
  if (!answerWords.length) return 0;
  const matches = answerWords.filter((word) => sourceVocabulary.has(word)).length;
  return matches / answerWords.length;
}

function removeEmptyFields(card) {
  return Object.fromEntries(
    Object.entries(card).filter(([, value]) => value !== undefined && value !== "")
  );
}
