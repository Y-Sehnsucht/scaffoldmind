# ScaffoldMind 明序

ScaffoldMind 明序是一个面向 CSAPP 和数据结构学习的 AI 学习助手。它的目标不是做一个简单问答壳，而是帮助学习者搭建“认知脚手架”：从材料输入开始，经过结构化解析、主动追问、用户尝试、错误诊断、强化练习和 Obsidian 输出，形成可回顾的学习闭环。

## 核心功能

- 单页面三栏学习工作台：左侧输入，中间学习闭环，右侧提问记录。
- 支持 CSAPP 和数据结构两个学科方向。
- 保留五种学习模式：
  - Context Stacking 超前学习
  - 课后深度复习
  - 出题人视角
  - 费曼反讲
  - 多维信息对撞
- 学习方法便签：框架优先、追问为什么、考试考点、工程应用等。
- PPT 页码输入和“查看原页”侧拉面板。
- 右侧提问记录快速浏览回顾侧边栏。
- 用户尝试回答后的错误诊断和强化题。
- Obsidian Markdown 输出，包含 wikilink 和 callout。
- localStorage 保存提问记录和学习记录。

## 技术栈

- 前端：React + Vite + Tailwind CSS
- 后端：Node.js + Express
- MVP 存储：浏览器 localStorage
- AI 调用：只能通过 Express 后端，前端不接触 API Key

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

## 环境变量说明

真实 API Key 只能放在本地 `server/.env`，不要提交到 Git。

`.env.example` 只保留空占位：

```text
TEXT_GENERATION_API_KEY=
PORT=3001
```

后端会显式读取 `server/.env`。从项目根目录或 `server/` 目录启动都应指向同一个后端环境文件。

## 三种数据源

页面顶部可以切换数据源：

- 本地 Mock：默认选项，完全在前端用 mock 数据跑通学习闭环。
- 后端 Mock：调用 Express mock API，验证前后端接口边界。
- 真实 API：通过 Express 后端调用真实文本生成 API。

默认始终是“本地 Mock”，保证演示稳定。只有手动选择“真实 API”时才会尝试真实 provider 调用。

## API Key 安全说明

- 不要把真实 API Key 写进代码。
- 不要把真实 API Key 写进 README、docs、测试或截图。
- 不要让前端读取 `TEXT_GENERATION_API_KEY`。
- 不要提交 `.env`、`server/.env` 或 `client/.env`。
- 如果真实 API 调用失败，后端会返回结构化 fallback，不让前端崩溃。

## AI 输出语言规范

所有本地 Mock、后端 Mock 和真实 API prompt 都应使用中文输出。

专业词汇第一次出现时使用“中文 + 英文括注”，例如：

- 缓存未命中（cache miss）
- 缓存行（cache line）
- 局部性（locality）
- 栈帧（stack frame）
- 指针（pointer）
- 时间复杂度（time complexity）

输出必须结构化，避免大段堆砌文字，适合前端卡片展示。

## 当前 MVP 状态

已完成：

- React + Vite + Tailwind 前端骨架
- Node.js Express 后端骨架
- 三栏 UI 学习工作台
- 五种学习模式
- 本地 Mock 学习闭环
- 后端 Mock API
- 真实 API 可选路径和 fallback
- localStorage 提问记录和学习记录
- PPT 原页侧拉面板
- Obsidian Markdown 输出
- 轻量 mock 测试脚本

未实现且不属于当前 MVP：

- 登录注册
- 教师后台
- OCR
- 完整 PPT 自动解析
- 向量数据库
- 云同步

## 演示路径

1. 启动前端和后端。
2. 打开 ScaffoldMind 明序首页。
3. 选择学科，例如 CSAPP。
4. 选择“课后深度复习”。
5. 保持“本地 Mock”，输入 PPT 页码和材料。
6. 点击生成解析。
7. 查看结构化概念、主动追问、尝试题和 Obsidian 输出。
8. 点击“查看第 X 页原始内容”打开 PPT 原页侧拉面板。
9. 点击一个主动追问，确认右侧提问记录新增问题。
10. 输入用户回答并提交诊断，查看错误类型、修改建议和强化题。
11. 保存学习记录，刷新后确认记录仍在。
12. 可切换到“后端 Mock”验证 Express API。
13. 可在本地配置 key 后手动切换到“真实 API”验证真实 provider。

## 测试命令

```bash
cd client
npm run test:mock
npm run build
```

```bash
cd server
npm run test:mock
npm run test:real
```

`npm run test:real` 不会打印真实 API Key，也不会打印完整模型回答，只输出 provider 状态、fallback 原因、HTTP status 和结构字段。

## 后续迭代方向

- 加强真实 API 输出的 schema 校验。
- 记录真实 API 成功/失败的手动验收结果。
- 改进 PPT 原页预览体验。
- 增加更多 CSAPP 和数据结构主题样例。
- 后续版本再考虑 OCR、RAG、长期学习画像等能力。
