# ScaffoldMind 明序 Tasks

## Current Phase

Agent Chat main-path migration.

Status: the executable main entry is now `AgentWorkspace`, a center-led AI learning agent with SSE streaming, attachment metadata chips, interactive follow-up options, provider fallback, and stable client/server acceptance checks. The old `StudyWorkspace`, old structured learning APIs, and old lightweight PPTX API remain in the codebase but are not the page's main entry.

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

## Day 2: Prototype Learning Loop

- [x] Implement subject selection for CSAPP and Data Structures.
- [x] Implement all five learning mode selectors.
- [x] Implement learning preference chips.
- [x] Implement mode-specific material input forms.
- [x] Implement structured learning analysis fallback.
- [x] Implement guided questions.
- [x] Implement right-side question history sidebar.
- [x] Implement user attempt input.
- [x] Implement structured error diagnosis fallback.
- [x] Persist question history to localStorage.

## Day 3: Backend Learning API And Future Real API Boundary

- [x] Keep Express runnable without requiring `.env`.
- [x] Implement structured fallback for `POST /api/analyze`.
- [x] Implement structured fallback for `POST /api/deep-dive`.
- [x] Implement structured fallback for `POST /api/diagnose`.
- [x] Implement structured fallback for `POST /api/obsidian`.
- [x] Implement structured fallback for `POST /api/collision`.
- [x] Add frontend API helper functions for backend learning endpoints.
- [x] Add unified `ok/data` success responses and `VALIDATION_ERROR` failures.
- [x] Verify the frontend does not expose API keys.
- [x] Add early top-bar source switching during prototype development.
- [x] Keep a deterministic structured fallback for provider failures.
- [x] Add frontend response parser for `{ ok, data, error }` envelopes.
- [x] Route backend analysis, deep dive, diagnosis, Obsidian, and collision calls through `client/src/shared/api`.
- [x] Add loading and recoverable error states for backend learning requests.
- [x] Add lightweight API client verification script.
- [x] Add opt-in `真实 API` frontend source.
- [x] Add mode-specific prompt builders for all five learning modes.
- [x] Add real API service path with structured fallback when key is missing or provider calls fail.
- [x] Replace prototype source switching with browser AI configuration.

## Day 4: Complete Five Learning Modes

- [x] Add Context Stacking structured output.
- [x] Add after-class deep review structured output.
- [x] Add examiner perspective structured output.
- [x] Add Feynman explanation structured output.
- [x] Add multi-source collision structured output.
- [x] Verify each mode has distinct inputs and output structure.
- [x] Add lightweight automated verification for all modes.

## Day 5: Acceptance, Export, And Delivery

- [x] Implement Obsidian Markdown copy.
- [x] Implement learning record save/delete/review through localStorage.
- [x] Add backend lightweight record storage and profile summary.
- [x] Add TXT/Markdown/PDF material extraction.
- [x] Add lightweight PPTX parsing.
- [x] Add AI provider configuration and self-check.
- [x] Replace local/backend demo source switch with browser AI settings panel.
- [x] Run the course-project browser acceptance path.
- [x] Update README with actual run commands.
- [x] Update CHANGELOG and `memory/MEMORY.md`.
- [x] Confirm `.env` is not tracked.

## Next Development Task

Run manual browser acceptance for the new Agent Chat path: long-text input, three modes, attachment chips, streaming fallback, interactive options, and layout zoom at 80%, 100%, 125%, and 150%.

## Scope Guardrails

- Do not implement login or registration.
- Do not add a teacher dashboard.
- Do not remove any of the five learning modes.
- Do not remove the question history sidebar.
- Do not expose or commit API keys.
- Do not replace lightweight localStorage/backend JSON storage with a production database for the course project.
- Do not implement full visual PPT parsing, OCR, vector search, or cloud sync in the course-project scope.
