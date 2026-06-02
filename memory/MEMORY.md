# ScaffoldMind 明序 Project Memory

## Current Version

V0.1 MVP, implementation checkpoint `0.3.7`.

## Current Status

ScaffoldMind 明序已经具备工程上下文、React + Vite + Tailwind 前端、Node.js Express 后端、三栏学习工作台、本地 Mock 学习闭环、后端 Mock API、真实 API 可控入口、PPTX 轻量解析、TXT/Markdown/PDF 文字提取、学习记录和提问记录。

默认数据源仍是“本地 Mock”。“后端 Mock”和“真实 API”仍可手动切换。真实 API 只在用户选择后通过 Express 后端调用；前端不读取、不展示、不保存 API Key。

`docs/PRD.md` 是产品事实来源，当前 checkpoint 未修改 PRD。

## Completed Features

- 创建并维护工程上下文文档：`docs/ARCHITECTURE.md`、`docs/TASKS.md`、`docs/API.md`、`docs/TEST_PLAN.md`、`.ai/AGENTS.md`、`README.md`、`CHANGELOG.md`。
- 初始化 `client/`：React + Vite + Tailwind CSS。
- 初始化 `server/`：Node.js + Express。
- 构建现代深色三栏学习工作台：
  - 左侧来源与文件。
  - 中间对话、材料输入、学习闭环。
  - 右侧提问记录、学习记录、学习画像。
- 保留五种学习模式：
  - Context Stacking 超前学习。
  - 课后深度复习。
  - 出题人视角。
  - 费曼反讲。
  - 多维信息对撞。
- 实现本地 Mock、后端 Mock、真实 API 三源切换，默认本地 Mock。
- 实现结构化解析、主动追问、用户尝试、错误诊断、强化题和 Obsidian Markdown 输出。
- 实现右侧提问记录快速浏览回顾侧边栏。
- 实现 PPT 原页侧拉面板。
- 实现 localStorage 提问记录和离线学习记录 fallback。
- 实现后端学习记录接口和基础学习画像。
- 实现 `POST /api/parse-ppt` 轻量 PPTX 解析，提取页码、文字块和图片占位。
- 实现 `POST /api/materials/extract`，支持 TXT、Markdown、PDF 文字提取。
- 实现后端统一响应格式：
  - 成功：`{ ok: true, data, error: null }`
  - 失败：`{ ok: false, data: null, error }`
- 完成 README 中文化和 AI 输出中文规范。
- 完成编码审计修复：
  - 清理冲突标记。
  - 修复确定的乱码中文。
  - 将 `README.md`、`CHANGELOG.md`、`memory/MEMORY.md` 重写为 UTF-8 中文清稿。
  - 将后端记录存储从当前 Node 不支持的 `node:sqlite` 改为同接口轻量 JSON 文件存储。
- 右侧“最近学习记录”现在可以点击恢复到当前工作台，恢复内容包括材料、结构化解析、追问、用户回答、诊断和 Obsidian 输出。
- 学习画像区支持复制 Obsidian 复习计划，内容包含薄弱概念、高频错误、最近学习主题、待追问问题和下一步复习动作。
- 提问记录保存主动追问类型，学习画像和复习计划会统计常见问题类型，帮助用户看见自己更常追问考试、工程、上下文还是底层逻辑。
- 学习记录保存 `questionHistory`，后端学习画像会从历史记录中汇总 `commonQuestionTypes`，刷新后仍能保留常见问题类型维度。
- 页面加载时，如果浏览器本地提问记录为空，会从后端学习记录恢复问题链，让右侧提问记录在刷新后更可靠。
- 新增后端学习闭环 smoke 脚本 `server/scripts/verifyLearningLoop.mjs`，覆盖材料提取、结构化解析、追问、诊断、Obsidian、学习记录保存和学习画像汇总。
- `server/scripts/verifyStructuredAi.mjs` 覆盖真实 provider 两条关键路径：纯文本输出会 fallback，结构化 JSON 输出会保留为 `providerStatus: "real_api"`。
- 前端通过 `client/src/utils/providerStatus.js` 将真实 AI 与结构化 fallback 的来源和失败原因显示为中文可读状态。
- 前端生成解析和提交诊断前有本地输入校验，空材料或空回答会提示用户补充内容，避免发起无意义请求并保留已有输入。
- 前端 API helper 会把网络失败标准化成 `BACKEND_UNAVAILABLE`，UI 通过 `client/src/utils/errorMessages.js` 输出可恢复的中文错误提示。
- 新增前端工作台 smoke 脚本 `client/scripts/verifyWorkspaceSmoke.mjs`，用无浏览器依赖的方式验证本地闭环、记录恢复、问题类型统计和复习计划。
- 新增后端记录存储恢复验证 `server/scripts/verifyRecordStore.mjs`，测试坏 JSON 记录文件不会导致服务崩溃，并且恢复后仍可保存记录和生成画像。

## In Progress

- 真实 API 模式已具备代码路径，但仍建议在浏览器中用真实 key 做一次人工验收。
- TXT/Markdown/PDF/PPTX 上传路径已接入；扫描版 PDF、图片 OCR、旧版 `.ppt` 不属于当前 MVP。

## Known Constraints

- 不创建、不修改、不读取、不打印 `server/.env`。
- API Key 只能存在于本地后端环境变量。
- 前端不得读取任何真实 API Key。
- 不实现登录注册。
- 不添加教师后台。
- 不实现 OCR。
- 不实现旧版 `.ppt` parser。
- 不实现向量数据库。
- 不实现云同步。
- 不修改 `docs/PRD.md`。
- 当前测试是轻量 Node 验证脚本，不是完整 UI 自动化测试。

## Latest Validation

- `cd client && npm run test:mock`：通过。
- `cd client && npm run test:workspace`：通过。
- `cd client && npm run build`：通过。
- `cd server && npm run test:mock`：通过。
- `cd server && npm run test:loop`：通过。
- `cd server && npm run test:records`：通过。
- 冲突标记扫描：未命中。
- 明显乱码扫描：未命中。
- `docs/PRD.md` 状态检查：未改动。

## Next Plan

1. 在浏览器中手动验收完整路径：本地 Mock、后端 Mock、真实 API。
2. 对 TXT/Markdown/PDF/PPTX 上传分别做一次人工 smoke test。
3. 为真实 API 输出增加更严格的 schema 修复和字段补全。
4. 如果产品范围扩大，再单独设计 OCR、旧版 `.ppt`、幻灯片视觉结构解析和向量检索服务。

## Recent Important Changes

- 2026-05-31：完成 PRD 驱动的工程上下文文档。
- 2026-06-01：初始化 React + Vite + Tailwind 前端和 Node.js Express 后端。
- 2026-06-01：完成本地 Mock MVP 学习闭环、localStorage 和 Obsidian 输出。
- 2026-06-01：补齐五种学习模式的差异化 mock 输出。
- 2026-06-01：加入后端 Mock API 和三源切换。
- 2026-06-01：加入真实 API 可控入口和结构化 fallback。
- 2026-06-01：统一 README 与 AI 输出为中文优先。
- 2026-06-01：重构为现代深色三栏工作台。
- 2026-06-01：加入 PPTX 轻量解析和 slide 列表预览。
- 2026-06-02：完成编码审计，修复冲突/乱码，稳定 TXT/Markdown/PDF/PPTX 材料输入路径。
- 2026-06-02：新增最近学习记录点击恢复能力，使历史学习成果可重新进入学习闭环。
- 2026-06-02：新增基于学习画像的 Obsidian 复习计划复制能力。
- 2026-06-02：新增常见问题类型统计，补齐学习画像中的问题链维度。
- 2026-06-02：将问题链写入学习记录，并同步到后端画像汇总。
- 2026-06-02：支持从后端学习记录恢复右侧提问记录。
- 2026-06-02：新增后端完整学习闭环 smoke 验证脚本。
- 2026-06-02：补强真实 API 结构化输出验收，覆盖 fallback 和成功路径。
- 2026-06-02：增强前端 provider 状态展示，清晰区分真实 AI 与结构化 fallback。
- 2026-06-02：新增前端空材料和空回答校验，改善可恢复错误体验。
- 2026-06-02：新增前端 API 错误分类，区分后端不可用、校验失败、解析失败和真实 AI 请求失败。
- 2026-06-02：新增前端工作台状态 smoke 验证脚本。
- 2026-06-02：新增后端记录存储损坏恢复验证脚本。
