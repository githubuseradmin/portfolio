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

const { resolveTheme, nextTheme, THEMES } = require("../app.js");

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
