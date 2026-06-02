# ScaffoldMind 明序

ScaffoldMind 明序是一个面向 CSAPP 和数据结构学习的 AI 学习助手。它不是简单问答壳，而是帮助学习者搭建“认知脚手架”：从材料输入开始，经过结构化解析、主动追问、用户尝试、错误诊断、强化练习和 Obsidian 输出，形成可回顾的学习闭环。

## 核心功能

- 单页面三栏学习工作台：左侧来源，中间对话与学习闭环，右侧提问记录和学习画像。
- 五种学习模式：Context Stacking 超前学习、课后深度复习、出题人视角、费曼反讲、多维信息对撞。
- 支持粘贴文本，也支持上传 TXT、Markdown、PDF 自动提取文字作为学习材料。
- 支持轻量 PPTX 全页解析：提取每页文字块、图片占位和页码预览。
- 右侧提问记录快速浏览回顾侧边栏，区分待追问、已回答、已强化。
- PPT 原页侧拉面板，用于查看页码、提取文字和相关概念。
- 顶部提供 AI 配置区，可在浏览器里选择 OpenAI、DeepSeek、GLM 或自定义 OpenAI-compatible provider，并保存模型、API URL 和 API Key。
- 学习记录自动保存，localStorage 保留本地回顾数据；后端提供轻量记录接口。
- Obsidian Markdown 输出，包含 wikilink、callout 和 PPT 页码来源。

## 技术栈

- 前端：React + Vite + Tailwind CSS
- 后端：Node.js + Express
- 本地存储：localStorage
- 后端记录：轻量 JSON 文件存储
- AI 调用：前端保存本地单用户配置，Express 后端负责调用 OpenAI-compatible provider

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

## AI 配置说明

当前版本面向本地单用户学习场景，可以直接在浏览器顶部的 **AI 配置** 区填写并保存 provider、model、API URL 和 API Key。

保存后可以点击 **AI 自检**，确认 provider 能返回结构化 JSON。

安全说明：

- 浏览器保存方式适合本机课程项目和个人学习，不适合公网多人平台。
- 不要把真实 API Key 写进代码、README、文档、截图或提交到 Git。
- `.env`、`server/.env`、`client/.env` 仍然必须被 `.gitignore` 忽略。
- 后端仍兼容 `server/.env` 作为备用配置，但默认推荐在页面里配置。

`server/.env` 备用变量示例：

```text
PORT=3001
AI_PROVIDER=openai
AI_JSON_RESPONSE_FORMAT=json_object
OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_API_URL=
```

## 演示路径

1. 启动前端和后端。
2. 在顶部 AI 配置区填写 provider、model、API URL 和 API Key，并点击“保存”。
3. 左侧上传 TXT、Markdown、PDF 或 PPTX，也可以直接在中间输入材料。
4. 选择学科、学习模式和学习便签。
5. 点击“AI 自检”，通过后点击“生成 AI 解析”。
6. 点击主动追问，右侧会自动记录问题。
7. 在用户尝试区提交回答，查看错误诊断和强化题。
8. 复制 Obsidian Markdown，或保存本次学习记录。

## 当前 MVP 状态

已完成：

- React + Vite + Tailwind 前端骨架。
- Express 后端骨架和统一 API 响应格式。
- 三栏现代学习工作台。
- 五种学习模式的 AI prompt 和结构化输出。
- 浏览器 AI 配置保存和后端 provider 调用。
- AI 状态展示、自检和结构化降级结果。
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
npm run test:acceptance
npm run build
```

服务端：

```bash
cd server
npm run test:acceptance
```

真实 provider 验证脚本不会打印完整回答或 API Key：

```bash
cd server
npm run test:real
```

## 后续迭代方向

- 准备课程展示脚本和截图。
- 如果要公网部署，需要把浏览器保存 key 改回服务端密钥托管或账号级安全存储。
- 如果产品范围继续扩大，再单独设计 OCR、幻灯片视觉结构解析、向量检索和云同步。
