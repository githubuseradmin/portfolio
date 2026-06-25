# Developer portfolio

A single-page personal portfolio for a self-taught IT generalist
(networking · security · low-level · DevOps), with a dark
terminal / hacker / network aesthetic.

It is **pure HTML, CSS and JavaScript** — no build step, no framework, no
dependencies (one optional Google Font). Just static files you can open in a
browser or drop onto any static host. It is mobile-first and deploys cleanly to
GitHub Pages.

## What's in here

| File         | Purpose                                                            |
| ------------ | ----------------------------------------------------------------- |
| `index.html` | Markup and content (hero, about, skills, projects, footer).       |
| `style.css`  | All styling. Themed entirely through CSS variables in `:root`.    |
| `app.js`     | Three vanilla-JS enhancements (see below). No libraries.          |
| `README.md`  | This file.                                                        |
| `.gitignore` | Keeps OS/editor cruft out of the repo.                            |

### Behaviour (`app.js`)

1. **Typewriter** effect in the hero terminal. Decorative only — a real,
   screen-reader-readable tagline lives in the markup.
2. **Reveal-on-scroll** for sections via `IntersectionObserver`.
3. **Auto-updating footer year**.

All three are progressive: with JavaScript disabled the page still reads fine,
and `prefers-reduced-motion` is respected throughout (animations and smooth
scrolling are disabled, and revealed content is shown immediately).

## Run locally

No tooling required. Either:

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

## Customize

Everything you'd realistically want to change is plain text in two files.

### Name, links, and copy — `index.html`

- **GitHub username / URL:** search and replace `githubuseradmin` and
  `https://github.com/githubuseradmin`. It appears in the nav, hero buttons,
  every project card link, and the footer.
- **Hero handle and tagline:** edit `.hero__title` and `.hero__tagline`.
- **Typewriter phrases:** edit the `phrases` array near the top of `app.js`.
- **About text:** the `#about` section.
- **Skills:** add/remove `<li class="chip">…</li>` items inside the three
  `.skills__group` blocks. Use `chip--core` / `chip--drawn` for accent colours.
- **Projects:** duplicate a `<li class="card">…</li>` block. Update the title,
  blurb, `.tag` items, and the link `href`s. For a live demo, add a second
  `.card__link` (see the `https-explained` card for the pattern).

### Colours and theme — `style.css`

The whole palette lives in the `:root` block at the top of `style.css`. Change
`--accent` (green) and `--accent-2` (cyan), and the rest of the UI follows.
Other tokens there control surfaces, text colours, border lines, radii, and the
max content width (`--maxw`).

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

No workflow file is needed — these are plain static assets.

## Accessibility & performance notes

- Semantic landmarks (`header`, `main`, `nav`, `section`, `footer`), a skip
  link, `aria-label`s on icon-only and grouped controls, and visible
  `:focus-visible` rings.
- `prefers-reduced-motion` fully honoured.
- No render-blocking JS (`defer`), no external scripts, one optional font that
  degrades to a local monospace stack.

## Credits

Built with AI assistance and hand-checked.
