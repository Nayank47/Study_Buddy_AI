export default function handler(request, response) {
  response.status(200).json({
    ok: true,
    version: "pdf-static-import-2026-06-05"
  });
}
