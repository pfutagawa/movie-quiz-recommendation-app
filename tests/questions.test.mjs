import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const questions = JSON.parse(
  await readFile(new URL("../data/questions.json", import.meta.url), "utf8"),
);

test("contains 100 valid and unique questions", () => {
  assert.equal(questions.length, 100);
  assert.equal(new Set(questions.map((question) => question.id)).size, 100);

  for (const question of questions) {
    assert.equal(question.options.length, 4, question.id);
    assert.ok(question.correctAnswer >= 0 && question.correctAnswer <= 3, question.id);
    assert.ok(question.options[question.correctAnswer], question.id);
    assert.ok(question.explanation.length >= 20, question.id);
  }
});

test("balances ten questions across each category", () => {
  const counts = Object.groupBy(questions, (question) => question.category);
  assert.equal(Object.keys(counts).length, 10);
  Object.entries(counts).forEach(([category, entries]) => {
    assert.equal(entries.length, 10, category);
  });
});
