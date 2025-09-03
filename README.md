# TV Explorer

**Live App:** [tv-explorer.netlify.app](https://tv-explorer.netlify.app)  
**Code:** [github.com/jc7k/tv-explorer](https://github.com/jc7k/tv-explorer)

---

## 🎬 Overview
**TV Explorer** is a production-ready web application that lets users discover trending TV shows, explore rich detail views, and navigate easily with a clean, modern interface.

- **Search & Discover:** Find shows quickly with responsive search and detail views.
- **Deployed on Netlify:** Fast, secure, and globally distributed.
- **Modern Stack:** React 18, TypeScript, Vite, TailwindCSS.
- **Accessibility:** WCAG-aware, tested with jest-axe and @axe-core/react.

### ✨ Key Features
- Fast client-side routing with React Router v6.
- Production security headers and caching configured in Netlify.
- Accessibility checks baked into CI with `vitest`, Testing Library, and jest-axe.
- SPA routing fallback ensures clean deep-linking.

---

## 🚀 Quick Start
```bash
# 1. Clone this repository
git clone https://github.com/jc7k/tv-explorer.git
cd tv-explorer

# 2. Install dependencies
npm install

# 3. Add your TMDB API key
# In Netlify or local .env file
VITE_TMDB_API_KEY=your_api_key_here

# 4. Run locally
npm run dev

# 5. Build for production
npm run build
```

---

## 🛠️ Tech Stack
- **Frontend:** React 18, TypeScript, Vite
- **Styling:** TailwindCSS, lucide-react icons
- **Routing:** React Router v6
- **Testing:** Vitest, Testing Library, jest-axe, @axe-core/react
- **Deployment:** Netlify (Node 18 runtime, SPA redirects)

---

## 📈 Engineering Highlights
- **Security:** Netlify config enforces X-Frame-Options, XSS protection, referrer and permission policies.
- **Performance:** Cache-control policies—immutable for assets, revalidate for HTML.
- **Testing Discipline:** Unit, integration, accessibility, and coverage testing included.
- **Accessibility:** Live checks with jest-axe, ensuring WCAG alignment.

---

## 🔬 Context Engineering Methodology
This project also serves as a **Context Engineering demo**—a new paradigm for working with AI coding assistants.

### Prompt Engineering vs Context Engineering
- **Prompt Engineering:** Focuses on clever phrasing—like writing sticky notes.
- **Context Engineering:** Supplies assistants with comprehensive documentation, examples, and validation gates—like giving them a full screenplay.

### Why It Matters
1. **Reduces AI Failures:** Errors are usually context failures, not model failures.
2. **Ensures Consistency:** AI follows project rules and conventions.
3. **Enables Complex Features:** Multi-step implementations become feasible.
4. **Self-Correcting:** Validation loops let AI fix its own mistakes.

### The Workflow
- **INITIAL.md:** Define feature requests.
- **CLAUDE.md:** Global project rules.
- **Examples/**: Code patterns the AI should follow.
- **PRPs/** (Product Requirements Prompts): AI-readable PRDs with implementation details, validation gates, and test requirements.

Commands inside Claude Code:
```bash
/generate-prp INITIAL.md
/execute-prp PRPs/your-feature-name.md
```

This structured approach allowed **TV Explorer** to be implemented rapidly, with production-quality results.

---

## 📌 Roadmap
- Advanced filters (genre, network, release year)
- Pagination for large result sets
- Deep-linkable routes with shareable show pages
- Observability (Sentry, RUM metrics)
- Lighthouse CI performance budgets

---

## 📚 Resources
- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Context Engineering Best Practices](https://www.philschmid.de/context-engineering)

---

## 👤 Author
Built by Jeff Chen as part of independent practice in Generative AI and Context Engineering.
