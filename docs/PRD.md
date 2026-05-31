# ScaffoldMind 明序 PRD

版本：V1.0  
开发周期：5 天内完成可演示 MVP  
开发方式：VSCode + Codex + GitHub  
技术栈：React + Vite + Tailwind CSS + Node.js Express  
目标学科：CSAPP、数据结构  
产品类型：个人 AI 学习助手  
核心目标：构建适配个人认知风格的学习闭环，而不是做一个简单 AI 问答壳。

---

## 0. 项目背景

本项目来源于“与 AI 共创，做一个自己的学习助手”的实践作业。评分标准强调：系统需要围绕自身学习特点，构建个性化学习流程；不能只是简单调用 AI 接口，而要体现学习问题建模、AI 参与机制、学习闭环、错误反馈、可扩展性、实现质量和表达反思。附件评分标准中明确提出，A 档需要“准确建模学习难点、构建完整学习闭环、AI 参与具有明确策略与动态调整机制、错误反馈具针对性、功能模块清晰，AI 能够一步步引导完成任务并具有较好的学习分型”。:contentReference[oaicite:0]{index=0}

ScaffoldMind 明序的目标不是让 AI 直接替用户学习，而是为用户搭建一个“认知脚手架”：帮助用户从课程材料中建立框架，追问底层逻辑，从出题人视角理解考点，通过费曼反讲暴露理解偏差，再通过错误诊断与强化练习形成闭环。

---

## 1. 产品名称

### 1.1 名称

ScaffoldMind 明序

### 1.2 名称含义

Scaffold 表示脚手架，强调系统不是直接给答案，而是帮助用户搭建理解结构。

Mind 表示思维、认知、学习过程。

“明序”表示：

- 明：把概念讲明，把逻辑讲透；
- 序：建立知识顺序、提问顺序、复习顺序和反馈顺序。

一句话解释：

ScaffoldMind 明序是一个为 CSAPP 和数据结构学习搭建认知脚手架的 AI 学习助手。

---

## 2. 产品定位

ScaffoldMind 明序是一款面向计算机基础课的理解驱动型 AI 学习助手。

它不以“快速给答案”为核心，而以“构建学习闭环”为核心：

输入学习材料  
→ 建立知识框架  
→ 深度解析概念  
→ 主动提出问题  
→ 用户尝试表达  
→ AI 诊断偏差  
→ 生成强化练习  
→ 保存学习记录  
→ 形成可复习、可导出的学习资产

---

## 3. 目标用户

### 3.1 核心用户

- 正在学习 CSAPP、数据结构的学生；
- 需要阅读 PPT、完成作业、准备考试、写实验报告；
- 偏理解驱动，不满足于记结论；
- 喜欢问“为什么”“这个知识点解决了什么问题”“老师为什么这样出题”；
- 希望 AI 能帮忙搭建框架，但不希望 AI 直接替自己思考。

### 3.2 用户认知风格

用户的学习偏好包括：

- 框架优先；
- 目录后填充；
- 重视知识点之间的关系；
- 重视出题人视角；
- 重视本质解释；
- 重视页码与原始 PPT 对应；
- 喜欢主动追问；
- 喜欢用输出倒逼输入；
- 希望表达精炼，不要重复；
- 希望学习结果能导出到 Obsidian。

---

## 4. 学习问题建模

ScaffoldMind 明序不把问题泛化成“辅助学习”，而是将真实学习瓶颈形式化为 AI 可以处理的问题。

| 学习瓶颈 | 具体表现 | 系统建模方式 |
|---|---|---|
| 概念混淆 | 知道定义，但混淆相近概念，例如 cache line、block size、cache size | AI 输出概念对比、本质解释、相关概念 |
| 推理断层 | 看懂当前页，但不知道为什么前后知识连在一起 | AI 输出前置知识、当前作用、后续连接 |
| 表层理解 | 会背答案，但换一道题不会 | 出题人视角分析“如何区分表层理解和真正理解” |
| 不会迁移 | 会做例题，不会抽象方法 | AI 提炼方法模板和迁移题 |
| 提问不系统 | 想追问但不知道该问什么 | AI 主动生成问题并分类 |
| 错误反馈粗糙 | 只知道错了，不知道为什么错 | AI 判断错误类型并给针对性反馈 |
| 对话脉络散乱 | 问题越问越多，回顾困难 | 右侧提问记录快速浏览回顾侧边栏 |
| PPT 图文割裂 | 知识点与原始页面对应不上 | 页码链接 + PPT 原页侧拉面板 |

---

## 5. 核心学习方法

### 5.1 框架—目录—填充

先建立整体框架，再填充细节。

AI 需要帮助用户回答：

- 这一节讲什么？
- 核心概念有哪些？
- 它们之间是什么关系？
- 哪些是前置知识？
- 哪些是后续内容的基础？
- 这一页在整章中起什么作用？

输出要求：

- 章节框架；
- 核心概念列表；
- 概念关系；
- 前后承接；
- 重点页码；
- 易错点；
- 后续追问。

---

### 5.2 反向思考：出题人视角

用户不是只问“这题怎么做”，而是问：

- 老师为什么出这题？
- 这题想考哪个知识点？
- 这题如何区分表层理解和真正理解？
- 表面理解的人会在哪里掉坑？
- 真正理解的人会怎么想？

AI 输出：

- 题目考点；
- 出题意图；
- 表层理解陷阱；
- 底层逻辑；
- 解题路径；
- 同类迁移题。

---

### 5.3 理解考点和脉络

每个题目和知识点都要回到课程结构中理解：

- 它解决了什么问题？
- 为什么要讲它？
- 它和前一个知识点有什么关系？
- 它会引出后面什么内容？
- 它在考试中如何出现？
- 它在工程中如何出现？

---

### 5.4 逻辑追问：问为什么

系统每次解析后都要生成主动追问。

问题类型包括：

- 考试常考型；
- 工程应用型；
- 上下文补全型；
- 底层逻辑型。

示例：

- 为什么 cache line 不是越大越好？
- 老师会如何考 cache miss？
- 为什么局部性原理能支撑 cache 设计？
- PPT 提到了 SRAM，但它和 DRAM 的核心差异是什么？

---

### 5.5 Context Stacking 超前学习法

适用于课前预习、课程掌握程度较低、刚进入新章节时。

输入材料：

- 上周课件/内容；
- 本周课件/内容；
- 阅读材料/未完成作业。

AI 固定回答三个关键问题：

1. 这周的 5 个核心概念是什么？它们和上周学的内容有什么关系？
2. 如果我要把这部分内容讲给一个完全没基础的人，我必须真正搞懂哪些东西？
3. 老师会怎么出题，才能区分“背过答案”和“真正理解”的学生？

输出：

- 本周知识地图；
- 与上周内容的连接；
- 必须真正理解的底层概念；
- 课堂验证清单；
- 补漏清单；
- 可能的出题角度。

产品意义：

课堂不再只是第一次接触知识，而是变成验证和补漏的场景。用户重点记录“意料之外”和“自己没想到”的内容，而不是重复记录已经会的内容。

---

### 5.6 费曼反讲

适用于用户觉得自己懂了，但不确定是否真正理解时。

流程：

用户选择费曼反讲模式  
→ 用户用最简单的话解释一个概念  
→ AI 根据材料判断解释是否准确  
→ AI 指出一个最关键偏差  
→ AI 给出 12 岁小孩也能懂的版本  
→ AI 反问一个检查理解的问题

输出结构：

- 你解释中准确的部分；
- 你解释中最大的问题；
- 为什么这个偏差重要；
- 更简单的解释；
- 一个检查理解的问题。

---

### 5.7 多维信息对撞

适用于进阶理解。

用户输入多份材料：

- 资料 A：课件/教材；
- 资料 B：行业文章/评论；
- 资料 C：反面观点/论文/其他解释。

MVP 实现方式：

- 提供三个文本输入框；
- 不做复杂文件库；
- 不做自动论文检索；
- 不做向量数据库；
- 只比较用户输入的多份材料。

AI 输出：

- 各资料核心观点；
- 观点冲突点；
- 证据强弱比较；
- 哪些结论可以采纳；
- 哪些地方需要保留怀疑；
- 对当前课程学习的帮助。

注意：多维信息对撞不放到第二版，而是在 MVP 中做轻量版。

---

## 6. MVP 功能范围

### 6.1 必须实现功能

#### 功能 1：单页面三栏布局

页面结构：

左侧：输入与学习设置区  
中间：AI 解析与学习闭环区  
右侧：提问记录快速浏览回顾侧边栏

布局示意：

┌──────────────────────────────────────────┐  
│ 顶部：ScaffoldMind 明序 / 学科 / 模式       │  
├──────────────┬───────────────┬──────────┤  
│ 左侧输入设置  │ 中间学习过程   │ 右侧提问栏 │  
│ 学科选择      │ AI 解析结果    │ 问题时间线 │  
│ 模式选择      │ 主动追问       │ 页码索引   │  
│ 学习便签      │ 用户尝试       │ 快速跳转   │  
│ 材料输入      │ 错误诊断       │ 状态标签   │  
│ 生成按钮      │ 强化题         │            │  
└──────────────┴───────────────┴──────────┘

完成标准：

- 页面能运行；
- 三栏清晰；
- 模式可切换；
- 右侧提问记录栏可显示问题；
- 中间区域能展示完整学习闭环。

---

#### 功能 2：学科选择

支持：

- CSAPP；
- 数据结构。

不同学科的 AI 输出侧重点不同。

CSAPP 侧重：

- 底层机制；
- 机器级理解；
- 性能影响；
- 工程场景。

数据结构侧重：

- 抽象数据类型；
- 操作逻辑；
- 算法复杂度；
- 题型迁移。

完成标准：

- 用户可切换学科；
- AI 请求参数包含 subject；
- 不同学科输出侧重点不同。

---

#### 功能 3：学习模式选择

MVP 必须支持五种模式：

1. Context Stacking 超前学习；
2. 课后深度复习；
3. 出题人视角；
4. 费曼反讲；
5. 多维信息对撞。

完成标准：

- 用户可切换模式；
- 不同模式有不同输入区域；
- 不同模式调用不同 prompt；
- 输出结构明显不同。

---

#### 功能 4：学习方法便签

学习方法便签相当于提前设置好的需求 prompt。

便签包括：

- 框架优先；
- 目录后填充；
- 反向思考；
- 追问为什么；
- 提炼本质；
- 考试考点；
- 工程应用；
- 少重复；
- 12 岁小孩也能懂；
- 渐进解释；
- 互动验证；
- Obsidian 输出。

MVP 实现：

- 先实现点击启用/取消；
- 允许高亮显示；
- 选中便签进入 AI 请求参数；
- 拖拽排序可作为增强项。

完成标准：

- 便签显示在左侧；
- 用户点击后状态变化；
- AI 输出体现被选中的学习偏好。

---

#### 功能 5：材料输入模块

根据不同模式显示不同输入框。

课后深度复习：

- 页码；
- PPT 页文字；
- PPT 页图片上传，可选。

Context Stacking：

- 上周内容；
- 本周内容；
- 阅读材料/未完成作业。

出题人视角：

- 题目；
- 我的初步思路，可选；
- 相关知识点，可选。

费曼反讲：

- 概念名称；
- 我的解释；
- 参考材料，可选。

多维信息对撞：

- 资料 A；
- 资料 B；
- 资料 C。

完成标准：

- 至少支持文本输入；
- 支持页码字段；
- 支持图片上传或图片占位；
- 输入为空时有提示；
- 生成失败后用户输入不丢失。

---

#### 功能 6：PPT 页码链接与侧拉面板

不把 PPT 图片直接放在知识点旁边，而是在每一页知识点后加链接：

“查看第 X 页原始内容 →”

点击后，从右侧打开侧拉面板。

侧拉面板内容：

- PPT 第 X 页图片；
- AI 提取出的文字内容；
- 用户手动补充内容；
- 该页对应知识点列表；
- 关闭按钮；
- 可选：全屏查看按钮。

MVP 取舍：

- 第一版不做完整 PPT 自动解析；
- 支持手动输入页码和文字；
- 图片可由用户上传截图；
- OCR、PPT 自动转图后续再做。

完成标准：

- 每个按页解析结果带页码；
- 点击页码链接能打开侧拉面板；
- 侧拉面板能展示图片或图片占位；
- 侧拉面板能展示该页提取文字；
- 关闭侧拉面板不影响当前学习内容。

---

#### 功能 7：AI 结构化解析

课后深度复习输出结构：

- 页码；
- 页面主题；
- 核心概念；
- 本质解释；
- 为什么讲这个知识点；
- 它解决了什么问题；
- 前后关联；
- 考试常考点；
- 工程应用；
- 易错点；
- 主动追问；
- 用户尝试题；
- 查看原页链接。

完成标准：

- 输出不是大段散文；
- 每个知识点有清晰标题；
- 核心概念解释精炼；
- 必须标注页码；
- 必须包含主动追问；
- 必须包含用户尝试题。

---

#### 功能 8：主动问题引导

系统要识别 PPT 中提到但没有深入挖掘的知识点。

问题类型：

- 考试常考型；
- 工程应用型；
- 上下文补全型；
- 底层逻辑型。

用户操作：

- 勾选问题；
- 点击“继续深入”；
- AI 根据原上下文继续回答；
- 问题自动进入右侧提问记录。

完成标准：

- 每次解析至少生成 3 个问题；
- 问题不能复制原文；
- 问题必须可继续执行回答；
- 用户选择的问题会进入提问记录侧边栏。

---

#### 功能 9：提问记录快速浏览回顾侧边栏

这是 ScaffoldMind 明序的核心特色之一。

侧边栏保存学习过程中的问题链，帮助用户快速回顾思考轨迹。

内容包括：

- AI 主动提出的问题；
- 用户勾选深入的问题；
- 用户自己输入的问题；
- 问题所属页码；
- 问题所属知识点；
- 问题状态：未回答 / 已回答 / 已强化；
- 点击后跳转到对应回答。

展示示例：

第 12 页 · Cache Miss  
Q1：为什么 cache line 不是越大越好？  
状态：已深入

第 14 页 · Locality  
Q2：老师会怎么考时间局部性？  
状态：未回答

完成标准：

- 用户每次点击追问，问题进入侧边栏；
- 点击侧边栏问题，可以定位到中间回答区域；
- 问题带页码或知识点标签；
- 页面刷新后可保留记录，MVP 使用 localStorage。

---

#### 功能 10：用户尝试与错误诊断

流程：

AI 解析完成  
→ AI 给出一个用户尝试题  
→ 用户输入自己的回答  
→ AI 判断错误类型  
→ AI 给出针对性反馈  
→ AI 生成强化题

错误类型：

- 概念混淆；
- 推理断层；
- 方法错误；
- 细节遗漏；
- 表达不完整；
- 基本正确。

反馈要求：

AI 不能只说“你的理解不准确”。

必须指出：

- 用户回答中的哪句话有问题；
- 这个问题属于什么错误类型；
- 为什么会错；
- 应该怎么改；
- 下一步练什么。

完成标准：

- 用户可以提交回答；
- AI 输出错误类型；
- AI 反馈引用用户回答；
- AI 生成强化问题；
- 反馈结果可保存到学习记录。

---

#### 功能 11：Obsidian 优化输出

系统支持一键复制 Obsidian Markdown。

示例：

# [[Cache Miss]]

> [!summary] 核心本质  
> Cache miss 的本质是 CPU 想访问的数据不在当前缓存层中。

> [!question] 主动追问  
> 为什么 cache line 不是越大越好？

> [!warning] 易错点  
> 不要把 cache size 和 block size 混淆。

## 相关概念
- [[Locality]]
- [[Cache Line]]
- [[Set Associative Mapping]]

## 来源
- PPT 第 12 页

完成标准：

- 用户可点击“复制 Obsidian 笔记”；
- 输出包含 callout；
- 输出包含 wikilink；
- 输出包含页码来源；
- 内容精炼，不是大段复制。

---

#### 功能 12：学习记录保存

保存一次完整学习闭环。

保存内容：

- 学习模式；
- 学科；
- 输入内容；
- AI 解析；
- 主动追问；
- 用户回答；
- 错误诊断；
- 强化题；
- Obsidian 笔记；
- 创建时间。

MVP 存储方式：

- localStorage。

后续扩展：

- SQLite；
- PostgreSQL；
- 用户登录；
- 云端同步。

完成标准：

- 用户可以保存学习记录；
- 刷新页面后记录仍在；
- 可以查看最近记录；
- 可以删除记录。

---

## 7. 暂不实现功能

五天 MVP 暂不实现：

- 登录注册；
- 教师后台；
- 多人协作；
- 完整 PPT 自动解析；
- 复杂 OCR；
- 自动生成精美教学插图；
- 完整知识图谱数据库；
- 向量数据库；
- 移动端 App；
- 复杂拖拽思维导图；
- 云端同步。

这些不进入 MVP，避免功能膨胀。

---

## 8. 页面与模块设计

### 8.1 顶部栏

内容：

- 产品名称：ScaffoldMind 明序；
- 学科选择：CSAPP / 数据结构；
- 模式选择：五种学习模式；
- 当前学习状态。

---

### 8.2 左侧输入与学习设置区

包含：

- 学科选择；
- 模式选择；
- 学习方法便签；
- 材料输入框；
- 页码输入；
- 图片上传；
- 生成按钮；
- 保存按钮。

设计重点：

左侧负责“配置这次学习”。学习设置不是装饰，而是 prompt 参数。

---

### 8.3 中间学习闭环区

包含：

- AI 解析结果；
- 主动追问问题；
- 继续深入回答；
- 用户尝试题；
- 用户回答输入框；
- 错误诊断反馈；
- 强化题；
- Obsidian 输出。

设计重点：

中间区域必须体现完整链路，而不是只有 AI 回答。

---

### 8.4 右侧提问记录快速回顾栏

包含：

- 问题列表；
- 页码标签；
- 知识点标签；
- 回答状态；
- 点击跳转。

设计重点：

突出主动提问的概念问题和学习脉络。

---

### 8.5 PPT 原页侧拉面板

触发方式：

用户点击“查看第 X 页原始内容”。

面板内容：

- PPT 图片；
- 提取文字；
- 相关知识点；
- 关闭按钮。

设计重点：

不占用主学习区空间，但能随时对照原始材料。

---

## 9. 数据对象设计

### 9.1 StudySession

| 字段 | 含义 | 类型 | 示例 |
|---|---|---|---|
| id | 学习会话 ID | string | session_001 |
| subject | 学科 | string | CSAPP |
| mode | 学习模式 | string | feynman |
| title | 标题 | string | Cache Miss 深度理解 |
| createdAt | 创建时间 | string | 2026-05-31 |
| status | 状态 | string | completed |

---

### 9.2 StudyPreference

| 字段 | 含义 | 类型 | 示例 |
|---|---|---|---|
| id | 偏好 ID | string | pref_why |
| label | 展示名称 | string | 追问为什么 |
| enabled | 是否启用 | boolean | true |
| priority | 优先级 | number | 1 |

---

### 9.3 MaterialPage

| 字段 | 含义 | 类型 | 示例 |
|---|---|---|---|
| id | 页面 ID | string | page_012 |
| sessionId | 会话 ID | string | session_001 |
| pageNumber | 页码 | number | 12 |
| extractedText | 提取文字 | string | Cache memory is... |
| imageUrl | PPT 页图片 | string | /uploads/page12.png |
| userNote | 用户补充 | string | 老师这里强调了局部性 |

---

### 9.4 AIAnalysis

| 字段 | 含义 | 类型 | 示例 |
|---|---|---|---|
| id | 解析 ID | string | analysis_001 |
| pageNumber | 来源页码 | number | 12 |
| topic | 主题 | string | Cache Miss |
| coreConcepts | 核心概念 | array | ["cache line", "locality"] |
| essence | 本质解释 | string | Cache miss 的本质是... |
| relation | 前后关联 | string | 承接局部性原理 |
| examFocus | 考点 | array | ["判断 miss 类型"] |
| pitfalls | 易错点 | array | ["混淆 block size 和 cache size"] |

---

### 9.5 GuidedQuestion

| 字段 | 含义 | 类型 | 示例 |
|---|---|---|---|
| id | 问题 ID | string | q_001 |
| sessionId | 会话 ID | string | session_001 |
| pageNumber | 页码 | number | 12 |
| concept | 相关概念 | string | Cache Line |
| type | 问题类型 | string | exam |
| question | 问题内容 | string | 为什么 cache line 不是越大越好？ |
| status | 状态 | string | answered |
| answer | AI 回答 | string | 因为... |

---

### 9.6 UserAttempt

| 字段 | 含义 | 类型 | 示例 |
|---|---|---|---|
| id | 尝试 ID | string | attempt_001 |
| sessionId | 会话 ID | string | session_001 |
| question | AI 提问 | string | 请解释 cache miss |
| userAnswer | 用户回答 | string | 因为缓存太小 |
| submittedAt | 提交时间 | string | 2026-05-31 |

---

### 9.7 ErrorFeedback

| 字段 | 含义 | 类型 | 示例 |
|---|---|---|---|
| id | 反馈 ID | string | fb_001 |
| attemptId | 用户尝试 ID | string | attempt_001 |
| errorType | 错误类型 | string | 概念混淆 |
| diagnosis | 诊断说明 | string | 你把容量问题和局部性问题混在一起 |
| suggestion | 修改建议 | string | 先区分 cache size 和 block size |
| reinforcementTask | 强化任务 | string | 判断下面访问序列的 miss 类型 |

---

### 9.8 ObsidianNote

| 字段 | 含义 | 类型 | 示例 |
|---|---|---|---|
| id | 笔记 ID | string | note_001 |
| sessionId | 会话 ID | string | session_001 |
| markdown | Markdown 内容 | string | # [[Cache Miss]] |
| copied | 是否复制 | boolean | true |

---

## 10. AI 能力设计

### 10.1 AI 角色

| AI 角色 | 作用 | 触发条件 |
|---|---|---|
| 讲解者 | 解释 PPT、概念、题目 | 用户点击生成解析 |
| 提问者 | 主动生成问题 | AI 解析完成后 |
| 纠错者 | 判断用户回答偏差 | 用户提交回答后 |
| 规划者 | 给出下一步补漏建议 | 错误诊断完成后 |

---

### 10.2 AI 输入结构

```json
{
  "subject": "CSAPP",
  "mode": "after_class_review",
  "preferences": ["framework_first", "why_chain", "exam_focus"],
  "pageNumber": 12,
  "materialText": "用户输入的 PPT 文本",
  "userQuestion": "",
  "userAttempt": "",
  "previousQuestions": []
}
10.3 AI 输出结构
{
  "pageNumber": 12,
  "topic": "Cache Miss",
  "summary": "本页主要解释缓存未命中的原因和影响。",
  "coreConcepts": [
    {
      "name": "Cache Miss",
      "simpleExplanation": "CPU 想找的数据不在缓存里。",
      "essence": "本质是数据访问速度层级之间的落差。",
      "relatedConcepts": ["Locality", "Cache Line"]
    }
  ],
  "whyThisMatters": "它解释了为什么程序访问模式会影响性能。",
  "contextRelation": {
    "previous": "承接局部性原理",
    "current": "解释缓存未命中的机制",
    "next": "引出缓存优化"
  },
  "examFocus": ["判断 miss 类型", "分析访问序列"],
  "pitfalls": ["把 cache size 和 block size 混淆"],
  "guidedQuestions": [
    {
      "type": "exam",
      "question": "老师会如何考 cache miss？",
      "reason": "能区分背定义和会分析访问过程的学生。"
    }
  ],
  "userTask": {
    "question": "请用自己的话解释 cache miss 为什么影响性能。",
    "expectedKeyPoints": ["数据不在缓存", "需要访问更慢层级", "访问模式影响命中率"]
  }
}
10.4 Prompt 约束

AI 必须遵守：

不要重复同一内容。
每个知识点必须精炼。
必须说明它解决了什么问题。
必须说明和前后知识点的关系。
必须区分“材料明确提到”和“AI 补充解释”。
必须生成主动追问。
必须生成用户尝试题。
错误反馈必须引用用户回答。
不允许只输出标准答案。
涉及 PPT 时必须标注页码。
11. Memory 机制设计

本项目有两类 Memory：产品内学习 Memory 和项目开发 Memory。

11.1 产品内学习 Memory
A. Session Memory：本次学习上下文

保存：

当前学科；
当前学习模式；
当前 PPT 页码；
当前材料内容；
当前 AI 解析结果；
当前主动追问；
用户本次回答；
AI 错误诊断结果；
当前强化题。

用途：

支持继续追问；
避免 AI 重复讲同一内容；
支持右侧提问记录；
支持侧拉面板定位 PPT 原页。

MVP 实现：

React state；
localStorage。
B. Learning Record Memory：学习记录记忆

保存完整学习闭环：

学习主题；
学科；
模式；
输入内容；
AI 解析；
主动追问；
用户回答；
错误类型；
反馈建议；
强化题；
Obsidian 笔记；
创建时间。

用途：

历史记录回看；
生成学习反思；
支持作业展示；
后续形成错题本。

MVP 实现：

localStorage。
C. Learner Profile Memory：学习画像记忆

统计用户长期学习特点：

常见错误类型；
高频薄弱概念；
常用学习模式；
用户常问的问题类型；
最近学习主题；
最近 5 次错误反馈。

用途：

让 AI 动态调整讲解策略；
支持个性化建议；
体现“AI 根据用户状态改变策略”。

MVP 简化实现：

从 localStorage 的最近学习记录中统计，不单独上数据库。

示例：

最近你在 CSAPP 中多次出现“概念混淆”，集中在 cache line、block size、set associative。建议下次使用费曼反讲模式重新解释这些概念。

11.2 项目开发 Memory

项目必须包含：

memory/MEMORY.md

用途：

记录项目当前状态；
记录已完成功能；
记录正在进行的任务；
记录已知问题；
记录下一步计划；
帮助 Codex 跨会话继续开发。

这符合 AI Coding 文档中强调的“知识持久化”和“新会话开始前让 AI 读取 memory/MEMORY.md”的做法。

memory/MEMORY.md 初始模板：

# ScaffoldMind 明序 Project Memory

## 当前版本
V0.1 MVP

## 已完成功能
- 尚未开始开发

## 正在进行
- 项目初始化

## 已知问题
- PPT 自动解析暂不实现
- API Key 必须放在后端 .env 中

## 下一步计划
1. 初始化 React + Vite + Tailwind
2. 初始化 Express 后端
3. 实现单页面三栏 UI
4. 实现 mock 学习闭环

## 最近 3 次重要变更
- 创建 PRD

## 快速参考
- 前端入口：client/src/App.jsx
- 后端入口：server/index.js
- Prompt 构造：server/services/promptBuilder.js
- AI 调用：server/services/aiService.js

每完成一个里程碑后，Codex 必须更新：

memory/MEMORY.md；
CHANGELOG.md；
docs/TASKS.md 的任务状态。
12. 技术架构
12.1 技术栈

前端：

React；
Vite；
Tailwind CSS。

后端：

Node.js；
Express。

存储：

MVP：localStorage；
后续：SQLite / PostgreSQL。

AI：

文本生成 API；
API Key 通过后端 .env 读取；
前端不得直接暴露 API Key。
12.2 为什么选择这套技术栈

React + Vite 适合快速搭建单页面应用。

Tailwind 适合快速实现卡片、便签、三栏布局和侧拉面板。

Node.js Express 适合快速搭建轻量后端，并与前端同属 JavaScript 生态。

localStorage 足够支撑五天 MVP 的学习记录和提问记录保存。

12.3 后端接口设计
方法	路径	作用
POST	/api/analyze	生成结构化解析
POST	/api/deep-dive	回答用户勾选的追问
POST	/api/diagnose	诊断用户回答
POST	/api/obsidian	生成 Obsidian Markdown
POST	/api/collision	多维信息对撞分析
12.4 API Key 安全要求

禁止：

把 API Key 写进前端；
把 API Key 写进 README；
把 API Key 上传 GitHub；
把 .env 提交到 Git。

后端 .env：

TEXT_GENERATION_API_KEY=your_api_key_here
PORT=3001

.env.example：

TEXT_GENERATION_API_KEY=
PORT=3001
13. 项目目录结构
scaffoldmind/
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── .gitignore
├── .env.example
│
├── .ai/
│   ├── AGENTS.md
│   └── context/
│       ├── architecture.md
│       ├── conventions.md
│       └── glossary.md
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── TASKS.md
│   ├── API.md
│   ├── TEST_PLAN.md
│   ├── GITHUB_GUIDE.md
│   └── decisions/
│       └── 0001-mvp-tech-stack.md
│
├── memory/
│   ├── MEMORY.md
│   └── 2026-xx-xx.md
│
├── client/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── core/
│       ├── features/
│       │   ├── study-session/
│       │   ├── question-history/
│       │   ├── page-drawer/
│       │   ├── feynman-mode/
│       │   ├── context-stacking/
│       │   └── obsidian-export/
│       ├── shared/
│       │   ├── components/
│       │   ├── api/
│       │   └── storage/
│       ├── prompts/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── package.json
│   ├── index.js
│   ├── routes/
│   │   ├── analyze.js
│   │   ├── diagnose.js
│   │   ├── deepDive.js
│   │   ├── obsidian.js
│   │   └── collision.js
│   ├── services/
│   │   ├── aiService.js
│   │   └── promptBuilder.js
│   └── config/
│       └── env.js
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
│   ├── dev.sh
│   ├── test.sh
│   └── build.sh
│
└── screenshots/
    ├── home.png
    ├── analysis.png
    ├── question-history.png
    └── page-drawer.png

该结构参考 AI Coding 文档中的思想：通过 .ai/ 提供 AI 协作上下文，通过 docs/ 固化架构、API、决策，通过 memory/ 保存项目状态，通过 tests/ 支撑阶段测试。

14. AI Coding 协作规范

项目必须包含：

.ai/AGENTS.md

AGENTS.md 作用：

告诉 Codex 如何理解项目、遵守哪些规则、不能做什么、每次完成任务后要输出什么。

AGENTS.md 初始内容建议：

# ScaffoldMind 明序 AI Coding Rules

## 项目概述
ScaffoldMind 明序是一个面向 CSAPP 和数据结构学习的 AI 学习助手。

核心学习闭环：
输入材料 → AI 讲解 → 主动追问 → 用户尝试 → 错误诊断 → 强化迁移 → 保存记录。

## 技术栈
- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express
- Storage: localStorage for MVP
- AI: Text generation API via Express backend

## 核心功能
- Context Stacking 超前学习
- 课后深度复习
- 出题人视角
- 费曼反讲
- 多维信息对撞
- 提问记录侧边栏
- PPT 原页侧拉面板
- 错误诊断反馈
- Obsidian Markdown 输出

## 禁止事项
- 不要实现登录注册，除非用户明确要求。
- 不要添加教师后台。
- 不要把 API Key 写入前端代码。
- 不要把所有组件写进 App.jsx。
- 不要删除五种学习模式。
- 不要删除提问记录侧边栏。
- 不要让 AI 输出纯大段散文，必须结构化。
- 不要跳过测试。
- 不要修改 docs/PRD.md，除非用户明确要求。

## 代码规范
- React 使用函数组件。
- 组件命名使用 PascalCase。
- 工具函数使用 camelCase。
- Tailwind 用于样式。
- API 调用统一放在 client/src/shared/api。
- localStorage 操作统一放在 client/src/shared/storage。
- Prompt 构造统一放在 server/services/promptBuilder.js。

## 测试要求
每完成一个任务，至少运行：
- npm run build
- npm run lint，如已配置
- 对关键路径进行手动测试

## 每次完成任务后必须输出
1. 修改了哪些文件
2. 实现了哪些功能
3. 如何运行
4. 如何测试
5. 是否更新了 memory/MEMORY.md
6. 是否有未完成事项
15. GitHub 交付规范
15.1 仓库名

推荐：

scaffoldmind


15.2 必须上传
README.md；
CHANGELOG.md；
CONTRIBUTING.md；
.env.example；
.gitignore；
docs/；
.ai/；
memory/；
client/；
server/；
tests/；
scripts/；
screenshots/。
15.3 禁止上传
.env；
真实 API Key；
node_modules/；
dist/；
coverage/；
日志文件；
临时文件。

.gitignore 必须包含：

node_modules
.env
dist
.DS_Store
.vscode
coverage
*.log
16. 五天开发计划
Day 1：项目初始化与上下文搭建

开发内容：

初始化 GitHub 仓库；
初始化 React + Vite + Tailwind；
初始化 Node.js Express；
创建 docs/PRD.md；
创建 docs/ARCHITECTURE.md 初稿；
创建 .ai/AGENTS.md；
创建 memory/MEMORY.md；
创建 .env.example；
创建 .gitignore；
完成三栏 UI 骨架。

测试：

前端 npm run dev 能启动；
后端 npm run dev 能启动；
页面能显示三栏布局；
侧拉面板能打开关闭。

文档更新：

README.md；
memory/MEMORY.md；
CHANGELOG.md；
GitHub commit。
Day 2：Mock 学习闭环

开发内容：

学习模式选择；
学习便签；
材料输入；
Mock AI 结构化解析；
主动追问；
右侧提问记录；
用户尝试回答；
Mock 错误诊断。

测试：

不接 API 也能跑完整闭环；
提问记录能保存到 localStorage；
刷新后记录不丢失。

文档更新：

memory/MEMORY.md；
CHANGELOG.md；
GitHub commit。
Day 3：接入真实文本生成 API

开发内容：

Express 后端读取 .env；
/api/analyze；
/api/deep-dive；
/api/diagnose；
/api/obsidian；
前端调用后端；
loading 状态；
error 状态；
fallback 展示。

测试：

前端不暴露 API Key；
API 失败时页面不崩溃；
AI 返回格式异常时有 fallback；
后端能正常读取环境变量。

文档更新：

docs/API.md；
memory/MEMORY.md；
CHANGELOG.md；
GitHub commit。
Day 4：五种学习模式完善

开发内容：

Context Stacking prompt；
课后深度复习 prompt；
出题人视角 prompt；
费曼反讲 prompt；
多维信息对撞 prompt。

测试：

每种模式至少准备一个测试输入；
确认每种模式输出结构不同；
确认费曼模式能指出理解偏差；
确认出题人模式能分析考点陷阱；
确认多维信息对撞能比较三段资料。

文档更新：

docs/TEST_PLAN.md；
memory/MEMORY.md；
CHANGELOG.md；
GitHub commit。
Day 5：验收、截图、反思与交付

开发内容：

Obsidian Markdown 复制；
学习记录保存；
评分标准映射页面/卡片；
截图；
README 完善；
最终测试。

测试：

完整演示路径跑通；
npm run build 成功；
手动测试关键路径；
检查 .env 未被 Git 跟踪；
检查 README 运行步骤可用。

文档更新：

README.md；
CHANGELOG.md；
memory/MEMORY.md；
screenshots/；
最终 GitHub commit。
17. 测试与验收策略

AI Coding 文档强调，AI 生成代码后不能不验证，应该分阶段测试、尽量多测试，并让 AI 根据验收标准写测试方案。

17.1 关键路径测试

必须测试：

模式切换是否正常；
便签选择是否进入请求参数；
输入为空时是否有提示；
AI 解析是否能展示；
点击查看原页是否打开侧拉面板；
主动追问是否进入右侧记录；
用户回答后是否生成错误诊断；
Obsidian Markdown 是否可复制；
学习记录是否能保存；
刷新页面后 localStorage 是否保留；
API 失败时页面是否崩溃；
前端是否没有暴露 API Key。
17.2 测试文件建议
tests/
├── unit/
│   ├── promptBuilder.test.js
│   ├── storage.test.js
│   └── obsidianExport.test.js
├── integration/
│   ├── analyze-api.test.js
│   └── diagnose-api.test.js
└── e2e/
    └── study-flow.spec.js

五天 MVP 不一定全部写完自动化测试，但至少必须有：

docs/TEST_PLAN.md；
手动测试清单；
关键工具函数单元测试；
build 测试。
18. 代码审查清单

每次让 Codex 完成功能后，需要检查：

是否符合 PRD 功能边界；
是否没有添加无关功能；
是否没有暴露 API Key；
是否有 loading 状态；
是否有 error 状态；
是否有 empty 状态；
是否更新 memory/MEMORY.md；
是否更新 README / API 文档；
是否通过 npm run build；
是否可以手动跑通完整学习闭环。

AI 辅助审查 prompt：

请审查当前修改，重点关注：
1. 是否符合 ScaffoldMind 明序的 PRD
2. 是否破坏五种学习模式
3. 是否暴露 API Key
4. 是否有安全风险
5. 是否有错误处理
6. 是否符合组件拆分规范
7. 是否需要补充测试
8. 是否需要更新 memory/MEMORY.md
19. 评分标准对应设计
评分项	分值	ScaffoldMind 对应设计
学习问题建模	20	将学习瓶颈建模为概念混淆、推理断层、不会迁移、表层理解陷阱
AI参与设计	20	AI 作为讲解者、提问者、纠错者、规划者；五种模式触发不同策略
学习闭环	20	输入 → 讲解 → 追问 → 用户尝试 → 反馈 → 强化 → 保存
错误反馈质量	15	错误类型诊断 + 引用用户回答 + 针对性修改建议
可扩展性	10	学科、模式、prompt、组件均可扩展
实现质量	10	React 组件化 + Express 后端 + API 安全调用 + localStorage
表达与反思	5	Obsidian 输出 + 学习过程记录 + AI 有效/无效反思
20. A 档达成说明
A 档要求	对应设计
准确建模学习难点	概念混淆、推理断层、表层理解陷阱、不会迁移
完整学习闭环	输入、讲解、追问、尝试、反馈、强化、记录
AI 策略明确	五种学习模式 + 四种 AI 角色
动态调整机制	根据模式、便签、用户回答、错误类型调整输出
错误反馈针对性	引用用户回答，判断错误类型，给强化题
功能模块清晰	左侧输入、中间闭环、右侧提问记录、侧拉原页
一步步引导	AI 先建框架，再讲解，再提问，再诊断
学习分型	Context Stacking、课后复习、出题人、费曼、多维对撞
21. 风险与取舍
风险 1：PPT 自动处理过重

取舍：

MVP 只做页码 + 文字输入 + 图片上传/占位 + 侧拉面板查看。

不做完整 PPT 自动转图和 OCR。

风险 2：AI 输出太散

取舍：

所有 prompt 强制结构化输出。

不允许纯自然语言长篇回答。

风险 3：Codex 乱加功能

取舍：

AGENTS.md 中明确禁止：

登录注册；
教师后台；
多页面复杂路由；
无关动画；
删除五种学习模式；
删除提问记录侧边栏。
风险 4：多维信息对撞做复杂

取舍：

MVP 只实现三段文本比较，不做文件库、不做搜索、不做论文管理。

22. 后续迭代方向
V1.1
PPT 自动转图片；
PPT 文本自动提取；
更好的侧拉页预览；
拖拽排序学习便签。
V1.2
学习计划页面；
错题本页面；
错误类型统计；
按知识点复习。
V2.0
多课程扩展；
知识图谱；
RAG 检索教材；
云端同步；
用户登录；
长期学习画像。
23. 最终演示路径

最终展示时，必须能跑通：

打开 ScaffoldMind 明序首页；
选择 CSAPP；
选择课后深度复习；
输入 PPT 第 12 页内容；
点击生成解析；
查看结构化知识点；
点击“查看第 12 页原始内容”；
打开侧拉面板查看 PPT 图片和提取文字；
勾选一个主动追问；
右侧提问记录出现该问题；
用户回答 AI 尝试题；
AI 输出错误类型和针对性反馈；
生成强化题；
复制 Obsidian 笔记；
保存学习记录。

这个路径可以证明系统不是简单问答，而是完整学习闭环。