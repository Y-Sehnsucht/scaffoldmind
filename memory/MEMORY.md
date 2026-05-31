# ScaffoldMind 明序 Project Memory

## 当前版本

V0.1 MVP

## 当前状态

项目处于工程上下文搭建阶段。`docs/PRD.md` 已作为唯一产品事实来源，当前完成的是文档和协作规则初始化，尚未开始业务代码开发。

## 已完成功能

- 创建 `docs/ARCHITECTURE.md` 初稿。
- 创建 `docs/TASKS.md` 初稿。
- 创建 `.ai/AGENTS.md` 初稿。
- 创建 `docs/API.md` 初稿。
- 创建 `docs/TEST_PLAN.md` 初稿。
- 创建 `README.md` 初稿。
- 创建 `CHANGELOG.md` 初稿。
- 补充 `.env.example` 空占位。

## 正在进行

- 项目初始化与工程上下文搭建。
- 下一步进入 React + Vite + Tailwind 前端骨架和 Node.js Express 后端骨架初始化。

## 已知问题与取舍

- PPT 自动解析暂不实现，MVP 只做页码、文字输入、图片上传或占位、侧拉面板查看。
- API Key 必须放在后端本地 `.env` 中，不得写入前端、README、docs、测试或截图。
- MVP 使用 localStorage，不使用 SQLite、PostgreSQL、向量数据库或云同步。
- 不实现登录注册。
- 不添加教师后台。
- 必须保留五种学习模式。
- 必须保留右侧提问记录侧边栏。

## 下一步计划

1. 初始化 React + Vite + Tailwind 前端。
2. 初始化 Node.js Express 后端。
3. 建立前端目录：`core`、`features`、`shared/api`、`shared/storage`。
4. 建立后端目录：`routes`、`services`、`config`。
5. 实现单页面三栏 UI 骨架。
6. 实现 mock 学习闭环入口。

## 最近 3 次重要变更

- 2026-05-31：补充 PRD，并以 PRD 为依据生成工程上下文文档。
- 2026-05-31：初始化 `.ai/AGENTS.md`，明确 Codex 协作规则和禁止事项。
- 2026-05-31：初始化 API、测试计划、任务清单、README 和 CHANGELOG。

## 快速参考

- 产品事实来源：`docs/PRD.md`
- 架构文档：`docs/ARCHITECTURE.md`
- API 初稿：`docs/API.md`
- 测试计划：`docs/TEST_PLAN.md`
- 任务清单：`docs/TASKS.md`
- AI 协作规则：`.ai/AGENTS.md`
- 前端入口规划：`client/src/App.jsx`
- 后端入口规划：`server/index.js`
- Prompt 构造规划：`server/services/promptBuilder.js`
- AI 调用规划：`server/services/aiService.js`

## 完成任务后必须更新

- `memory/MEMORY.md`
- `CHANGELOG.md`
- `docs/TASKS.md`
