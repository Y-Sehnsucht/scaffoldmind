# Changelog

All notable changes to ScaffoldMind 明序 will be documented in this file.

## [0.3.2] - 2026-06-01

### Changed

- Cleaned frontend UI copy in the study workspace, top bar, input panel, analysis panel, Obsidian export, PPT page drawer, and question history sidebar.
- Restored readable Chinese labels for the five learning modes, learning preference chips, source switch, loading states, and localStorage controls.
- Kept the default source as `本地 Mock` and preserved `后端 Mock` / `真实 API`.

### Verified

- `cd client && npm run test:mock`
- `cd client && npm run build`
- `cd server && npm run test:mock`

### Not Implemented

- No `docs/PRD.md` changes.
- No `server/.env` changes.
- No API key was printed or written.

## [0.3.1] - 2026-06-01

### Changed

- Rewrote README as a Chinese-first project guide.
- Updated local mock output, backend mock output, Obsidian Markdown output, and real API prompts to require Chinese-first structured output.
- Added language acceptance checks for Chinese content and English terminology notes.

### Not Implemented

- No `docs/PRD.md` changes.
- No `server/.env` changes.
- No API key was printed or written.

## [0.3.0] - 2026-06-01

### Added

- Added opt-in real text generation API mode through the existing Express routes.
- Added `真实 API` to the frontend source selector while keeping `本地 Mock` as the default and preserving `后端 Mock`.
- Added mode-specific prompt builders for all five learning modes.
- Added real API fallback handling for missing API key, provider failure, empty response, and plain-text provider output.

## [0.2.4] - 2026-06-01

### Added

- Added explicit backend environment loading from `server/.env`.
- Added `hasTextGenerationApiKey` to the backend env object without printing or exposing the key.
- Added `server/scripts/verifyEnv.mjs` to verify env loading and missing-file tolerance.

## [0.2.3] - 2026-06-01

### Added

- Added the top-bar source switch for `本地 Mock` and `后端 Mock`.
- Added frontend backend mock flow for analysis, deep dive, diagnosis, Obsidian output, and multi-source collision.
- Added frontend API response parsing and recoverable loading/error states.

## [0.2.2] - 2026-06-01

### Added

- Added Express mock responses for `POST /api/analyze`, `/api/deep-dive`, `/api/diagnose`, `/api/obsidian`, and `/api/collision`.
- Added unified backend success and error response shapes.
- Added backend mock validation scripts.

## [0.2.1] - 2026-06-01

### Added

- Added distinct mode-specific mock output structures for all five learning modes.
- Added UI rendering for each mode-specific mock structure.
- Added `client/scripts/verifyMockMvp.mjs` and `npm run test:mock`.

## [0.2.0] - 2026-06-01

### Added

- Built the enhanced single-page three-column learning workspace.
- Added structured mock analysis, guided questions, deep-dive answers, diagnosis, reinforcement tasks, localStorage persistence, and Obsidian Markdown export.
- Added the right-side question history sidebar and PPT original page side drawer.

## [0.1.1] - 2026-06-01

### Added

- Initialized React + Vite + Tailwind frontend skeleton under `client/`.
- Initialized Node.js Express backend skeleton under `server/`.

## [0.1.0] - 2026-05-31

### Added

- Created initial engineering context documents based on `docs/PRD.md`.
- Added `.env.example` placeholders without secrets.
