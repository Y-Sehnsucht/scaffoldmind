# ScaffoldMind 明序 Project Memory

## Current Version

V0.1 MVP, implementation checkpoint `0.3.2`.

## Current Status

ScaffoldMind 明序 now has the engineering context, React + Vite + Tailwind frontend, Node.js Express backend, frontend mock MVP learning loop, backend mock API boundaries, a controlled three-source frontend selector, and an opt-in real text generation API path.

The default source remains `本地 Mock`. `后端 Mock` and `真实 API` remain available. Real API calls happen only when the user explicitly selects `真实 API`. `docs/PRD.md` remains the product source of truth and must not be edited during implementation checkpoints.

The latest checkpoint cleaned the frontend UI copy so the study workspace, source switch, five learning modes, PPT drawer, Obsidian export, and question history sidebar display readable Chinese text.

## Completed Features

- Created and maintained engineering context docs: `docs/ARCHITECTURE.md`, `docs/TASKS.md`, `docs/API.md`, `docs/TEST_PLAN.md`, `.ai/AGENTS.md`, `README.md`, `CHANGELOG.md`.
- Initialized `client/` with React + Vite + Tailwind.
- Initialized `server/` with Node.js Express.
- Built the single-page three-column learning workspace.
- Preserved the five required learning modes:
  - Context Stacking 超前学习
  - 课后深度复习
  - 出题人视角
  - 费曼反讲
  - 多维信息对撞
- Built learning preference chips, mode-specific inputs, page number input, image upload placeholder, generate/save controls, and readable Chinese UI labels.
- Built structured local mock analysis, guided questions, deep-dive answers, user attempt diagnosis, reinforcement task, and Obsidian Markdown output.
- Built the right-side question history sidebar.
- Built the PPT original page side drawer.
- Saved question history and learning records through localStorage.
- Added distinct mode-specific local mock output structures for all five learning modes.
- Added Express endpoints:
  - `POST /api/analyze`
  - `POST /api/deep-dive`
  - `POST /api/diagnose`
  - `POST /api/obsidian`
  - `POST /api/collision`
- Added unified backend responses:
  - success: `{ ok: true, data, error: null }`
  - failure: `{ ok: false, data: null, error }`
- Added frontend backend helper methods under `client/src/shared/api`.
- Added a top-bar source switch:
  - `本地 Mock`
  - `后端 Mock`
  - `真实 API`
- Kept `本地 Mock` as the default.
- Added frontend API response parser and recoverable API error handling.
- Added loading and error states for backend/real API requests without clearing user input.
- Hardened backend environment loading so `server/config/env.js` explicitly reads `server/.env`.
- Added `env.hasTextGenerationApiKey` without exposing or printing the actual key.
- Added `server/scripts/verifyEnv.mjs` for env loader verification.
- Added prompt builders for all five learning modes.
- Added `aiService` real API path with structured fallback for missing key, provider failure, empty response, or plain-text response.
- Rewrote README as a Chinese-first project guide.
- Standardized local mock, backend mock, Obsidian output, and real API prompts to Chinese-first output.
- Added mock test assertions for Chinese content and English term notes.
- Added lightweight verification scripts:
  - `cd server && npm run test:mock`
  - `cd client && npm run test:mock`

## In Progress

- Real API mode is implemented but should be manually verified in the browser with both dev servers running.
- Automated tests avoid printing or exposing the API key and do not require a provider response.

## Known Constraints And Tradeoffs

- Codex must not create, edit, print, or commit `server/.env`.
- API keys must live only in local backend `server/.env`.
- Frontend must never expose text generation API keys.
- MVP storage remains browser localStorage only.
- No login or registration.
- No teacher dashboard.
- No OCR pipeline.
- No complete PPT automatic parsing.
- No vector database.
- No cloud sync.
- Current tests are lightweight Node scripts, not a full test framework.
- AI output should remain Chinese-first and structured; English should appear mainly as term notes.

## Next Plan

1. Manually test all three source modes in the browser:
   - `本地 Mock`
   - `后端 Mock`
   - `真实 API`
2. Add a small browser-level smoke test for the main learning loop if the project adopts a UI test runner.
3. Add stricter request/response schema checks around real provider output.
4. Continue confirming `server/.env` is ignored and `docs/PRD.md` is unchanged.

## Recent Important Changes

- 2026-05-31: Added PRD-based engineering context docs.
- 2026-06-01: Initialized React + Vite + Tailwind frontend and Node.js Express backend.
- 2026-06-01: Completed frontend local mock MVP learning loop, localStorage, and Obsidian output.
- 2026-06-01: Added distinct mock output structures for all five learning modes.
- 2026-06-01: Added backend mock API boundaries with unified response formats.
- 2026-06-01: Added controlled frontend mock source switch and frontend API response parser.
- 2026-06-01: Hardened backend env loading to explicitly target `server/.env`.
- 2026-06-01: Added opt-in real text generation API path with structured fallback and a three-source frontend selector.
- 2026-06-01: Standardized README and AI outputs to Chinese-first language rules.
- 2026-06-01: Cleaned frontend UI copy and removed mojibake from the main workspace components.

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
- Backend env loader: `server/config/env.js`
- Backend prompt builder: `server/services/promptBuilder.js`
- Backend AI service: `server/services/aiService.js`
- Backend mock service: `server/services/mockLearningService.js`

## Must Update After Each Milestone

- `memory/MEMORY.md`
- `CHANGELOG.md`
- `docs/TASKS.md`
