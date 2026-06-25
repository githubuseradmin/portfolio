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

  /* --------------------------------- Boot --------------------------------- */
  function init() {
    initTheme();
    initYear();
    initReveal();
    initActiveNav();
    initTypewriter();
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
    module.exports = { resolveTheme: resolveTheme, nextTheme: nextTheme, THEMES: THEMES };
  }
})();
