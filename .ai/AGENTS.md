# ScaffoldMind 明序 AI Coding Rules

## Project Overview

ScaffoldMind 明序 is an AI learning assistant for CSAPP and Data Structures. It helps the learner build a cognitive scaffold instead of receiving direct answers.

Core learning loop:

Input material -> AI explanation -> guided questions -> user attempt -> error diagnosis -> reinforcement task -> saved record.

`docs/PRD.md` is the product source of truth. Do not modify it unless the user explicitly asks.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- MVP storage: localStorage
- AI: text generation API through the Express backend only

## Required MVP Features

- Single-page three-column layout.
- Subject selection: CSAPP and Data Structures.
- Five learning modes:
  - Context Stacking
  - After-class deep review
  - Examiner perspective
  - Feynman explanation
  - Multi-source collision
- Learning preference chips.
- Mode-specific material inputs.
- PPT page-number links and original page side drawer.
- Structured AI analysis.
- Guided questions.
- Right-side question history sidebar.
- User attempt and targeted error diagnosis.
- Reinforcement task generation.
- Obsidian Markdown output.
- Learning records saved with localStorage.

## Forbidden Changes

- Do not implement login or registration unless explicitly requested.
- Do not add a teacher dashboard.
- Do not expose API keys in frontend code.
- Do not write API keys into README, docs, examples, tests, or screenshots.
- Do not commit `.env`; only `.env.example` belongs in GitHub.
- Do not place all components in `App.jsx`.
- Do not remove any of the five learning modes.
- Do not remove the right-side question history sidebar.
- Do not make AI output pure long-form prose; output must be structured.
- Do not skip verification after implementation.
- Do not modify `docs/PRD.md` unless explicitly requested.

## Code Organization

Frontend:

- React components use function components.
- Component names use PascalCase.
- Utility functions use camelCase.
- Tailwind CSS is the styling system.
- API clients live under `client/src/shared/api`.
- localStorage helpers live under `client/src/shared/storage`.
- Feature code should live under `client/src/features`.

Backend:

- Express routes live under `server/routes`.
- Prompt construction lives in `server/services/promptBuilder.js`.
- AI provider calls live in `server/services/aiService.js`.
- Environment loading lives in `server/config/env.js`.
- API keys are read from backend `.env` only.

## Testing Requirements

After each implementation task, run the strongest available verification:

- `npm run build` where configured.
- `npm run lint` where configured.
- Relevant unit or integration tests where configured.
- Manual checks for the PRD's key learning path.

For documentation-only tasks, verify scope, security, and PRD alignment.

## Required Completion Report

Every completed task should report:

1. Modified files.
2. Implemented behavior or documentation.
3. How to run.
4. How to test.
5. Whether `memory/MEMORY.md` was updated.
6. Remaining unfinished items.

## Review Checklist

Before finalizing changes, check:

- The work follows `docs/PRD.md`.
- The five learning modes still exist.
- The question history sidebar still exists.
- API keys are not exposed.
- `.env` is ignored.
- MVP scope has not expanded into login, teacher dashboard, OCR, vector DB, or cloud sync.
- Loading, error, and empty states are considered for user-facing features.
- Documentation and memory are updated when behavior changes.
