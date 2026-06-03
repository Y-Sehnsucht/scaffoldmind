# ScaffoldMind 明序 Tasks

## 当前阶段

手动验收已通过阶段 C：新增 `/practice`、`/review`、`/settings` 前端页面和轻量后端 API。当前只进行文档同步，不再修改功能代码。

## 已完成

- [x] 工程上下文文档初始化。
- [x] React + Vite + Tailwind 前端骨架。
- [x] Node.js Express 后端骨架。
- [x] `/landing` 产品入口。
- [x] `/home` 学习仪表盘。
- [x] `/chat` 现有 AI 学习主路径，保留 Agent Chat、SSE 流式输出、交互选项、附件 metadata chip、对话历史恢复和 localStorage 记忆。
- [x] `/history` 学习历史浏览。
- [x] `/profile` 学习画像。
- [x] `/practice` 刷题页。
- [x] `/review` 复习计划页。
- [x] `/settings` 本地设置页。
- [x] 后端 practice/review 轻量 API。
- [x] `localStorage` 保存任务、倒数日、历史、画像、刷题统计和错题。
- [x] 前端移除 API Key、Provider、Model、API URL 配置入口。

## 阶段 C 完成项

### /practice

- [x] 根据用户选择的 concept、画像和最近错题生成常考题。
- [x] 显示刷题数量、刷题时长、正确率。
- [x] 用户提交答案后返回 AI/fallback 评价。
- [x] 答错后显示“再来一道同知识点题目”。
- [x] 刷题统计写入 localStorage。
- [x] 错题写入 localStorage，可作为用户画像薄弱点来源。

### /review

- [x] 根据 learnerProfile、history、practiceStats、mistakes 生成复习计划。
- [x] 展示待复习概念。
- [x] 展示推荐复习顺序。
- [x] 展示强化练习入口。
- [x] 复习项跳转 `/chat?concept=xxx`。
- [x] 强化练习跳转 `/practice?concept=xxx`。
- [x] 缺 key/provider 失败时 fallback，不白屏。

### /settings

- [x] 主题切换。
- [x] 导出本地学习数据 JSON。
- [x] 清空本地历史，需要 confirm。
- [x] 清空任务 / 倒数日 / 刷题记录，需要 confirm。
- [x] 显示“AI 服务由后端环境变量配置”。
- [x] 不出现 API Key、Provider、Model、API URL 输入框。

## 新增 API

- [x] `POST /api/practice/generate`
- [x] `POST /api/practice/evaluate`
- [x] `POST /api/review/plan`

## 下一步建议

1. 手动浏览器验收 `/practice`、`/review`、`/settings` 在不同窗口宽度下的视觉和交互。
2. 检查错题薄弱点是否需要在 `/profile` 中更明显地展示。
3. 准备阶段 D 前先确认是否继续保持“PPT/图片只作为附件 metadata，不解析”的范围。

## 范围守卫

- 不修改 `docs/PRD.md`。
- 不读取、打印、修改 `.env` 或 `server/.env`。
- 不写入真实 API Key。
- 不新增前端 API Key 配置入口。
- 不实现登录、教师后台、OCR、完整 PPT 解析、RAG、向量数据库或云同步。
- 当前 `/chat` 主路径不调用 `/api/parse-ppt` 或 `requestPptParsing`。
