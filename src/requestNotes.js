import { extname } from "node:path";
import { extractPdfText } from "./pdfExtractor.js";

export async function notesFromRequest(body) {
  if (typeof body.text === "string" && body.text.trim()) {
    return body.text;
  }

  if (Array.isArray(body.text) && body.text.join("\n").trim()) {
    return body.text.join("\n");
  }

  if (!body.fileDataBase64 || !body.fileName) {
    throw new Error("Upload a PDF, TXT, or Markdown file, or paste notes.");
  }

  const extension = extname(body.fileName).toLowerCase();
  const buffer = Buffer.from(body.fileDataBase64, "base64");

  if (extension === ".pdf" || body.fileType === "application/pdf") {
    return extractPdfText(buffer, body.fileName);
  }

  if ([".txt", ".md", ".markdown"].includes(extension) || body.fileType?.startsWith("text/")) {
    return buffer.toString("utf8");
  }

  throw new Error("Unsupported file type. Use PDF, TXT, or Markdown.");
}
