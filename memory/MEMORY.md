# ScaffoldMind 明序 Project Memory

## Current Version

V0.1 MVP, implementation checkpoint `0.2.4`.

## Current Status

ScaffoldMind 明序 has the engineering context, React + Vite + Tailwind frontend skeleton, Node.js Express backend skeleton, frontend mock MVP learning loop, mode-specific mock output for all five learning modes, backend mock API boundaries, and a controlled frontend mock source switch.

The app still does not call a real text generation API. `docs/PRD.md` remains the product source of truth and was not modified for this checkpoint.

## Completed Features

- Created and maintained engineering context docs: `docs/ARCHITECTURE.md`, `docs/TASKS.md`, `docs/API.md`, `docs/TEST_PLAN.md`, `.ai/AGENTS.md`, `README.md`, `CHANGELOG.md`.
- Initialized `client/` with React + Vite + Tailwind.
- Initialized `server/` with Node.js Express.
- Built the single-page three-column learning workspace.
- Preserved the five required learning modes:
  - Context Stacking
  - after-class deep review
  - examiner perspective
  - Feynman explanation
  - multi-source collision
- Built learning preference chips, mode-specific inputs, page number input, image upload placeholder, and generate/save controls.
- Built structured local mock analysis, guided questions, deep-dive answers, user attempt diagnosis, reinforcement task, and Obsidian Markdown output.
- Built the right-side question history sidebar.
- Built the PPT original page side drawer.
- Saved question history and learning records through localStorage.
- Added distinct mode-specific local mock output structures for all five learning modes.
- Added Express mock endpoints:
  - `POST /api/analyze`
  - `POST /api/deep-dive`
  - `POST /api/diagnose`
  - `POST /api/obsidian`
  - `POST /api/collision`
- Added unified backend responses:
  - success: `{ ok: true, data }`
  - validation failure: `{ ok: false, error: { code: "VALIDATION_ERROR", message } }`
- Added frontend backend mock helper methods under `client/src/shared/api`.
- Added a top-bar mock source switch:
  - `本地 Mock`
  - `后端 Mock`
- Kept `本地 Mock` as the default.
- Added frontend API response parser and recoverable API error handling.
- Added loading and error states for backend mock requests without clearing user input.
- Added lightweight verification scripts:
  - `cd server && npm run test:mock`
  - `cd client && npm run test:mock`
- Hardened backend environment loading so `server/config/env.js` explicitly reads `server/.env`.
- Added `env.hasTextGenerationApiKey` without exposing or printing the actual key.
- Added `server/scripts/verifyEnv.mjs` for env loader verification.

## In Progress

- Backend mock path is now available from the UI, but the full browser walkthrough with both dev servers should be manually tested next.
- Real text generation API integration remains intentionally blocked until schema checks and manual mock acceptance are complete.

## Known Constraints And Tradeoffs

- No `.env` is created by Codex. Only `.env.example` should be committed.
- API keys must live only in a local backend `.env` when real integration starts.
- Frontend must never expose text generation API keys.
- MVP storage remains browser localStorage only.
- No login or registration.
- No teacher dashboard.
- No OCR pipeline.
- No complete PPT automatic parsing.
- No vector database.
- No cloud sync.
- Current tests are lightweight Node scripts, not a full test framework.
- `server/.env` is local-only and ignored by Git; Codex must not print or commit its contents.

## Next Plan

1. Run the full backend mock browser path with both dev servers:
   - generate analysis
   - click guided question
   - submit diagnosis
   - copy Obsidian output
   - try multi-source collision
2. Add stricter request/response schema checks before any real API connection.
3. Add manual test notes for backend-down error behavior.
4. Continue confirming `.env` is absent and `docs/PRD.md` is unchanged.

## Recent Important Changes

- 2026-05-31: Added PRD-based engineering context docs.
- 2026-06-01: Initialized React + Vite + Tailwind frontend and Node.js Express backend.
- 2026-06-01: Completed frontend local mock MVP learning loop, localStorage, and Obsidian output.
- 2026-06-01: Added distinct mock output structures for all five learning modes.
- 2026-06-01: Added backend mock API boundaries with unified response formats.
- 2026-06-01: Added controlled frontend mock source switch and frontend API response parser.
- 2026-06-01: Hardened backend env loading to explicitly target `server/.env`.

## Quick References

- Product source of truth: `docs/PRD.md`
- Architecture: `docs/ARCHITECTURE.md`
- API: `docs/API.md`
- Test plan: `docs/TEST_PLAN.md`
- Tasks: `docs/TASKS.md`
- AI rules: `.ai/AGENTS.md`
- Frontend entry: `client/src/App.jsx`
- Study workspace: `client/src/features/study-session/StudyWorkspace.jsx`
- Frontend API helper: `client/src/shared/api/client.js`
- Backend app: `server/app.js`
- Backend entry: `server/index.js`
- Backend mock service: `server/services/mockLearningService.js`

## Must Update After Each Milestone

- `memory/MEMORY.md`
- `CHANGELOG.md`
- `docs/TASKS.md`
