# ScaffoldMind 明序 API Draft

This document is an initial API draft based on `docs/PRD.md`. The API is implemented by the Node.js Express backend. The React frontend calls only these backend routes and never calls the AI provider directly.

## Security

- API keys are read only from the backend local `.env`.
- `.env` must not be committed.
- `.env.example` contains empty placeholders only.
- Frontend code, README, docs, tests, and screenshots must not include real API keys.
- The current implementation supports local mock, backend mock, and an opt-in real API path.
- The real API path reads the key only from backend `server/.env` through `server/config/env.js`.

## Frontend Mock Source Switch

The React app defaults to local mock data for stable demos. A top-bar switch can manually select:

- `本地 Mock`: run the full learning loop inside the frontend using local mock builders.
- `后端 Mock`: call the Express mock routes while preserving the same UI, question history, PPT side drawer, localStorage records, and Obsidian output.

The third source option is `真实 API`. It calls the same Express routes with `aiSource: "real_api"`, and the backend calls the text generation provider only in this mode.

The default remains local mock. The frontend helper also exports `USE_BACKEND_MOCK = false` as the stable default configuration flag.

## Frontend Response Validation

The frontend validates backend envelopes before using data:

- `{ "ok": true, "data": ... }` returns `data`.
- `{ "ok": false, "error": { "code": "...", "message": "..." } }` throws a recoverable API error.
- Unknown response shapes throw `INVALID_RESPONSE`.

When a backend mock request fails, the page shows a friendly error message and keeps the user's current input.

## AI 输出语言规范

- 默认使用中文输出。
- 专业词汇第一次出现时使用“中文 + 英文括注”，例如：缓存未命中（cache miss）、缓存行（cache line）、局部性（locality）、栈帧（stack frame）、指针（pointer）、时间复杂度（time complexity）。
- 输出必须是结构化 JSON，不能返回长篇散文。
- Obsidian Markdown 也以中文为主，英文术语只作备注。
- 本地 Mock、后端 Mock 和真实 API prompt 都必须遵守同一语言规范。

## Common Types

### Subject

```json
"CSAPP"
```

Allowed values:

- `CSAPP`
- `DATA_STRUCTURES`

### Learning Mode

```json
"after_class_review"
```

Allowed values:

- `context_stacking`
- `after_class_review`
- `examiner_perspective`
- `feynman`
- `multi_source_collision`

### Common Request Fields

```json
{
  "subject": "CSAPP",
  "mode": "after_class_review",
  "preferences": ["framework_first", "why_chain", "exam_focus"],
  "pageNumber": 12,
  "materialText": "PPT page text or study material",
  "previousQuestions": []
}
```

Notes:

- `subject` is required.
- `mode` is required.
- `preferences` is an array of selected learning preference IDs.
- `pageNumber` is optional for modes that do not use PPT pages.
- `materialText` is the default text material field.
- Mode-specific endpoints may accept additional fields.

### Success Response

All successful API responses use:

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

### Error Response

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "AI_RESPONSE_INVALID",
    "message": "The AI response could not be parsed into the expected structure."
  }
}
```

The frontend should preserve user input and show a recoverable error state.

Validation failures use HTTP `400` with `error.code` set to `VALIDATION_ERROR`.

## GET /api/health

Check that the Express backend is running in mock mode.

### Response

```json
{
  "ok": true,
  "data": {
    "service": "scaffoldmind-server",
    "mode": "mock"
  }
}
```

## POST /api/analyze

Generate structured analysis for a learning session.

### Request

```json
{
  "subject": "CSAPP",
  "mode": "after_class_review",
  "preferences": ["framework_first", "why_chain", "exam_focus"],
  "pageNumber": 12,
  "materialText": "Cache memory material from PPT page 12",
  "imageContext": {
    "hasImage": false,
    "imageNote": ""
  },
  "previousQuestions": []
}
```

### Response

```json
{
  "ok": true,
  "data": {
    "pageNumber": 12,
    "topic": "Cache Miss",
    "summary": "This page explains why cache misses happen and why they affect performance.",
    "coreConcepts": [
      {
        "name": "Cache Miss",
        "simpleExplanation": "The CPU needs data that is not currently in the cache.",
        "essence": "The essence is a mismatch between fast CPU demand and slower memory hierarchy access.",
        "relatedConcepts": ["Locality", "Cache Line"]
      }
    ],
    "whyThisMatters": "It connects program access patterns to performance.",
    "contextRelation": {
      "previous": "Builds on locality.",
      "current": "Explains cache miss mechanism.",
      "next": "Leads to cache optimization."
    },
    "examFocus": ["Classify miss types", "Analyze access sequences"],
    "engineeringUse": ["Improve memory access locality"],
    "pitfalls": ["Do not confuse cache size and block size."],
    "guidedQuestions": [
      {
        "id": "q_001",
        "type": "exam",
        "question": "How would an examiner test whether you truly understand cache misses?",
        "reason": "This separates memorizing a definition from analyzing behavior.",
        "pageNumber": 12,
        "concept": "Cache Miss"
      }
    ],
    "userTask": {
      "question": "Explain in your own words why cache misses affect performance.",
      "expectedKeyPoints": ["data not in cache", "slower memory access", "access pattern affects hit rate"]
    },
    "pageLink": {
      "pageNumber": 12,
      "label": "查看第 12 页原始内容"
    }
  }
}
```

## POST /api/deep-dive

Answer a guided question selected by the user and record it in the question history.

### Request

```json
{
  "subject": "CSAPP",
  "mode": "after_class_review",
  "preferences": ["why_chain"],
  "question": {
    "id": "q_001",
    "type": "exam",
    "question": "How would an examiner test whether you truly understand cache misses?",
    "pageNumber": 12,
    "concept": "Cache Miss"
  },
  "materialText": "Cache memory material from PPT page 12",
  "previousQuestions": []
}
```

### Response

```json
{
  "ok": true,
  "data": {
    "questionId": "q_001",
    "answer": "An examiner may give an access sequence and ask you to compute hits and misses.",
    "keyPoints": ["access sequence", "cache mapping", "hit/miss reasoning"],
    "followUpQuestions": [
      {
        "id": "q_002",
        "type": "bottom_logic",
        "question": "Why does locality make this kind of exam question meaningful?"
      }
    ],
    "historyItem": {
      "id": "qh_001",
      "question": "How would an examiner test whether you truly understand cache misses?",
      "pageNumber": 12,
      "concept": "Cache Miss",
      "status": "answered"
    }
  }
}
```

## POST /api/diagnose

Diagnose the user's answer to an AI-generated attempt question.

### Request

```json
{
  "subject": "CSAPP",
  "mode": "after_class_review",
  "preferences": ["interactive_check"],
  "question": "Explain in your own words why cache misses affect performance.",
  "userAttempt": "Because the cache is too small.",
  "expectedKeyPoints": ["data not in cache", "slower memory access", "access pattern affects hit rate"],
  "materialContext": "Cache miss and locality material."
}
```

### Response

```json
{
  "ok": true,
  "data": {
    "errorType": "concept_confusion",
    "quotedIssue": "Because the cache is too small.",
    "whatIsCorrect": "You noticed that cache capacity can matter.",
    "mainProblem": "The answer treats all cache misses as a capacity problem and misses access pattern and hierarchy cost.",
    "whyItMatters": "This confusion makes it hard to analyze compulsory, capacity, and conflict misses.",
    "suggestion": "Separate whether data is absent because it is first accessed, evicted by capacity, or mapped to a conflicting line.",
    "reinforcementTask": "Given a short access sequence, identify which misses are compulsory and which are capacity-related."
  }
}
```

## POST /api/obsidian

Generate Obsidian-friendly Markdown from the current learning loop.

### Request

```json
{
  "subject": "CSAPP",
  "mode": "after_class_review",
  "analysis": {
    "pageNumber": 12,
    "topic": "Cache Miss",
    "coreConcepts": []
  },
  "guidedQuestions": [],
  "diagnosis": null
}
```

### Response

```json
{
  "ok": true,
  "data": {
    "obsidianMarkdown": "# [[Cache Miss]]\n\n> [!summary] 核心本质\n> Cache miss means the requested data is not in the current cache layer.\n\n> [!question] 主动追问\n> Why is a larger cache line not always better?\n\n## 来源\n- PPT 第 12 页\n"
  }
}
```

## POST /api/collision

Compare three user-provided text sources for the multi-source collision mode.

### Request

```json
{
  "subject": "DATA_STRUCTURES",
  "mode": "multi_source_collision",
  "preferences": ["essence_first"],
  "sourceA": "Course material",
  "sourceB": "Article or commentary",
  "sourceC": "Alternative or opposing explanation"
}
```

### Response

```json
{
  "ok": true,
  "data": {
    "sourceSummaries": [
      {
        "source": "A",
        "coreView": "The course material emphasizes abstract operations."
      }
    ],
    "conflicts": ["Source B focuses on engineering tradeoffs while source A focuses on exam definitions."],
    "evidenceComparison": ["Source A is authoritative for course exams."],
    "adoptableConclusions": ["Keep the ADT definition as the main frame."],
    "openDoubts": ["Whether the implementation detail matters depends on the exam scope."],
    "learningValue": "This comparison helps separate course requirements from broader engineering discussion."
  }
}
```

## Real API Fallback Notes

## POST /api/parse-ppt

Lightweight PPTX parsing endpoint for the source-file panel. This route does not call the AI provider and does not read API keys.

Current support:

- `.pptx` only.
- Extracts text stored directly in slide XML.
- Detects image placeholders through slide relationships.
- Returns all parsed slides so the frontend can switch pages without uploading again.
- Does not perform OCR.
- Does not render slides to images.
- Does not support legacy `.ppt`, PDF parsing, or image-structure recognition yet.

### Request

```json
{
  "fileName": "cache-memory.pptx",
  "fileBase64": "base64-encoded-pptx-content",
  "pageNumber": 12
}
```

### Response

```json
{
  "ok": true,
  "data": {
    "fileName": "cache-memory.pptx",
    "pageNumber": 12,
    "slideCount": 24,
    "extractedText": "Cache memory uses locality.",
    "slides": [],
    "images": [
      {
        "id": "rId2",
        "order": 1,
        "target": "../media/image1.png"
      }
    ],
    "structure": [
      {
        "type": "text",
        "order": 1,
        "text": "Cache memory uses locality."
      }
    ],
    "warnings": [
      "当前解析直接读取 PPTX XML 文本和图片占位关系，不执行 OCR。"
    ]
  },
  "error": null
}
```

Unsupported file types return:

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "UNSUPPORTED_FILE_TYPE",
    "message": "当前轻量解析器只支持 .pptx。PDF、图片 OCR 和旧版 .ppt 需要后续专门解析服务。"
  }
}
```

When `aiSource` is `real_api`:

- If `TEXT_GENERATION_API_KEY` is missing, the backend returns structured mock fallback data.
- If the provider call fails, the backend returns structured mock fallback data.
- Fallback responses include `providerStatus: "fallback"` and `fallbackReason`.
- Successful real provider responses include `providerStatus: "real_api"`.
- If the provider returns plain text, the backend converts it into the existing frontend-displayable structure.

## Current Backend Notes

The backend returns deterministic mock JSON unless the frontend explicitly sends `aiSource: "real_api"`. Required-field validation is active for:

- `subject` and `mode` on learning endpoints
- `materialText` on `/api/analyze`
- `question` and `materialText` on `/api/deep-dive`
- `question` and `userAttempt` on `/api/diagnose`
- `analysis` on `/api/obsidian`
- `sourceA`, `sourceB`, and `sourceC` on `/api/collision`

Frontend helper support exists through `client/src/shared/api/client.js`, but `USE_BACKEND_MOCK` is `false` by default, so the page still uses local mock data.

## Future API Notes

Future versions may add database-backed records, account sync, PPT parsing, OCR, RAG, and long-term learner profiles. These are not part of the MVP.
