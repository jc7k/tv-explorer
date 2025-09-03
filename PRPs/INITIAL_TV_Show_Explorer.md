# INITIAL.md – TV Show Explorer (Netlify-ready, KISS)

**FEATURE:**  
TV Show Explorer is a lightweight web app that lets users discover series at a glance and dive deep when curiosity strikes. The landing screen features a sleek hero search bar plus two dynamic, scroll-snappable carousels—one surfacing TMDB’s “Trending Today” posters, the other its current “Most Popular” lineup—inviting instant exploration beyond a plain grid. Selecting any show opens a rich detail view packed with ratings, synopsis, cast, seasons/episodes, streaming providers, and similar‑show suggestions, giving newcomers plenty to click without feeling overwhelmed. This web app will be deployed on Netlify via CI/CD.

---

**EXAMPLES (User journeys):**  
- **Instant browse:** User lands and scroll-snaps through **Trending Today**; taps a card → opens a detail drawer with synopsis, rating, and “Where to Watch.”  
- **Targeted search:** User types a series name → top results appear with posters and first air date; pressing Enter navigates to the best match.  
- **Deeper dive:** From a show’s page, user flips between **Overview**, **Cast**, **Seasons**, and **Similar** tabs; clicks a provider chip to jump to the streaming app.  
- **Serendipity:** From **Most Popular**, user discovers an older classic; the **Similar** tab recommends related series to queue next.  

---

**DOCUMENTATION & EXAMPLES (via Archon MCP server):**  
- **Source of truth:** All API docs, request/response examples, rate limits, and field definitions are **retrieved on demand through the Archon MCP server**, not embedded here. This keeps docs current and reduces maintenance. citeturn0search1  
- **Targets to fetch through MCP:**  
  - TMDB TV APIs (search, trending, popular, details, credits, recommendations, watch/providers).  
  - Image configuration (base URLs, sizes) to build poster/backdrop URLs.  
  - Any pagination, language, and region parameters needed.  
- **Operational notes:**  
  - The dev workflow queries Archon from the IDE to pull the latest endpoints and sample payloads before coding a feature.  
  - Example prompts for Archon: “Fetch TMDB TV API docs for ‘Trending’ and provide a minimal request/response example,” “Show rate limits and recommended caching for TV endpoints.”  
- **Why MCP:** Standardized, tool‑agnostic access to live documentation that prevents drift. citeturn0search16

> Format of this document follows the same structure as the previously shared `INITIAL.md` pattern for rapid app scaffolding. fileciteturn0file0

---

**TECH STACK (keep-it-simple):**  
- **Frontend:** Vite + React + TypeScript, TailwindCSS, minimal state via URL + component state (avoid heavy global stores).  
- **Data:** Direct fetch to TMDB REST endpoints (read-only).  
- **Build/Host:** Netlify (static build); environment variable for TMDB API key.  
- **Tooling:** Archon MCP for up-to-date API docs & examples; no separate API proxy unless rate limiting demands it.

---

**MVP SCOPE:**  
- Landing page: search bar + two carousels (**Trending Today**, **Most Popular**).  
- TV detail route: poster, title, year, rating, synopsis; tabs for **Cast**, **Seasons/Episodes** (lazy‑loaded), **Where to Watch/Providers**, **Similar**.  
- Error/Empty states: helpful messages and “try another search.”  
- Performance: lazy image loading, responsive sizes, minimal JS.  
- Accessibility: keyboard navigation for carousels; alt text on posters; focus states.  
- Analytics (optional): Netlify Analytics or simple pageview events.

---

**REPO / DIRECTORY (Netlify‑compatible):**  
Keep the structure close to a standard Vite app so Netlify auto-detects the build. This mirrors a simple, working pattern seen in similar React+Vite repos. citeturn1view0

```
tv-show-explorer/
├─ public/                 # static assets (favicon, app icons)
├─ src/
│  ├─ app/
│  │  ├─ routes/           # / (home), /show/:id
│  │  ├─ components/       # Carousel, Card, Tabs
│  │  ├─ hooks/            # useTmdb(), useDebouncedSearch()
│  │  └─ lib/              # small utilities (imageUrl, formatters)
│  ├─ styles/              # Tailwind entry, global.css
│  ├─ main.tsx             # React bootstrap
│  └─ index.css
├─ index.html
├─ package.json
├─ vite.config.ts
├─ netlify.toml            # Netlify config
└─ .env.example            # TMDB_API_KEY=...
```

**`netlify.toml` (minimal):**
```
[build]
  command = "npm run build"
  publish = "dist"

[template.environment]
  TMDB_API_KEY = "Your TMDB API key"

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"
```

**ENV & CONFIG:**  
- `TMDB_API_KEY` supplied via Netlify environment variables.  
- Image base URL & sizes read at runtime from TMDB configuration endpoint (fetched and cached on first load).  
- Region/language defaults (e.g., `en-US`, `US`) can be toggled via query params.

---

**UX NOTES (KISS):**  
- Use scroll‑snappable horizontal carousels with inertial scrolling; arrow buttons only if needed.  
- Keep detail view content above the fold: poster, title/year, rating, synopsis, clear CTA to “Where to Watch.”  
- Tabs lazily load content; skeletons during fetch.  
- Avoid modals for deep navigation—use routes so back/forward work predictably.

---

**NON‑GOALS (V1):**  
- User accounts, watchlists, or reviews.  
- Server-side rendering.  
- Localization beyond a single language/region default.

---

**SUCCESS METRICS:**  
- Time to first contentful interaction on landing (<2s on mid‑tier mobile).  
- Search-to-click conversion rate.  
- Detail page engagement (tab clicks, provider clicks).

---

**RISKS & MITIGATIONS:**  
- **API limits:** Add client‑side caching and debounced search; if needed, a tiny Netlify Function proxy later.  
- **Poster bandwidth:** Use responsive `srcset` and lazy loading.  
- **Docs drift:** Always fetch latest TMDB docs & examples through Archon MCP before shipping. citeturn0search1

---

**TASK CHECKLIST (Day 0 → Ship):**  
1) Bootstrap Vite + React + TS; wire Tailwind.  
2) Add Netlify config; set `TMDB_API_KEY` in dashboard.  
3) Implement `useTmdb()` with endpoints for trending, popular, search, details, credits, recommendations, providers.  
4) Build carousels and search bar on `/`.  
5) Build detail route with tabs and lazy fetch.  
6) Add empty/error states and loading skeletons.  
7) Lighthouse & performance sweep; ship to Netlify preview → production.

---

**References**  
- Archon MCP server (live doc/examples retrieval). citeturn0search1  
- Repo pattern inspiration for React+Vite + public/src/index.html layout. citeturn1view0
- Background on MCP as a standard protocol. citeturn0search16
