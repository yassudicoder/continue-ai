# CONTINUE AI — "THE THREAD"
### Creative system for the experiential site · v2

---

## 1 · PRODUCT THESIS

An AI conversation accumulates something valuable: context, decisions, code,
momentum. Today that value is held hostage by whichever model the conversation
happened to start in. Continue AI makes the conversation a **portable object** —
capture the full thread on ChatGPT, Claude, or Gemini; package it into a
portable prompt; carry it through **your own clipboard** to any of eight AIs;
paste; continue.

The mechanism is the message. The route between models is *empty* — no Continue
AI cloud, no account, no telemetry, no conversation database. The capsule
travels from one browser tab to the next and never touches anyone's servers,
including ours. Privacy is not a feature card; it is the physics of the product.

**Never claim more than the extension does.** It captures, packages, copies.
The user pastes. Every scene on the site respects that mechanic.

## 2 · CREATIVE THESIS

**THE THREAD.** The entire site is one continuous line.

The conversation is drawn as a single thread that runs the full height of the
page. It begins inside Model A's chamber, gets thicker with accumulated context,
hits the context wall, is captured and wound into a capsule, crosses the empty
interchange between models — the void that proves nothing sits in the middle —
and unwinds inside Model B, where it keeps going. The scrollbar is the transfer
timeline: **scrolling performs the product.** The visitor doesn't read about a
transfer; they scrub through one.

Brand posture: **freight infrastructure for intelligence.** Waybills, cargo
manifests, customs stamps, routing boards. The capsule is painted
international orange for the same reason flight recorders are: so it can't be
lost. The site should feel like documents from a shipping company that moves
conversations instead of containers.

Anchor line: **NEVER LOSE THE THREAD.**

## 3 · VISUAL LANGUAGE

- **Canvas** — warm paper `#f4f1ea` and deep ink `#12130f`. Light ↔ dark is a
  *narrative* device, not a theme: paper inside the model chambers, ink in the
  void between them. No gradients, no glass, no glow, no particles.
- **Accent** — international orange `#ff4f00`. One accent; it is always the
  thread / the capsule / Continue AI acting. Model identities are 8px dots only.
- **Type** — three voices:
  - `Archivo` (variable, 500–900, some expanded) — the SHOUT: headlines, stamps.
  - `IBM Plex Mono` (400/500) — the MACHINE: manifests, states, annotations,
    coordinates, counters.
  - `Instrument Serif` (italic) — the WHISPER: one human sentence per act.
- **Primitives** — thread line · context packets (beads on the line) · capsule
  (pill + hazard chevrons + waybill) · model chambers (browser-ish frames) ·
  the wall (hatched boundary) · manifest rows (dotted leaders) · rubber stamps
  (rotated bordered ALL-CAPS) · waypoint plates (WPT 01…) · timeline ticks.
- **Texture** — faint SVG turbulence grain on paper, hairline rules,
  registration marks. Restraint between the big moments.

## 4 · EXPERIENCE STORYBOARD

- **S0 NAV** — hairline bar: spool mark, TRANSFER ROOM / MANIFEST / BLOG / FAQ,
  "Add to Chrome — free".
- **S1 ARRIVAL** (paper) — display stack: "SWITCH THE MODEL. / KEEP THE
  THREAD." Serif whisper: "Your conversation is no longer trapped inside one
  AI." Mono microline with the honest facts. CTAs. The thread starts at the
  headline's full stop and runs down the page.
- **S2 THE JOURNEY** (pinned, ~600vh of scroll, the film):
  1. **THE LONG CHAT** — a ChatGPT-ish chamber; a long working session
    time-lapses past; message counter and context meter climb.
  2. **THE WALL** — meter reddens, `CONTEXT LIMIT` stamp slams, the composer
    disables. "Every model has a wall."
  3. **CAPTURE** — the orange needle sweeps; every message gets an x-ray
    outline and a mono tag (USER / ASSISTANT / CODE / DECISION); the manifest
    counts up to 100% integrity. (Sample data, labeled.)
  4. **PACKAGE** — the tagged rows compress onto the thread into a capsule
    with a waybill: FROM CHATGPT → TO CLAUDE · CONTENTS: ENTIRE THREAD.
  5. **THE CROSSING** (ink) — the void. Routing board of 8 destinations; the
    Claude route lights; the capsule travels the thread. The void is where the
    privacy truth lives: NO CLOUD / NO ACCOUNT / NO TELEMETRY / NO DATABASE —
    "The space between models is empty. That's the point."
  6. **RECONSTRUCTION** (paper) — a Claude-ish chamber assembles; the capsule
    unwinds; the same conversation re-materializes; a cursor blinks; the next
    message is already being typed. Stamp: `CONTINUED · NOTHING LOST`.
- **S3 TRANSFER ROOM** (`#try`) — participation. The sample thread, a routing
  board of all 8 destinations, TRANSFER runs capture → manifest → package →
  route → reconstruct in miniature and **copies a real portable prompt** to the
  visitor's clipboard. Labeled: sample conversation, real prompt.
- **S4 THE MANUAL WAY** — controlled chaos vs one straight line. Nine scraps of
  the copy-paste ritual on a tangled gray path; then one orange line, one
  action.
- **S5 MANIFEST** (`#features`) — five cargo-manifest rows, each demonstrated,
  none identical: full-thread capture (virtualized window diagram) · 3 in → 8
  out (routing table) · exports (fanning file stubs) · local-first (the empty
  route) · long chats (deep spool).
- **S6 FIELD MANUAL** (`#faq`) — the five questions, manifest-styled.
- **S7 LAST CALL** (ink) — "TAKE THE THREAD WITH YOU." CTA, footer, the honest
  microline.

## 5 · SIGNATURE INTERACTION

**The Crossing.** A conversation physically leaves ChatGPT — decomposes into
tagged layers, compresses into an orange capsule on a thread, crosses an empty
black interchange past a routing board, enters Claude, and unspools back into
the same conversation — in one continuous scroll-scrubbed motion. It explains
capture, packaging, routing, privacy, and continuity without a word of UI copy,
and it is the moment people will record.

## 6 · MOTION SYSTEM

- Scroll position **is** the timeline in S2: deterministic, scrub-forward and
  scrub-backward, no autonomous animation while pinned. Easing is mechanical:
  `cubic-bezier(.65,0,.2,1)`.
- Objects never fade in from nowhere — they enter attached to the thread, and
  they leave along it.
- Stamps slam: scale 1.5 → 0.95 → 1 with ~2° rotation, 200ms, once per pass.
- Micro: magnetic primary CTA, mono state text on hover, copy-confirmation is a
  stamp, focus states are visible orange rules.
- `prefers-reduced-motion`: the pinned film becomes six static storyboard
  frames with captions; reveals become plain visibility; the demo jumps between
  states without tweens. Same information, same order, no motion.

## 7 · TECHNICAL PLAN

- Static, no build step (deploys as-is on Vercel, `cleanUrls`).
- **No frameworks.** One rAF scroll engine (~120 lines, vanilla): scene
  registration, per-act segment mapping (`seg(p, a, b)`), transform/opacity
  only, passive listeners, `will-change` on the few moving layers,
  content-visibility on below-fold sections.
- SVG for the thread (stroke-dashoffset drawing), routing board, and stamps.
  No canvas, no WebGL — the concept doesn't need them, and paper doesn't shade.
- Files: `index.html` (all narrative text is real, semantic HTML — the film
  annotates it, it doesn't replace it), `thread.css`, `thread.js`.
  Blog + privacy keep the legacy system (`styles.css` …) with an accent
  retheme; landing anchors `#try` `#features` `#faq` are preserved.
- Fonts: Google Fonts (Archivo variable; IBM Plex Mono 400/500; Instrument
  Serif italic), `display=swap`.
- A11y: semantic sections behind the film, keyboard-operable demo, visible
  focus, ARIA labels on the stage ("animated illustration of a transfer"),
  decorative layers `aria-hidden`.
- Honesty: journey counters count what is actually rendered; demo values are
  marked SAMPLE; transfer language is capture → package → **copy** → paste.
