# Changelog

## [0.5.0] - 2026-06-03

### Added

- 新增 `/practice` 刷题页。
- 新增刷题统计：刷题数量、刷题时长、正确率。
- 新增答案评价和错题同知识点强化入口。
- 新增 localStorage 刷题统计和错题保存。
- 新增 `/review` 复习计划页。
- 新增待复习概念、推荐复习顺序和强化练习入口。
- 新增 `/settings` 本地设置页。
- 新增本地数据导出、清空本地历史、清空任务/倒数日/刷题记录和主题切换。
- 新增 `POST /api/practice/generate`。
- 新增 `POST /api/practice/evaluate`。
- 新增 `POST /api/review/plan`。
- 新增 `server/scripts/verifyPracticeReview.mjs`，并纳入 `server` acceptance 测试。

### Changed

- 文档同步到当前多页面结构：`/landing`、`/home`、`/chat`、`/history`、`/profile`、`/practice`、`/review`、`/settings`。
- 文档明确 `/chat` 仍是现有 AI 学习主路径。
- 文档明确 PPT/图片在当前主路径中只作为附件 metadata，不解析。
- 文档明确前端无 API Key、Provider、Model、API URL 配置入口。
- 文档明确后端通过本地 `.env` 使用 DeepSeek 或兼容 provider。

### Verified

- `cd server && npm run test:acceptance`
- `cd client && npm run build`
- `cd client && npm run test:acceptance`

### Not Changed

- 未修改 `docs/PRD.md`。
- 未读取、打印、创建或修改 `.env` / `server/.env`。
- 未写入真实 API Key。
- 未修改 `/landing`、`/home`、`/chat`、`/history`、`/profile` 的 UI。
- 未实现 OCR、RAG、向量数据库、登录或云同步。

## [0.4.0] - 2026-06-02

### Added

- 新增 `AgentWorkspace` 作为当前 `/chat` 主学习路径。
- 新增 `POST /api/agent/chat/stream` SSE 流式接口。
- 新增附件 metadata chip、交互选项、流式 fallback 和 Agent Chat acceptance 测试。

### Preserved

- 保留旧 `StudyWorkspace`、旧结构化学习 API 和旧轻量 `/api/parse-ppt` 代码路径。
- 当前 `/chat` 主路径不调用 `/api/parse-ppt` 或 `requestPptParsing`。

## [0.3.0] - 2026-06-01

### Added

- 新增 Express 结构化学习 API。
- 新增前端 API helper 和统一响应解析。
- 新增 localStorage 学习记录、提问记录和 Obsidian Markdown 输出。

## [0.2.0] - 2026-06-01

### Added

- 完成前端原型学习闭环。
- 补齐五种学习模式的 mock 输出结构。

## [0.1.0] - 2026-05-31

### Added

- 建立 PRD 驱动的工程上下文。
- 初始化 React + Vite + Tailwind 前端和 Node.js Express 后端骨架。
