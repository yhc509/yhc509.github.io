import assert from "node:assert/strict";
import test from "node:test";
import { isProjectDevlog } from "./projectDevlog.mjs";

test("a devlog with a project is kept off the post feed", () => {
  assert.equal(isProjectDevlog({ type: "devlog", project: "dice-hunters" }), true);
  assert.equal(isProjectDevlog({ type: "devlog", project: "  dice-hunters  " }), true);
});

test("a devlog without a project stays on the post feed", () => {
  assert.equal(isProjectDevlog({ type: "devlog" }), false);
  assert.equal(isProjectDevlog({ type: "devlog", project: "" }), false);
  assert.equal(isProjectDevlog({ type: "devlog", project: "   " }), false);
});

test("an article linked to a project stays on the post feed", () => {
  assert.equal(isProjectDevlog({ type: "article", project: "flyingcat" }), false);
  assert.equal(isProjectDevlog({ type: "archive_candidate", project: "flyingcat" }), false);
  assert.equal(isProjectDevlog(undefined), false);
});
