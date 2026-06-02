# Changelog

所有 ScaffoldMind 明序的重要变更都会记录在这里。

## [0.3.7] - 2026-06-02

### Changed

- 执行全项目编码审计，扫描 `client`、`server`、`docs`、`memory`、`README.md`、`CHANGELOG.md` 中的冲突标记和明显乱码。
- 重写 `README.md`、`memory/MEMORY.md`、`CHANGELOG.md` 为中文 UTF-8 清稿。
- 修复后端记录存储中的乱码中文。
- 将后端学习记录存储从当前 Node 20 不支持的 `node:sqlite` 改为同接口轻量 JSON 文件存储，避免 mock 验证失败。
- 保留 TXT、Markdown、PDF 文字提取和 PPTX 轻量解析路径。
- 右侧“最近学习记录”支持点击恢复完整学习上下文，包括材料、结构化解析、追问、用户回答、诊断和 Obsidian 输出。
- 将客户端保存成功文案和 `docs/API.md` 中的记录存储描述从 SQLite 更新为后端本地轻量记录存储。
- 学习画像增加“复制计划”入口，可将薄弱概念、高频错误、最近主题和待追问问题整理为 Obsidian 复习计划 Markdown。
- 提问记录保存主动追问的 `type/typeLabel`，学习画像新增“常见问题类型”统计，并同步写入复习计划。
- 学习记录会保存问题链 `questionHistory`，后端 `GET /api/profile/summary` 会从已保存记录中汇总 `commonQuestionTypes`。
- 页面初始化时会在本地提问记录为空的情况下，从后端学习记录的 `questionHistory` 恢复右侧提问记录。
- 新增 `server/scripts/verifyLearningLoop.mjs` 和 `npm run test:loop`，自动验证材料提取、解析、追问、诊断、Obsidian、保存记录和学习画像的完整后端闭环。
- 扩展结构化 AI 验证：覆盖 provider 返回纯文本时 fallback，以及 provider 返回结构化 JSON 时标记为 `real_api` 的成功路径。
- 前端分析结果增加更清晰的 provider 来源说明，将真实 AI、结构化 fallback、缺失 API Key 和结构化校验错误翻译为中文可读状态。
- 前端生成和诊断前增加本地输入校验：空材料或空用户回答会给出中文提示，不发起无意义请求，也不清空已有输入。
- 前端 API helper 会把网络失败标准化为 `BACKEND_UNAVAILABLE`，并通过统一错误文案区分后端未启动、校验失败、材料解析失败和真实 AI 请求失败。
- 新增 `client/scripts/verifyWorkspaceSmoke.mjs` 和 `npm run test:workspace`，无需新增浏览器测试依赖即可验证前端工作台核心状态闭环。
- 新增 `server/scripts/verifyRecordStore.mjs` 和 `npm run test:records`，验证学习记录 JSON 文件损坏时可安全回退并继续保存记录。

### Verified

- `cd client && npm run test:mock`
- `cd client && npm run build`
- `cd server && npm run test:mock`
- 冲突标记扫描未命中。
- 明显乱码扫描未命中。

### Not Changed

- 未修改 `docs/PRD.md`。
- 未创建或修改 `server/.env`。
- 未写入或打印真实 API Key。
- 未新增大型依赖。
- 未实现登录注册、教师后台、OCR、旧版 `.ppt` parser、向量数据库或云同步。

## [0.3.6] - 2026-06-01

### Added

- 添加 PPTX 解析结果导航。
- 左侧来源面板展示每页页码、文字块数量、图片占位数量和首段预览。
- 点击某一页可将该页文字与结构填入中间输入区。

### Verified

- `cd server && npm run test:mock`
- `cd client && npm run test:mock`
- `cd client && npm run build`

## [0.3.5] - 2026-06-01

### Added

- 添加 `POST /api/parse-ppt`，支持轻量 `.pptx` 解析。
- 后端读取 Office Open XML 中的 slide XML 和图片关系占位。
- 前端文件解析操作接入后端 PPTX parser。

### Not Implemented

- 未加入 OCR、幻灯片渲染、向量数据库或大型解析依赖。

## [0.3.4] - 2026-06-01

### Changed

- 将页面调整为更接近参考图的宽屏三栏工作台。
- 将材料和问题输入区移动到中间对话区。
- 左侧聚焦来源文件、PPT 页码、学习便签和 slide 预览。
- 自动保存生成的问题与学习记录。

## [0.3.3] - 2026-06-01

### Changed

- 优化首页空状态、生成后状态、右侧提问记录状态和错误提示。
- 统一主要 UI 文案为中文。

## [0.3.2] - 2026-06-01

### Changed

- README 改为中文主文档。
- 本地 Mock、后端 Mock、真实 API prompt 统一为中文优先输出。
- 专业术语首次出现时使用“中文 + 英文括注”。

## [0.3.1] - 2026-06-01

### Added

- 添加真实 API 可控入口和三源切换：本地 Mock、后端 Mock、真实 API。
- 缺少 key 或 provider 调用失败时使用结构化 fallback。

## [0.3.0] - 2026-06-01

### Added

- 添加后端 Mock API 和统一响应格式。
- 添加前端 API helper 和响应解析工具。

## [0.2.0] - 2026-06-01

### Added

- 完成本地 Mock 学习闭环。
- 添加 localStorage 保存、提问记录和 Obsidian Markdown 输出。
- 补齐五种学习模式的差异化 mock 结构。

## [0.1.0] - 2026-05-31

### Added

- 建立 PRD 驱动的工程上下文。
- 初始化 React + Vite + Tailwind 前端和 Node.js Express 后端骨架。
