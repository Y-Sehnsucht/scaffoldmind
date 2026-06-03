# ScaffoldMind 明序：核心产品质量修复任务

你正在修改我本地的 scaffoldmind 项目工作区。

当前项目已经是一个多页面 AI 学习系统，包含：

- /landing
- /home
- /chat
- /history
- /profile
- /practice
- /review
- /settings

当前项目已有能力：

- /api/agent/chat/stream
- 中间主导式 AI 问答页
- 流式输出
- 附件 metadata chip
- PPT / 图片只展示 metadata，不解析
- 复制 / 点赞 / 点踩反馈
- localStorage 记忆
- 用户画像
- 日夜主题切换
- Context Stacking 超前学习模式
- 费曼反讲模式
- 多页面路由
- /practice 刷题页
- /review 复习计划页
- /settings 本地设置页

本轮任务不是新增页面，而是修复当前产品的核心质量问题，使它从“能跑的 demo”变成“成熟可用的 AI 学习产品”。

请严格按照本文档执行。不要擅自扩展需求，不要降低输出质量，不要做最小化 demo，不要用“简单 mock”糊弄核心体验。

---

## 一、本轮必须解决的核心问题

### 1. 智能体回答质量问题

当前智能体回答过于机械，所有问题都被硬塞进固定结构：

- 总结
- 框架
- 5 个核心概念
- 你可以继续选择

这导致复杂问题没有被完整回答，内容单薄，形式固化。

典型错误示例：

用户问：

“哈希表学习的框架是怎样的？其中 5 个核心概念是什么？他们和上周学的东西有什么关系；如果我要将这门课交给一个完全没基础的人，我需要真正的搞懂哪些东西？”

当前智能体只机械输出：

- 总结
- 框架
- 5 个核心概念
- 你可以继续选择

这是错误的。

正确回答必须根据用户问题动态组织，并完整覆盖用户的所有子问题：

1. 哈希表学习框架是什么；
2. 5 个核心概念是什么；
3. 和上周学过的内容有什么关系；
4. 如果要教给零基础的人，真正必须懂什么。

回答不能只给空泛定义，必须有学习深度、结构关系、例子、旧知识连接、教学抓手。

---

### 2. 模式逻辑问题

默认知识解析、Context Stacking、费曼反讲三种模式必须有明显不同的回答策略。

#### 默认知识解析模式

默认模式不是固定模板模式。

它应该根据用户真实问题动态组织回答结构：

- 如果用户问学习框架，就回答学习框架；
- 如果用户问多个子问题，就逐一回答每个子问题；
- 如果用户问和旧知识的关系，就显式连接旧知识；
- 如果用户问如何教给零基础的人，就讲清教学抓手和底层逻辑；
- 如果用户问考试，就讲考点、易错点、题型；
- 如果用户问代码，就讲思想、数据结构、流程、边界情况、代码。

允许有总结，但不能机械固定为“总结 / 框架 / 5 个核心概念 / 你可以继续选择”。

#### Context Stacking 超前学习模式

Context Stacking 的定位是 AI 主动搭建预习脚手架。

它必须主动生成：

- 预习路线；
- 前置知识连接；
- 课堂验证清单；
- 老师可能怎么考；
- 学习风险点。

它不应该反问用户，不应该要求用户先回答，不应该进入费曼式作答评价流程。

错误行为示例：

- “你先说说你掌握到什么程度”
- “你认为它和前面哪一章有关”
- “请你先列出你想验证的问题”

这些在 Context Stacking 中都不应该默认出现。

#### 费曼反讲模式

费曼反讲不是 AI 讲义模式。

费曼模式下不应该输出默认知识解析中的固定结构：

- 总结
- 框架
- 5 个核心概念
- 你可以继续选择

费曼模式的核心流程应该是：

用户先表达 / 反讲 / 作答
→ AI 评价
→ AI 找出准确点
→ AI 找出思维漏洞
→ AI 指出概念混淆
→ AI 给出改写建议
→ AI 提出下一步追问
→ 结果写入用户画像

如果用户只输入一个主题，AI 应先引导用户用自己的话解释，而不是直接长篇讲解。

---

### 3. 交互选项重复问题

当前有时会出现“你可以继续选择”中的选项重复一遍。

这说明可能存在：

- 后端模型已经输出选项；
- 前端又拼接 fallback options；
- 或前端解析 Markdown 时重复渲染。

必须修复。

任何情况下，同一组交互选项不得重复出现。

---

### 4. 日间模式颜色问题

当前很多地方写死了白色文字，例如：

- text-white
- text-neutral-100
- bg-black

导致夜间模式可见，但日间模式下看不清，尤其是侧边栏。

必须修复：

- 除 /landing 外，应用内部页面不要大量写死 text-white；
- 使用 CSS variables 管理 light / dark 颜色；
- 侧边栏、导航、卡片、按钮、正文、辅助文字在日间和夜间都必须清晰可见；
- 日间模式不能是单调灰白，要更有设计感、更丰富；
- 夜间模式保持高级、克制、低噪；
- /landing 可以保持强黑色视频视觉，不受应用页主题约束污染。

---

### 5. 日历交互问题

当前点击日期后，如果使用弹窗添加事件，不符合需求。

正确行为：

点击日期
→ 下方“选中日期事件”区域显示该日期事件
→ 在该区域提供添加、编辑、删除功能

要求：

- 不使用弹窗作为主要事件编辑方式；
- 有事件的日期要变色并带底色圆圈或小点；
- 今天、本日事件、选中日期三种状态必须互相独立；
- 修改其他日期事件时，今天的状态不能变化；
- 同一天可以有多个事件；
- 刷新后事件保留；
- 日期状态在 light / dark 下都可见。

---

### 6. 应用页面宽度问题

除 /landing 外，应用页面应该尽量占满整个页面，像 /chat 修复后的宽阔布局一样。

当前一些页面可能仍然像窄卡片、居中容器或后台模板。

要求：

- /home /history /profile /practice /review /settings 都要更舒展；
- 不要把整页包进窄的 max-width 容器；
- 页面外边距保持 24px-32px；
- 内部文字块可以有阅读宽度控制，但页面整体布局不能窄；
- 缩放 80%、100%、125%、150% 时保持相对位置和比例；
- AppShell 不得挤压主内容；
- /chat 不能再次变窄。

---

### 7. Chat 新会话逻辑问题

Chat 页面需要像 ChatGPT / Gemini 那样组织会话。

正确行为：

1. 用户从导航栏点击进入 /chat：
   - 默认开启一个新的空对话；
   - 不自动恢复上一次对话。

2. 用户从 /history 点击某次历史：
   - 跳转到 /chat?conversationId=xxx；
   - 恢复对应历史对话；
   - 自动滚动到底部。

3. 用户在当前对话中输入新问题：
   - 当前对话继续；
   - 发送后自动滚动到底部；
   - streaming 输出时，如果用户没有主动上滑，应持续跟随到底部。

4. 用户从 /review 或 /practice 跳转到 /chat?concept=xxx：
   - 创建新对话；
   - 可以把 concept 放进输入草稿或系统提示；
   - 不恢复旧对话。

5. /chat 左侧栏应该显示：
   - 当前对话内的历史提问索引；
   - 点击某个问题可滚动到该问题位置。

6. 全站历史记录仍然放在 /history。
   - /chat 左侧不是全站历史；
   - /chat 左侧是当前 conversation 内的问题索引。

---

## 二、必须保留的现有能力

不得破坏：

1. /api/agent/chat/stream；
2. /chat 流式输出；
3. 文本输入；
4. 加号附件按钮；
5. 附件 metadata chip；
6. PPT / 图片只展示 metadata，不解析；
7. 模式选择；
8. Context Stacking 模式；
9. 费曼反讲模式；
10. 交互选项；
11. 复制 / 点赞 / 点踩；
12. localStorage 记忆；
13. 用户画像；
14. 对话历史恢复；
15. 日夜主题切换；
16. /landing /home /history /profile /practice /review /settings 已有页面；
17. 前端不显示 API Key 配置入口；
18. 后端通过 .env 或环境变量调用 DeepSeek；
19. 缺 key 或 provider 失败时 fallback，不白屏；
20. 旧 StudyWorkspace / InputPanel / AnalysisPanel 文件。

---

## 三、严禁事项

1. 不读取、不打印、不修改 .env。
2. 不写死 API Key。
3. 不提交真实 API Key。
4. 不恢复前端 AI 配置入口。
5. 不新增 API Key / Provider / Model / API URL 输入框。
6. 不调用 /api/parse-ppt。
7. 不调用 requestPptParsing。
8. 不实现 OCR。
9. 不实现完整 PPT 解析。
10. 不实现图片文字识别。
11. 不实现 RAG。
12. 不实现向量数据库。
13. 不实现登录注册。
14. 不实现云同步。
15. 不删除旧 StudyWorkspace / InputPanel / AnalysisPanel / 旧 analyze API / 旧 parsePpt API。
16. 不做文档更新。
17. 不 commit。
18. 不 push。
19. 不引入大型依赖。
20. 不为了修 UI 重写整个项目。

---

## 四、执行阶段

本任务使用 Codex goal mode 执行。可以连续执行所有阶段，但必须每阶段自检。若某阶段 build/test 失败，必须先修复，不能跳过。

---

# 阶段 0：审查当前项目状态

开始前先审查，不要直接改代码。

必须阅读：

- client/src/App.jsx
- client/src/app/AppShell.jsx
- client/src/app/SidebarNav.jsx
- client/src/routes/AppRoutes.jsx
- client/src/pages/ChatPage.jsx
- client/src/pages/HomePage.jsx
- client/src/pages/HistoryPage.jsx
- client/src/pages/ProfilePage.jsx
- client/src/pages/PracticePage.jsx
- client/src/pages/ReviewPage.jsx
- client/src/pages/SettingsPage.jsx
- client/src/features/agent-chat/AgentWorkspace.jsx
- client/src/features/agent-chat/ChatShell.jsx
- client/src/features/agent-chat/ChatComposer.jsx
- client/src/features/agent-chat/ChatMessage.jsx
- client/src/features/agent-chat/InteractiveOptions.jsx
- client/src/features/agent-chat/ConversationHistory.jsx
- client/src/features/agent-chat/MessageActions.jsx
- client/src/shared/storage/agentMemoryStorage.js
- client/src/shared/storage/homeStorage.js
- client/src/shared/storage/practiceStorage.js
- client/src/styles.css
- server/routes/agentChat.js
- server/services/promptBuilder.js
- server/services/aiService.js
- server/scripts/verifyAgentChat.mjs
- client/scripts/verifyAgentChatClient.mjs

审查目标：

1. 当前回答编排逻辑在哪里；
2. 当前 default / context_stacking / feynman 如何区分；
3. 当前交互选项是否有重复来源；
4. 当前 light/dark 颜色 token 如何实现；
5. 哪些应用页写死了 text-white；
6. 日历事件交互当前如何实现；
7. 页面宽度是否存在 max-w 限制；
8. /chat 当前 conversation 加载逻辑如何实现；
9. /history 如何恢复对话；
10. 当前左侧栏显示的是全站历史还是当前对话问题索引。

阶段 0 可以继续进入后续阶段，不需要停止，但如果发现需要大规模重写或会破坏 /chat 主功能，必须停止汇报。

---

# 阶段 1：修复智能体回答编排层

目标：让智能体不再机械套固定模板，而是根据用户问题和模式动态回答。

允许修改：

- server/routes/agentChat.js
- server/services/promptBuilder.js
- server/services/aiService.js
- server/scripts/verifyAgentChat.mjs
- client/src/features/agent-chat/AgentWorkspace.jsx
- client/src/features/agent-chat/InteractiveOptions.jsx
- client/scripts/verifyAgentChatClient.mjs

## 1.1 后端新增或完善回答策略

在后端 promptBuilder 中实现清晰的回答策略分流。

至少区分：

- default
- context_stacking
- feynman
- evaluate_interaction_answer

可以新增函数，例如：

- buildAgentChatPrompt(input)
- buildDefaultLearningPrompt(input)
- buildContextStackingPrompt(input)
- buildFeynmanPrompt(input)
- buildAgentEvaluationPrompt(input)

不要求函数名完全一致，但逻辑必须清晰。

---

## 1.2 default 模式动态回答

default 模式不再强制固定输出：

- 总结
- 框架
- 5 个核心概念
- 你可以继续选择

default 模式必须根据用户问题动态生成结构。

Prompt 必须包含类似要求：

“请先识别用户问题中包含的所有子问题，并确保逐一回答。不要机械套用固定模板。回答结构必须服务于用户问题。”

针对复杂问题，尤其是包含“框架、核心概念、关系、如何教给别人”的问题，应输出类似结构：

- 先给一条学习主线；
- 一、学习框架；
- 二、核心概念；
- 三、与旧知识的关系；
- 四、如果教给零基础的人，真正要懂什么；
- 五、下一步学习建议。

必须覆盖每个子问题。

例如 Hash 表问题，回答必须显式包含：

1. 哈希表学习框架；
2. 5 个核心概念；
3. 与上周所学内容的关系；
4. 教给零基础的人必须懂的底层逻辑；
5. 可选学习路径或下一步建议。

不允许只输出空泛定义。

---

## 1.3 Context Stacking 模式

Context Stacking 必须主动生成：

- 预习路线；
- 前置知识连接；
- 课堂验证清单；
- 老师可能怎么考；
- 学习风险点。

必须禁止：

- 反问用户；
- 让用户先回答；
- 默认进入 pendingInteraction；
- 使用费曼式评价流程；
- 输出普通 default 模板。

Prompt 中必须明确：

“你是主动搭建预习脚手架，不要反问用户，不要要求用户先作答。”

---

## 1.4 Feynman 模式

Feynman 模式不应使用 default 的讲义结构。

情况 A：用户只输入主题或问题，没有给出自己的解释。

AI 应输出：

- 邀请用户用自己的话解释；
- 告诉用户不要背定义；
- 提示 AI 会从准确点、漏洞、混淆点、改写建议进行评价；
- 不长篇讲解。

情况 B：用户输入了自己的解释或 pendingInteraction 存在。

AI 应输出：

## 评价
## 准确点
## 思维漏洞
## 概念混淆
## 如何改写
## 下一步追问

要求：

- 必须引用或概括用户原话；
- 不要机械讲完整知识点；
- 重点在纠正思维漏洞；
- 评价结果进入用户画像。

---

## 1.5 修复交互选项重复

要求：

1. 如果后端已经输出交互选项，前端不要再重复追加同样的 fallback options。
2. 如果前端需要 fallback options，必须先去重。
3. 去重依据可以是 normalize 文本：
   - 去空格；
   - 去编号；
   - 去标点；
   - 简化大小写。
4. UI 渲染时同一组选项不得重复出现。

---

## 1.6 提升 fallback 质量

缺 key 或 provider 失败时，也不能退化成单薄模板。

fallback 应根据 mode 生成合理内容：

default fallback：
- 根据用户问题做动态结构；
- 对复杂多问题做逐项回答；
- 不机械套固定四段。

context_stacking fallback：
- 预习路线；
- 前置连接；
- 课堂验证；
- 可能考法。

feynman fallback：
- 用户未解释时，引导反讲；
- 用户已解释时，输出评价结构。

---

## 阶段 1 验收

使用以下问题测试 default 模式：

“哈希表学习的框架是怎样的？其中5个核心概念是什么？他们和上周学的东西有什么关系；如果我要将这门课交给一个完全没基础的人，我需要真正的搞懂哪些东西？”

必须满足：

1. 回答完整覆盖四个子问题；
2. 不只输出“总结/框架/5概念/选项”；
3. 内容有深度；
4. 明确连接旧知识；
5. 明确讲如何教给零基础的人；
6. 交互选项不重复。

Context Stacking 测试：

输入缓存或哈希表材料，必须主动生成：

- 预习路线；
- 前置知识连接；
- 课堂验证清单；
- 可能考法。

不得反问用户。

Feynman 测试：

输入“我想用费曼法学习哈希表”，AI 应要求用户先解释，不应输出讲义。

用户输入解释后，AI 应评价、纠错、指出漏洞。

---

# 阶段 2：修复主题颜色系统

目标：日间模式文字全部可见，色彩更丰富、更成熟。

允许修改：

- client/src/styles.css
- client/src/app/AppShell.jsx
- client/src/app/SidebarNav.jsx
- client/src/pages/*.jsx
- client/src/features/**/*.jsx

要求：

1. 除 /landing 外，应用页不要大量写死 text-white。
2. 应用页统一使用 CSS variables。
3. 补齐或重构以下变量：

```css
:root {
  --app-bg: #f7f4ee;
  --workspace-bg: #fbfaf7;
  --panel-bg: rgba(255, 255, 255, 0.72);
  --panel-strong: rgba(255, 255, 255, 0.92);
  --text-primary: #1f2933;
  --text-secondary: #5f6673;
  --text-muted: #8a9099;
  --border-soft: rgba(30, 41, 59, 0.10);
  --accent: #d97706;
  --accent-soft: #fff2cc;
  --accent-blue: #5067ff;
  --accent-green: #2f9e73;
  --danger: #dc2626;
}

.dark {
  --app-bg: #060709;
  --workspace-bg: #090a0f;
  --panel-bg: rgba(17, 19, 26, 0.72);
  --panel-strong: rgba(17, 19, 26, 0.92);
  --text-primary: #f5f5f5;
  --text-secondary: #c7c9d1;
  --text-muted: #8b909c;
  --border-soft: rgba(255, 255, 255, 0.10);
  --accent: #ffc72c;
  --accent-soft: rgba(255, 199, 44, 0.12);
  --accent-blue: #8ea2ff;
  --accent-green: #72d6a5;
  --danger: #ff6b6b;
}
应用页背景使用：
bg-[var(--app-bg)]
text-[var(--text-primary)]
卡片使用：
bg-[var(--panel-bg)]
border-[var(--border-soft)]
辅助文字使用：
text-[var(--text-secondary)]
text-[var(--text-muted)]
侧边栏必须检查：
light 模式下图标和文字清楚；
active 状态明显；
hover 状态明显；
不再出现白字白底。
日间模式颜色要更丰富：
暖黄用于重点；
蓝色用于信息；
绿色用于完成；
红色用于紧急；
不要单调灰白。
不要破坏 landing 的黑色视频视觉。
阶段 3：修复日历交互

目标：取消弹窗式事件编辑，改为下方选中日期事件面板。

允许修改：

client/src/features/home/LearningCalendar.jsx
client/src/features/home/*
client/src/shared/storage/homeStorage.js
client/src/pages/HomePage.jsx

要求：

点击日期时：
setSelectedDate(date)
不弹窗
下方显示“选中日期事件”面板
选中日期事件面板包含：
当前选中日期；
该日期事件列表；
添加事件按钮；
编辑按钮；
删除按钮；
取消编辑按钮。
添加事件：
在面板内输入标题/备注；
保存到 localStorage；
支持同一天多个事件。
编辑事件：
在面板内完成；
不弹窗；
更新 localStorage。
删除事件：
需要确认；
删除后该日期状态更新。
日期视觉状态独立：
today：今天；
selectedDate：当前选中日期；
eventDate：有事件日期。
视觉规则：
today：使用 accent 描边圆圈；
selectedDate：使用 accent-blue 或深色实心圆；
eventDate：使用 accent-soft 底色或小圆点；
today + event：描边 + 小点；
selected + event：选中底色 + 小点。
修改其他日期事件时，today 态不能变化。
light / dark 下都要可见。
阶段 4：修复应用页面宽度

目标：所有应用页都像成熟产品一样舒展，不是窄卡片。

允许修改：

client/src/app/AppShell.jsx
client/src/pages/HomePage.jsx
client/src/pages/HistoryPage.jsx
client/src/pages/ProfilePage.jsx
client/src/pages/PracticePage.jsx
client/src/pages/ReviewPage.jsx
client/src/pages/SettingsPage.jsx
client/src/styles.css

要求：

AppShell 主内容：
h-full
w-full
flex-1
overflow-hidden
pl-16
应用页根容器：
h-full
w-full
overflow-hidden 或 overflow-y-auto
p-6 或 px-6 py-6
不要整体 max-w 居中
不允许用以下结构包住整个页面：
max-w-4xl mx-auto
max-w-5xl mx-auto
max-w-6xl mx-auto
max-w-[920px]
max-w-[1200px] 作为整页外壳
可以在内部文字区域使用阅读宽度，但不能限制整个页面布局。
/home /history /profile /practice /review /settings 都要更宽阔。
缩放 80%、100%、125%、150%：
不重叠；
不横向溢出；
侧栏不挤压；
页面主要内容仍可用。
不破坏 /chat 宽阔布局。
阶段 5：修复 Chat 新会话与历史逻辑

目标：让 /chat 像 ChatGPT / Gemini 一样管理新会话和历史恢复。

允许修改：

client/src/pages/ChatPage.jsx
client/src/features/agent-chat/AgentWorkspace.jsx
client/src/features/agent-chat/ConversationHistory.jsx
client/src/features/agent-chat/ChatShell.jsx
client/src/shared/storage/agentMemoryStorage.js
client/src/routes/AppRoutes.jsx
client/src/app/SidebarNav.jsx

要求：

5.1 导航进入 /chat 创建新会话

当用户从 AppShell/SidebarNav 点击 Chat 导航进入 /chat 时：

URL 没有 conversationId；
应创建新的空 conversation；
不自动恢复最近会话；
输入框为空；
消息区为空；
显示空状态。

如果当前已有未保存草稿，可以保留为 draft，但不能自动恢复旧对话。

5.2 从 /history 恢复历史

当用户从 /history 点击某条历史：

跳转到 /chat?conversationId=xxx；
AgentWorkspace 加载该 conversation；
消息恢复；
自动滚动到底部。
5.3 从 /review 或 /practice 跳转

当 URL 是：

/chat?concept=xxx

行为：

创建新 conversation；
可以把 concept 放入输入草稿；
或显示提示“将围绕 xxx 开始新学习”；
不恢复旧对话。
5.4 发送消息后自动滚动

当用户发送消息：

立即滚动到底部；
assistant streaming 时，如果用户没有主动上滑，持续跟随到底部；
streaming 结束后确保在底部。

实现建议：

messagesEndRef；
scrollToBottom；
isUserNearBottom；
requestAnimationFrame；
onMessagesChange；
onStreamingDelta。
5.5 历史对话加载后自动滚动

conversationId 变化并成功加载后：

scrollToBottom；
保证最后一条消息可见。
5.6 /chat 左侧栏改为当前对话问题索引

当前 /chat 左侧栏不应显示全站历史列表。

它应该显示当前 conversation 内用户问过的问题索引：

按消息顺序列出 user messages；
每项显示问题前 30-40 字；
点击后滚动到对应 user message；
当前滚动区域附近的问题可高亮；
如果当前对话为空，显示空状态。

全站历史仍然在 /history 页面。

5.7 Conversation 保存规则
用户第一次发送消息后创建 conversation title；
title 优先使用第一条 user message 前 24-32 字；
每次消息更新后保存到 localStorage；
/history 可看到；
feedback、用户画像逻辑不破坏。
阶段 6：测试补充与回归检查

必须更新或补充测试。

允许修改：

client/scripts/verifyAgentChatClient.mjs
client/scripts/verifyMultiPageShell.mjs
server/scripts/verifyAgentChat.mjs
server/package.json
client/package.json

测试必须覆盖：

default prompt 不再机械固定模板；
context_stacking prompt 包含主动预习路线、前置连接、课堂验证、可能考法、不反问；
feynman prompt 不输出 default 讲义结构；
evaluation prompt 包含评价结构；
交互选项去重逻辑存在；
新主路径没有 API Key 输入框；
新主路径没有 /api/parse-ppt；
新主路径没有 requestPptParsing；
应用页没有大量 text-white 固定导致 light 模式不可读；
/chat 新会话逻辑存在；
/chat 支持 conversationId 恢复；
/chat 当前对话问题索引存在；
日历使用 selected date panel，而非 modal；
practice/review/settings 现有测试继续通过。

最终必须运行：

cd server
npm run test:acceptance
cd client
npm run build
npm run test:acceptance

如果失败，必须修复，不能跳过。

五、手动验收标准

完成后，以下手动验收必须成立。

1. 智能体回答质量

输入：

“哈希表学习的框架是怎样的？其中5个核心概念是什么？他们和上周学的东西有什么关系；如果我要将这门课交给一个完全没基础的人，我需要真正的搞懂哪些东西？”

期望：

回答完整覆盖四个子问题；
不机械套固定四段；
有学习框架；
有 5 个核心概念；
明确讲与上周知识关系；
明确讲如何教给零基础的人；
内容有深度；
交互选项不重复。
2. Context Stacking

输入缓存或哈希表材料。

期望：

主动生成预习路线；
主动生成前置知识连接；
主动生成课堂验证清单；
主动生成可能考法；
不反问用户；
不要求用户先回答。
3. Feynman

输入：

“我想用费曼法学习哈希表。”

期望：

AI 要求用户先用自己的话解释；
不输出普通讲义。

用户输入一段解释后：

AI 输出评价；
指出准确点；
指出思维漏洞；
指出概念混淆；
给出改写建议；
给出下一步追问。
4. 日间模式
切换 light 模式；
侧边栏文字清晰；
应用页文字清晰；
卡片、按钮、active nav 状态清楚；
日间模式颜色不单调；
夜间模式仍正常。
5. 日历
点击日期后，下方出现选中日期事件面板；
添加事件可用；
编辑事件可用；
删除事件可用；
有事件日期高亮；
今天状态独立；
选中状态独立；
刷新后事件保留。
6. 页面宽度
/home /history /profile /practice /review /settings 都舒展；
不像窄卡片；
125%、150% 缩放下不崩；
/chat 仍宽阔。
7. Chat 新会话
点击导航 Chat，进入新的空对话；
从 History 点击历史，恢复对应对话；
输入新问题后滚动到底部；
恢复历史后滚动到底部；
左侧显示当前对话内问题索引；
点击问题索引能跳转；
全站历史仍在 /history。
六、完成后汇报格式

完成后必须汇报：

修改文件列表；
是否修改后端；
回答编排层如何修复；
default 模式如何动态回答；
Context Stacking 如何保证不反问；
Feynman 如何改成评价纠错流程；
交互选项重复如何修复；
日间模式颜色如何修复；
日历交互如何修复；
页面宽度如何修复；
Chat 新会话逻辑如何实现；
自动滚动如何实现；
当前对话问题索引如何实现；
测试命令和结果；
是否存在 .env 改动；
是否存在 API Key 风险；
剩余风险。
七、Goal Mode 执行要求

现在开启 goal mode 执行本任务。

你可以连续执行阶段 0 到阶段 6，但必须遵守：

每阶段完成后进行必要自检。
如果 build/test 失败，先修复，不准跳过。
如果发现需要大规模重写、破坏 /chat 主功能、或引入大型依赖，必须停止并汇报。
不要做文档更新。
不要 commit。
不要 push。
完成阶段 6 后停止，等待我手动验收。