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
- Current main entry is the center-led `AgentWorkspace`, not the old `StudyWorkspace`.
- The center chat area is the primary visual focus.
- The bottom composer has a plus button for attachments.
- Attachment chips show file name/type metadata only.
- PPTX and image attachments show that they are attached but not parsed.
- The new main path does not call `/api/parse-ppt` or `requestPptParsing`.
- Long text input can be sent without freezing the page.
- Streaming output appears as the assistant response is generated.
- First knowledge answer includes `## 总结`, `## 框架`, `## 5 个核心概念`, and `## 你可以继续选择`.
- Interactive options below the latest answer can be clicked and sent as the next user message.
- Default knowledge parsing, Context Stacking, and Feynman modes are selectable and have visibly different follow-up options.
- Backend unavailable, missing key, provider failure, or empty provider output shows a friendly fallback and does not white-screen.
- Browser zoom at 80%, 100%, 125%, and 150% should not create horizontal overflow or incoherent overlap.
- Top-bar AI settings panel is visible.
- Provider/model/API URL/API Key fields can be edited and saved locally.
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
- With the backend stopped, requests show a friendly error and the page does not crash.
- With the backend running, generate analysis calls `/api/analyze`.
- Selecting a guided question calls `/api/deep-dive`.
- Submitting a user attempt calls `/api/diagnose`.
- Obsidian output is produced through `/api/obsidian`.
- With multi-source collision selected, the app can call `/api/collision`.
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
- `GET /api/health` returns `ok: true` and service metadata.
- `POST /api/analyze` accepts JSON and returns `{ "ok": true, "data": ... }`.
- `POST /api/deep-dive` accepts a selected guided question and returns `{ "ok": true, "data": ... }`.
- `POST /api/diagnose` quotes the user's answer and returns `{ "ok": true, "data": ... }`.
- `POST /api/obsidian` returns Markdown with callouts, wikilinks, and page source under `data.obsidianMarkdown`.
- `POST /api/collision` compares three text sources under `data`.
- `POST /api/parse-ppt` accepts a base64 `.pptx`, extracts slide XML text, and detects image placeholders.
- `POST /api/parse-ppt` returns all parsed slides so the frontend can switch pages after one upload.
- `POST /api/parse-ppt` rejects unsupported file types with `UNSUPPORTED_FILE_TYPE`.
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
- localStorage helpers save, load, and delete records safely. Covered by `cd client && npm run test:acceptance`.
- Obsidian export includes callouts, wikilinks, and source page. Covered by `cd client && npm run test:acceptance`.
- structured learning output is non-empty and exposes mode-specific fields for all five learning modes. Covered by `cd client && npm run test:acceptance`.
- frontend API response parser accepts `{ ok: true, data }`. Covered by `cd client && npm run test:acceptance`.
- frontend API response parser rejects `{ ok: false, error }` with a typed recoverable error. Covered by `cd client && npm run test:acceptance`.
- frontend API helper constructs the expected `POST /api/analyze` request. Covered by `cd client && npm run test:acceptance`.

Integration tests:

- `POST /api/agent/chat/stream` validates empty messages.
- `POST /api/agent/chat/stream` emits `status`, `delta`, and `done` SSE events.
- Provider failure on `/api/agent/chat/stream` emits fallback markdown with the required sections.
- `POST /api/analyze` validates required fields.
- `POST /api/diagnose` validates `userAttempt`.
- API routes return structured errors.
- `GET /api/health`, valid `/api/analyze`, invalid `/api/analyze`, and valid `/api/diagnose` are covered by `cd server && npm run test:acceptance`.
- Lightweight `.pptx` text extraction and image placeholder detection are covered by `cd server && npm run test:acceptance`.
- Multi-slide `.pptx` response coverage is included in `cd server && npm run test:acceptance`.
- Complete backend learning loop `materials/extract -> analyze -> deep-dive -> diagnose -> obsidian -> records -> profile` is covered by `cd server && npm run test:loop` and included in `cd server && npm run test:acceptance`.
- Backend learning record store recovery from corrupted JSON and record API write-failure response shape are covered by `cd server && npm run test:records` and included in `cd server && npm run test:acceptance`.
- Agent Chat stream and fallback behavior are covered by `cd server && npm run test:acceptance`.
- Agent Chat client request construction, SSE parsing, and metadata-only attachment payloads are covered by `cd client && npm run test:acceptance`.

E2E tests:

- Complete structured learning loop without a real AI provider.
- Question history persists after refresh.
- Side drawer opens and closes.
- API failure shows error state and keeps user input.
- Lightweight frontend workspace smoke flow `material -> analysis -> question history -> deep dive -> diagnosis -> record -> restored questions -> review plan` is covered by `cd client && npm run test:workspace` and included in `cd client && npm run test:acceptance`.

## 6. Build And Security Checks

Before delivery:

- Run frontend build when configured.
- Run backend tests when configured.
- Search repository for accidental API key patterns.
- Confirm `.env` is not tracked by Git.
- Confirm `node_modules`, `dist`, `coverage`, and logs are not committed.

## 6.1 Real API Mode Checks

- The top-bar no longer exposes local/backend demo source switching.
- Requests send `aiSource: "real_api"` plus browser `aiConfig` to Express routes.
- Without an API Key, AI requests return structured fallback data and do not crash.
- With a valid browser-saved key, AI requests can generate structured analysis through Express.
- `POST /api/ai/preflight` reports missing key, provider failure, malformed output, or structured real API success without exposing any key.
- Provider failure returns structured fallback data or a structured error, while preserving user input and existing results.
- Structured provider JSON is accepted as `providerStatus: "real_api"` and covered by `cd server && npm run test:acceptance`.
- Real-provider preflight success with a fake OpenAI-compatible provider is covered by `cd server && npm run test:acceptance`.
- Plain-text provider output is rejected as unstructured and converted to fallback data, covered by `cd server && npm run test:acceptance`.
- API keys never appear in response bodies, browser-visible code, docs, tests, or logs.

## 7. Current Status

Course-project acceptance on 2026-06-02:

- Browser AI platform UI check passed: AI settings visible, old source selector removed, generate button says `生成 AI 解析`.
- Browser AI self-check without a key showed a recoverable missing-key state and did not crash.
- Automated backend fallback checks still cover the complete learning loop without a real key.
- Real provider browser path remains optional and requires a valid browser-saved key.

## AI Output Language Checks

- AI prompt 和结构化降级输出应以中文为主。
- 专业词汇第一次出现时应带英文备注，例如缓存未命中（cache miss）、缓存行（cache line）、局部性（locality）。
- Obsidian Markdown 输出应以中文为主，并保留 wikilink 和 callout。
- 输出应保持结构化 JSON，不应退化成大段散文。

The AI-platform acceptance flow is implemented. Current executable checks:

- `cd client && npm run test:acceptance`
- `cd client && npm run test:workspace`
- `cd client && npm run build`
- `cd server && npm run test:acceptance`
- `cd server && npm run test:loop`
- `cd server && npm run test:records`

The automated verification covers:

- question history localStorage round trip and clear
- learning records localStorage round trip and clear
- Obsidian Markdown callouts, wikilinks, and PPT page source
- all five learning modes exposing distinct mode-specific fallback fields
- frontend API response parser and request construction
- backend health check, validation failure, analyze fallback response, and diagnose fallback response
- backend complete learning loop, saved record, question history persistence, and learner profile summary
- frontend workspace smoke flow, restored question history, question type stats, and review plan output
- backend record-store corruption recovery and profile rebuilding after recovery
- backend record API write-failure response shape and cache rollback after failed save
