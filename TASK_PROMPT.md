你正在修改我本地的 scaffoldmind 项目工作区。当前项目已经有 AgentWorkspace 主路径：中间主导式 AI 学习智能体、附件 metadata、流式输出、交互选项、旧 StudyWorkspace 保留。现在请在此基础上继续添加一组新功能。

请开启目标模式长期执行，但必须严格遵守本 prompt。不要擅自扩展需求，不要重写整个项目，不要引入大型依赖，不要删除旧 StudyWorkspace，不要破坏当前已通过的 build/test。

【最高优先级】

本轮目标是：在 2 小时内高质量实现以下功能，并保证产品可执行、无报错、能正确讲解知识、主布局不被扰乱。

必须实现：

1. 每段 AI 输出后添加交互图标：
   - 复制
   - 点赞 thumbs up
   - 点踩 thumbs down
   - 鼠标 hover 复制图标显示 tooltip：“复制”
   - 鼠标 hover 点赞图标显示 tooltip：“很棒”
   - 鼠标 hover 点踩图标显示 tooltip：“欠佳”
   - 点击复制图标复制该段 AI 输出内容
   - 点击点赞 / 点踩后记录反馈，用于智能体自我优化
   - 图标必须轻量、精致，不要破坏消息区域布局

2. 自我优化和迭代：
   - 通过用户点击“很棒 / 欠佳”
   - 用户输入中的显式评价语言
   - 用户对同一问题反复追问次数
   - 用户常选择的交互选项
   - 用户常问的知识方向
   来构建轻量用户画像，并优化后续回答方式。
   不要做复杂推荐系统，不要做向量数据库，不要做 RAG。
   但功能必须完整闭环：
   用户行为 → 本地/后端记录 → 画像 summary → 下次 prompt 注入 → 回答风格优化。

3. 记忆能力：
   - 记住历史问题
   - 记住上下文消息
   - 记住用户反馈
   - 记住用户画像
   - 用户重新进入网站后，可以看到之前的学习记录 / 对话记录
   - 不需要登录，不需要云同步
   - 优先使用 localStorage + 后端 lightweight JSON storage
   - 当前项目已有 records/profile 相关能力时优先复用，不要重写数据库层

4. 日间模式 / 夜间模式切换：
   - 参考 Magic UI Animated Theme Toggler 的交互感觉
   - 不安装 Magic UI 大依赖
   - 自己实现轻量 AnimatedThemeToggle
   - 图标置于页面右上方
   - 支持 light / dark
   - 使用 document.documentElement.classList 或 data-theme
   - 保存到 localStorage
   - 如果浏览器支持 View Transitions API，则用 document.startViewTransition 做动画
   - 如果不支持，则正常切换，不报错
   - 切换动画可以用 circle reveal 或简洁淡入淡出
   - 不要破坏现有布局

5. 消除前端 AI 配置界面：
   - 前端不再展示 AI Provider / API Key / API URL / Model 配置入口
   - 用户进入网站即可调用 DeepSeek API
   - 但绝对不能把 API Key 写进前端代码
   - 正确做法：后端从 server/.env 读取 DEEPSEEK_API_KEY 或 TEXT_GENERATION_API_KEY
   - 前端只调用本地 Express API
   - 如果后端缺 key，仍然 fallback，不白屏
   - 不读取、不打印、不提交 .env
   - 不修改 .env 内容
   - 可以更新 .env.example，说明需要 DEEPSEEK_API_KEY，但不要写真实 key

6. 页面字体整体放大和阅读体验优化：
   - 正文 AI 回复：1rem，约 16px
   - 用户输入框：1rem，约 16px
   - 标题：1.25rem - 1.5rem
   - 辅助文本：0.8125rem - 0.875rem
   - 代码块：0.875rem
   - 行高：1.55 - 1.65
   - 段落间距：0.9rem - 1.1rem
   - 支持 Markdown 层级：标题、列表、粗体、代码块、引用要清楚
   - 避免纯黑正文，light 下用深灰，dark 下用柔和浅色
   - 不要让字体变大后撑爆布局
   - 输入框、消息区、按钮都要适配

【技术边界】

不要实现：
- OCR
- 完整 PPT 解析
- 图片文字识别
- RAG
- 向量数据库
- 登录注册
- 云同步
- 教师后台
- 多用户权限
- 大型推荐系统
- 大型依赖库

可以实现：
- localStorage 记忆
- server/data JSON 轻量存储
- feedback event log
- learner profile summary
- prompt personalization context
- theme localStorage
- tooltip
- clipboard copy
- basic analytics / repeated-question detection

【开始前必须审查】

先阅读当前本地文件，不要凭记忆修改：

- client/src/App.jsx
- client/src/features/agent-chat/AgentWorkspace.jsx
- client/src/features/agent-chat/ChatShell.jsx
- client/src/features/agent-chat/ChatMessage.jsx
- client/src/features/agent-chat/ChatComposer.jsx
- client/src/features/agent-chat/InteractiveOptions.jsx
- client/src/features/agent-chat/agentChatApi.js
- client/src/styles.css
- client/src/shared/storage/*
- client/src/shared/api/client.js
- server/app.js
- server/routes/agentChat.js
- server/services/aiService.js
- server/services/promptBuilder.js
- server/services/recordStore.js
- server/routes/records.js
- server/routes/profile.js
- server/package.json
- client/package.json

先确认当前状态：
1. git status
2. client build 是否当前通过
3. server acceptance 是否当前通过
4. 新 AgentWorkspace 主路径结构
5. 当前是否存在 AI 配置入口
6. 当前 messages / records / profile 是如何存储的

【推荐实现方案】

一、输出后交互图标

新增或修改：

client/src/features/agent-chat/MessageActions.jsx
client/src/features/agent-chat/ChatMessage.jsx
client/src/features/agent-chat/feedbackStore.js 或 client/src/shared/storage/feedbackStorage.js

实现：
- 每条 assistant message 底部显示 action row
- action row 包含：
  - Copy icon
  - ThumbsUp icon
  - ThumbsDown icon
- hover tooltip：
  - 复制
  - 很棒
  - 欠佳
- 点击 copy：
  - navigator.clipboard.writeText(message.content)
  - 成功后 tooltip 或状态变为“已复制”
  - 如果 Clipboard API 不可用，fallback 到 textarea select copy 或显示错误
- 点击 thumbs up：
  - 保存 feedback event：rating = "positive"
  - UI 显示已选状态
- 点击 thumbs down：
  - 保存 feedback event：rating = "negative"
  - UI 显示已选状态
- 同一条消息允许切换反馈，但最终只保留最后一次 rating
- feedback event 不要包含 API Key，不要包含敏感环境变量

反馈结构建议：

{
  id: "feedback_xxx",
  messageId: "...",
  conversationId: "...",
  rating: "positive" | "negative",
  messageExcerpt: "前 300 字",
  topic: "...",
  mode: "default" | "context_stacking" | "feynman",
  createdAt: "...",
  reason: "",
  source: "message_action"
}

二、自我优化与用户画像

新增或修改：

client/src/features/agent-chat/learnerProfile.js
client/src/shared/storage/learnerMemoryStorage.js
server/services/agentMemoryStore.js
server/routes/agentMemory.js 或复用 /api/profile

轻量实现即可，但必须形成闭环。

前端 localStorage 存：
- conversations
- messages
- feedbackEvents
- repeatedQuestionStats
- selectedOptionStats
- learnerProfile

后端 JSON 存：
server/data/agent-memory.json

如果不想新增 route 太多，可以新增：
- GET /api/agent/memory
- POST /api/agent/memory/event
- POST /api/agent/memory/conversation
- GET /api/agent/memory/profile

但如果 2 小时内风险太高，可以先以前端 localStorage 为主、后端轻量 route 为辅。必须保证 build/test 通过。

用户画像字段建议：

{
  totalMessages: number,
  totalConversations: number,
  positiveFeedbackCount: number,
  negativeFeedbackCount: number,
  preferredModes: [{ mode, count }],
  frequentTopics: [{ label, count }],
  weakConceptHints: [{ label, count }],
  repeatedQuestionPatterns: [{ normalizedQuestion, count }],
  answerStylePreference: {
    wantsConcise: boolean,
    wantsExamples: boolean,
    wantsExamFocus: boolean,
    wantsStepByStep: boolean,
    dislikesTooLong: boolean
  },
  lastUpdatedAt: string
}

行为来源：
1. thumbs up/down
2. 用户文本：
   - “讲太多了 / 太啰嗦 / 简洁一点” → wantsConcise
   - “举例 / 例子 / 代码” → wantsExamples
   - “考试 / 考点 / 易错” → wantsExamFocus
   - “一步步 / 详细 / 从头讲” → wantsStepByStep
3. 反复问相似问题：
   - 对用户 message 做简单 normalize：去标点、转小写、截断
   - 同一 normalizedQuestion count >= 2，记录 repeatedQuestionPatterns
4. 交互选项点击：
   - 记录用户常点哪类选项

   【Memory 实现决策】

本轮记忆能力优先采用前端 localStorage 实现，后端记录作为轻量补充，不强制新增复杂后端 memory 系统。

允许新增轻量后端接口：
- GET /api/agent/memory
- POST /api/agent/memory/event
- POST /api/agent/memory/conversation
- GET /api/agent/memory/profile

但必须满足以下条件：
1. 如果新增后端 memory API，必须是轻量 JSON storage，存储在 server/data/agent-memory.json。
2. 不允许引入数据库、Redis、向量数据库、RAG、云同步或登录系统。
3. 如果 2 小时内实现后端 memory API 风险较高，则优先完成 localStorage 闭环，后端 memory 只保留可扩展接口或暂不实现。
4. 记忆功能的最低完成标准是：页面刷新后能从 localStorage 恢复最近对话、反馈记录、用户画像和学习记录。
5. 后端 memory 是增强项，不得影响主路径可运行、无报错、流式输出和前端体验。
6. 不允许因为后端 memory 未完成而破坏已有 records/profile API。

三、把用户画像注入 Prompt

修改：

server/routes/agentChat.js
server/services/promptBuilder.js

请求 /api/agent/chat/stream 时，前端带上 memoryContext 或 learnerProfile summary。

payload 可以增加：

{
  learnerProfile: {
    answerStylePreference: {...},
    frequentTopics: [...],
    repeatedQuestionPatterns: [...],
    recentFeedbackSummary: "用户倾向简洁、喜欢考试导向..."
  }
}

后端 buildAgentChatPrompt(input) 必须加入一段：

【用户学习画像】
- 用户偏好：...
- 最近薄弱点：...
- 反馈倾向：...
- 回答优化要求：...

注意：
- 画像只能影响回答方式，不能编造用户没提供的事实。
- 如果画像为空，不要输出画像痕迹。
- 不要在回答里说“根据你的画像”，除非用户问。
- 对负反馈的优化原则：
  - 如果用户常点“欠佳”，回答更具体、更结构化、更少空话。
  - 如果用户常要求简洁，减少篇幅。
  - 如果用户常问考试，增加考点/易错提示。
  - 如果用户反复问同一概念，优先用类比、例题和分步解释。

四、记忆能力

前端必须实现：
- 保存 conversations 到 localStorage
- 页面重新进入时加载最近 conversations
- 左侧或右侧显示“最近学习记录 / 最近对话”
- 点击历史记录可以恢复 conversation
- 保持当前中间主布局，不要扰乱大格局

建议新增：
client/src/features/agent-chat/ConversationHistory.jsx

功能：
- 显示最近 10 条 conversation
- 每条显示标题、模式、时间
- 点击恢复 messages
- 提供清空按钮，清空前 window.confirm
- 标题生成：
  - 优先第一条用户消息前 24 字
  - 或 AI 总结标题
- 每轮消息结束后自动保存

localStorage key 建议：
- scaffoldmind.agent.conversations
- scaffoldmind.agent.feedback
- scaffoldmind.agent.profile
- scaffoldmind.agent.theme

五、主题切换

新增：

client/src/features/agent-chat/AnimatedThemeToggle.jsx
或 client/src/shared/components/AnimatedThemeToggle.jsx

要求：
- 图标在右上方
- light/dark 两种
- localStorage 保存
- 初始化时：
  - 优先读取 localStorage
  - 没有则读取 prefers-color-scheme
- 切换时：
  - 如果 document.startViewTransition 存在，使用它
  - 否则直接切换 class
- html 或 body 加 .dark / .light / data-theme
- CSS 用变量：
  --bg
  --panel
  --panel-soft
  --text
  --muted
  --border
  --accent
  --assistant-bg
  --user-bg
- 不要使用纯黑纯白刺眼配色
- 不要引入 magicui 依赖
- 不要破坏 Tailwind 现有样式

六、删除前端 AI 配置界面

当前前端如果还有 SettingsModal / AI 配置按钮 / provider 输入框：
- 从新 AgentWorkspace 主路径隐藏或移除入口
- 不删除旧 StudyWorkspace 里的 SettingsModal 文件
- 新主路径不允许出现 API Key 输入框
- 新主路径不允许要求用户配置 provider
- agentChatApi 只调用后端 /api/agent/chat/stream
- payload 不再从前端传 apiKey
- 如果当前代码仍会读取 localStorage aiConfig，请从新主路径移除
- 后端继续从 env 读取 DeepSeek API Key
- .env.example 可更新：
  DEEPSEEK_API_KEY=
  AI_PROVIDER=deepseek
  DEEPSEEK_MODEL=deepseek-v4-flash
  DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
- 不写真实 key

【旧 AI 配置保留策略】

新主路径 AgentWorkspace 必须移除 AI 配置入口，不能出现 API Key 输入框、Provider 选择、API URL 输入框或 Model 输入框。

但旧 StudyWorkspace 中已有的 SettingsModal、AI 配置组件、aiConfigStorage、旧 AI 配置逻辑可以保持原样，不需要删除。

要求：
1. 旧 StudyWorkspace / SettingsModal / aiConfigStorage 保留，避免破坏旧代码和旧测试。
2. App.jsx 当前主入口应挂载 AgentWorkspace，因此旧 AI 配置不会作为主路径暴露。
3. 新 AgentWorkspace 不允许导入或展示 SettingsModal。
4. 新 AgentWorkspace 不允许从前端读取、保存或发送 apiKey。
5. 新 AgentWorkspace 只调用后端 /api/agent/chat/stream。
6. 后端从 server/.env 或环境变量读取 DeepSeek API Key。
7. 不读取、不打印、不修改 .env。
8. 不写死、不提交任何真实 API Key。

七、字号和 Markdown 阅读体验

修改 client/src/styles.css 和相关组件 className。

要求：
- html { font-size: 16px; }
- AI 正文：text-base / 1rem，line-height 1.6
- 用户输入框：1rem，line-height 1.5
- H1/H2：1.25rem - 1.5rem
- 辅助文本：0.8125rem - 0.875rem
- 代码块：0.875rem
- 段落间距：0.9rem - 1.1rem
- 列表有缩进和间距
- strong 加粗明显
- code/pre 有背景块
- light/dark 下对比度都舒适
- 不要让按钮、chip、侧栏因为字号变大而挤爆
- 窄屏输入框字体不低于 16px，避免移动端自动缩放

八、测试与验收

必须更新或新增测试，不允许删除旧测试逃避失败。

前端测试建议：
client/scripts/verifyAgentChatClient.mjs 增加检查：
- MessageActions 存在
- copy/positive/negative feedback storage helper 存在
- AnimatedThemeToggle 存在
- ConversationHistory 存在
- 新 AgentWorkspace 不出现 AI Key 配置入口
- 新 AgentWorkspace 不调用 parsePpt/requestPptParsing
- 交互选项仍存在
- memory/profile helper 存在

后端测试建议：
server/scripts/verifyAgentChat.mjs 增加检查：
- /api/agent/chat/stream fallback 仍输出固定结构
- payload 可接受 learnerProfile
- promptBuilder 包含用户画像注入逻辑
- 不要求前端传 apiKey

必要命令：
cd server && npm run test:acceptance
cd client && npm run build
cd client && npm run test:acceptance

如果测试失败：
- 先修复
- 不要继续下一阶段
- 不要删除测试
- 不要绕过 build

【执行阶段】

请按以下阶段执行，可以连续长期跑，但每阶段必须汇报修改文件、核心改动、自检命令、自检结果。如果某阶段失败，停止并修复，不要跳过。

阶段 0：审查
- 阅读相关文件
- 输出当前风险点
- 确认是否存在 AI 配置入口
- 确认当前 memory/record 结构
- 不改代码

阶段 1：消息操作图标
- 实现 MessageActions
- 集成到 ChatMessage
- 实现复制、点赞、点踩
- 实现 tooltip
- 实现 feedback localStorage helper
- 自检 client build

阶段 2：记忆与用户画像
- 实现 conversation 保存 / 恢复
- 实现 feedbackEvents
- 实现 learnerProfile 轻量构建
- 实现 repeated question stats
- 实现 selected option stats
- 新增 ConversationHistory
- 自检 client build

阶段 3：Prompt 自我优化闭环
- 前端请求带 learnerProfile summary
- 后端 agentChat 接收 learnerProfile
- promptBuilder 注入用户画像
- fallback 也遵守更优结构
- 自检 server acceptance + client build

阶段 4：主题切换
- 实现 AnimatedThemeToggle
- 右上角放置
- localStorage 保存 theme
- View Transitions API 可用则动画切换，不可用则普通切换
- light/dark CSS variables
- 自检 client build

阶段 5：隐藏前端 AI 配置
- 新主路径移除 AI 配置入口
- 前端不传 apiKey
- 后端从 env 读取 DeepSeek
- .env.example 只保留空占位
- 缺 key fallback
- 自检 server acceptance + client build

阶段 6：字号和阅读体验
- 全局字号放大
- Markdown 样式增强
- 行高、段落、代码块、列表优化
- light/dark 对比度优化
- 自检 client build

阶段 7：测试补充与最终验收
- 更新 client/server acceptance
- 运行：
  cd server && npm run test:acceptance
  cd client && npm run build
  cd client && npm run test:acceptance
- 搜索确认：
  新主路径没有 /api/parse-ppt
  新主路径没有 requestPptParsing
  新主路径没有 API Key 输入框
  没有真实 key
  没有读取/打印 .env

阶段 8：文档更新
- 更新 README、docs/API.md、docs/TASKS.md、docs/TEST_PLAN.md、CHANGELOG.md、memory/MEMORY.md
- 不修改 docs/PRD.md，除非现有项目规范明确要求
- 输出 git status --short

【最终验收标准】

1. 每条 AI 回复下方有复制、点赞、点踩图标。
2. hover 文案分别是：复制、很棒、欠佳。
3. 复制功能可用。
4. 点赞/点踩会记录反馈，并有 UI 选中状态。
5. 用户画像能根据反馈、输入评价、重复提问、选项点击更新。
6. 后续回答 prompt 能接收用户画像并优化回答方式。
7. 页面刷新后能看到之前学习记录 / 对话记录。
8. 可以恢复历史 conversation。
9. 右上角有日间/夜间切换按钮。
10. theme 会持久化。
11. 新主路径没有 AI 配置界面。
12. 前端不出现 API Key 输入框。
13. 后端从 env 调用 DeepSeek，缺 key fallback。
14. 字体明显比之前更舒适，AI 正文约 16px，输入框约 16px。
15. Markdown 层级清晰。
16. 现有中间主布局不被扰乱。
17. PPT/图片仍只作为附件 metadata，不解析。
18. 不出现 XML 噪声。
19. client build 通过。
20. client acceptance 通过。
21. server acceptance 通过。
22. 项目可执行、无报错、能正确讲解知识。

