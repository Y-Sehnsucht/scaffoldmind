# ScaffoldMind 明序 Tasks

## Current Phase

Engineering context setup.

Status: mock learning loop, localStorage persistence, Obsidian mock output, and enhanced UI skeleton are implemented.

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

## Day 3: Real Text Generation API

- [ ] Configure Express to read local `.env`.
- [ ] Implement `POST /api/analyze`.
- [ ] Implement `POST /api/deep-dive`.
- [ ] Implement `POST /api/diagnose`.
- [ ] Implement `POST /api/obsidian`.
- [ ] Implement frontend API client under `client/src/shared/api`.
- [ ] Add loading, error, and fallback states.
- [ ] Verify the frontend does not expose API keys.

## Day 4: Complete Five Learning Modes

- [ ] Add Context Stacking prompt.
- [ ] Add after-class deep review prompt.
- [ ] Add examiner perspective prompt.
- [ ] Add Feynman explanation prompt.
- [ ] Add multi-source collision prompt.
- [ ] Verify each mode has distinct inputs and output structure.
- [ ] Add at least one manual test input per mode.

## Day 5: Acceptance, Export, And Delivery

- [x] Implement Obsidian Markdown copy.
- [x] Implement learning record save/delete/review through localStorage.
- [ ] Run the final demo path from the PRD.
- [ ] Capture screenshots for delivery.
- [ ] Update README with actual run commands.
- [ ] Update CHANGELOG and `memory/MEMORY.md`.
- [ ] Confirm `.env` is not tracked.

## Next Development Task

Polish mock mode-specific outputs and add focused tests for storage and Obsidian export.

## Scope Guardrails

- Do not implement login or registration.
- Do not add a teacher dashboard.
- Do not remove any of the five learning modes.
- Do not remove the question history sidebar.
- Do not expose or commit API keys.
- Do not replace localStorage with a database for MVP.
- Do not implement full PPT parsing, OCR, vector search, or cloud sync in MVP.
