# ScaffoldMind 明序 API

本文件记录当前 Express 后端 API。React 前端只调用 Express 后端，不直接调用 DeepSeek 或其他文本生成 provider。

## 安全边界

- 前端不读取、不展示、不保存 `TEXT_GENERATION_API_KEY`。
- 前端没有 API Key、Provider、Model、API URL 配置入口。
- 真实 API Key 只能由后端从本地 `server/.env` 读取。
- 文档、代码、测试和响应体不得包含真实 API Key。
- 当前 `/chat` 主路径中的 PPT、图片和文件附件只作为 metadata 传递，不解析内容。
- 旧 `/api/parse-ppt` 代码路径保留，但当前主学习路径不得调用它。

## 统一响应格式

成功：

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

失败：

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field(s): concept"
  }
}
```

## GET /api/health

检查后端是否运行。

## POST /api/agent/chat/stream

`/chat` 当前 AI 学习主路径。返回 `text/event-stream`，保留流式输出、fallback、交互选项和附件 metadata。

请求字段：

```json
{
  "subject": "CSAPP",
  "mode": "default",
  "message": "解释缓存未命中（cache miss）",
  "attachments": [
    {
      "name": "lecture.pptx",
      "size": 123456,
      "type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "selectedAt": "2026-06-03T00:00:00.000Z"
    }
  ],
  "history": []
}
```

说明：

- `attachments` 仅表示文件 metadata。
- PPT/图片不在当前主路径中解析。
- 缺 key 或 provider 失败时返回 fallback markdown，不让前端白屏。

## POST /api/practice/generate

根据用户选择的 concept、画像和最近错题生成常考题。题目由后端生成或 fallback mock 生成，不接外部题库。

请求：

```json
{
  "subject": "CSAPP",
  "concept": "补码溢出",
  "difficulty": "medium",
  "learnerProfile": {},
  "recentMistakes": []
}
```

响应：

```json
{
  "ok": true,
  "data": {
    "id": "practice_001",
    "question": "请解释补码溢出为什么是常考点，并指出一个最容易误判的边界条件。",
    "answerType": "short_answer",
    "choices": [],
    "knowledgePoint": "补码溢出",
    "difficulty": "medium",
    "expectedKeyPoints": ["概念定义", "边界条件", "常见误区", "修正判断"],
    "hint": "先说本质，再说误判，再给出正确判断。",
    "providerStatus": "fallback",
    "fallbackReason": "deepseek_missing_api_key"
  },
  "error": null
}
```

必填字段：`subject`、`concept`、`difficulty`。

## POST /api/practice/evaluate

评价用户答案，返回正确性、分数、反馈、漏掉的关键点和下一步动作。

请求：

```json
{
  "question": "请解释补码溢出为什么是常考点。",
  "userAnswer": "补码溢出需要关注符号位变化和边界条件。",
  "expectedKeyPoints": ["概念定义", "边界条件", "常见误区"],
  "knowledgePoint": "补码溢出",
  "subject": "CSAPP"
}
```

响应：

```json
{
  "ok": true,
  "data": {
    "correct": true,
    "score": 82,
    "feedback": "你的回答覆盖了主要结构，建议再补一个具体反例。",
    "mainIssue": "例子不够具体",
    "correctKeyPoints": ["边界条件"],
    "missedKeyPoints": ["常见误区"],
    "nextAction": "same_concept",
    "providerStatus": "fallback"
  },
  "error": null
}
```

必填字段：`question`、`userAnswer`、`knowledgePoint`、`subject`。

## POST /api/review/plan

根据本地 learnerProfile、历史对话、刷题统计和错题生成复习计划。

请求：

```json
{
  "learnerProfile": {},
  "recentConversations": [],
  "practiceStats": {},
  "weakConcepts": ["补码溢出", "缓存未命中（cache miss）"]
}
```

响应：

```json
{
  "ok": true,
  "data": {
    "priorityConcepts": ["补码溢出", "缓存未命中（cache miss）"],
    "reviewPlan": [
      {
        "id": "review_001",
        "title": "补码溢出",
        "reason": "来自最近错题或负反馈，应优先复盘。",
        "suggestedAction": "chat",
        "estimatedMinutes": 20
      }
    ],
    "recommendedPractice": [
      {
        "knowledgePoint": "补码溢出",
        "reason": "用一题简答题检查概念边界和易错点。"
      }
    ],
    "nextActions": ["先复习最高优先级概念", "进入强化练习做同知识点题目"],
    "providerStatus": "fallback"
  },
  "error": null
}
```

## 已保留的旧结构化学习 API

以下 API 仍保留在代码中，用于旧 `StudyWorkspace` 或后续兼容，不是当前 `/chat` 主路径：

- `POST /api/analyze`
- `POST /api/deep-dive`
- `POST /api/diagnose`
- `POST /api/obsidian`
- `POST /api/collision`
- `POST /api/parse-ppt`

范围说明：

- 当前主路径 PPT/图片只作为附件 metadata，不解析。
- 不实现 OCR、RAG、向量数据库、登录、云同步。
