/* ==========================================================================
   githubuseradmin — portfolio behaviour
   --------------------------------------------------------------------------
   Small, dependency-free enhancements:
     1. Theme toggle (dark / light) persisted in localStorage.
     2. Typewriter effect in the hero terminal.
     3. Reveal-on-scroll for sections (IntersectionObserver).
     4. Active-section highlighting in the nav (IntersectionObserver).
     5. Auto-updating footer year.
   Everything is progressive: if JS is disabled the page still reads fine,
   and prefers-reduced-motion is honoured throughout.

   Pure, side-effect-free helpers (theme resolution + toggling) are exported
   for unit testing under Node at the bottom of this file; in the browser the
   export block is simply skipped.
   ========================================================================== */

(function () {
  "use strict";

  /* ----------------------------------------------------------------------
   * Pure helpers (no DOM, no globals) — unit-tested in test/app.test.js
   * -------------------------------------------------------------------- */

  var THEME_KEY = "theme";
  var THEMES = { DARK: "dark", LIGHT: "light" };

  /**
   * Decide which theme to apply on load.
   * Precedence: an explicitly saved valid choice wins; otherwise fall back to
   * the OS preference; otherwise default to dark.
   *
   * @param {string|null} saved        Raw value read from storage (may be null).
   * @param {boolean} prefersLight     Whether the OS prefers a light scheme.
   * @returns {"dark"|"light"}
   */
  function resolveTheme(saved, prefersLight) {
    if (saved === THEMES.DARK || saved === THEMES.LIGHT) {
      return saved;
    }
    return prefersLight ? THEMES.LIGHT : THEMES.DARK;
  }

  /**
   * Given the current theme, return the one a toggle should switch to.
   * Anything that is not a valid known theme is treated as dark, so the
   * first toggle from an unknown state reliably yields light.
   *
   * @param {string} current
   * @returns {"dark"|"light"}
   */
  function nextTheme(current) {
    return current === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
  }

  /* ----------------------------------------------------------------------
   * Environment helpers
   * -------------------------------------------------------------------- */

  // True when the user has asked the OS to minimise animation.
  var prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Safe localStorage access — private mode / blocked storage must not throw.
  function readStored(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  function writeStored(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      /* storage unavailable — preference simply won't persist */
    }
  }

  /* ----------------------------------------------------------------------
   * 1. Theme toggle
   * --------------------------------------------------------------------
   * The inline bootstrap in <head> has already set data-theme to avoid a
   * flash. Here we keep the button's label/aria in sync and handle clicks.
   * -------------------------------------------------------------------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function syncToggleButton(btn, theme) {
    if (!btn) return;
    var isLight = theme === THEMES.LIGHT;
    // aria-pressed reflects "light is on" relative to the default dark base.
    btn.setAttribute("aria-pressed", isLight ? "true" : "false");
    btn.setAttribute(
      "aria-label",
      isLight ? "Switch to dark theme" : "Switch to light theme"
    );
  }

  function initTheme() {
    var btn = document.getElementById("theme-toggle");

    var prefersLight =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: light)").matches;

    var current = resolveTheme(readStored(THEME_KEY), prefersLight);
    applyTheme(current);
    syncToggleButton(btn, current);

    if (!btn) return;

    btn.addEventListener("click", function () {
      current = nextTheme(current);
      applyTheme(current);
      writeStored(THEME_KEY, current);
      syncToggleButton(btn, current);
    });
  }

  /* ----------------------------------------------------------------------
   * 2. Typewriter effect
   * --------------------------------------------------------------------
   * Types out the tagline character-by-character into #typewriter. The
   * element is aria-hidden (a real, instantly-readable tagline lives in the
   * hero markup), so this is purely visual flair for sighted users.
   * -------------------------------------------------------------------- */
  function initTypewriter() {
    var el = document.getElementById("typewriter");
    if (!el) return;

    var phrases = [
      "self-taught IT generalist",
      "networking · security · low-level · DevOps",
      "curious about what's under the hood"
    ];

    // Reduced motion / no requestAnimationFrame: just show the first phrase.
    if (prefersReducedMotion) {
      el.textContent = phrases[0];
      return;
    }

    var typeSpeed = 55; // ms per character typed
    var eraseSpeed = 28; // ms per character erased
    var holdAfterType = 1600; // pause once a phrase is complete
    var holdAfterErase = 350; // pause before typing the next phrase

    var phraseIndex = 0;
    var charIndex = 0;
    var erasing = false;

    function tick() {
      var current = phrases[phraseIndex];

      if (!erasing) {
        // Typing forward
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          erasing = true;
          window.setTimeout(tick, holdAfterType);
          return;
        }
        window.setTimeout(tick, typeSpeed);
      } else {
        // Erasing backward
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          erasing = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          window.setTimeout(tick, holdAfterErase);
          return;
        }
        window.setTimeout(tick, eraseSpeed);
      }
    }

    tick();
  }

  /* ----------------------------------------------------------------------
   * 3. Reveal-on-scroll
   * --------------------------------------------------------------------
   * Adds .is-visible to .reveal elements as they enter the viewport.
   * Falls back to showing everything when IntersectionObserver is missing
   * or motion is reduced, so content is never trapped behind opacity:0.
   * -------------------------------------------------------------------- */
  function initReveal() {
    var elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    var showAll = function () {
      for (var i = 0; i < elements.length; i++) {
        elements[i].classList.add("is-visible");
      }
    };

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      showAll();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target); // reveal once, then stop watching
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12
      }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });

    // Safety net: in any environment where the observer never fires (some
    // headless renderers, exotic embeds), content must not stay hidden behind
    // opacity:0. After a short grace period, reveal anything still hidden.
    window.setTimeout(function () {
      for (var i = 0; i < elements.length; i++) {
        if (!elements[i].classList.contains("is-visible")) {
          elements[i].classList.add("is-visible");
        }
      }
    }, 2500);
  }

  /* ----------------------------------------------------------------------
   * 4. Active-section nav highlighting
   * --------------------------------------------------------------------
   * Marks the nav link of the section currently in view with
   * aria-current="page" (styled as an underline). Purely an enhancement:
   * without the APIs it relies on, the links just behave as normal anchors.
   *
   * Implementation: a throttled scroll/resize handler picks the last section
   * whose top has passed an anchor line near the top of the viewport. This is
   * deterministic regardless of section height (an IntersectionObserver band
   * can miss sections taller than the band), and it sets a sensible initial
   * state on load.
   * -------------------------------------------------------------------- */
  function initActiveNav() {
    var links = document.querySelectorAll(".nav__links a[data-nav-link]");
    if (
      !links.length ||
      typeof window.requestAnimationFrame !== "function"
    ) {
      return;
    }

    // Pair each existing section with its nav link, in document order.
    var pairs = [];
    links.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      var section = document.getElementById(href.slice(1));
      if (section) pairs.push({ link: link, section: section });
    });
    if (!pairs.length) return;

    var currentLink = null;

    function setActive(link) {
      if (link === currentLink) return;
      if (currentLink) currentLink.removeAttribute("aria-current");
      if (link) link.setAttribute("aria-current", "page");
      currentLink = link;
    }

    function update() {
      // Anchor line a third of the way down the viewport.
      var anchor = window.innerHeight * 0.33;
      var active = null;
      for (var i = 0; i < pairs.length; i++) {
        var top = pairs[i].section.getBoundingClientRect().top;
        if (top <= anchor) {
          active = pairs[i].link; // last section past the anchor wins
        }
      }
      // Near the very bottom, force the final section active so the last
      // link lights up even if its top never reaches the anchor line.
      var nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (nearBottom) active = pairs[pairs.length - 1].link;
      setActive(active);
    }

    // Throttle to one update per animation frame.
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        update();
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update(); // initial state
  }

  /* ----------------------------------------------------------------------
   * 5. Footer year — keeps the copyright current without manual edits.
   * -------------------------------------------------------------------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ----------------------------------------------------------------------
   * 6. Project walkthrough overlay
   * --------------------------------------------------------------------
   * Clicking a project card opens an in-page overlay that "explains" the
   * project: a small animated architecture diagram (built from the data in
   * projects.js), a few highlights, key stats, and links out to the code,
   * README and live demo. State is driven by the URL hash (#project/<id>),
   * so each walkthrough is deep-linkable and the browser Back button — or
   * Esc, or a click on the backdrop — closes it.
   *
   * Progressive enhancement: the cards already work without JS (their links
   * point straight at GitHub / the live demos). This overlay is the extra
   * layer. The pure, DOM-free helpers (projectById / projectHash /
   * parseProjectHash) are exported for unit testing next to the theme helpers.
   * -------------------------------------------------------------------- */

  // projects.js exposes the data as a browser global; fall back to an empty
  // set so requiring app.js under Node (for tests) never throws.
  var PROJECT_DATA =
    (typeof window !== "undefined" && window.PORTFOLIO_PROJECTS) ||
    { PROJECTS: [], NODE_W: 150, NODE_H: 50 };
  var PROJECTS = PROJECT_DATA.PROJECTS;

  /* --- pure helpers (no DOM) — unit-tested in test/app.test.js --- */

  function projectById(list, id) {
    if (!list) return null;
    for (var i = 0; i < list.length; i++) {
      if (list[i] && list[i].id === id) return list[i];
    }
    return null;
  }

  function projectHash(id) {
    return "#project/" + id;
  }

  function parseProjectHash(hash) {
    if (typeof hash !== "string") return null;
    var m = hash.match(/^#project\/([A-Za-z0-9_-]+)$/);
    return m ? m[1] : null;
  }

  /* --- tiny HTML/SVG building utilities --- */

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return c === "&" ? "&amp;"
        : c === "<" ? "&lt;"
        : c === ">" ? "&gt;"
        : c === '"' ? "&quot;"
        : "&#39;";
    });
  }

  function nodeBox(n) {
    var w = n.w || PROJECT_DATA.NODE_W;
    var h = n.h || PROJECT_DATA.NODE_H;
    return { x: n.x, y: n.y, w: w, h: h, cx: n.x + w / 2, cy: n.y + h / 2 };
  }

  // A smooth cubic path between the facing sides of two node boxes. Picks a
  // horizontal or vertical exit based on which axis dominates, so straight
  // pipelines, snakes and fan-outs all read cleanly with one routine.
  function edgePath(a, b) {
    var dx = b.cx - a.cx, dy = b.cy - a.cy;
    var sx, sy, ex, ey, c1x, c1y, c2x, c2y, mx, my;
    if (Math.abs(dx) >= Math.abs(dy)) {
      sx = dx >= 0 ? a.x + a.w : a.x; sy = a.cy;
      ex = dx >= 0 ? b.x : b.x + b.w; ey = b.cy;
      mx = (sx + ex) / 2;
      c1x = mx; c1y = sy; c2x = mx; c2y = ey;
    } else {
      sy = dy >= 0 ? a.y + a.h : a.y; sx = a.cx;
      ey = dy >= 0 ? b.y : b.y + b.h; ex = b.cx;
      my = (sy + ey) / 2;
      c1x = sx; c1y = my; c2x = ex; c2y = my;
    }
    return "M" + sx + "," + sy + " C" + c1x + "," + c1y + " " +
      c2x + "," + c2y + " " + ex + "," + ey;
  }

  // Build the architecture diagram as an inline SVG string. When `animated`
  // is false (reduced motion) the nodes render statically and no travelling
  // pulses are emitted.
  function buildDiagramSVG(diagram, animated) {
    var boxes = {};
    diagram.nodes.forEach(function (n) { boxes[n.id] = nodeBox(n); });

    var defs =
      '<marker id="pf-arw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,1 L9,5 L0,9 Z" class="pf-arw-flow"/></marker>' +
      '<marker id="pf-arw-dep" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,1 L9,5 L0,9 Z" class="pf-arw-dep"/></marker>';

    var edges = "";
    var pulses = "";
    diagram.edges.forEach(function (e, i) {
      var a = boxes[e.from], b = boxes[e.to];
      if (!a || !b) return;
      var dep = e.kind === "dep";
      var id = "pf-e" + i;
      edges += '<path id="' + id + '" class="pf-edge' + (dep ? " pf-edge--dep" : "") +
        '" d="' + edgePath(a, b) + '"/>';
      if (animated && !dep) {
        pulses += '<circle class="pf-pulse" r="3">' +
          '<animateMotion dur="1.8s" begin="' + (i * 0.35).toFixed(2) +
          's" repeatCount="indefinite" rotate="0">' +
          '<mpath xlink:href="#' + id + '" href="#' + id + '"/></animateMotion></circle>';
      }
    });

    var nodes = "";
    diagram.nodes.forEach(function (n, i) {
      var box = boxes[n.id];
      var parts = String(n.label).split("\n");
      var cls = "pf-node pf-node--" + (n.kind || "core") + (animated ? " pf-node--anim" : "");
      var txt;
      if (parts.length > 1) {
        txt =
          '<text class="pf-node__l1" x="' + box.cx + '" y="' + (box.cy - 7) +
          '" text-anchor="middle" dominant-baseline="central">' + esc(parts[0]) + "</text>" +
          '<text class="pf-node__l2" x="' + box.cx + '" y="' + (box.cy + 9) +
          '" text-anchor="middle" dominant-baseline="central">' + esc(parts[1]) + "</text>";
      } else {
        txt = '<text class="pf-node__l1" x="' + box.cx + '" y="' + box.cy +
          '" text-anchor="middle" dominant-baseline="central">' + esc(parts[0]) + "</text>";
      }
      nodes += '<g class="' + cls + '" style="animation-delay:' + (i * 70) + 'ms">' +
        '<rect x="' + box.x + '" y="' + box.y + '" width="' + box.w + '" height="' + box.h + '" rx="9"/>' +
        txt + "</g>";
    });

    return '<svg class="pf-diagram" viewBox="' + esc(diagram.viewBox) +
      '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img">' +
      "<defs>" + defs + "</defs>" + edges + pulses + nodes + "</svg>";
  }

  function linkHtml(l) {
    var icon = l.kind === "demo" ? "▶" : "↗";
    var cls = "pf-link" + (l.kind === "demo" ? " pf-link--primary" : "");
    return '<a class="' + cls + '" href="' + esc(l.href) + '" target="_blank" rel="noopener">' +
      '<span class="pf-link__i" aria-hidden="true">' + icon + "</span>" + esc(l.label) + "</a>";
  }

  function renderOverlayBody(p, animated) {
    var badge = p.badge ? '<span class="pf-ov__badge">' + esc(p.badge) + "</span>" : "";
    var highlights = (p.highlights || []).map(function (h) {
      return "<li>" + esc(h) + "</li>";
    }).join("");
    var stats = (p.stats || []).map(function (s) {
      return '<li class="pf-ov__stat"><span class="pf-ov__stat-v">' + esc(s.v) +
        '</span><span class="pf-ov__stat-k">' + esc(s.k) + "</span></li>";
    }).join("");
    var tags = (p.stack || []).map(function (t) {
      return '<li class="pf-ov__tag">' + esc(t) + "</li>";
    }).join("");
    var note = p.note
      ? '<p class="pf-ov__note"><span aria-hidden="true">↻ </span>' + esc(p.note) + "</p>"
      : "";
    var links = (p.links || []).map(linkHtml).join("");

    return (
      '<header class="pf-ov__head">' +
        '<span class="pf-ov__icon" aria-hidden="true">' + esc(p.icon || "$") + "</span>" +
        '<h2 id="pf-ov-title" class="pf-ov__title">' + esc(p.name) + "</h2>" + badge +
      "</header>" +
      '<p class="pf-ov__summary">' + esc(p.summary) + "</p>" +
      '<div class="pf-ov__diagram" aria-hidden="true">' + buildDiagramSVG(p.diagram, animated) + "</div>" +
      '<div class="pf-ov__cols">' +
        '<div class="pf-ov__col">' +
          '<h3 class="pf-ov__h3">how it works</h3>' +
          '<ul class="pf-ov__highlights">' + highlights + "</ul>" + note +
        "</div>" +
        '<div class="pf-ov__col pf-ov__col--meta">' +
          '<ul class="pf-ov__stats">' + stats + "</ul>" +
          '<ul class="pf-ov__tags">' + tags + "</ul>" +
        "</div>" +
      "</div>" +
      '<div class="pf-ov__links">' + links + "</div>"
    );
  }

  /* --- overlay controller (hash-driven) --- */

  var overlayEl = null;
  var currentId = null;
  var lastFocus = null;

  function ensureOverlay() {
    if (overlayEl) return overlayEl;
    overlayEl = document.createElement("div");
    overlayEl.className = "pf-overlay";
    overlayEl.id = "pf-overlay";
    overlayEl.setAttribute("hidden", "");
    overlayEl.innerHTML =
      '<div class="pf-overlay__scrim" data-pf-close></div>' +
      '<div class="pf-overlay__panel" role="dialog" aria-modal="true" aria-labelledby="pf-ov-title" tabindex="-1">' +
        '<button class="pf-overlay__close" type="button" data-pf-close aria-label="Close (Esc)"><span aria-hidden="true">✕</span> esc</button>' +
        '<div class="pf-ov__body"></div>' +
      "</div>";
    document.body.appendChild(overlayEl);
    overlayEl.addEventListener("click", function (e) {
      if (e.target.closest("[data-pf-close]")) requestClose();
    });
    return overlayEl;
  }

  function showProject(p) {
    if (currentId === p.id) return;
    var ov = ensureOverlay();
    var animated = !prefersReducedMotion;
    ov.querySelector(".pf-ov__body").innerHTML = renderOverlayBody(p, animated);
    if (!currentId) lastFocus = document.activeElement; // remember the opener
    ov.removeAttribute("hidden");
    void ov.offsetWidth; // reflow so the open transition runs from hidden
    ov.classList.add("is-open");
    document.documentElement.classList.add("pf-lock");
    currentId = p.id;
    var closeBtn = ov.querySelector(".pf-overlay__close");
    if (closeBtn) closeBtn.focus();
  }

  function hideProject() {
    if (!currentId || !overlayEl) return;
    overlayEl.classList.remove("is-open");
    document.documentElement.classList.remove("pf-lock");
    currentId = null;
    var ov = overlayEl;
    window.setTimeout(function () {
      if (!currentId) ov.setAttribute("hidden", ""); // unless reopened meanwhile
    }, 260);
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
      lastFocus = null;
    }
  }

  // Closing just moves the hash off the project; the hashchange handler does
  // the actual hide. Landing back on #projects also returns the reader to the
  // projects list.
  function requestClose() {
    if (parseProjectHash(location.hash)) location.hash = "#projects";
    else hideProject();
  }

  function syncFromHash() {
    var id = parseProjectHash(location.hash);
    var p = id ? projectById(PROJECTS, id) : null;
    if (p) showProject(p);
    else hideProject();
  }

  function openById(id) {
    if (!id) return;
    if (location.hash === projectHash(id)) syncFromHash(); // same hash: no event
    else location.hash = projectHash(id);
  }

  function onOverlayKeydown(e) {
    if (!currentId) return;
    if (e.key === "Escape") { e.preventDefault(); requestClose(); return; }
    if (e.key !== "Tab" || !overlayEl) return;
    // Trap focus inside the dialog.
    var f = overlayEl.querySelectorAll("a[href], button:not([disabled])");
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function initProjects() {
    if (!PROJECTS || !PROJECTS.length) return;

    // Open from an explicit "Walkthrough" button, or from a click anywhere on
    // a project card that is not itself a link or button.
    document.addEventListener("click", function (e) {
      var opener = e.target.closest("[data-pf-open]");
      if (opener) {
        e.preventDefault();
        openById(opener.getAttribute("data-pf-open"));
        return;
      }
      var card = e.target.closest(".card[data-project]");
      if (card && !e.target.closest("a") && !e.target.closest("button")) {
        openById(card.getAttribute("data-project"));
      }
    });

    document.addEventListener("keydown", onOverlayKeydown, true);
    window.addEventListener("hashchange", syncFromHash);
    syncFromHash(); // honour a deep link on first load
  }

  /* --------------------------------- Boot --------------------------------- */
  function init() {
    initTheme();
    initYear();
    initReveal();
    initActiveNav();
    initTypewriter();
    initProjects();
  }

  // Run after DOM is parsed. Because the script is loaded with `defer`, the
  // DOM is normally ready already; the guard covers the edge case. Guarded so
  // that requiring this file under Node (for tests) does not touch the DOM.
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  }

  /* ------------------------- Test-only exports -------------------------
   * Under Node (CommonJS) expose the pure helpers so they can be unit
   * tested. In the browser `module` is undefined and this block is skipped,
   * so the file stays a self-contained IIFE with no global leakage.
   * -------------------------------------------------------------------- */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      resolveTheme: resolveTheme,
      nextTheme: nextTheme,
      THEMES: THEMES,
      projectById: projectById,
      projectHash: projectHash,
      parseProjectHash: parseProjectHash
    };
  }
})();
