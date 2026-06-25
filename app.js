/* ==========================================================================
   githubuseradmin — portfolio behaviour
   --------------------------------------------------------------------------
   Three small, dependency-free enhancements:
     1. Typewriter effect in the hero terminal.
     2. Reveal-on-scroll for sections (IntersectionObserver).
     3. Auto-updating footer year.
   Everything is progressive: if JS is disabled, the page still reads fine,
   and prefers-reduced-motion is honoured throughout.
   ========================================================================== */

(function () {
  "use strict";

  // True when the user has asked the OS to minimise animation.
  var prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------------------
   * 1. Typewriter effect
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
   * 2. Reveal-on-scroll
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
   * 3. Footer year — keeps the copyright current without manual edits.
   * -------------------------------------------------------------------- */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* --------------------------------- Boot --------------------------------- */
  function init() {
    initYear();
    initReveal();
    initTypewriter();
  }

  // Run after DOM is parsed. Because the script is loaded with `defer`, the
  // DOM is normally ready already; the guard covers the edge case.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
