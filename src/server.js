import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createFlashcards } from "./agent.js";
import { notesFromRequest } from "./requestNotes.js";

const PORT = Number(process.env.PORT ?? 3000);
const ROOT = resolve(process.cwd(), "public");
const MAX_BODY_BYTES = 20 * 1024 * 1024;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

export const server = createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/api/health") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && request.url === "/api/flashcards") {
      await handleFlashcards(request, response);
      return;
    }

    if (request.method === "GET") {
      await serveStatic(request, response);
      return;
    }

    sendJson(response, 405, { error: "Method not allowed." });
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
});

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  server.listen(PORT, () => {
    console.log(`Study Buddy web app running at http://localhost:${PORT}`);
  });
}

async function handleFlashcards(request, response) {
  const body = await readJsonBody(request);
  const notes = await notesFromRequest(body);
  const warnings = [];

  const result = await createFlashcards(notes, {
    mock: body.mock === true,
    model: body.model,
    onWarning: (warning) => warnings.push(warning)
  });

  sendJson(response, 200, {
    flashcards: result.flashcards,
    warnings: [...warnings, ...result.warnings],
    json: result.json,
    markdown: result.markdown
  });
}

async function serveStatic(request, response) {
  const rawPath = new URL(request.url, `http://localhost:${PORT}`).pathname;
  const relativePath = rawPath === "/" ? "index.html" : rawPath.slice(1);
  const safePath = normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  const filePath = resolve(join(ROOT, safePath));

  if (!filePath.startsWith(ROOT)) {
    sendJson(response, 403, { error: "Forbidden." });
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": CONTENT_TYPES[extname(filePath)] ?? "application/octet-stream"
    });
    response.end(file);
  } catch {
    sendJson(response, 404, { error: "Not found." });
  }
}

function readJsonBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let totalBytes = 0;
    const chunks = [];

    request.on("data", (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        rejectBody(new Error("Upload is too large. Keep files under 20 MB."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      try {
        resolveBody(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        rejectBody(new Error("Request body must be valid JSON."));
      }
    });

    request.on("error", rejectBody);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
