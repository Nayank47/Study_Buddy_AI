import { createSessionToken, verifyStaticCredentials } from "../src/auth.js";

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
    const username = body?.username ?? "";
    const password = body?.password ?? "";

    if (!verifyStaticCredentials(username, password)) {
      response.status(401).json({ error: "Invalid username or password." });
      return;
    }

    response.status(200).json({
      token: createSessionToken(username),
      username
    });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}
