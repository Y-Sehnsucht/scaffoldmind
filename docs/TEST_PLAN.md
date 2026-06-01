# ScaffoldMind 明序 Test Plan

This is the initial MVP test plan based on `docs/PRD.md`.

## 1. Documentation And Scope Checks

- Confirm `docs/PRD.md` remains unchanged unless explicitly requested.
- Confirm all five learning modes are documented and preserved.
- Confirm the right-side question history sidebar is documented and preserved.
- Confirm MVP exclusions are visible: no login, no teacher dashboard, no OCR pipeline, no vector database, no cloud sync.
- Confirm `.env.example` contains placeholders only.
- Confirm `.gitignore` includes `.env`.
- Confirm no real API key appears in repository files.

## 2. Frontend Manual Tests

Run after the React app exists.

- App loads without crashing.
- Top-bar mock source defaults to `本地 Mock`.
- Switching to `后端 Mock` is visible and reversible.
- Single-page three-column layout is visible.
- Subject selector switches between CSAPP and Data Structures.
- All five learning modes can be selected:
  - Context Stacking
  - After-class deep review
  - Examiner perspective
  - Feynman explanation
  - Multi-source collision
- Each mode shows the correct input fields.
- Learning preference chips toggle on and off.
- Empty required input shows a helpful prompt.
- Failed generation does not erase user input.
- With `后端 Mock` selected and the backend stopped, requests show a friendly error and the page does not crash.
- With `后端 Mock` selected and the backend running, generate analysis calls `/api/analyze`.
- With `后端 Mock` selected, selecting a guided question calls `/api/deep-dive`.
- With `后端 Mock` selected, submitting a user attempt calls `/api/diagnose`.
- With `后端 Mock` selected, Obsidian output is produced through `/api/obsidian`.
- With multi-source collision selected under `后端 Mock`, the app can call `/api/collision`.
- Structured analysis appears in the center area.
- At least three guided questions appear after analysis.
- Selecting a guided question adds it to the right-side question history.
- Clicking a question history item navigates to or highlights the matching answer.
- Page-number link opens the PPT original page side drawer.
- Closing the side drawer does not lose the current learning content.
- User attempt submission shows a diagnosis area.
- Obsidian Markdown can be copied.
- Learning record can be saved, reviewed, and deleted.
- Refreshing the page preserves localStorage-backed question history and learning records.

## 3. Backend Manual Tests

Run after the Express backend exists.

- Server starts on default port without requiring `.env`.
- `GET /api/health` returns `ok: true` and mock service metadata.
- `POST /api/analyze` accepts JSON and returns `{ "ok": true, "data": ... }`.
- `POST /api/deep-dive` accepts a selected guided question and returns `{ "ok": true, "data": ... }`.
- `POST /api/diagnose` quotes the user's answer and returns `{ "ok": true, "data": ... }`.
- `POST /api/obsidian` returns Markdown with callouts, wikilinks, and page source under `data.obsidianMarkdown`.
- `POST /api/collision` compares three text sources under `data`.
- Missing required fields return HTTP `400` with `error.code = "VALIDATION_ERROR"`.
- API errors return JSON with `ok: false`.
- AI malformed responses produce recoverable fallback errors after real API integration.
- API keys never appear in response bodies or browser-visible code.

## 4. Key Path Acceptance Test

The final PRD demo path must pass:

1. Open ScaffoldMind 明序.
2. Select CSAPP.
3. Select after-class deep review.
4. Enter PPT page 12 content.
5. Generate structured analysis.
6. View core concepts, essence explanation, context relation, exam focus, pitfalls, guided questions, and user task.
7. Click "查看第 12 页原始内容".
8. Confirm the side drawer opens with image placeholder or uploaded image and extracted text.
9. Select one guided question.
10. Confirm the question appears in the right-side history.
11. Submit an answer to the user attempt question.
12. Confirm the diagnosis includes error type, quote from user answer, suggestion, and reinforcement task.
13. Copy Obsidian Markdown.
14. Save the learning record.
15. Refresh the page and confirm saved records and question history remain.

## 5. Suggested Automated Tests

Unit tests:

- `promptBuilder` builds different prompts for all five modes.
- `promptBuilder` includes subject and learning preferences.
- localStorage helpers save, load, and delete records safely. Covered by `cd client && npm run test:mock`.
- Obsidian export includes callouts, wikilinks, and source page. Covered by `cd client && npm run test:mock`.
- mock learning output is non-empty and exposes mode-specific fields for all five learning modes. Covered by `cd client && npm run test:mock`.
- frontend API response parser accepts `{ ok: true, data }`. Covered by `cd client && npm run test:mock`.
- frontend API response parser rejects `{ ok: false, error }` with a typed recoverable error. Covered by `cd client && npm run test:mock`.
- frontend backend mock helper constructs the expected `POST /api/analyze` request. Covered by `cd client && npm run test:mock`.

Integration tests:

- `POST /api/analyze` validates required fields.
- `POST /api/diagnose` validates `userAttempt`.
- API routes return structured errors.
- `GET /api/health`, valid `/api/analyze`, invalid `/api/analyze`, and valid `/api/diagnose` are covered by `cd server && npm run test:mock`.

E2E tests:

- Complete mock learning loop without a real AI provider.
- Question history persists after refresh.
- Side drawer opens and closes.
- API failure shows error state and keeps user input.

## 6. Build And Security Checks

Before delivery:

- Run frontend build when configured.
- Run backend tests when configured.
- Search repository for accidental API key patterns.
- Confirm `.env` is not tracked by Git.
- Confirm `node_modules`, `dist`, `coverage`, and logs are not committed.

## 6.1 Real API Mode Checks

- The top-bar source selector includes `本地 Mock`, `后端 Mock`, and `真实 API`.
- `本地 Mock` remains the default source.
- `真实 API` sends `aiSource: "real_api"` to Express routes and never calls a provider directly from the frontend.
- Without `TEXT_GENERATION_API_KEY`, `真实 API` mode returns structured fallback data and does not crash.
- With a valid local backend key, `真实 API` mode can generate structured analysis through Express.
- Provider failure returns structured fallback data or a structured error, while preserving user input and existing results.
- API keys never appear in response bodies, browser-visible code, docs, tests, or logs.

## 7. Current Status

The frontend mock MVP is implemented. Current executable checks:

- `cd client && npm run test:mock`
- `cd client && npm run build`
- `cd server && npm run test:mock`

The mock verification covers:

- question history localStorage round trip and clear
- learning records localStorage round trip and clear
- Obsidian Markdown callouts, wikilinks, and PPT page source
- all five learning modes exposing distinct mode-specific mock fields
- frontend backend mock response parser and request construction
- backend health check, validation failure, analyze mock response, and diagnose mock response
