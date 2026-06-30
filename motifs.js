/* ==========================================================================
   githubuseradmin — per-project animated motifs
   --------------------------------------------------------------------------
   Small, self-contained animated SVGs (one per project) injected into each
   card's .card__art banner by app.js. They share ONE animation vocabulary —
   the .m-* classes defined in style.css — so every motif stays consistent and
   tiny, and all motion is automatically disabled under prefers-reduced-motion.

   Convention for every motif:
     - viewBox "0 0 140 86"; keep content within ~8px padding.
     - colour/stroke ONLY via the shared classes:
         m-line (green) · m-line2 (cyan) · m-warn (amber) · m-dim · m-faint
         m-fill (green) · m-fill2 (cyan)
     - animate ONLY via the shared classes (no inline <style>, <animate>, SMIL):
         m-spin · m-flow · m-pulse · m-blink · m-rise · m-scan · m-draw
         (+ m-d1/m-d2/m-d3 for staggered delays)
   ========================================================================== */
(function (root) {
  "use strict";

  var MOTIFS = {
    // Reference motif #1 — radar sweep (recon / scanning).
    "netsec-toolkit": `<svg viewBox="0 0 140 86" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g transform="translate(70 43)">
        <circle class="m-faint" r="13"/>
        <circle class="m-faint" r="25"/>
        <circle class="m-faint" r="36"/>
        <line class="m-faint" x1="-36" y1="0" x2="36" y2="0"/>
        <line class="m-faint" x1="0" y1="-36" x2="0" y2="36"/>
        <g class="m-spin">
          <circle r="36" fill="none" stroke="none"/>
          <line class="m-line" x1="0" y1="0" x2="36" y2="0"/>
        </g>
        <circle class="m-fill m-pulse" cx="20" cy="-15" r="2.6"/>
        <circle class="m-fill2 m-pulse m-d2" cx="-24" cy="12" r="2.2"/>
      </g>
    </svg>`,

    // Reference motif #2 — heartbeat / ECG (live monitoring).
    "sentinel": `<svg viewBox="0 0 140 86" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <line class="m-faint" x1="8" y1="44" x2="132" y2="44"/>
      <path class="m-line2 m-draw" d="M10 44 H42 l5 -20 l7 37 l6 -27 l5 10 H132"/>
      <circle class="m-fill m-pulse" cx="120" cy="22" r="3"/>
    </svg>`,

    // Log stream with a blinking brute-force alert row + a magnifier.
    "logwatch": `<svg viewBox="0 0 140 86" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="m-rise m-d1"><rect class="m-faint" x="14" y="16" width="70" height="3" rx="1.5"/></g><rect class="m-dim" x="14" y="25" width="52" height="3" rx="1.5"/><g class="m-rise m-d2"><rect class="m-faint" x="14" y="34" width="84" height="3" rx="1.5"/></g><rect class="m-warn m-blink" x="14" y="43" width="76" height="3" rx="1.5"/><rect class="m-dim" x="14" y="52" width="46" height="3" rx="1.5"/><g class="m-rise m-d1"><rect class="m-faint" x="14" y="61" width="64" height="3" rx="1.5"/></g><g transform="translate(106 60)"><circle class="m-line2" r="9" fill="none"/><line class="m-line2" x1="6.5" y1="6.5" x2="14" y2="14"/></g></svg>`,

    // Shield that draws itself + a check + hardening dots.
    "vps-bootstrap": `<svg viewBox="0 0 140 86" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path class="m-line2 m-draw" d="M70 12 L98 22 V44 C98 60 86 70 70 76 C54 70 42 60 42 44 V22 Z" fill="none"/><path class="m-line m-draw m-d2" d="M58 44 L67 53 L84 33" fill="none"/><circle class="m-fill m-pulse" cx="52" cy="64" r="2.2"/><circle class="m-fill m-pulse m-d1" cx="70" cy="68" r="2.2"/><circle class="m-fill m-pulse m-d2" cx="88" cy="64" r="2.2"/></svg>`,

    // Tic-tac-toe grid + a bobbing falling block + a sparkle.
    "game-lab": `<svg viewBox="0 0 140 86" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(46 23)"><line class="m-faint" x1="16" y1="0" x2="16" y2="48"/><line class="m-faint" x1="32" y1="0" x2="32" y2="48"/><line class="m-faint" x1="0" y1="16" x2="48" y2="16"/><line class="m-faint" x1="0" y1="32" x2="48" y2="32"/><g class="m-line2"><line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/></g><circle class="m-line" cx="40" cy="24" r="5" fill="none"/></g><g class="m-rise"><rect class="m-fill2" x="104" y="20" width="11" height="11" rx="2.5"/></g><circle class="m-fill m-blink" cx="110" cy="58" r="2.4"/></svg>`,

    // Secure request: nodes on a flowing line + a travelling packet + a padlock.
    "https-explained": `<svg viewBox="0 0 140 86" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><line class="m-faint" x1="14" y1="50" x2="126" y2="50"/><line class="m-line2 m-flow" x1="14" y1="50" x2="126" y2="50"/><circle class="m-line" cx="14" cy="50" r="5" fill="none"/><circle class="m-line" cx="51" cy="50" r="5" fill="none"/><circle class="m-fill2" cx="89" cy="50" r="5"/><circle class="m-line" cx="126" cy="50" r="5" fill="none"/><circle class="m-fill m-scan" cx="14" cy="50" r="2.6"/><g transform="translate(99 18)"><rect class="m-line2" x="0" y="9" width="20" height="14" rx="3" fill="none"/><path class="m-line2" d="M4 9 V5 a6 6 0 0 1 12 0 V9" fill="none"/><circle class="m-fill2 m-pulse" cx="10" cy="16" r="1.8"/></g></svg>`,

    // Automation pipeline: form -> gear -> AI spark -> Telegram, packet flowing.
    "lead-automation": `<svg viewBox="0 0 140 86" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><line class="m-faint" x1="20" y1="48" x2="120" y2="48"/><line class="m-line m-flow" x1="20" y1="48" x2="120" y2="48"/><rect class="m-line2" x="11" y="38" width="18" height="20" rx="2" fill="none"/><line class="m-faint" x1="15" y1="44" x2="25" y2="44"/><line class="m-faint" x1="15" y1="48" x2="25" y2="48"/><line class="m-faint" x1="15" y1="52" x2="21" y2="52"/><g transform="translate(57 48)"><g class="m-spin"><circle r="9" fill="none" stroke="none"/><circle class="m-line" r="7" fill="none"/><line class="m-line" x1="0" y1="-9" x2="0" y2="9"/><line class="m-line" x1="-9" y1="0" x2="9" y2="0"/></g></g><g transform="translate(86 48)"><path class="m-line2 m-pulse" d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill="none"/></g><path class="m-fill m-rise" d="M112 40 L128 48 L112 56 L116 48 Z"/><circle class="m-fill2 m-scan" cx="20" cy="48" r="2.6"/></svg>`,

    // Auth panel: window + avatar + lock arc + 2FA dots lighting up.
    "dashboard": `<svg viewBox="0 0 140 86" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect class="m-dim" x="34" y="16" width="72" height="54" rx="5" fill="none"/><line class="m-dim" x1="34" y1="28" x2="106" y2="28"/><circle class="m-faint" cx="40" cy="22" r="1.6"/><circle class="m-faint" cx="46" cy="22" r="1.6"/><circle class="m-line2" cx="70" cy="42" r="7" fill="none"/><path class="m-line2" d="M62 54 a8 7 0 0 1 16 0" fill="none"/><circle class="m-fill m-blink m-d1" cx="58" cy="62" r="2.6"/><circle class="m-fill m-blink m-d2" cx="70" cy="62" r="2.6"/><circle class="m-fill m-blink m-d3" cx="82" cy="62" r="2.6"/><line class="m-line" x1="58" y1="36" x2="82" y2="36" opacity="0.5"/></svg>`,

    // Calendar with a booked (checked) slot, a free pulsing slot, and a clock.
    "booking-bot": `<svg viewBox="0 0 140 86" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect class="m-dim" x="30" y="16" width="64" height="54" rx="5" fill="none"/><line class="m-dim" x1="30" y1="28" x2="94" y2="28"/><line class="m-faint" x1="30" y1="42" x2="94" y2="42"/><line class="m-faint" x1="30" y1="56" x2="94" y2="56"/><line class="m-faint" x1="51" y1="28" x2="51" y2="70"/><line class="m-faint" x1="72" y1="28" x2="72" y2="70"/><rect class="m-fill2" x="51" y="42" width="21" height="14"/><path class="m-line" d="M55 49 l4 4 l7 -8" fill="none"/><rect class="m-line m-pulse" x="72" y="56" width="22" height="14" fill="none" opacity="0.7"/><g transform="translate(104 56)"><circle class="m-line2" r="11" fill="none"/><line class="m-line2" x1="0" y1="0" x2="0" y2="-6"/><line class="m-line2" x1="0" y1="0" x2="5" y2="2"/></g></svg>`
  };

  // Browser global consumed by app.js.
  if (root) root.PORTFOLIO_MOTIFS = MOTIFS;
  // CommonJS export (so tests can assert motif coverage under Node).
  if (typeof module !== "undefined" && module.exports) module.exports = MOTIFS;
})(typeof window !== "undefined" ? window : null);
