/* ==========================================================================
   githubuseradmin — portfolio project data
   --------------------------------------------------------------------------
   Pure data module: the content behind each project "walkthrough" overlay
   (summary, highlights, a small architecture diagram, and external links).
   No DOM, no side effects — app.js renders this into the overlay.

   Keeping data here (separate from the rendering/behaviour in app.js) mirrors
   the steps.js / app.js split used in the https-explained project, and lets
   the pure helpers in app.js be unit-tested with a fixture.

   Diagram model
   -------------
   Each diagram is a tiny declarative graph drawn on a fixed SVG viewBox:
     nodes: [{ id, x, y, label, kind, w?, h? }]
            label may contain a single "\n" to wrap onto a second (dimmer) line.
            kind ∈ io | core | store | ext | out | sec  (drives the accent colour)
     edges: [{ from, to, kind? }]
            kind "flow" (default) = solid accent edge with a travelling pulse;
            kind "dep"            = dashed, secondary edge (cross-cutting/feedback).
   The renderer in app.js lays out nothing — coordinates are authored here so
   every diagram stays deliberate and uncluttered.

   Exposed as a browser global (window.PORTFOLIO_PROJECTS) and, when required
   under Node for tests, as a CommonJS export.
   ========================================================================== */
(function (root) {
  "use strict";

  var GH = "https://github.com/githubuseradmin";
  var PAGES = "https://githubuseradmin.github.io";

  // Default node box size (a diagram may override per node).
  var NODE_W = 150;
  var NODE_H = 50;

  var PROJECTS = [
    /* ----------------------------------------------------------------- */
    {
      id: "netsec-toolkit",
      name: "netsec-toolkit",
      icon: "$",
      summary:
        "A zero-dependency Python CLI for recon and triage: five read-only " +
        "probes feed one weighted security grade, so a host goes from raw " +
        "scan to an A–F verdict in a single command.",
      stack: ["Python", "stdlib only", "asyncio", "CLI"],
      stats: [
        { k: "tests", v: "106" },
        { k: "deps", v: "0" },
        { k: "grade", v: "A–F" }
      ],
      highlights: [
        "Five subcommands — scan · headers · tls · dns · audit",
        "Pure logic split from I/O → all 106 tests run offline",
        "--json on every command, CI-friendly exit codes (0/1/2)",
        "Cookie values are discarded on purpose — secrets never logged"
      ],
      diagram: {
        viewBox: "0 0 680 140",
        nodes: [
          { id: "t", x: 10, y: 45, label: "target\nhost / url", kind: "io" },
          { id: "p", x: 180, y: 45, label: "probes\nscan·headers·tls·dns", kind: "core" },
          { id: "g", x: 350, y: 45, label: "grader\nweighted 0–100", kind: "core" },
          { id: "r", x: 520, y: 45, label: "A–F · JSON", kind: "out" }
        ],
        edges: [
          { from: "t", to: "p" },
          { from: "p", to: "g" },
          { from: "g", to: "r" }
        ]
      },
      links: [
        { label: "Code", kind: "code", href: GH + "/netsec-toolkit" },
        { label: "README", kind: "readme", href: GH + "/netsec-toolkit#readme" }
      ]
    },

    /* ----------------------------------------------------------------- */
    {
      id: "logwatch",
      name: "logwatch",
      icon: "$",
      summary:
        "A stdlib log-analysis tool that turns noisy nginx / sshd logs into a " +
        "ranked security report — flagging traversal, SQLi, XSS, scanners and " +
        "SSH brute-force, with an exit code you can gate CI on.",
      stack: ["Python", "stdlib only", "log analysis", "security"],
      stats: [
        { k: "tests", v: "92" },
        { k: "deps", v: "0" },
        { k: "out", v: "html·md·json" }
      ],
      highlights: [
        "Layered pipeline: parsers → detectors → analyzers → report",
        "Brute-force detection via a sliding-window deque",
        "Allow-list (IP / CIDR, v4 + v6) suppresses known-good sources",
        "Every attacker-controlled field is HTML-escaped in exports"
      ],
      diagram: {
        viewBox: "0 0 680 140",
        nodes: [
          { id: "l", x: 10, y: 45, label: "log\nnginx · sshd", kind: "io" },
          { id: "p", x: 180, y: 45, label: "parse + detect\ntraversal·SQLi·brute", kind: "core" },
          { id: "a", x: 350, y: 45, label: "aggregate\ncounters · risk", kind: "core" },
          { id: "r", x: 520, y: 45, label: "report\nhtml·md·json", kind: "out" }
        ],
        edges: [
          { from: "l", to: "p" },
          { from: "p", to: "a" },
          { from: "a", to: "r" }
        ]
      },
      links: [
        { label: "Code", kind: "code", href: GH + "/logwatch" },
        { label: "README", kind: "readme", href: GH + "/logwatch#readme" }
      ]
    },

    /* ----------------------------------------------------------------- */
    {
      id: "vps-bootstrap",
      name: "vps-bootstrap",
      icon: "$",
      summary:
        "One idempotent Bash script that takes a fresh Ubuntu/Debian VPS from " +
        "“root over port 22” to a hardened baseline — and a read-only --verify " +
        "mode that audits the live host without changing a thing.",
      stack: ["Bash", "Ubuntu / Debian", "hardening", "DevOps"],
      stats: [
        { k: "steps", v: "14" },
        { k: "tests", v: "18" },
        { k: "mode", v: "set · verify" }
      ],
      highlights: [
        "Anti-lockout by design: never goes key-only without a valid key + open port",
        "SSH hardening via a drop-in, not edits to the distro sshd_config",
        "--verify reads live daemon state (sshd -T, ufw, fail2ban, sysctl)",
        "fail2ban · UFW · unattended-upgrades · swap · sysctl tuning"
      ],
      diagram: {
        viewBox: "0 0 680 215",
        nodes: [
          { id: "v", x: 10, y: 40, label: "fresh VPS\nroot · :22", kind: "io" },
          { id: "s", x: 180, y: 40, label: "14 steps\nuser·key·UFW·f2b", kind: "core" },
          { id: "h", x: 350, y: 40, label: "hardened host", kind: "out" },
          { id: "a", x: 350, y: 145, label: "--verify\nPASS/WARN/FAIL", kind: "io" }
        ],
        edges: [
          { from: "v", to: "s" },
          { from: "s", to: "h" },
          { from: "h", to: "a", kind: "dep" }
        ]
      },
      links: [
        { label: "Code", kind: "code", href: GH + "/vps-bootstrap" },
        { label: "README", kind: "readme", href: GH + "/vps-bootstrap#readme" }
      ]
    },

    /* ----------------------------------------------------------------- */
    {
      id: "https-explained",
      name: "https-explained",
      icon: "▶",
      summary:
        "An interactive, animated explainer of what really happens when you " +
        "open an https:// URL — seven navigable stages from keystroke to " +
        "pixels, doubling as intro networking / web-security course material.",
      stack: ["JavaScript", "SVG", "no build", "education"],
      stats: [
        { k: "stages", v: "7" },
        { k: "tests", v: "15" },
        { k: "deps", v: "0" }
      ],
      highlights: [
        "Data/logic (steps.js) split from DOM/animation (app.js) → unit-testable",
        "Packet motion via the Web Animations API; deep-linkable per stage",
        "Full keyboard nav, aria-live captions, prefers-reduced-motion aware",
        "Honest about its teaching simplifications (TLS 1.3 collapsed, single DNS hop)"
      ],
      diagram: {
        viewBox: "0 0 680 215",
        nodes: [
          { id: "url", x: 20, y: 38, label: "URL", kind: "io" },
          { id: "dns", x: 265, y: 38, label: "DNS\nresolve", kind: "core" },
          { id: "tcp", x: 510, y: 38, label: "TCP\nconnect", kind: "core" },
          { id: "tls", x: 510, y: 148, label: "TLS 1.3\nhandshake", kind: "core" },
          { id: "http", x: 265, y: 148, label: "HTTP\nrequest", kind: "core" },
          { id: "render", x: 20, y: 148, label: "render\npixels", kind: "out" }
        ],
        edges: [
          { from: "url", to: "dns" },
          { from: "dns", to: "tcp" },
          { from: "tcp", to: "tls" },
          { from: "tls", to: "http" },
          { from: "http", to: "render" }
        ]
      },
      links: [
        { label: "Live demo", kind: "demo", href: PAGES + "/https-explained/" },
        { label: "Code", kind: "code", href: GH + "/https-explained" },
        { label: "README", kind: "readme", href: GH + "/https-explained#readme" }
      ]
    },

    /* ----------------------------------------------------------------- */
    {
      id: "dashboard",
      name: "dashboard",
      icon: "$",
      summary:
        "A full-stack Flask dashboard with the boring-but-essential plumbing " +
        "every app needs: auth with optional TOTP 2FA, four-role access " +
        "control, an admin panel and a support-ticket flow — app-factory + " +
        "blueprints, server-rendered with HTMX.",
      stack: ["Flask", "SQLAlchemy", "HTMX", "2FA", "RBAC"],
      stats: [
        { k: "routes", v: "19" },
        { k: "roles", v: "4" },
        { k: "tests", v: "20" }
      ],
      highlights: [
        "App-factory wires four blueprints: auth · dashboard · admin · support",
        "Security layer: bcrypt, pyotp TOTP + QR, hand-rolled signed CSRF",
        "Role guard rails — no self-demote of the last admin; mods can't touch admins",
        "One codebase, SQLite by default or MySQL via DATABASE_URL"
      ],
      diagram: {
        viewBox: "0 0 680 215",
        nodes: [
          { id: "b", x: 10, y: 150, label: "browser\n+ HTMX", kind: "io" },
          { id: "f", x: 180, y: 150, label: "Flask factory\nCSRF · session", kind: "core" },
          { id: "p", x: 350, y: 150, label: "blueprints\nauth·dash·admin·support", kind: "core" },
          { id: "d", x: 520, y: 150, label: "SQLAlchemy\nSQLite / MySQL", kind: "store" },
          { id: "s", x: 265, y: 30, label: "security\n2FA·bcrypt·RBAC", kind: "sec" }
        ],
        edges: [
          { from: "b", to: "f" },
          { from: "f", to: "p" },
          { from: "p", to: "d" },
          { from: "s", to: "f", kind: "dep" },
          { from: "s", to: "p", kind: "dep" }
        ]
      },
      links: [
        { label: "Code", kind: "code", href: GH + "/dashboard" },
        { label: "README", kind: "readme", href: GH + "/dashboard#readme" }
      ]
    },

    /* ----------------------------------------------------------------- */
    {
      id: "sentinel",
      name: "sentinel",
      icon: "$",
      summary:
        "A zero-dependency, self-hosted uptime / TLS monitor with Telegram " +
        "alerts. Plugin sensors emit events into one core — SQLite store, " +
        "alerter and status page — and a debounced state machine pages you on " +
        "real outages, not blips.",
      stack: ["Python", "stdlib only", "SQLite", "Telegram"],
      stats: [
        { k: "tests", v: "106" },
        { k: "deps", v: "0" },
        { k: "checks", v: "4" }
      ],
      highlights: [
        "Checks HTTP · TCP · TLS (cert expiry) · DNS, per-target thresholds",
        "Debounced state machine (hysteresis): alerts on transitions, not flaps",
        "Telegram + console alerts; SQLite history → uptime % and incidents",
        "Daemon or one-shot for cron/CI (exit 0/1/2) + a static dark status page",
        "Plugin sensor seam — an SSH honeypot sensor drops into the same core next"
      ],
      diagram: {
        viewBox: "0 0 680 232",
        nodes: [
          { id: "hp", x: 10, y: 10, label: "ssh honeypot\n(next sensor)", kind: "ext" },
          { id: "up", x: 10, y: 96, label: "uptime sensor\nHTTP·TCP·TLS·DNS", kind: "io" },
          { id: "core", x: 265, y: 96, label: "core\nstate machine", kind: "core" },
          { id: "db", x: 510, y: 10, label: "SQLite\nevents · incidents", kind: "store" },
          { id: "al", x: 510, y: 96, label: "alerts\nTelegram · console", kind: "out" },
          { id: "st", x: 510, y: 172, label: "status page\nHTML", kind: "out" }
        ],
        edges: [
          { from: "up", to: "core" },
          { from: "hp", to: "core", kind: "dep" },
          { from: "core", to: "db" },
          { from: "core", to: "al" },
          { from: "core", to: "st" }
        ]
      },
      links: [
        { label: "Code", kind: "code", href: GH + "/sentinel" },
        { label: "README", kind: "readme", href: GH + "/sentinel#readme" }
      ]
    },

    /* ----------------------------------------------------------------- */
    {
      id: "booking-bot",
      name: "telegram-booking-bot",
      icon: "▶",
      badge: "demo",
      summary:
        "A booking assistant for a small service business (barbershop / salon): " +
        "a Telegram chat-bot plus a Mini App pick a service, master and free " +
        "time slot, store it in SQLite, and fire reminders before the visit.",
      stack: ["Python", "aiogram", "Mini App", "SQLite", "APScheduler"],
      stats: [
        { k: "UI", v: "Mini App" },
        { k: "lang", v: "RU" },
        { k: "demo", v: "live" }
      ],
      highlights: [
        "Slot engine respects per-master capacity and an “any master” option",
        "Telegram Mini App checkout mirrored to /docs for GitHub Pages",
        "APScheduler sends pre-visit reminders back to the client",
        "Client UI is intentionally Russian; dev docs are English"
      ],
      // System I'd like to improve next — see the note in the overlay.
      note:
        "Next iteration: rework the booking core (calendar conflicts, " +
        "cancellations, staff notifications) into a cleaner state machine.",
      diagram: {
        viewBox: "0 0 680 232",
        nodes: [
          { id: "c", x: 10, y: 85, label: "client\nTelegram · Mini App", kind: "io" },
          { id: "bot", x: 250, y: 85, label: "aiogram bot\nFSM · slots", kind: "core" },
          { id: "db", x: 490, y: 85, label: "SQLite\nbookings · masters", kind: "store" },
          { id: "sch", x: 250, y: 175, label: "APScheduler\nreminders", kind: "core" }
        ],
        edges: [
          { from: "c", to: "bot" },
          { from: "bot", to: "db" },
          { from: "bot", to: "sch", kind: "dep" },
          { from: "sch", to: "c", kind: "dep" }
        ]
      },
      links: [
        { label: "Live demo", kind: "demo", href: PAGES + "/telegram-booking-bot-test/" },
        { label: "Code", kind: "code", href: GH + "/telegram-booking-bot-test" },
        { label: "README", kind: "readme", href: GH + "/telegram-booking-bot-test#readme" }
      ]
    },

    /* ----------------------------------------------------------------- */
    {
      id: "lead-automation",
      name: "landing + n8n",
      icon: "▶",
      badge: "demo",
      summary:
        "A two-part lead-automation demo: a premium barbershop landing page " +
        "posts its form to an n8n workflow, which normalises the lead, logs it " +
        "to Google Sheets, drafts a reply with GPT-4o-mini and pings Telegram — " +
        "wired together by one shared webhook contract.",
      stack: ["HTML/CSS/JS", "n8n", "webhook", "OpenAI", "Google Sheets"],
      stats: [
        { k: "nodes", v: "6" },
        { k: "link", v: "/webhook/lead" },
        { k: "demo", v: "live" }
      ],
      highlights: [
        "Landing and workflow share one JSON lead contract (POST /webhook/lead)",
        "Landing runs in demo mode (logs the payload) until a webhook URL is set",
        "n8n flow: webhook → normalize → Sheets → GPT-4o-mini → Telegram",
        "No secrets in the repo — credentials referenced by placeholder only"
      ],
      diagram: {
        viewBox: "0 0 680 140",
        nodes: [
          { id: "form", x: 10, y: 45, label: "landing\nlead form", kind: "io" },
          { id: "hook", x: 180, y: 45, label: "n8n\nwebhook /lead", kind: "core" },
          { id: "enrich", x: 350, y: 45, label: "enrich\nSheets · GPT-4o-mini", kind: "ext" },
          { id: "alert", x: 520, y: 45, label: "Telegram\nlead alert", kind: "out" }
        ],
        edges: [
          { from: "form", to: "hook" },
          { from: "hook", to: "enrich" },
          { from: "enrich", to: "alert" }
        ]
      },
      links: [
        { label: "Live landing", kind: "demo", href: PAGES + "/landing-demo/" },
        { label: "Landing code", kind: "code", href: GH + "/landing-demo" },
        { label: "n8n workflow", kind: "code", href: GH + "/n8n-automation-demo" }
      ]
    },

    /* ----------------------------------------------------------------- */
    {
      id: "game-lab",
      name: "browser games",
      icon: "▶",
      badge: "test · demo",
      summary:
        "Three self-contained, zero-dependency browser toys built to explore " +
        "ideas — an unbeatable tic-tac-toe (minimax), a 1010!-style block " +
        "puzzle, and a procedural art + sound generator. Single-file demos, " +
        "kept as throwaway “-test” repos.",
      stack: ["HTML/JS", "no build", "SVG", "Web Audio"],
      stats: [
        { k: "games", v: "3" },
        { k: "deps", v: "0" },
        { k: "demo", v: "live" }
      ],
      highlights: [
        "tic-tac-toe — minimax + alpha-beta (unbeatable) and an Infinity variant",
        "block-blast — pointer drag-drop, line clears, combos, persistent best score",
        "asset-lab — procedural SVG creatures + synthesized chiptune via Web Audio",
        "Each is one index.html: markup, styles and logic inline"
      ],
      diagram: {
        viewBox: "0 0 680 232",
        nodes: [
          { id: "web", x: 30, y: 90, label: "browser\nzero deps", kind: "io" },
          { id: "ttt", x: 400, y: 14, label: "tic-tac-toe\nminimax", kind: "core" },
          { id: "bb", x: 400, y: 90, label: "block-blast\ndrag · combos", kind: "core" },
          { id: "al", x: 400, y: 166, label: "asset-lab\nSVG · Web Audio", kind: "core" }
        ],
        edges: [
          { from: "web", to: "ttt" },
          { from: "web", to: "bb" },
          { from: "web", to: "al" }
        ]
      },
      links: [
        { label: "tic-tac-toe", kind: "demo", href: PAGES + "/tic-tac-toe-2-test/" },
        { label: "block-blast", kind: "demo", href: PAGES + "/block-blast-test/" },
        { label: "asset-lab", kind: "demo", href: PAGES + "/asset-lab-test/" }
      ]
    }
  ];

  var api = { PROJECTS: PROJECTS, NODE_W: NODE_W, NODE_H: NODE_H };

  // Browser global
  if (root) root.PORTFOLIO_PROJECTS = api;
  // CommonJS (tests under Node)
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : null);
