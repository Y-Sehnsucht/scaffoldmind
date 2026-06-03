# ScaffoldMind 明序 Test Plan

## 1. 范围与安全检查

- `docs/PRD.md` 未被修改。
- 不读取、打印、修改 `.env` 或 `server/.env`。
- 仓库中不写入真实 API Key。
- 前端无 API Key、Provider、Model、API URL 配置入口。
- 前端只调用 Express 后端。
- 后端通过本地 `.env` 使用 DeepSeek 或兼容 provider。
- `/chat` 主路径中的 PPT/图片只展示附件 metadata，不解析。
- 不实现 OCR、RAG、向量数据库、登录、云同步。

## 2. 多页面手动验收

- `/landing`：产品入口可打开。
- `/home`：任务、倒数日、日历、最近学习可见。
- `/chat`：现有 AI 学习主路径可用，保留流式输出、交互选项、附件 metadata chip、模式选择、复制/点赞/点踩、对话历史恢复。
- `/history`：本地历史和反馈记录可浏览。
- `/profile`：学习画像、薄弱概念和知识图谱可见。
- `/practice`：刷题生成、答案评价、错题同知识点强化可用。
- `/review`：复习计划生成、复习项跳转、强化练习跳转可用。
- `/settings`：主题切换、导出本地数据、清空本地历史、清空任务/倒数日/刷题记录可用。

## 3. /practice 验收

- 输入 concept 后可生成常考题。
- 页面显示刷题数量、刷题时长、正确率。
- 提交答案后显示评价。
- 答错时显示“再来一道同知识点题目”。
- 刷题统计写入 localStorage。
- 错题写入 localStorage。
- 后端关闭、缺 key 或 provider 失败时使用 fallback，不白屏。

## 4. /review 验收

- 页面根据 learnerProfile、history、practiceStats、mistakes 生成复习计划。
- 展示待复习概念。
- 展示推荐复习顺序。
- 展示强化练习入口。
- 点击复习项跳转 `/chat?concept=xxx`。
- 点击强化练习跳转 `/practice?concept=xxx`。
- 后端关闭、缺 key 或 provider 失败时 fallback，不白屏。

## 5. /settings 验收

- 可切换日间/夜间主题。
- 可导出本地学习数据 JSON。
- 清空本地历史前有 confirm。
- 清空任务 / 倒数日 / 刷题记录前有 confirm。
- 明确显示“AI 服务由后端环境变量配置”。
- 页面不出现 API Key、Provider、Model、API URL 输入框。

## 6. API 验收

后端：

- `GET /api/health` 返回 `ok: true`。
- `POST /api/agent/chat/stream` 可流式返回或 fallback。
- `POST /api/practice/generate` 返回题目结构。
- `POST /api/practice/evaluate` 返回评价结构。
- `POST /api/review/plan` 返回复习计划结构。
- 缺必要字段时返回 HTTP 400 和 `VALIDATION_ERROR`。
- API 响应统一为 `{ ok, data, error }`。

## 7. 自动化命令

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

当前 `server` acceptance 覆盖 practice/review 新 API，`client` acceptance 覆盖现有学习主路径和 API client。

## 8. 交付前检查

- 运行 `git status --short`。
- 确认没有意外修改 `docs/PRD.md`。
- 确认没有新增 `.env` 提交项。
- 确认没有新增大型依赖。
- 确认没有修改 `/landing`、`/home`、`/chat`、`/history`、`/profile` 的 UI。
