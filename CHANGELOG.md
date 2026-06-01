# Changelog

All notable changes to ScaffoldMind 明序 will be documented in this file.

## [0.2.4] - 2026-06-01

### Added

- Added explicit backend environment loading from `server/.env`.
- Added `hasTextGenerationApiKey` to the backend env object without printing or exposing the key.
- Added `server/scripts/verifyEnv.mjs` to verify env loading and missing-file tolerance.

### Changed

- Updated README to clarify that real API keys belong in local `server/.env`.

### Not Implemented

- No real text generation API was connected.
- No `.env` file was created.
- No frontend UI changes were made.

## [0.2.3] - 2026-06-01

### Added

- Added a top-bar mock source switch with `本地 Mock` and `后端 Mock`.
- Kept local mock as the default source for stable demos.
- Added frontend backend mock flow for analysis, deep dive, diagnosis, Obsidian output, and multi-source collision.
- Added frontend API response parser for `{ ok: true, data }` and `{ ok: false, error }`.
- Added recoverable loading and error states for backend mock requests.
- Added `client/scripts/verifyApiClient.mjs` for response parsing and backend mock request construction checks.

### Changed

- Updated `client npm run test:mock` to cover local mock MVP checks and frontend API client checks.
- Updated API docs, test plan, task list, and project memory for the controlled backend mock UI path.

### Not Implemented

- No real text generation API was connected.
- No `.env` file was created.
- No login, registration, teacher dashboard, OCR, vector database, cloud sync, or complete PPT parsing was added.

## [0.2.2] - 2026-06-01

### Added

- Added Express mock responses for:
  - `POST /api/analyze`
  - `POST /api/deep-dive`
  - `POST /api/diagnose`
  - `POST /api/obsidian`
  - `POST /api/collision`
- Added unified success response shape `{ ok: true, data }`.
- Added unified validation error shape with `VALIDATION_ERROR`.
- Added backend mock service and validation helpers.
- Added `server/scripts/verifyMockApi.mjs` and `npm run test:mock`.
- Added frontend API helper methods and `USE_BACKEND_MOCK = false`.

### Changed

- Updated API documentation for mock backend response format and validation rules.
- Updated test plan, task list, and project memory for backend mock API readiness.

### Not Implemented

- No real text generation API was connected.
- No `.env` file was created.
- No login, registration, teacher dashboard, OCR, vector database, cloud sync, or complete PPT parsing was added.

## [0.2.1] - 2026-06-01

### Added

- Added distinct mode-specific mock output structures for all five learning modes:
  - Context Stacking
  - after-class deep review
  - examiner perspective
  - Feynman explanation
  - multi-source collision
- Added UI rendering for each mode-specific mock structure.
- Added `client/scripts/verifyMockMvp.mjs` lightweight verification script.
- Added `npm run test:mock` for localStorage, Obsidian Markdown, and mock learning output checks.

### Changed

- Updated test plan with executable mock verification commands.
- Updated task status for mode-specific mock output completion.

### Not Implemented

- No real text generation API was connected.
- No `.env` file was created.
- No login, registration, teacher dashboard, OCR, vector database, cloud sync, or complete PPT parsing was added.

## [0.2.0] - 2026-06-01

### Added

- Built the enhanced single-page three-column learning workspace.
- Added top-bar subject selection, five learning mode selection, and current status display.
- Added learning preference chips, mode-specific material inputs, page number input, image upload placeholder, and mock generation button.
- Added structured mock analysis with page number, topic, core concepts, essence, context relation, exam focus, engineering use, pitfalls, guided questions, user task, and page link.
- Added PPT original page side drawer with image placeholder, extracted text placeholder, and related concepts.
- Added mock guided-question deep dive flow that writes to the right-side question history sidebar.
- Added mock user-answer diagnosis with error type, quoted answer, suggestion, and reinforcement task.
- Added localStorage persistence for question history and learning records.
- Added save/clear controls for question history and learning records.
- Added Obsidian Markdown mock export with wikilink, callouts, related concepts, page source, copy action, and fallback text area.

### Changed

- Kept `App.jsx` as a thin wrapper around the componentized study workspace.
- Updated README, task list, and project memory for the mock MVP stage.

### Not Implemented

- No real text generation API was connected.
- No `.env` file was created.
- No login, registration, teacher dashboard, OCR, vector database, cloud sync, or complete PPT parsing was added.

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
