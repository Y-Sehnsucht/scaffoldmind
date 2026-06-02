# ScaffoldMind 明序 API Draft

This document is an initial API draft based on `docs/PRD.md`. The API is implemented by the Node.js Express backend. The React frontend calls only these backend routes and never calls the AI provider directly.

## Security

- API keys can be supplied from the browser AI settings panel for local single-user use.
- `.env` must not be committed.
- `.env.example` contains empty placeholders only.
- Frontend code, README, docs, tests, and screenshots must not include real API keys.
- The backend proxies OpenAI-compatible provider calls and never exposes API keys in response bodies.
- `server/.env` remains a fallback configuration path, but the main UI saves provider/model/API URL/API Key in browser localStorage.
- Browser-saved keys are suitable for this local course project, not for public multi-user deployment.

## Frontend AI Settings

The React app exposes a top-bar AI settings panel:

- provider: `openai`, `deepseek`, `glm`, or `custom`
- model
- OpenAI-compatible chat completions URL
- API Key
- JSON response format mode

## Frontend Response Validation

The frontend validates backend envelopes before using data:

- `{ "ok": true, "data": ... }` returns `data`.
- `{ "ok": false, "error": { "code": "...", "message": "..." } }` throws a recoverable API error.
- Unknown response shapes throw `INVALID_RESPONSE`.

When a request fails, the page shows a friendly error message and keeps the user's current input.

## AI 输出语言规范

- 默认使用中文输出。
- 专业词汇第一次出现时使用“中文 + 英文括注”，例如：缓存未命中（cache miss）、缓存行（cache line）、局部性（locality）、栈帧（stack frame）、指针（pointer）、时间复杂度（time complexity）。
- 输出必须是结构化 JSON，不能返回长篇散文。
- Obsidian Markdown 也以中文为主，英文术语只作备注。
- AI prompt 和结构化降级结果都必须遵守同一语言规范。

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
  "aiConfig": {
    "provider": "deepseek",
    "model": "deepseek-v4-pro",
    "apiUrl": "https://api.deepseek.com/chat/completions",
    "apiKey": "browser-saved key",
    "jsonResponseFormat": "json_object"
  },
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

Check that the Express backend is running.

### Response

```json
{
  "ok": true,
  "data": {
    "service": "scaffoldmind-server",
    "mode": "ready"
  }
}
```

## GET /api/ai/status

Return backend AI runtime metadata without exposing API keys.

### Response

```json
{
  "ok": true,
  "data": {
    "provider": "openai",
    "providerLabel": "OpenAI",
    "model": "gpt-4o-mini",
    "hasApiKey": false,
    "apiMode": "openai_compatible_chat_completions",
    "jsonResponseFormat": "json_object"
  },
  "error": null
}
```

## POST /api/ai/preflight

Run a tiny real-provider self-check from the backend. This endpoint never returns the API key. If the key is missing or the provider response is not structured, it returns `ok: true` with `data.ready = false` and a recoverable reason instead of breaking the UI.

### Response

```json
{
  "ok": true,
  "data": {
    "provider": "glm",
    "providerLabel": "GLM",
    "model": "glm-5.1",
    "hasApiKey": true,
    "ready": true,
    "providerStatus": "real_api",
    "fallbackReason": null,
    "validationErrors": [],
    "message": "真实 AI 调用成功，结构化 JSON 已通过校验。",
    "checkedAt": "2026-06-02T00:00:00.000Z"
  },
  "error": null
}
```

## POST /api/materials/extract

Extract text from an uploaded learning material before analysis.

### Request

Use `multipart/form-data` with one file field:

```text
material=<TXT | Markdown | PDF file>
```

Supported extensions:

- `.txt`
- `.md`
- `.markdown`
- `.pdf`

The file size limit is 15MB. Image OCR and PPT parsing are not implemented in this endpoint.

### Response

```json
{
  "ok": true,
  "data": {
    "fileName": "cache-notes.md",
    "sourceType": "markdown",
    "mimeType": "text/markdown",
    "pageCount": null,
    "extractedText": "# Cache\nLocality material",
    "warnings": []
  },
  "error": null
}
```

If a PDF is scanned or image-only, `extractedText` may be empty and `warnings` explains that no usable text was found.

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
        "coreView": "资料 A 强调抽象数据类型（abstract data type）的操作边界。"
      }
    ],
    "conflicts": ["资料 B 更关注工程取舍，资料 A 更关注考试定义。"],
    "evidenceComparison": ["资料 A 对课程考试更权威，资料 B 对实现代价更有帮助。"],
    "adoptableConclusions": ["以抽象数据类型（abstract data type）的定义作为主框架。"],
    "openDoubts": ["实现细节是否重要取决于考试范围。"],
    "learningValue": "这次对撞帮助区分课程要求和更宽泛的工程讨论。"
  }
}
```

## GET /api/records

List saved learning records from the backend local lightweight record store.

### Query

```text
limit=20
```

### Response

```json
{
  "ok": true,
  "data": [
    {
      "id": "record_001",
      "title": "缓存未命中（cache miss）",
      "subject": "CSAPP",
      "mode": "after_class_review",
      "modeLabel": "课后深度复习",
      "source": "ai_platform",
      "input": "缓存未命中（cache miss）与局部性（locality）材料",
      "analysis": {},
      "deepDive": null,
      "userAnswer": "",
      "diagnosis": null,
      "obsidianMarkdown": "# [[缓存未命中（cache miss）]]",
      "createdAt": "2026-06-02T00:00:00.000Z"
    }
  ],
  "error": null
}
```

## POST /api/records

Save a complete learning loop record to backend local lightweight storage.

### Request

```json
{
  "title": "缓存未命中（cache miss）",
  "subject": "CSAPP",
  "mode": "after_class_review",
  "modeLabel": "课后深度复习",
  "source": "ai_platform",
  "input": "缓存未命中（cache miss）与局部性（locality）材料",
  "analysis": {},
  "deepDive": null,
  "userAnswer": "我认为缓存未命中就是缓存坏了。",
  "diagnosis": {},
  "obsidianMarkdown": "# [[缓存未命中（cache miss）]]"
}
```

`analysis` is required. The backend returns HTTP `201` when the record is saved.

## DELETE /api/records

Clear all saved backend learning records. The frontend may still keep localStorage as a temporary fallback when the backend is unavailable.

## DELETE /api/records/:id

Delete one saved learning record by id.

## GET /api/profile/summary

Build a lightweight learner profile from recent backend learning records.

### Response

```json
{
  "ok": true,
  "data": {
    "totalRecords": 3,
    "frequentErrorTypes": [{ "label": "因果关系混淆", "count": 2 }],
    "weakConcepts": [{ "label": "缓存未命中（cache miss）", "count": 2 }],
    "commonQuestionTypes": [{ "label": "考试常考型", "count": 2 }],
    "commonModes": [{ "label": "课后深度复习", "count": 3 }],
    "recentTopics": ["缓存未命中（cache miss）"],
    "nextReviewSuggestion": "优先用费曼反讲复习缓存未命中（cache miss），重点检查“因果关系混淆”这类偏差。",
    "updatedAt": "2026-06-02T00:00:00.000Z"
  },
  "error": null
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

When the frontend sends `aiConfig`:

- Browser configuration takes priority over `server/.env` fallback values.
- The backend calls the configured OpenAI-compatible provider from Express; the browser never calls provider URLs directly.
- If the browser API key is missing, the backend returns structured fallback data.
- When `AI_JSON_RESPONSE_FORMAT=json_object`, the backend asks OpenAI-compatible providers to return JSON object responses.
- If a custom provider rejects `response_format`, set `AI_JSON_RESPONSE_FORMAT=none`; schema validation still runs after the response.
- If the provider call fails, the backend returns structured fallback data.
- If the provider returns malformed JSON or a response that fails the task schema, the backend returns structured fallback data.
- Fallback responses include `providerStatus: "fallback"` and `fallbackReason`.
- Schema fallback responses may include `validationErrors` with a short list of failed fields.
- Successful provider responses include `providerStatus: "real_api"`.
- If the provider returns plain text instead of JSON, the backend treats it as `AI_RESPONSE_INVALID` and returns structured fallback data.

## Current Backend Notes

The current frontend always uses the AI platform path. Learning endpoints call the configured provider first, then fall back to deterministic structured results when the provider is not ready or returns an invalid response. Required-field validation is active for:

- `subject` and `mode` on learning endpoints
- `materialText` on `/api/analyze`
- `question` and `materialText` on `/api/deep-dive`
- `question` and `userAttempt` on `/api/diagnose`
- `analysis` on `/api/obsidian`
- `sourceA`, `sourceB`, and `sourceC` on `/api/collision`

Frontend helper support exists through `client/src/shared/api/client.js`; request-level `aiConfig` is forwarded to the backend for analysis, deep dive, diagnosis, Obsidian export, and AI preflight.

## Future API Notes

Future versions may add database-backed records, account sync, PPT parsing, OCR, RAG, and long-term learner profiles. These are not part of the MVP.
