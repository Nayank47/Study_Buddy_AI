import test from "node:test";
import assert from "node:assert/strict";
import { notesFromRequest } from "../src/requestNotes.js";

test("notesFromRequest accepts pasted text", async () => {
  assert.equal(await notesFromRequest({ text: "study notes" }), "study notes");
});

test("notesFromRequest accepts array text from unusual JSON clients", async () => {
  assert.equal(await notesFromRequest({ text: ["one", "two"] }), "one\ntwo");
});

test("notesFromRequest rejects unsupported uploads", async () => {
  await assert.rejects(
    () =>
      notesFromRequest({
        fileName: "notes.docx",
        fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileDataBase64: Buffer.from("content").toString("base64")
      }),
    /Unsupported file type/
  );
});
