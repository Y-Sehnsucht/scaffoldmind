# ScaffoldMind 明序 Project Memory

## 当前版本

V0.1 MVP

## 当前状态

项目已完成工程上下文搭建，并初始化 React + Vite + Tailwind 前端骨架与 Node.js Express 后端骨架。`docs/PRD.md` 仍是唯一产品事实来源。

## 已完成功能

- 创建 `docs/ARCHITECTURE.md` 初稿。
- 创建 `docs/TASKS.md` 初稿。
- 创建 `.ai/AGENTS.md` 初稿。
- 创建 `docs/API.md` 初稿。
- 创建 `docs/TEST_PLAN.md` 初稿。
- 创建 `README.md` 初稿。
- 创建 `CHANGELOG.md` 初稿。
- 补充 `.env.example` 空占位。
- 初始化 `client/` 前端骨架。
- 初始化 `server/` 后端骨架。
- 添加前端共享 API helper、localStorage helper、学科和五种学习模式常量。
- 添加 Express 健康检查、五个 API 路由占位、环境配置、promptBuilder 和 aiService 占位。

## 正在进行

- 下一步进入单页面三栏 UI 骨架和 PPT 原页侧拉面板骨架。

## 已知问题与取舍

- PPT 自动解析暂不实现，MVP 只做页码、文字输入、图片上传或占位、侧拉面板查看。
- API Key 必须放在后端本地 `.env` 中，不得写入前端、README、docs、测试或截图。
- MVP 使用 localStorage，不使用 SQLite、PostgreSQL、向量数据库或云同步。
- 不实现登录注册。
- 不添加教师后台。
- 必须保留五种学习模式。
- 必须保留右侧提问记录侧边栏。

## 下一步计划

1. 实现单页面三栏 UI 骨架。
2. 实现 PPT 原页侧拉面板骨架。
3. 实现学科选择和五种学习模式选择。
4. 实现学习便签和模式化输入区域。
5. 实现 mock 学习闭环入口。
6. 将提问记录保存到 localStorage。

## 最近 3 次重要变更

- 2026-05-31：补充 PRD，并以 PRD 为依据生成工程上下文文档。
- 2026-05-31：初始化 `.ai/AGENTS.md`，明确 Codex 协作规则和禁止事项。
- 2026-05-31：初始化 API、测试计划、任务清单、README 和 CHANGELOG。
- 2026-06-01：初始化 React + Vite + Tailwind 前端骨架和 Node.js Express 后端骨架。

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
