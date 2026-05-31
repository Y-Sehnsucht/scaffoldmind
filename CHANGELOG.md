# Changelog

All notable changes to ScaffoldMind 明序 will be documented in this file.

## [0.1.1] - 2026-06-01

### Added

- Initialized React + Vite + Tailwind frontend skeleton under `client/`.
- Added frontend entry files, Tailwind/PostCSS/Vite config, shared API helper, localStorage helper, and PRD constants for subjects and five learning modes.
- Initialized Node.js Express backend skeleton under `server/`.
- Added backend health route, API route placeholders, environment config, prompt builder placeholder, and AI service placeholder.

### Changed

- Updated README run instructions for separate frontend and backend projects.
- Updated task list and project memory to reflect completed skeleton initialization.

### Not Implemented

- No real AI provider call was added.
- API route placeholders return `501` until feature implementation.
- No login, registration, teacher dashboard, OCR, vector database, or cloud sync was added.

## [0.1.0] - 2026-05-31

### Added

- Created initial engineering context documents based on `docs/PRD.md`.
- Added architecture draft covering the single-page three-column layout, Express backend boundary, localStorage MVP storage, AI routing, PPT side drawer, question history sidebar, and Obsidian export.
- Added task plan for the 5-day MVP.
- Added AI collaboration rules in `.ai/AGENTS.md`.
- Added initial API draft for:
  - `POST /api/analyze`
  - `POST /api/deep-dive`
  - `POST /api/diagnose`
  - `POST /api/obsidian`
  - `POST /api/collision`
- Added initial test plan for documentation checks, frontend manual tests, backend manual tests, final demo path, automated test candidates, and security checks.
- Added README initial project guide.
- Initialized project memory.
- Added `.env.example` placeholders.

### Security

- Documented that API keys must live only in backend local `.env`.
- Confirmed `.env` is ignored by Git.
- Kept `.env.example` empty of secrets.

### Not Implemented

- No business code was added.
- No login or registration was added.
- No teacher dashboard was added.
- No API provider integration was added.
