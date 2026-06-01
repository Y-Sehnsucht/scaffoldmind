# ScaffoldMind 明序 Project Memory

## 当前版本

V0.1 MVP

## 当前状态

项目已完成工程上下文搭建、React + Vite + Tailwind 前端骨架、Node.js Express 后端骨架、前端 mock MVP 学习闭环，以及五种学习模式的差异化 mock 输出。`docs/PRD.md` 仍是唯一产品事实来源，本轮未接入真实文本生成 API。

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
- 完成单页面三栏 UI 骨架增强。
- 完成顶部栏学科选择、五种学习模式选择和当前状态展示。
- 完成学习方法便签、模式化输入、页码输入、图片上传占位。
- 完成 mock 结构化解析、主动追问、mock 深入回答、用户尝试、mock 错误诊断和强化题。
- 完成 PPT 原页侧拉面板骨架。
- 完成右侧提问记录 localStorage 保存。
- 完成学习记录 localStorage 保存与清空。
- 完成 Obsidian Markdown mock 输出、复制和 fallback 文本框。
- 完成五种学习模式的差异化 mock 输出结构。
- 完成模式化 mock 输出 UI 渲染。
- 新增 `npm run test:mock`，覆盖 localStorage、Obsidian Markdown 和五种模式输出字段。

## 正在进行

- 下一步进入真实 API 接入边界准备，但暂不连接真实文本生成 API。

## 已知问题与取舍

- PPT 自动解析暂不实现，MVP 只做页码、文字输入、图片上传文件名占位、侧拉面板查看。
- API Key 必须放在后端本地 `.env` 中，不得写入前端、README、docs、测试或截图。
- MVP 使用 localStorage，不使用 SQLite、PostgreSQL、向量数据库或云同步。
- 不实现登录注册。
- 不添加教师后台。
- 必须保留五种学习模式。
- 必须保留右侧提问记录侧边栏。
- 当前 AI 结果全部来自前端 mock 数据，不调用真实 AI API。
- 当前轻量测试为 Node 脚本，不引入额外测试框架。

## 下一步计划

1. 准备真实 API 接入前的请求/响应校验，但暂不接真实 API。
2. 为 Express API 占位路由补充 mock 响应或 schema 校验策略。
3. 增加空输入、复制失败、清空记录等手动测试记录。
4. 后续再实现 Express mock/真实接口切换策略。
5. 继续确认 `.env` 不被创建或提交。

## 最近 3 次重要变更

- 2026-05-31：补充 PRD，并以 PRD 为依据生成工程上下文文档。
- 2026-05-31：初始化 `.ai/AGENTS.md`，明确 Codex 协作规则和禁止事项。
- 2026-05-31：初始化 API、测试计划、任务清单、README 和 CHANGELOG。
- 2026-06-01：初始化 React + Vite + Tailwind 前端骨架和 Node.js Express 后端骨架。
- 2026-06-01：完成前端 mock MVP 学习闭环、localStorage 保存和 Obsidian Markdown mock 输出。
- 2026-06-01：完成五种学习模式差异化 mock 输出，并新增 `npm run test:mock` 轻量验证。

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
