# ScaffoldMind 明序

ScaffoldMind 明序是一个面向 CSAPP 和数据结构学习的 AI 学习助手。当前版本采用 React + Vite + Tailwind CSS 前端和 Node.js + Express 后端，主学习路径是 `/chat`：用户在中间对话区输入问题或学习材料，后端通过流式接口返回结构化学习回答，前端用 localStorage 保存本地学习记忆。

## 页面结构

- `/landing`：产品入口页。
- `/home`：学习首页，展示任务、倒数日、学习日历和最近学习状态。
- `/chat`：现有 AI 学习主路径，保留流式输出、模式选择、交互选项、附件 metadata chip、复制、点赞、点踩、对话恢复和用户画像更新。
- `/history`：本地历史与反馈记录浏览。
- `/profile`：本地学习画像、薄弱概念和知识图谱视图。
- `/practice`：刷题页，支持刷题生成、答案评价、错题同知识点强化。
- `/review`：复习页，支持根据本地画像、历史、刷题统计和错题生成复习计划。
- `/settings`：本地设置页，支持本地数据导出、清空、主题切换。

## 核心范围

- `/chat` 继承现有 Agent Chat 学习主路径，不把 API Key 暴露给前端。
- PPT、图片和其他附件在当前主路径中只作为 metadata 展示，不解析 PPT 内容，不做 OCR，不做图片结构识别。
- `/practice` 调用后端 practice API 生成题目、评价答案，并在答错时提供同知识点强化入口。
- `/review` 调用后端 review API 生成复习计划，并可跳转到 `/chat?concept=...` 或 `/practice?concept=...`。
- `/settings` 管理 localStorage 中的本地学习数据，不提供任何前端 API Key 配置入口。

## 技术栈

- 前端：React、Vite、Tailwind CSS
- 后端：Node.js、Express
- 流式输出：Server-Sent Events（SSE）
- 本地存储：localStorage
- AI Provider：后端通过 `server/.env` 使用 DeepSeek 或兼容 Chat Completions 的服务

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

- 真实 API Key 只允许放在本地 `server/.env`。
- GitHub 只提交 `.env.example`，不提交 `.env`、`server/.env` 或 `client/.env`。
- 前端不读取、不展示、不保存 `TEXT_GENERATION_API_KEY`。
- 前端没有 API Key、Provider、Model 或 API URL 配置入口。
- 前端只调用 Express 后端；DeepSeek 调用由后端代理完成。
- README、文档、代码和测试都不得写入真实 API Key。

`.env.example` 只保留占位变量，不包含真实值。

## API 速览

- `GET /api/health`
- `POST /api/agent/chat/stream`
- `POST /api/practice/generate`
- `POST /api/practice/evaluate`
- `POST /api/review/plan`

旧结构化学习接口仍保留在代码中用于兼容或后续迭代，包括 `/api/analyze`、`/api/deep-dive`、`/api/diagnose`、`/api/obsidian`、`/api/collision`、`/api/parse-ppt`。当前 `/chat` 主路径不调用 `/api/parse-ppt`。

## localStorage 保存内容

当前前端会在 localStorage 保存：

- 首页任务
- 倒数日
- 学习日历事件
- 对话历史
- 反馈与交互记忆
- 用户画像
- 刷题统计
- 错题记录
- 主题设置

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

- 多页面应用结构：`/landing`、`/home`、`/chat`、`/history`、`/profile`、`/practice`、`/review`、`/settings`
- `/chat` Agent Chat 主学习路径
- `/home`、`/history`、`/profile` 前端视觉重做
- `/practice` 刷题生成、答案评价、错题同知识点强化
- `/review` 复习计划生成
- `/settings` 本地数据管理、导出、清空、主题切换
- 后端 practice/review API 与 fallback
- localStorage 本地学习记忆

暂不包含：

- 登录注册
- 教师后台
- OCR
- RAG 或向量数据库
- 云同步
- 当前主路径中的 PPT/图片内容解析

## 后续迭代方向

- 手动验收 `/practice`、`/review`、`/settings` 在不同窗口宽度下的细节体验。
- 将错题和薄弱点更深入地接入 `/profile` 学习画像。
- 如果后续要实现 PPT/图片解析，需要单独开阶段重新确认范围、安全边界和测试策略。
