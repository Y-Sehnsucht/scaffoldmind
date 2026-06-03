# ScaffoldMind 明序 Tasks

## 当前阶段

手动验收已通过当前前端重构与多页面补齐阶段。现在只进行最终文档同步，不修改功能代码、不修改 `docs/PRD.md`、不读取或修改 `.env`。

## 已完成

- [x] 工程上下文文档初始化。
- [x] React + Vite + Tailwind CSS 前端骨架。
- [x] Node.js + Express 后端骨架。
- [x] `/landing` 产品入口页。
- [x] `/home` 学习首页，包含任务、倒数日、学习日历和最近学习状态。
- [x] `/chat` 现有 AI 学习主路径，保留 Agent Chat、SSE 流式输出、模式选择、交互选项、附件 metadata chip、对话历史恢复、复制、点赞、点踩和 localStorage 记忆。
- [x] `/history` 本地学习历史与反馈记录浏览。
- [x] `/profile` 本地学习画像、薄弱概念和知识图谱视图。
- [x] `/practice` 刷题页，支持刷题生成、答案评价、错题同知识点强化。
- [x] `/review` 复习页，支持根据本地画像、历史、刷题统计和错题生成复习计划。
- [x] `/settings` 本地数据管理、导出、清空和主题切换。
- [x] 后端 practice/review API。
- [x] localStorage 保存任务、倒数日、历史、画像、反馈/交互记忆、刷题统计和错题。
- [x] 前端移除 API Key、Provider、Model、API URL 配置入口。

## 新增 API

- [x] `POST /api/practice/generate`
- [x] `POST /api/practice/evaluate`
- [x] `POST /api/review/plan`

## 当前范围说明

- `/chat` 继承现有 AI 学习主路径。
- 前端无 API Key 配置入口，前端只调用 Express 后端。
- 后端通过本地 `server/.env` 使用 DeepSeek 或兼容 provider。
- PPT、图片和其他附件在 `/chat` 中只展示 metadata，不解析内容。
- 旧 `StudyWorkspace`、旧 analyze API、旧 parse-ppt API 代码路径保留，但当前主路径不调用 `/api/parse-ppt`。
- 不实现登录注册、教师后台、OCR、RAG、向量数据库或云同步。

## 下一步建议

1. 手动验收 `/practice`、`/review`、`/settings` 在不同窗口宽度和缩放比例下的体验。
2. 检查错题与薄弱点是否需要在 `/profile` 中更明显地聚合展示。
3. 如需实现 PPT/图片解析，单独开阶段确认范围、安全边界、解析策略和测试计划，不要混入当前 `/chat` 主路径。

## 交付前自检

- `cd server && npm run test:acceptance`
- `cd client && npm run build`
- `cd client && npm run test:acceptance`
- `git status --short`
