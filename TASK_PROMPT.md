你正在修改我本地的 scaffoldmind 项目工作区。当前项目已经有多页面第一轮实现，但 UI 不符合预期。现在只执行“前端止损重构阶段 A”，不要继续做 practice/review/settings 后端，不要做文档更新，不要新增复杂功能。

【当前问题】

1. /landing 落地页太粗糙，没有严格继承我提供的 RECREATION PROMPT 原生设计。
2. /chat 主学习页被改窄，两边空隙过大，失去了原本 ChatGPT / Gemini / NotebookLM 式宽阔主输入输出体验。
3. AppShell 侧边栏挤压主工作区。
4. Home / History / Profile 当前可以暂时保留，但不要继续扩展功能。
5. Codex 不要自行发挥审美，必须严格按 Gemini 最新前端蓝图落地。

【最高优先级】

本轮只做三件事：

1. 重构 AppShell：
   - 左侧导航栏固定 64px 宽度。
   - hover 时浮动展开到 256px。
   - 展开时绝对定位或 fixed overlay，不得推挤右侧主内容。
   - 主内容区始终 `pl-16 w-full h-full overflow-hidden`。
   - 不允许 AppShell 导致 /chat 变窄。

2. 重做 /landing：
   - 严格继承 RECREATION PROMPT 原生视觉结构。
   - 使用 bg-black、全屏 Hero、背景视频、liquid-glass、Instrument Serif、大标题、视频 section、哲学 section、服务卡片 section。
   - 文案全部改成 ScaffoldMind 明序，不得照搬 Asme、Know it then all、About Us、Pricing、Login、Sign Up。
   - 落地页可以强视觉，应用页不要被落地页黑色视频背景污染。
   - 如果外链视频加载失败，必须有黑色/渐变 fallback，不白屏。

3. 修复 /chat：
   - /chat 必须恢复宽阔主学习页。
   - 不允许使用 `max-w-4xl`、`max-w-[920px]` 或类似限制导致主区变窄。
   - AppShell 不得挤压 /chat。
   - 大屏下主 workspace 接近满宽，只保留 24px-32px 舒适边距。
   - 中间对话主通道使用 `flex-1 min-w-0`。
   - 左侧历史栏只在 xl 及以上显示，宽度约 `w-72 shrink-0 hidden xl:flex`。
   - 右侧状态栏只在 2xl 及以上显示，宽度约 `w-80 shrink-0 hidden 2xl:flex`。
   - 125%、150% 缩放时左右栏应优先隐藏，保证中间对话区宽阔。
   - 输入框使用 `w-full max-w-5xl mx-auto` 或更宽，但不能窄。
   - 保留所有原功能。

【必须保留的功能】

不得破坏：

1. /chat 流式输出。
2. /api/agent/chat/stream。
3. 文本输入。
4. 加号附件按钮。
5. 附件 metadata chip。
6. PPT/图片只展示 metadata，不解析。
7. 模式选择。
8. Context Stacking 正确行为：主动生成预习路线、前置连接、课堂验证清单、可能考法，不反问用户。
9. 费曼反讲正确行为：用户先反讲/作答，AI 再评价纠错。
10. 交互选项。
11. 复制 / 点赞 / 点踩。
12. localStorage 记忆。
13. 用户画像。
14. 对话历史恢复。
15. 日夜主题切换。
16. 前端不显示 API Key 配置入口。

【严禁】

1. 不要读取、打印、修改 .env。
2. 不要写死 API Key。
3. 不要恢复前端 AI 配置入口。
4. 不要调用 /api/parse-ppt。
5. 不要调用 requestPptParsing。
6. 不要实现 OCR。
7. 不要实现 RAG。
8. 不要实现向量数据库。
9. 不要实现登录/云同步。
10. 不要重写后端。
11. 不要删除旧 StudyWorkspace / InputPanel / AnalysisPanel / 旧 analyze API / 旧 parsePpt API。
12. 不要继续开发 practice/review/settings 后端。
13. 不要做文档更新。

【需要先审查的文件】

开始修改前先阅读：

- client/src/App.jsx
- client/src/app/AppShell.jsx
- client/src/app/SidebarNav.jsx
- client/src/routes/AppRoutes.jsx
- client/src/pages/LandingPage.jsx
- client/src/pages/ChatPage.jsx
- client/src/features/agent-chat/AgentWorkspace.jsx
- client/src/features/agent-chat/ChatShell.jsx
- client/src/features/agent-chat/ChatComposer.jsx
- client/src/features/agent-chat/ChatMessage.jsx
- client/src/features/agent-chat/ConversationHistory.jsx
- client/src/features/agent-chat/AnimatedThemeToggle.jsx
- client/src/styles.css
- client/package.json

如果实际文件路径略有不同，以本地项目为准。

【全局视觉 Token 要求】

在 `client/src/styles.css` 或现有全局 CSS 中确认/补齐：

1. Instrument Serif 字体导入：

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
.liquid-glass：
.liquid-glass {
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: none;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.4) 0%,
    rgba(255,255,255,0.1) 20%,
    rgba(255,255,255,0) 40%,
    rgba(255,255,255,0) 60%,
    rgba(255,255,255,0.1) 80%,
    rgba(255,255,255,0.4) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
.frosted-glass：
.frosted-glass {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.01);
}
不要使用实体亮蓝、亮绿的大卡片背景。
不要用传统后台管理系统风格。
应用页使用克制、低噪、可阅读风格。
Landing 可以强视觉。

【AppShell 重构要求】

目标结构：

<div className="flex h-screen w-screen overflow-hidden bg-[var(--bg)] text-[var(--text-primary)]">
  <SidebarNav />
  <main className="h-full w-full flex-1 overflow-hidden pl-16">
    {children}
  </main>
</div>

SidebarNav：

fixed left-0 top-0 z-50
h-full
w-16
hover:w-64
transition-all duration-300 ease-in-out
liquid-glass 或 dark 下深色 glass
flex flex-col justify-between
展开时显示文字标签
收起时只显示图标
展开时 overlay，不推挤 main
不得导致 /chat 宽度变化

导航项：

Landing
Home
Chat
History
Profile
Practice
Review
Settings

但本轮不实现 Practice/Review/Settings 功能，只保持路由入口或占位即可。

【/landing 重做要求】

严格按以下 section 实现：

SECTION 1 -- HERO

full viewport：min-h-screen relative overflow-hidden flex flex-col bg-black
背景视频：
https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4
视频属性：muted, autoPlay, playsInline, preload="auto"
尽量实现淡入淡出；如果实现复杂，至少保证加载失败不白屏。
顶部导航 liquid-glass pill：
左侧 Globe icon + "ScaffoldMind"
中间：Cognition / Scaffolding / Methodology
右侧：进入系统 / 开始学习
大标题：
Know it then <em>all</em>.
Instrument Serif
text-7xl md:text-8xl lg:text-9xl
white / neutral
副标题：
“明序：突破无序碎片的认知壁垒。将复杂的长篇材料与零散知识，重构为高度动态的个人思维脚手架。”
胶囊输入：
placeholder：“输入你当前正在攻克的复杂课题...”
右侧白色圆形 ArrowRight 按钮
点击后跳转 /chat，可把输入作为 initial prompt 或 localStorage draft；如果实现成本高，至少跳转 /chat。
Manifesto button：
“阅读明序认知宣言”

SECTION 2 -- ABOUT

bg-black
顶部微弱径向渐变
label：
THE COGNITIVE SCAFFOLDING
主标题：
Pioneering structural frameworks for minds that dismantle, rebuild, and master.
允许中英混排，但视觉要高级。

SECTION 3 -- FEATURED VIDEO

视频：
https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4
圆角 3xl aspect-video
左下 liquid-glass 卡片：
label：METHODOLOGY
text：
“我们坚信，被动输入不是学习。明序内置默认知识解析、Context Stacking 超前学习与费曼反讲三大范式，用主动高频交互逼近认知的本质。”
右下按钮：
“探索明序核心模式”

SECTION 4 -- PHILOSOPHY

标题：
Evolution x Perspective.
左侧视频：
https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4
右侧两个文本块：
“每一次长文本的挂载，都是在对知识资产进行重组。明序在底层维护动态记忆流，确保 AI 的每一次追问都精确切中你的盲区。”
“告别没有记忆的 Chat 机器人。系统根据你的点赞、点踩和作答表现，实时校准输出风格，生成只属于你的知识进化网络。”

SECTION 5 -- SERVICES

两张视频卡片：

Card 1：

video：
https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4
tag：CONTEXT STACKING
title：前置认知连接
desc：
“输入未学课程，AI 主动为你生成预习路线图、课堂验证清单与可能考法，实现超前理解。”

Card 2：

video：
https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4
tag：FEYNMAN PARADOX
title：动态纠错演练
desc：
“身份互换，由你对 AI 进行知识讲授。智能体通过多轮交互和文本追问，实时捕获并纠正你的思维偏误。”

【/chat 宽度和布局修复】

ChatPage / AgentWorkspace 外层：

不得套 max-w-4xl
不得套 max-w-[920px]
不得用居中小卡片包住整个 chat
应使用：
<div className="h-full w-full overflow-hidden">
  <div className="flex h-full w-full gap-6 p-6">
    <aside className="hidden w-72 shrink-0 xl:flex ...">...</aside>
    <section className="flex min-w-0 flex-1 flex-col ...">...</section>
    <aside className="hidden w-80 shrink-0 2xl:flex ...">...</aside>
  </div>
</div>

中间核心区：

flex min-w-0 flex-1 flex-col
消息流：flex-1 min-h-0 overflow-y-auto
输入框：w-full max-w-5xl mx-auto
如果当前输入框更窄，必须改宽。
如果当前 AppShell 限制主内容宽度，必须去掉。

模式切换栏：

移到中间区域顶部
w-fit mx-auto my-4 p-1 rounded-full
切换模式时保留现有“需要重新输入”的逻辑
不得在当前回复内直接切换

AI 消息：

不要传统微信气泡感
AI 回复可以全宽平铺
左侧微弱竖线区分：
border-l-2 border-neutral-300 dark:border-neutral-700 pl-6
用户消息可以居右，max-w-[85%]

空状态：

中央显示：
What shall we structure today?
Instrument Serif italic
下方三个胶囊卡片：
默认知识解析 / Context Stacking / 费曼反讲

【不要处理的内容】

本轮不要重做 /home /history /profile。
本轮不要做 /practice /review /settings 后端。
本轮不要更新 README / docs / CHANGELOG。
本轮不要 commit。

【测试要求】

完成后运行：

cd client
npm run build
npm run test:acceptance

如果你修改了 server 或发现 server 测试相关影响，再运行：

cd server
npm run test:acceptance

必须检查：

/landing 能打开。
/landing 视觉接近原生 RECREATION PROMPT。
/landing 文案属于 ScaffoldMind。
/chat 不再变窄。
/chat 主输入框足够宽。
/chat 原功能全部保留。
AppShell hover 展开不推挤 /chat。
新主路径没有 API Key 输入框。
新主路径没有 /api/parse-ppt 或 requestPptParsing。
build/test 通过。

现在开始执行。先审查相关文件，然后做最小必要修改。完成后汇报修改文件、测试结果和剩余风险。