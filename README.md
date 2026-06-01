# ScaffoldMind 明序

ScaffoldMind 明序 is an AI learning assistant for CSAPP and Data Structures. It is designed to build a learning loop, not a simple AI Q&A shell.

Core loop:

Input material -> structured explanation -> guided questions -> user attempt -> error diagnosis -> reinforcement task -> saved learning record.

## MVP Scope

The MVP must include:

- Single-page three-column learning workspace.
- Subject selection for CSAPP and Data Structures.
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
- Obsidian Markdown output.
- Learning records saved in localStorage.

## Not In MVP

- Login or registration.
- Teacher dashboard.
- Multi-user collaboration.
- Complete PPT automatic parsing.
- OCR pipeline.
- Vector database.
- Cloud sync.
- Mobile app.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- MVP storage: browser localStorage
- AI access: text generation API through the Express backend

## Project Status

Current stage: mock MVP learning loop implemented.

The app currently runs a local mock learning loop without calling a real AI provider. The next development task is to polish mode-specific mock outputs and add focused tests for storage and Obsidian export.

## Repository Structure

Planned structure:

```text
scaffoldmind/
  README.md
  CHANGELOG.md
  .env.example
  .gitignore
  .ai/
    AGENTS.md
    context/
  docs/
    PRD.md
    ARCHITECTURE.md
    TASKS.md
    API.md
    TEST_PLAN.md
  memory/
    MEMORY.md
  client/
    package.json
    index.html
    src/
  server/
    package.json
    index.js
    routes/
    services/
    config/
  tests/
  scripts/
  screenshots/
```

## Environment Variables

Create a local `.env` file for backend development only. Do not commit it.

`.env.example` contains the required variable names with empty values:

```text
TEXT_GENERATION_API_KEY=
PORT=3001
```

The frontend must never read or contain the text generation API key.

## Running Locally

Install dependencies separately for the frontend and backend:

```bash
# frontend
cd client
npm install
npm run dev

# backend
cd server
npm install
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:3001/api/health`

## Current Mock Flow

The frontend can run without the backend for the mock learning loop:

1. Select a subject and one of the five learning modes.
2. Toggle learning preference chips.
3. Enter material and a PPT page number.
4. Generate a mock structured analysis.
5. Open the PPT original page side drawer.
6. Click a guided question to add it to question history.
7. Submit a user attempt to show mock diagnosis and reinforcement.
8. Save the learning record to localStorage.
9. Copy or manually copy the Obsidian Markdown mock output.

## Documentation

- Product requirements: `docs/PRD.md`
- Architecture: `docs/ARCHITECTURE.md`
- Task plan: `docs/TASKS.md`
- API draft: `docs/API.md`
- Test plan: `docs/TEST_PLAN.md`
- AI collaboration rules: `.ai/AGENTS.md`
- Project memory: `memory/MEMORY.md`

## Security Rules

- Do not commit `.env`.
- Do not write real API keys into any file.
- Do not expose API keys in frontend code.
- Only commit `.env.example` with empty placeholders.

## Next Task

Polish mode-specific mock outputs and add focused tests for storage and Obsidian export.
