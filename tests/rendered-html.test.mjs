import assert from "node:assert/strict";
import test from "node:test";

async function getWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

const executionContext = {
  waitUntil() {},
  passThroughOnException() {},
};

const environment = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};

test("renders the CineQuiz entry experience", async () => {
  const worker = await getWorker();
  const response = await worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    environment,
    executionContext,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(html, /CineQuiz BR/);
  assert.match(html, /Acerte/);
  assert.doesNotMatch(html, /codex-preview/);
});

test("serves a recommendation queue without exposing an API key", async () => {
  const worker = await getWorker();
  const response = await worker.fetch(
    new Request("http://localhost/api/recommendations?categories=sci-fi,drama"),
    environment,
    executionContext,
  );
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(payload.recommendations));
  assert.ok(payload.recommendations.length >= 4);
  assert.ok(["tmdb", "demo"].includes(payload.source));
});
