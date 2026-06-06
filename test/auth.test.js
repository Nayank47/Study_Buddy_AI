import test from "node:test";
import assert from "node:assert/strict";
import {
  createSessionToken,
  getBearerToken,
  verifySessionToken,
  verifyStaticCredentials
} from "../src/auth.js";

test("verifyStaticCredentials accepts default demo login", () => {
  assert.equal(verifyStaticCredentials("student", "studybuddy123"), true);
});

test("verifyStaticCredentials rejects wrong password", () => {
  assert.equal(verifyStaticCredentials("student", "wrong"), false);
});

test("session token verifies until it expires", () => {
  const token = createSessionToken("student", 1000);
  assert.equal(verifySessionToken(token, 2000), true);
  assert.equal(verifySessionToken(token, 1000 + 9 * 60 * 60 * 1000), false);
});

test("getBearerToken extracts authorization header", () => {
  assert.equal(getBearerToken({ headers: { authorization: "Bearer abc123" } }), "abc123");
});
