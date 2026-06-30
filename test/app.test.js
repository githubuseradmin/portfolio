/* ==========================================================================
   Unit tests for the pure helpers in app.js
   --------------------------------------------------------------------------
   Uses only Node's built-in test runner (node:test) and assert module — no
   external dependencies. Run with:  node --test
   The browser-only code in app.js is guarded by `typeof document`, so simply
   requiring the file here exercises just the exported, side-effect-free logic.
   ========================================================================== */

const { test } = require("node:test");
const assert = require("node:assert/strict");

const {
  resolveTheme,
  nextTheme,
  THEMES,
  projectById,
  projectHash,
  parseProjectHash
} = require("../app.js");
const { PROJECTS } = require("../projects.js");
const MOTIFS = require("../motifs.js");

test("THEMES exposes the two expected values", () => {
  assert.equal(THEMES.DARK, "dark");
  assert.equal(THEMES.LIGHT, "light");
});

test("resolveTheme: a saved valid choice always wins over OS preference", () => {
  // Saved "light" wins even when the OS prefers dark.
  assert.equal(resolveTheme("light", false), "light");
  // Saved "dark" wins even when the OS prefers light.
  assert.equal(resolveTheme("dark", true), "dark");
});

test("resolveTheme: with no saved choice, OS preference decides", () => {
  assert.equal(resolveTheme(null, true), "light");
  assert.equal(resolveTheme(null, false), "dark");
});

test("resolveTheme: an invalid/garbage saved value is ignored", () => {
  // Falls back to OS preference rather than trusting bad data.
  assert.equal(resolveTheme("purple", true), "light");
  assert.equal(resolveTheme("", false), "dark");
  assert.equal(resolveTheme(undefined, false), "dark");
});

test("resolveTheme: defaults to dark when nothing else applies", () => {
  assert.equal(resolveTheme(null, false), "dark");
});

test("nextTheme: flips between the two themes", () => {
  assert.equal(nextTheme("dark"), "light");
  assert.equal(nextTheme("light"), "dark");
});

test("nextTheme: an unknown current state toggles to light first", () => {
  // Anything not recognised as "light" is treated as dark, so the first
  // toggle reliably produces light.
  assert.equal(nextTheme("unknown"), "light");
  assert.equal(nextTheme(""), "light");
  assert.equal(nextTheme(null), "light");
});

test("resolveTheme + nextTheme compose: toggling from a resolved value", () => {
  const start = resolveTheme(null, false); // -> dark
  const after = nextTheme(start); // -> light
  assert.equal(start, "dark");
  assert.equal(after, "light");
  assert.equal(nextTheme(after), "dark"); // toggling back
});

/* ------------------------- Project walkthrough helpers ------------------- */

test("projectHash builds the deep-link hash for an id", () => {
  assert.equal(projectHash("netsec-toolkit"), "#project/netsec-toolkit");
});

test("parseProjectHash extracts the id from a valid hash", () => {
  assert.equal(parseProjectHash("#project/netsec-toolkit"), "netsec-toolkit");
  assert.equal(parseProjectHash("#project/game-lab"), "game-lab");
});

test("parseProjectHash rejects anything that is not a project hash", () => {
  assert.equal(parseProjectHash("#projects"), null);
  assert.equal(parseProjectHash("#about"), null);
  assert.equal(parseProjectHash("#project/"), null); // empty id
  assert.equal(parseProjectHash("#project/bad id"), null); // space is invalid
  assert.equal(parseProjectHash(""), null);
  assert.equal(parseProjectHash(null), null);
  assert.equal(parseProjectHash(undefined), null);
});

test("projectHash and parseProjectHash round-trip", () => {
  for (const p of PROJECTS) {
    assert.equal(parseProjectHash(projectHash(p.id)), p.id);
  }
});

test("projectById finds a project and returns null for misses", () => {
  assert.equal(projectById(PROJECTS, "logwatch").name, "logwatch");
  assert.equal(projectById(PROJECTS, "does-not-exist"), null);
  assert.equal(projectById(null, "logwatch"), null);
  assert.equal(projectById([], "logwatch"), null);
});

/* ------------------------- Project data integrity ------------------------ */

test("PROJECTS is a non-empty array with unique ids", () => {
  assert.ok(Array.isArray(PROJECTS) && PROJECTS.length > 0);
  const ids = PROJECTS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, "project ids must be unique");
});

test("every project has the fields the overlay renders", () => {
  for (const p of PROJECTS) {
    assert.ok(p.id && p.name && p.summary, `${p.id}: id/name/summary`);
    assert.ok(Array.isArray(p.highlights) && p.highlights.length, `${p.id}: highlights`);
    assert.ok(Array.isArray(p.links) && p.links.length, `${p.id}: links`);
    for (const l of p.links) {
      assert.ok(l.href && /^https?:\/\//.test(l.href), `${p.id}: link href`);
      assert.ok(l.label && l.kind, `${p.id}: link label/kind`);
    }
  }
});

test("every project has an animated SVG motif", () => {
  for (const p of PROJECTS) {
    const m = MOTIFS[p.id];
    assert.ok(typeof m === "string" && m.includes("<svg"), `${p.id}: motif SVG`);
    assert.ok(m.includes('viewBox="0 0 140 86"'), `${p.id}: motif viewBox`);
  }
});

test("every diagram edge references existing nodes", () => {
  for (const p of PROJECTS) {
    assert.ok(p.diagram && Array.isArray(p.diagram.nodes), `${p.id}: diagram nodes`);
    const ids = new Set(p.diagram.nodes.map((n) => n.id));
    for (const e of p.diagram.edges) {
      assert.ok(ids.has(e.from), `${p.id}: edge.from "${e.from}" missing`);
      assert.ok(ids.has(e.to), `${p.id}: edge.to "${e.to}" missing`);
    }
  }
});
