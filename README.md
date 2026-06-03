# ScaffoldMind 明序

ScaffoldMind 明序是一个面向 CSAPP 和数据结构学习的 AI 学习助手。当前项目采用多页面前端结构，主学习路径是 `/chat` 的 Agent Chat：用户在中间输入材料或问题，系统通过 Express 后端流式输出结构化学习内容，并保留本地学习记忆。

## 页面结构

- `/landing`：产品视觉入口。
- `/home`：学习仪表盘，展示任务、倒数日、日历和最近学习。
- `/chat`：现有 AI 学习主路径，保留流式输出、交互选项、附件 metadata chip、模式选择、复制/点赞/点踩、对话历史恢复和 localStorage 记忆。
- `/history`：本地学习历史和反馈记录浏览。
- `/profile`：本地学习画像、薄弱概念和知识图谱。
- `/practice`：刷题页，支持按知识点生成常考题、提交答案评价、错题同知识点强化。
- `/review`：复习计划页，根据本地画像、历史、刷题统计和错题生成复习顺序。
- `/settings`：本地设置页，支持主题切换、导出本地学习数据、清空本地历史、清空任务/倒数日/刷题记录。

## 核心功能

- `/chat` 继承现有 Agent Chat 主学习路径，不直接解析 PPT 或图片内容。
- PPT、图片和其他附件在当前主路径中只作为 metadata 展示，包括文件名、大小、类型和选择时间。
- `/practice` 新增刷题生成、答案评价、错题记录和同知识点强化入口。
- `/review` 新增复习计划生成，支持跳转到 `/chat?concept=...` 和 `/practice?concept=...`。
- `/settings` 管理本地数据和主题，不提供任何前端 API Key、Provider、Model 或 API URL 配置入口。
- localStorage 保存任务、倒数日、历史、画像、提问/互动记忆、刷题统计、错题和复习相关本地状态。

## 技术栈

- 前端：React + Vite + Tailwind CSS
- 后端：Node.js + Express
- 流式输出：Server-Sent Events（SSE）
- 本地存储：localStorage
- AI 调用：前端只调用 Express 后端；后端通过本地 `.env` 配置 DeepSeek 或兼容 Chat Completions 的 provider

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

## 环境变量与 API Key 安全

- 真实 API Key 只能放在本地 `server/.env`。
- GitHub 只提交 `.env.example`，不能提交 `.env`、`server/.env` 或 `client/.env`。
- 前端不读取、不展示、不保存 `TEXT_GENERATION_API_KEY`。
- 前端没有 API Key、Provider、Model、API URL 配置入口。
- Express 后端读取本地环境变量并代理 DeepSeek 调用；前端不直接请求 DeepSeek 或任何文本生成 provider。
- 文档、README、代码、测试、截图中都不能写入真实 API Key。

`.env.example` 只保留占位变量，不包含真实值。

## 新增 API

- `POST /api/practice/generate`：按知识点生成常考题，缺 key 或 provider 失败时返回 fallback。
- `POST /api/practice/evaluate`：评价用户答案，答错时建议同知识点强化。
- `POST /api/review/plan`：根据本地画像、历史、刷题统计和错题生成复习计划，失败时 fallback。

## 测试

前端：

```bash
cd client
npm run build
npm run test:acceptance
```

后端：

```bash
cd server
npm run test:acceptance
```

## 当前 MVP 状态

已完成：

- 多页面应用骨架。
- `/chat` Agent Chat 主学习路径。
- `/home`、`/history`、`/profile` 前端视觉重做。
- `/practice` 刷题页和 practice API。
- `/review` 复习计划页和 review API。
- `/settings` 本地设置页。
- 本地数据保存、导出和清理。
- 后端 fallback，保证缺 key/provider 失败时不白屏。

暂不包含：

- 登录注册。
- 教师后台。
- OCR。
- RAG 或向量数据库。
- 云同步。
- 完整 PPT 自动解析或图片结构识别。

## 后续迭代方向

- 手动浏览器验收 `/practice`、`/review`、`/settings` 的视觉和交互。
- 将错题薄弱点更深地接入 `/profile` 画像展示。
- 若后续要公网部署，需要重新设计账号、密钥托管和服务端安全策略。
