import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export async function extractPdfText(buffer, filePath = "PDF") {
  const { PDFParse } = loadPdfParse();
  const parser = new PDFParse({ data: buffer });
  let text;

  try {
    const result = await parser.getText();
    text = result?.text ?? "";
  } finally {
    await parser.destroy?.();
  }

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
    return require("pdf-parse");
  } catch (error) {
    throw new Error(`Could not load pdf-parse in this deployment: ${error.message}`);
  }
}
