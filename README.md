# Continue AI — experiential site

Marketing site for the **Continue AI** Chrome extension — continue any AI
chat on another model (ChatGPT, Claude, or Gemini) in one click, without losing
context. Local-first, no account.

The landing page is a scroll-driven experience ("**The Thread**"): the visitor
scrubs through an actual transfer — a long chat hits its context limit, gets
captured and tagged, compresses into a context capsule, crosses the empty
interchange between models, and reconstructs inside the destination. See
`DESIGN.md` for the full creative system.

- **Extension:** https://chromewebstore.google.com/detail/continue-ai-%E2%80%94-move-your-a/cojmibmimpeakmgllhpolgbjienedfkf
- **Live site:** https://continue-ai-lilac.vercel.app/

## What's here

Plain static HTML/CSS/JS — **no build step, no frameworks, no third-party
requests** (fonts are self-hosted, analytics ships off).

| Path | What |
|---|---|
| `index.html` | The experience: arrival, the journey film (+ static storyboard fallback), transfer room demo, manual-way contrast, cargo manifest, field manual, last call |
| `thread.css` | Design system for the landing (paper/ink/extension signal blue) |
| `thread.js` | rAF scroll engine driving the pinned film + the interactive transfer room |
| `fonts/` | Self-hosted woff2 (Archivo variable, IBM Plex Mono, Instrument Serif) |
| `DESIGN.md` | Creative system: thesis, visual language, storyboard, motion & tech plan |
| `blog/` | Blog hub + 3 articles (legacy design system, rethemed to the new accent) |
| `privacy.html` | Privacy policy |
| `og/` | Open Graph cover (`cover.png`) + its HTML source (screenshot at 1200×630) |
| `styles.css`, `spec-sheet.css`, `dark.css`, `creative.css` | Legacy system — used by blog + privacy only |
| `motion.js`, `creative.js`, `theme.js`, `analytics.js` | Behaviour for blog/privacy (analytics off by default; also loaded no-op on the landing) |
| `_redirects`, `vercel.json`, `robots.txt`, `sitemap.xml` | Hosting + SEO config |

## Notes for editing the landing

- Scroll position **is** the film's timeline: `thread.js` maps scrollY → p ∈
  [0,1] → per-act states. Everything is idempotent per frame, so it scrubs both
  directions.
- `prefers-reduced-motion` (or no JS) swaps the film for a six-frame static
  storyboard — the storyboard is also what screen readers get.
- Every number shown in the film/demo is derived from the sample conversation
  in `thread.js` (`CONVO`) and labeled SAMPLE. Keep it that way: the site never
  claims metrics the extension doesn't have, and transfer language is always
  capture → package → **copy** → you paste.

## Local preview

```bash
python -m http.server 8000
# open http://localhost:8000
```

## Deploy (Vercel)

No build command; root directory. `vercel.json` (`cleanUrls`) serves
`/privacy` and `/blog/...` without `.html`. If you move to a custom domain,
update the canonical/OG URLs in every page head plus `sitemap.xml` and
`robots.txt`.
