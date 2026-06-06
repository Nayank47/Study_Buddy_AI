import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export async function extractPdfText(buffer, filePath = "PDF") {
  const pdf = loadPdfParse();
  const result = await pdf(buffer);
  const text = result?.text ?? "";

  const cleaned = text.replace(/\u0000/g, "").trim();
  if (!cleaned) {
    throw new Error(
      `No selectable text could be extracted from ${filePath}. Scanned/image-only PDFs need OCR before flashcards can be generated.`
    );
  }

  return cleaned;
}

function loadPdfParse() {
  try {
    const pdfParse = require("pdf-parse");
    if (typeof pdfParse !== "function") {
      throw new Error("Expected pdf-parse v1 function API.");
    }
    return pdfParse;
  } catch (error) {
    throw new Error(`Could not load pdf-parse in this deployment: ${error.message}`);
  }
}
