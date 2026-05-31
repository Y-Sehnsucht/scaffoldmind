# ScaffoldMind 明序 Architecture

## 1. Overview

ScaffoldMind 明序 is a single-page AI learning assistant for CSAPP and Data Structures. The MVP is built around a complete learning loop:

Input material -> structured AI explanation -> guided questions -> user attempt -> error diagnosis -> reinforcement task -> saved learning record.

The system must not become a generic chat shell. It must preserve the PRD's core learning design: five learning modes, the right-side question history sidebar, PPT page links with a side drawer, structured AI output, and local learning memory.

## 2. Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- MVP storage: browser localStorage
- AI access: text generation API called only from the Express backend
- Environment variables: backend `.env` locally, `.env.example` in GitHub

The frontend must never contain API keys or call the AI provider directly.

## 3. Application Shape

The MVP uses one main page with three persistent regions:

- Left: input and learning settings
- Center: AI analysis and learning loop
- Right: question history quick review sidebar

The PPT original page panel opens as a right-side drawer over the main page. It should not replace the question history feature or disrupt the current learning result.

## 4. Frontend Architecture

Recommended structure after project initialization:

```text
client/src/
  core/
  features/
    study-session/
    question-history/
    page-drawer/
    feynman-mode/
    context-stacking/
    obsidian-export/
  shared/
    components/
    api/
    storage/
  prompts/
  utils/
  App.jsx
  main.jsx
```

Key frontend responsibilities:

- Render subject selection: CSAPP and Data Structures.
- Render all five learning modes:
  - Context Stacking
  - After-class deep review
  - Examiner perspective
  - Feynman explanation
  - Multi-source collision
- Render learning preference chips and pass selected preferences into API requests.
- Render mode-specific material inputs.
- Preserve user input when generation fails.
- Store question history and learning records in localStorage.
- Show structured AI results instead of long unstructured prose.
- Support page-number links that open the PPT original page drawer.
- Support copying Obsidian-friendly Markdown.

## 5. Backend Architecture

Recommended structure after project initialization:

```text
server/
  index.js
  routes/
    analyze.js
    deepDive.js
    diagnose.js
    obsidian.js
    collision.js
  services/
    aiService.js
    promptBuilder.js
  config/
    env.js
```

Key backend responsibilities:

- Read `TEXT_GENERATION_API_KEY` and `PORT` from local `.env`.
- Expose JSON API endpoints for the frontend.
- Build prompts from subject, mode, preferences, material input, page context, previous questions, and user attempts.
- Call the AI provider through `aiService`.
- Normalize AI responses into structured JSON where possible.
- Return safe fallback errors when AI calls fail or output is malformed.

The backend must not implement user login, teacher dashboards, cloud sync, databases, vector search, OCR, or automatic PPT parsing in the MVP.

## 6. MVP Data Flow

1. User chooses subject, learning mode, and learning preferences.
2. User enters material in the mode-specific fields.
3. Frontend sends a JSON request to the Express backend.
4. Backend builds the mode-specific prompt and calls the AI provider.
5. Backend returns structured learning output.
6. Frontend renders analysis, guided questions, user task, page links, and Obsidian output.
7. User selects a guided question or submits an answer.
8. Frontend calls `/api/deep-dive` or `/api/diagnose`.
9. Question history, diagnosis, reinforcement tasks, and saved learning records are persisted in localStorage.

## 7. Storage Model

MVP storage is localStorage only.

Session memory:

- current subject
- current mode
- current page number
- current material input
- current analysis
- current guided questions
- current user attempt
- current diagnosis

Learning record memory:

- learning topic
- subject
- mode
- input content
- AI analysis
- guided questions
- user answer
- error type
- feedback suggestion
- reinforcement task
- Obsidian note
- created time

Learner profile memory:

- derived from recent localStorage learning records
- common error types
- frequent weak concepts
- common question types
- recent learning topics

No database is required for the MVP.

## 8. AI Strategy

AI output must be structured and learning-loop oriented. Prompts must enforce:

- concise concept explanations
- page number references when PPT material is involved
- distinction between material facts and AI-added explanation
- active guided questions
- a user attempt task
- targeted error diagnosis that quotes the user's answer
- reinforcement tasks after feedback

Different modes must produce visibly different output structures.

## 9. Security Boundaries

- Do not write API keys into frontend code.
- Do not write API keys into README or docs.
- Do not commit `.env`.
- Commit only `.env.example` with empty placeholders.
- Keep AI provider access behind Express routes.

## 10. Explicit Non-Goals For MVP

- No login or registration.
- No teacher dashboard.
- No multi-user collaboration.
- No complete PPT automatic parsing.
- No OCR pipeline.
- No vector database.
- No cloud sync.
- No mobile app.
- No complex mind-map editor.

These constraints are part of the product scope and should be preserved unless the PRD changes.
