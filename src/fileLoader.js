import { extname } from "node:path";
import { readFile } from "node:fs/promises";
import { extractPdfText } from "./pdfExtractor.js";

const TEXT_EXTENSIONS = new Set([".md", ".markdown", ".txt"]);

export function detectInputKind(filePath) {
  const extension = extname(filePath).toLowerCase();

  if (extension === ".pdf") return "pdf";
  if (TEXT_EXTENSIONS.has(extension)) return "text";
  return "unknown";
}

export async function loadNotesFromFile(filePath) {
  const inputKind = detectInputKind(filePath);

  if (inputKind === "pdf") {
    const buffer = await readFile(filePath);
    return extractPdfText(buffer, filePath);
  }

  if (inputKind === "unknown") {
    console.warn(`Warning: Unknown file extension for ${filePath}; reading it as UTF-8 text.`);
  }

  return readFile(filePath, "utf8");
}
