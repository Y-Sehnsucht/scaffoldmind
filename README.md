# ScaffoldMind 明序

ScaffoldMind 明序是一个面向 CSAPP 和数据结构学习的 AI 学习助手。它不是简单问答壳，而是帮助学习者搭建“认知脚手架”：从材料输入开始，经过结构化解析、主动追问、用户尝试、错误诊断、强化练习和 Obsidian 输出，形成可回顾的学习闭环。

## 核心功能

- 单页面三栏学习工作台：左侧来源，中间对话与学习闭环，右侧提问记录和学习画像。
- 五种学习模式：Context Stacking 超前学习、课后深度复习、出题人视角、费曼反讲、多维信息对撞。
- 支持粘贴文本，也支持上传 TXT、Markdown、PDF 自动提取文字作为学习材料。
- 支持轻量 PPTX 全页解析：提取每页文字块、图片占位和页码预览。
- 右侧提问记录快速浏览回顾侧边栏，区分待追问、已回答、已强化。
- PPT 原页侧拉面板，用于查看页码、提取文字和相关概念。
- 本地 Mock、后端 Mock、真实 API 三种数据源可控切换，默认使用本地 Mock。
- 学习记录自动保存，localStorage 保留本地回顾数据；后端提供轻量记录接口。
- Obsidian Markdown 输出，包含 wikilink、callout 和 PPT 页码来源。

## 技术栈

- 前端：React + Vite + Tailwind CSS
- 后端：Node.js + Express
- 本地存储：localStorage
- 后端记录：轻量 JSON 文件存储
- AI 调用：只能通过 Express 后端，前端不读取、不展示、不保存 API Key

## 运行方式

前端：

```bash
cd client
npm install
npm run dev
```

后端：

```bash
cd server
npm install
npm run dev
```

默认地址：

- 前端：`http://localhost:5173`
- 后端健康检查：`http://localhost:3001/api/health`

也可以在项目根目录运行：

```bash
start-dev.cmd
```

## 环境变量说明

真实 API Key 只能放在本地 `server/.env`，不要提交到 Git。项目不会创建或修改 `server/.env`。

`.env.example` 只保留空占位。真实 API 模式由后端读取环境变量，前端只请求 Express API。

示例变量名：

```text
PORT=3001
AI_PROVIDER=openai
AI_JSON_RESPONSE_FORMAT=json_object
OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_API_URL=
```

API Key 安全要求：

- 不要把真实 API Key 写进代码、README、文档或前端。
- 前端不得读取 `TEXT_GENERATION_API_KEY` 或任何 provider key。
- `.env`、`server/.env`、`client/.env` 必须被 `.gitignore` 忽略。
- 验证脚本只允许输出是否配置 key，不允许输出 key 内容。

## 三种数据源

- 本地 Mock：默认模式，不依赖后端，适合稳定演示。
- 后端 Mock：通过 Express mock API 返回结构化 JSON，适合验证前后端接口。
- 真实 API：只有用户手动切换后才调用后端真实 provider；缺少 key 或调用失败时使用结构化 fallback，页面不崩溃。

## 演示路径

1. 启动前端和后端。
2. 在顶部选择数据源，默认保持“本地 Mock”。
3. 左侧上传 TXT、Markdown、PDF 或 PPTX，也可以直接在中间输入材料。
4. 选择学科、学习模式和学习便签。
5. 点击“生成解析”。
6. 点击主动追问，右侧会自动记录问题。
7. 在用户尝试区提交回答，查看错误诊断和强化题。
8. 复制 Obsidian Markdown，或保存本次学习记录。

## 当前 MVP 状态

已完成：

- React + Vite + Tailwind 前端骨架。
- Express 后端骨架和统一 API 响应格式。
- 三栏现代学习工作台。
- 五种学习模式的本地 mock 输出。
- 后端 mock API 和真实 API 可控入口。
- PPTX 轻量解析。
- TXT、Markdown、PDF 文字提取。
- 提问记录、学习记录、学习画像、Obsidian 输出。
- 编码审计修复，主要文本文件统一为可读中文 UTF-8。

暂不包含：

- 登录注册。
- 教师后台。
- OCR。
- 旧版 `.ppt` parser。
- 完整 PPT 自动视觉解析。
- 向量数据库。
- 云同步。

## 测试

客户端：

```bash
cd client
npm run test:mock
npm run build
```

服务端：

```bash
cd server
npm run test:mock
```

真实 provider 验证脚本不会打印完整回答或 API Key：

```bash
cd server
npm run test:real
```

## 后续迭代方向

- 在浏览器中补充三种数据源的端到端手动验收。
- 为真实 API 输出增加更严格的结构化 schema 修复。
- 增加轻量 UI smoke test。
- 如果产品范围允许，再设计专门的 PDF/OCR/幻灯片视觉结构解析服务。
