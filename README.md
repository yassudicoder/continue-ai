# Continue AI — marketing site

Static landing site for the **Continue AI** Chrome extension — continue any AI
chat on another model (ChatGPT, Claude, or Gemini) in one click, without losing
context. Local-first, no account.

- **Extension:** https://chromewebstore.google.com/detail/continue-ai-%E2%80%94-move-your-a/cojmibmimpeakmgllhpolgbjienedfkf
- **Live site:** https://continue-ai.netlify.app/ *(update if deployed under a different subdomain)*

## What's here

Plain static HTML/CSS/JS — **no build step**.

The landing page is the **TRANSIT** experience: a scroll-driven narrative
("THE CROSSING") where a conversation is captured out of one model, packed
into a context capsule, carried across the model boundary, and rebuilt in
another model — plus an interactive Handoff Terminal demo, a drawn
trust-boundary privacy map, and a cargo-manifest feature ledger.

| Path | What |
|---|---|
| `index.html` | Landing page (THE CROSSING scroll narrative, handoff terminal, trust boundary, cargo manifest, FAQ) |
| `transit.css`, `transit.js` | The landing page's design system + behaviour (self-contained, no dependencies) |
| `fonts/` | Self-hosted woff2 (Space Grotesk · JetBrains Mono · Inter, latin subsets) |
| `blog/` | Blog hub + 3 articles (legacy "field notes" styling) |
| `privacy.html` | Privacy policy |
| `og/` | Open Graph cover (`cover.png`) + its HTML source (render at 1200×630) |
| `styles.css`, `spec-sheet.css`, `dark.css`, `creative.css` | Legacy design system, still used by `blog/` + `privacy.html` |
| `motion.js`, `creative.js`, `theme.js` | Legacy behaviour for blog/privacy pages |
| `analytics.js` | Site analytics — **off by default** (no key set → no requests) |
| `_redirects`, `vercel.json`, `robots.txt`, `sitemap.xml` | Netlify/Vercel + SEO config |

## Local preview

```bash
python -m http.server 8000
# open http://localhost:8000
```

## Deploy (Netlify)

No build command; **publish directory = repo root**. `_redirects` handles the
clean `/blog/…` and `/privacy` URLs. After deploying, replace the placeholder
`continue-ai.netlify.app` in the `<link rel="canonical">` / Open Graph tags,
`sitemap.xml`, and `robots.txt` with your real domain.
