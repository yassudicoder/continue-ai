# Continue AI — marketing site

Static landing site for the **Continue AI** Chrome extension — continue any AI
chat on another model (ChatGPT, Claude, or Gemini) in one click, without losing
context. Local-first, no account.

- **Extension:** https://chromewebstore.google.com/detail/continue-ai-%E2%80%94-move-your-a/cojmibmimpeakmgllhpolgbjienedfkf
- **Live site:** https://continue-ai.netlify.app/ *(update if deployed under a different subdomain)*

## What's here

Plain static HTML/CSS/JS — **no build step**.

| Path | What |
|---|---|
| `index.html` | Landing page (hero, live transfer demo, feature ledger, FAQ) |
| `blog/` | Blog hub + 3 articles |
| `privacy.html` | Privacy policy |
| `og/` | Open Graph cover (`cover.png`) + its HTML source |
| `styles.css`, `spec-sheet.css`, `dark.css`, `creative.css` | Design system |
| `motion.js`, `creative.js`, `theme.js`, `analytics.js`, `script.js` | Behaviour (analytics off by default) |
| `_redirects`, `robots.txt`, `sitemap.xml` | Netlify + SEO config |

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
