import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_USERNAME = "student";
const DEFAULT_PASSWORD = "studybuddy123";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export function verifyStaticCredentials(username, password) {
  const expectedUsername = process.env.STUDY_BUDDY_USERNAME ?? DEFAULT_USERNAME;
  const expectedPassword = process.env.STUDY_BUDDY_PASSWORD ?? DEFAULT_PASSWORD;

  return safeEqual(String(username ?? ""), expectedUsername) && safeEqual(String(password ?? ""), expectedPassword);
}

export function createSessionToken(username, now = Date.now()) {
  const payload = {
    sub: username,
    exp: now + SESSION_TTL_MS
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token, now = Date.now()) {
  const [encodedPayload, signature] = String(token ?? "").split(".");
  if (!encodedPayload || !signature) return false;
  if (!safeEqual(signature, sign(encodedPayload))) return false;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    return typeof payload.exp === "number" && payload.exp > now;
  } catch {
    return false;
  }
}

export function getBearerToken(request) {
  const header = request.headers?.authorization ?? request.headers?.Authorization ?? "";
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
}

export function isRequestAuthenticated(request) {
  return verifySessionToken(getBearerToken(request));
}

function sign(value) {
  const secret = process.env.STUDY_BUDDY_AUTH_SECRET ?? process.env.ANTHROPIC_API_KEY ?? "local-dev-secret";
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}
