English | [Русский](README.ru.md)

# Developer portfolio

A single-page personal portfolio for a self-taught IT generalist
(networking · security · low-level · DevOps), with a dark
terminal / hacker / network aesthetic and an optional light theme.

It is **pure HTML, CSS and JavaScript** — no build step, no framework, no
runtime dependencies (one optional Google Font). Just static files you can open
in a browser or drop onto any static host. It is mobile-first, accessible, and
deploys cleanly to GitHub Pages.

## Features

- **Light / dark theme toggle** — a button in the nav switches the palette and
  remembers your choice in `localStorage`. On first visit it follows your OS
  `prefers-color-scheme`. A tiny inline script applies the theme **before first
  paint**, so there is no flash of the wrong colours.
- **Active-section nav** — the nav link for the section you are currently
  reading is highlighted (`aria-current="page"`), updated as you scroll.
- **Typewriter intro** in a faux-terminal hero (decorative; a real,
  screen-reader-readable tagline lives in the markup).
- **Reveal-on-scroll** for sections via `IntersectionObserver`.
- **Auto-updating footer year** — no manual edits each January.
- **Accessible by default** — semantic landmarks, a skip link, visible focus
  rings, labelled controls, and full `prefers-reduced-motion` support.
- **Zero console errors** and no render-blocking JavaScript.

Every enhancement is progressive: with JavaScript disabled the page still reads
fine, and with reduced-motion requested, animations and smooth scrolling are
turned off while content is shown immediately.

## Project layout

| Path                | Purpose                                                       |
| ------------------- | ------------------------------------------------------------- |
| `index.html`        | Markup and content (hero, about, skills, projects, footer).   |
| `style.css`         | All styling. Themed entirely through CSS variables in `:root`.|
| `app.js`            | Vanilla-JS enhancements (see Features). No libraries.         |
| `test/app.test.js`  | Unit tests for the pure theme logic (Node's built-in runner). |
| `package.json`      | Test/serve scripts only — **no runtime dependencies**.        |
| `README.md`         | This file.                                                    |
| `README.ru.md`      | Russian translation of this file.                             |
| `.gitignore`        | Keeps OS/editor cruft out of the repo.                        |

## Run locally

No tooling required to view it. Either:

- Double-click `index.html` to open it directly in a browser, **or**
- Serve the folder (recommended, so relative paths behave exactly like in
  production):

```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

```bash
# Node (if you have it)
npx serve .
```

## Tests

The pure, DOM-free logic that decides the theme (`resolveTheme`, `nextTheme`) is
unit-tested with **Node's built-in test runner** — no dependencies to install.

```bash
node --test
# or:
npm test
```

Example output:

```text
✔ THEMES exposes the two expected values
✔ resolveTheme: a saved valid choice always wins over OS preference
✔ resolveTheme: with no saved choice, OS preference decides
✔ resolveTheme: an invalid/garbage saved value is ignored
✔ resolveTheme: defaults to dark when nothing else applies
✔ nextTheme: flips between the two themes
✔ nextTheme: an unknown current state toggles to light first
✔ resolveTheme + nextTheme compose: toggling from a resolved value
ℹ tests 8
ℹ pass 8
ℹ fail 0
```

You can also syntax-check the scripts without running anything:

```bash
node --check app.js
node --check test/app.test.js
# or: npm run check
```

## Customize

Everything you'd realistically want to change is plain text in two files.

### Name, links, and copy — `index.html`

- **GitHub username / URL:** search and replace `githubuseradmin` and
  `https://github.com/githubuseradmin`. It appears in the nav, hero buttons,
  every project card link, and the footer.
- **Hero handle and tagline:** edit `.hero__title` and `.hero__tagline`.
- **Typewriter phrases:** edit the `phrases` array inside `initTypewriter` in
  `app.js`.
- **About text:** the `#about` section.
- **Skills:** add/remove `<li class="chip">…</li>` items inside the three
  `.skills__group` blocks. Use `chip--core` / `chip--drawn` for accent colours.
- **Projects:** duplicate a `<li class="card">…</li>` block. Update the title,
  blurb, `.tag` items, and the link `href`s. For a live demo, add a second
  `.card__link` (see the `https-explained` card for the pattern).

### Colours and theme — `style.css`

The palette lives in the token blocks at the top of `style.css`:

- `:root` holds **structural** tokens (fonts, radii, spacing, motion).
- `:root, :root[data-theme="dark"]` holds the **dark** palette (the default).
- `:root[data-theme="light"]` holds the **light** palette.

Change `--accent` (green) and `--accent-2` (cyan) and the rest of the UI
follows. The `--on-accent` token is the text colour used on top of accent
fills, so contrast stays correct in both themes.

## Deploy to GitHub Pages

Because `index.html` is at the repository root, deployment is just:

1. Create a repo (for a user site, name it `githubuseradmin.github.io`; for a
   project site, any name works) and push these files to it.
2. On GitHub: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*,
   pick your branch (e.g. `main`) and the `/ (root)` folder, then **Save**.
4. Wait a minute; your site appears at:
   - `https://githubuseradmin.github.io/` (user site), or
   - `https://githubuseradmin.github.io/<repo>/` (project site).

No workflow file is needed — these are plain static assets. The `test/` folder
and `package.json` are harmless on Pages (they are simply not served as part of
the page) and exist only for local testing.

## Accessibility & performance notes

- Semantic landmarks (`header`, `main`, `nav`, `section`, `footer`), a single
  `<h1>`, a skip link, `aria-label`s on icon-only and grouped controls, and
  visible `:focus-visible` rings.
- The theme toggle exposes its state via `aria-pressed` and updates its
  `aria-label` ("Switch to light/dark theme").
- `prefers-reduced-motion` is fully honoured.
- No render-blocking JS (`defer`), no external scripts beyond one optional font
  that degrades to a local monospace stack.

## Credits

Built with AI assistance and hand-checked.
