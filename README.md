# ScaffoldMind 明序

ScaffoldMind 明序是一个面向 CSAPP 和数据结构学习的 AI 学习智能体。当前主入口已经切换为中间主导式 Agent Chat：用户在中间输入材料或问题，系统以流式方式输出总结、框架、核心概念和可继续选择的学习路径。

旧版 `StudyWorkspace`、结构化学习闭环、旧 `/api/analyze` 和轻量 `/api/parse-ppt` 仍保留在代码中，但不再作为页面主入口。

## 核心功能

- 中间主导式聊天界面，类似 ChatGPT / Gemini / NotebookLM 的主输入输出体验。
- 三种 Agent Chat 模式：默认知识解析、Context Stacking 超前学习、费曼反讲。
- 首次知识回答固定包含 `## 总结`、`## 框架`、`## 5 个核心概念`、`## 你可以继续选择`。
- 支持点击回答下方的交互选项，继续下一轮学习。
- 中间输入框旁提供加号按钮，可添加附件 chip。
- 附件只保存 metadata：`name`、`size`、`type`、`selectedAt`。
- PPTX 和图片当前版本只作为附件标记，不解析内容，不调用 OCR，不渲染幻灯片。
- 后端提供 `/api/agent/chat/stream` SSE 流式接口。
- 无 API Key、provider 失败或后端异常时，页面显示友好 fallback，不白屏。

## 技术栈

- 前端：React + Vite + Tailwind CSS
- 后端：Node.js + Express
- 流式输出：Server-Sent Events（SSE）
- 本地配置：localStorage
- AI 调用：Express 后端代理 OpenAI-compatible provider

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

## AI 配置和安全

当前课程项目仍支持在页面左侧 AI 配置区填写 provider、model、API URL 和 API Key，并保存到本机浏览器 localStorage。浏览器不会直接请求 AI provider，真实调用由 Express 后端代理。

安全约束：

- 不要把真实 API Key 写进代码、README、文档、截图或提交到 Git。
- 不要读取、打印或提交 `.env`、`server/.env`、`client/.env`。
- `.gitignore` 必须忽略 `.env`、`server/.env`、`client/.env`。
- `server/.env` 仅作为本地备用配置；缺 key 时系统会使用 fallback。
- 浏览器保存 key 只适合本机单用户课程项目，不适合公网多人平台。

## 演示路径

1. 启动前端和后端。
2. 打开页面，确认主视觉是中间聊天区。
3. 在左侧选择学科和模式。
4. 在中间底部输入 CSAPP 或数据结构材料。
5. 可点击加号添加 PPTX 或图片，页面只显示附件 chip。
6. 发送后观察流式输出。
7. 确认回答包含总结、框架、5 个核心概念和可继续选择。
8. 点击一个交互选项，继续下一轮回答。
9. 切换默认知识解析、Context Stacking、费曼反讲，确认输出侧重点不同。
10. 停止后端或不配置 key 时，确认页面显示友好 fallback，不白屏。

## 当前 MVP 状态

已完成：

- React + Vite + Tailwind 前端。
- Express 后端。
- 新主路径 `AgentWorkspace`。
- Agent Chat SSE 接口 `/api/agent/chat/stream`。
- 附件 metadata chip。
- 流式回答、错误兜底和交互选项。
- 旧 `StudyWorkspace`、旧结构化学习 API 和旧 PPTX 轻量解析 API 保留。
- client/server acceptance 测试覆盖 Agent Chat 主路径。

暂不包含：

- 登录注册。
- 教师后台。
- OCR。
- 完整 PPT 自动解析。
- 旧版 `.ppt` parser。
- RAG 或向量数据库。
- 云同步。

## 测试

客户端：

```bash
cd client
npm run build
npm run test:acceptance
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

- 手动浏览器验收 80%、100%、125%、150% 缩放下的布局表现。
- 准备课程展示脚本和截图。
- 如果后续要公网部署，需要重新设计密钥托管和账号级安全存储。
- OCR、完整 PPT 视觉解析、RAG、向量检索和云同步必须作为单独阶段评估。
