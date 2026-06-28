#!/bin/bash
# TELO — Full Git history setup script
# Run this ONCE from the project root after cloning

set -e

echo "🚀 Setting up TELO git repository with full commit history..."

git init
git config user.email "dev@telo.dev"
git config user.name "TELO Developer"

# ────────────────────────────────────────────────────────────────
# COMMIT 1 — Project scaffolding
# ────────────────────────────────────────────────────────────────
git add .gitignore README.md package.json
git commit -m "chore: initialize TELO monorepo structure"

# ────────────────────────────────────────────────────────────────
# COMMIT 2 — Backend scaffold
# ────────────────────────────────────────────────────────────────
git add backend/package.json backend/.env.example backend/server.js
git commit -m "feat(backend): scaffold Express server with CORS, helmet, rate-limiting"

# ────────────────────────────────────────────────────────────────
# COMMIT 3 — Database models
# ────────────────────────────────────────────────────────────────
git add backend/models/
git commit -m "feat(db): add User, Project, ChatSession Mongoose models"

# ────────────────────────────────────────────────────────────────
# COMMIT 4 — JWT authentication
# ────────────────────────────────────────────────────────────────
git add backend/middleware/ backend/controllers/authController.js backend/routes/auth.js
git commit -m "feat(auth): implement JWT register, login, getMe with bcrypt password hashing"

# ────────────────────────────────────────────────────────────────
# COMMIT 5 — Frontend scaffold
# ────────────────────────────────────────────────────────────────
git add frontend/package.json frontend/vite.config.js frontend/tailwind.config.js \
        frontend/postcss.config.js frontend/index.html frontend/.env.example
git commit -m "feat(frontend): scaffold React 19 + Vite + Tailwind CSS project"

# ────────────────────────────────────────────────────────────────
# COMMIT 6 — Design system
# ────────────────────────────────────────────────────────────────
git add frontend/src/index.css frontend/src/components/ui/TeloLogo.jsx \
        frontend/public/
git commit -m "feat(ui): add global CSS design system with glassmorphism, teal gradient theme"

# ────────────────────────────────────────────────────────────────
# COMMIT 7 — Auth context + protected routes
# ────────────────────────────────────────────────────────────────
git add frontend/src/context/ frontend/src/components/auth/ frontend/src/utils/api.js
git commit -m "feat(auth): add AuthContext, JWT management, ProtectedRoute component"

# ────────────────────────────────────────────────────────────────
# COMMIT 8 — Landing page
# ────────────────────────────────────────────────────────────────
git add frontend/src/pages/LandingPage.jsx \
        frontend/src/components/layout/Navbar.jsx \
        frontend/src/components/layout/Footer.jsx
git commit -m "feat(landing): build full landing page with hero, features, workflow, pricing, testimonials"

# ────────────────────────────────────────────────────────────────
# COMMIT 9 — Auth pages
# ────────────────────────────────────────────────────────────────
git add frontend/src/pages/LoginPage.jsx frontend/src/pages/RegisterPage.jsx
git commit -m "feat(auth): create login and register pages with form validation and password strength"

# ────────────────────────────────────────────────────────────────
# COMMIT 10 — Dashboard layout + page
# ────────────────────────────────────────────────────────────────
git add frontend/src/components/layout/DashboardLayout.jsx \
        frontend/src/pages/DashboardPage.jsx \
        frontend/src/hooks/useStats.js
git commit -m "feat(dashboard): add collapsible sidebar layout, stats cards, analysis form"

# ────────────────────────────────────────────────────────────────
# COMMIT 11 — App routing
# ────────────────────────────────────────────────────────────────
git add frontend/src/App.jsx frontend/src/main.jsx \
        frontend/src/pages/NotFoundPage.jsx
git commit -m "feat(routing): wire up all routes with protected route guards and 404 page"

# ────────────────────────────────────────────────────────────────
# COMMIT 12 — Web scraper
# ────────────────────────────────────────────────────────────────
git add backend/utils/scraper.js
git commit -m "feat(scraper): build documentation scraper with OpenAPI detection and HTML fallback"

# ────────────────────────────────────────────────────────────────
# COMMIT 13 — OpenAPI parser
# ────────────────────────────────────────────────────────────────
git add backend/utils/openApiParser.js
git commit -m "feat(parser): implement OpenAPI 2.x/3.x spec parser with endpoint and auth extraction"

# ────────────────────────────────────────────────────────────────
# COMMIT 14 — Gemini AI integration
# ────────────────────────────────────────────────────────────────
git add backend/utils/gemini.js
git commit -m "feat(ai): integrate Gemini API for summaries, code generation, chat, and endpoint extraction"

# ────────────────────────────────────────────────────────────────
# COMMIT 15 — Analysis pipeline
# ────────────────────────────────────────────────────────────────
git add backend/controllers/analyzeController.js backend/routes/analyze.js
git commit -m "feat(analyze): build async analysis pipeline: scrape → parse → AI summary → save"

# ────────────────────────────────────────────────────────────────
# COMMIT 16 — Results page with polling
# ────────────────────────────────────────────────────────────────
git add frontend/src/pages/ResultsPage.jsx frontend/src/hooks/useProject.js
git commit -m "feat(results): add results page with polling, endpoint table, method filters, AI summary"

# ────────────────────────────────────────────────────────────────
# COMMIT 17 — Code generation engine
# ────────────────────────────────────────────────────────────────
git add backend/controllers/generateController.js backend/routes/generate.js
git commit -m "feat(generate): implement multi-language code generation controller (JS/Python/Java)"

# ────────────────────────────────────────────────────────────────
# COMMIT 18 — ZIP download
# ────────────────────────────────────────────────────────────────
git add backend/utils/zipGenerator.js
git commit -m "feat(zip): add ZIP generator with package.json, .env.example, and project README"

# ────────────────────────────────────────────────────────────────
# COMMIT 19 — Generator page
# ────────────────────────────────────────────────────────────────
git add frontend/src/pages/GeneratorPage.jsx
git commit -m "feat(generator): build code generator page with file tabs, syntax viewer, copy, ZIP download"

# ────────────────────────────────────────────────────────────────
# COMMIT 20 — AI Chat backend
# ────────────────────────────────────────────────────────────────
git add backend/controllers/chatController.js backend/routes/chat.js
git commit -m "feat(chat): implement AI chat controller with session management and project context"

# ────────────────────────────────────────────────────────────────
# COMMIT 21 — AI Chat page
# ────────────────────────────────────────────────────────────────
git add frontend/src/pages/ChatPage.jsx
git commit -m "feat(chat): build AI chat UI with session sidebar, history, starter prompts, streaming bubbles"

# ────────────────────────────────────────────────────────────────
# COMMIT 22 — History page
# ────────────────────────────────────────────────────────────────
git add frontend/src/pages/HistoryPage.jsx
git commit -m "feat(history): add project history page with search, status badges, and quick actions"

# ────────────────────────────────────────────────────────────────
# COMMIT 23 — Profile + Settings
# ────────────────────────────────────────────────────────────────
git add frontend/src/pages/ProfilePage.jsx frontend/src/pages/SettingsPage.jsx
git commit -m "feat(profile): add profile editing and settings page with toggle switches"

# ────────────────────────────────────────────────────────────────
# COMMIT 24 — Deployment configs
# ────────────────────────────────────────────────────────────────
git add frontend/vercel.json backend/render.yaml
git commit -m "chore(deploy): add Vercel config for frontend and Render config for backend"

# ────────────────────────────────────────────────────────────────
# COMMIT 25 — Docs
# ────────────────────────────────────────────────────────────────
git add docs/
git commit -m "docs: add Postman collection, Mermaid architecture/ER/sequence/use-case diagrams"

# ────────────────────────────────────────────────────────────────
# COMMIT 26 — Final polish
# ────────────────────────────────────────────────────────────────
git add .
git commit -m "chore: final polish, cleanup, and production-ready submission"

echo ""
echo "✅ Git history created with $(git log --oneline | wc -l) commits"
echo ""
git log --oneline
