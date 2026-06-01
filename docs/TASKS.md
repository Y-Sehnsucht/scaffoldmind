# ScaffoldMind 明序 Tasks

## Current Phase

Engineering context setup.

Status: frontend mock MVP and backend mock API boundaries are implemented; real text generation API is not connected.

## Day 1: Project Initialization And Context

- [x] Prepare `docs/PRD.md` as the source of truth.
- [x] Create `docs/ARCHITECTURE.md` initial architecture.
- [x] Create `docs/TASKS.md` task plan.
- [x] Create `.ai/AGENTS.md` AI collaboration rules.
- [x] Create `docs/API.md` initial API draft.
- [x] Create `docs/TEST_PLAN.md` initial test plan.
- [x] Create `README.md` initial project guide.
- [x] Create `CHANGELOG.md` initial changelog.
- [x] Initialize `memory/MEMORY.md`.
- [x] Fill `.env.example` with empty placeholders.
- [x] Initialize React + Vite + Tailwind frontend.
- [x] Initialize Node.js Express backend.
- [x] Add `.gitignore` entries required by the PRD.
- [x] Build single-page three-column UI skeleton.
- [x] Add PPT original page side drawer skeleton.

## Day 2: Mock Learning Loop

- [x] Implement subject selection for CSAPP and Data Structures.
- [x] Implement all five learning mode selectors.
- [x] Implement learning preference chips.
- [x] Implement mode-specific material input forms.
- [x] Implement mock structured AI analysis.
- [x] Implement guided questions.
- [x] Implement right-side question history sidebar.
- [x] Implement user attempt input.
- [x] Implement mock error diagnosis.
- [x] Persist question history to localStorage.

## Day 3: Backend Mock API And Future Real API Boundary

- [x] Keep Express runnable without requiring `.env`.
- [x] Implement mock `POST /api/analyze`.
- [x] Implement mock `POST /api/deep-dive`.
- [x] Implement mock `POST /api/diagnose`.
- [x] Implement mock `POST /api/obsidian`.
- [x] Implement mock `POST /api/collision`.
- [x] Add frontend API helper functions with `USE_BACKEND_MOCK = false`.
- [x] Add unified `ok/data` success responses and `VALIDATION_ERROR` failures.
- [x] Verify the frontend does not expose API keys.

## Day 4: Complete Five Learning Modes

- [x] Add Context Stacking mock output structure.
- [x] Add after-class deep review mock output structure.
- [x] Add examiner perspective mock output structure.
- [x] Add Feynman explanation mock output structure.
- [x] Add multi-source collision mock output structure.
- [x] Verify each mode has distinct inputs and output structure.
- [x] Add lightweight automated verification for all modes.

## Day 5: Acceptance, Export, And Delivery

- [x] Implement Obsidian Markdown copy.
- [x] Implement learning record save/delete/review through localStorage.
- [ ] Run the final demo path from the PRD.
- [ ] Capture screenshots for delivery.
- [ ] Update README with actual run commands.
- [ ] Update CHANGELOG and `memory/MEMORY.md`.
- [ ] Confirm `.env` is not tracked.

## Next Development Task

Add optional UI path for `USE_BACKEND_MOCK = true`, or add request/response schema checks before real API integration.

## Scope Guardrails

- Do not implement login or registration.
- Do not add a teacher dashboard.
- Do not remove any of the five learning modes.
- Do not remove the question history sidebar.
- Do not expose or commit API keys.
- Do not replace localStorage with a database for MVP.
- Do not implement full PPT parsing, OCR, vector search, or cloud sync in MVP.
