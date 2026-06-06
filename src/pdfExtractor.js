export async function extractPdfText(buffer, filePath = "PDF") {
  const pdfParse = await loadPdfParse();

  let text = "";

  if (typeof pdfParse.default === "function") {
    const result = await pdfParse.default(buffer);
    text = result?.text ?? "";
  } else if (typeof pdfParse.PDFParse === "function") {
    const parser = new pdfParse.PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      text = result?.text ?? "";
    } finally {
      await parser.destroy?.();
    }
  } else {
    throw new Error("Unsupported pdf-parse API shape. Check the installed pdf-parse version.");
  }

  const cleaned = text.replace(/\u0000/g, "").trim();
  if (!cleaned) {
    throw new Error(
      `No selectable text could be extracted from ${filePath}. Scanned/image-only PDFs need OCR before flashcards can be generated.`
    );
  }

  return cleaned;
}

async function loadPdfParse() {
  try {
    return await import("pdf-parse");
  } catch (error) {
    throw new Error("PDF support requires pdf-parse. Run npm install, then try again.", {
      cause: error
    });
  }
}
