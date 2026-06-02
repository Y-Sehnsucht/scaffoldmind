import { useMemo, useState } from 'react';
import {
  buildLearnerProfile,
  buildLearnerProfileSummary,
  clearConversations,
  loadConversations,
  loadFeedbackEvents,
  loadInteractionEvents,
  loadLearnerProfile,
  loadOptionStats,
  loadRepeatedQuestionStats,
  recordSelectedOption,
  recordUserQuestion,
  saveConversation,
  saveFeedbackEvent,
  saveInteractionEvent,
  saveLearnerProfile,
} from '../../shared/storage/agentMemoryStorage.js';
import { streamAgentChat } from './agentChatApi.js';
import { AnimatedThemeToggle } from './AnimatedThemeToggle.jsx';
import { ChatShell } from './ChatShell.jsx';
import { ConversationHistory } from './ConversationHistory.jsx';

const SUBJECTS = [
  { id: 'CSAPP', label: 'CSAPP' },
  { id: 'DATA_STRUCTURES', label: '数据结构' },
];

const MODES = [
  { id: 'default', label: '默认知识解析', hint: '先总结、搭框架，再展开核心概念。' },
  { id: 'context_stacking', label: 'Context Stacking', hint: '适合上课前预习，先建立知识脚手架。' },
  { id: 'feynman', label: '费曼反讲', hint: '适合用自己的话复述，让 AI 帮你纠偏。' },
];

export function AgentWorkspace() {
  const [conversations, setConversations] = useState(() => loadConversations());
  const [activeConversationId, setActiveConversationId] = useState(() => loadConversations()[0]?.id || createId('conversation'));
  const [subject, setSubject] = useState('CSAPP');
  const [mode, setMode] = useState('default');
  const [messages, setMessages] = useState(() => loadConversations()[0]?.messages || []);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState('本地页面就绪');
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackByMessage, setFeedbackByMessage] = useState(() => buildFeedbackMap(loadFeedbackEvents()));
  const [learnerProfile, setLearnerProfile] = useState(() => loadLearnerProfile());
  const [pendingInteraction, setPendingInteraction] = useState(null);
  const [modeSwitchNotice, setModeSwitchNotice] = useState('');

  const latestAssistant = useMemo(() => [...messages].reverse().find((message) => message.role === 'assistant'), [messages]);
  const interactiveOptions = useMemo(
    () => getModeSpecificOptions(mode, latestAssistant?.content || ''),
    [latestAssistant, mode],
  );

  function handleAddAttachments(files) {
    const next = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || inferFileType(file.name),
      selectedAt: new Date().toISOString(),
    }));

    setAttachments((current) => [...current, ...next]);
  }

  function handleRemoveAttachment(target) {
    setAttachments((current) => current.filter((file) => file.selectedAt !== target.selectedAt || file.name !== target.name));
  }

  async function handleCopyMessage(message) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(message.content || '');
        return true;
      }

      return fallbackCopyText(message.content || '');
    } catch {
      return fallbackCopyText(message.content || '');
    }
  }

  function handleFeedback(message, rating) {
    const event = saveFeedbackEvent({
      messageId: message.id,
      conversationId: activeConversationId,
      rating,
      messageExcerpt: message.content,
      topic: extractTopicFromContent(message.content),
      mode,
      source: 'message_action',
    });
    setFeedbackByMessage((current) => ({ ...current, [message.id]: event.rating }));
    refreshLearnerProfile(conversations);
  }

  function handleSelectConversation(conversation) {
    if (isStreaming) {
      return;
    }

    setActiveConversationId(conversation.id);
    setSubject(conversation.subject || 'CSAPP');
    setMode(conversation.mode || 'default');
    setMessages(conversation.messages || []);
    setInput('');
    setAttachments([]);
    setErrorMessage('');
    setPendingInteraction(null);
    setStatus('已恢复历史对话');
  }

  function handleClearConversations() {
    if (!window.confirm('确定清空最近对话记录吗？此操作只影响本机 localStorage。')) {
      return;
    }

    clearConversations();
    setConversations([]);
    setActiveConversationId(createId('conversation'));
    setMessages([]);
    setStatus('最近对话已清空');
    refreshLearnerProfile([]);
  }

  function handleModeChange(nextMode) {
    if (nextMode === mode) {
      return;
    }

    if (isStreaming) {
      setModeSwitchNotice('当前回答生成中，请等待完成后再切换模式。');
      return;
    }

    setMode(nextMode);
    setPendingInteraction(null);
    setInput('');
    setAttachments([]);
    setErrorMessage('');
    setMessages([]);
    setActiveConversationId(createId('conversation'));
    setModeSwitchNotice(buildModeSwitchNotice(nextMode));
    setStatus('已切换模式，请重新输入或发送问题');
  }

  async function handleSend(forcedText) {
    const messageText = String(forcedText ?? input).trim();

    if (!messageText) {
      setErrorMessage('请输入要学习或追问的内容。附件只做标记，当前版本不会解析文件内容。');
      return;
    }

    const outgoingAttachments = forcedText ? [] : attachments;
    const activeInteraction = forcedText ? null : pendingInteraction;
    const userMessage = {
      id: createId('user'),
      role: 'user',
      content: messageText,
      attachments: outgoingAttachments,
      createdAt: new Date().toISOString(),
    };
    const assistantId = createId('assistant');
    const assistantMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };
    const history = messages.map(({ role, content }) => ({ role, content }));
    const repeatedQuestionStats = recordUserQuestion(messageText);

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput('');
    setAttachments([]);
    setErrorMessage('');
    setModeSwitchNotice('');
    setIsStreaming(true);
    setStatus('正在分析材料...');

    await streamAgentChat(
      {
        subject,
        mode,
        message: messageText,
        attachments: outgoingAttachments,
        history,
        requestType: activeInteraction ? 'evaluate_interaction_answer' : 'chat',
        interaction: activeInteraction,
        learnerProfile: buildLearnerProfileSummary(learnerProfile),
      },
      {
        onStatus(message) {
          if (message) {
            setStatus(message);
          }
        },
        onDelta(text) {
          appendAssistantDelta(assistantId, text);
        },
        onDone() {
          finishAssistantMessage(assistantId);
          persistCurrentConversation(assistantId);
          if (activeInteraction) {
            persistInteractionMemory(activeInteraction, messageText, assistantId);
            setPendingInteraction(null);
          }
          setStatus('回答完成，可以继续追问');
          setIsStreaming(false);
        },
        onError(error) {
          const fallback = buildClientFallback(messageText, error?.code || 'REQUEST_ERROR');
          setErrorMessage(error?.message || '请求失败，已显示本地兜底讲解。');
          replaceAssistantMessage(assistantId, fallback);
          persistCurrentConversation(assistantId, fallback);
          if (activeInteraction) {
            persistInteractionMemory(activeInteraction, messageText, assistantId, fallback);
            setPendingInteraction(null);
          }
          setStatus('后端暂不可用，已显示本地兜底讲解');
          setIsStreaming(false);
        },
      },
    );

    refreshLearnerProfile(conversations, repeatedQuestionStats);
  }

  function appendAssistantDelta(id, text) {
    setMessages((current) =>
      current.map((message) =>
        message.id === id
          ? {
              ...message,
              content: `${message.content}${text}`,
            }
          : message,
      ),
    );
  }

  function finishAssistantMessage(id) {
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, isStreaming: false } : message)));
  }

  function replaceAssistantMessage(id, content) {
    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, content, isStreaming: false } : message)),
    );
  }

  function persistCurrentConversation(assistantId, forcedAssistantContent = null) {
    setMessages((currentMessages) => {
      const completedMessages = currentMessages.map((message) =>
        message.id === assistantId
          ? {
              ...message,
              content: forcedAssistantContent ?? message.content,
              isStreaming: false,
            }
          : message,
      );
      const saved = saveConversation({
        id: activeConversationId,
        subject,
        mode,
        messages: completedMessages,
        updatedAt: new Date().toISOString(),
      });
      const nextConversations = loadConversations();
      setConversations(nextConversations);
      refreshLearnerProfile(nextConversations);
      setActiveConversationId(saved.id);
      return completedMessages;
    });
  }

  function refreshLearnerProfile(nextConversations = conversations, nextRepeatedStats = loadRepeatedQuestionStats()) {
    const profile = buildLearnerProfile({
      conversations: nextConversations,
      feedbackEvents: loadFeedbackEvents(),
      optionStats: loadOptionStats(),
      repeatedQuestionStats: nextRepeatedStats,
      interactionEvents: loadInteractionEvents(),
    });
    setLearnerProfile(saveLearnerProfile(profile));
  }

  function handleOptionSelect(option) {
    recordSelectedOption(option);
    refreshLearnerProfile();

    if (getInteractionBehavior(mode, option) === 'direct_generation') {
      setPendingInteraction(null);
      setModeSwitchNotice('');
      handleSend(option);
      return;
    }

    const sourceAssistant = latestAssistant;
    const interaction = createPendingInteraction({
      mode,
      optionText: option,
      sourceAssistantMessageId: sourceAssistant?.id || '',
      topic: extractTopicFromContent(sourceAssistant?.content || ''),
    });
    const taskMessage = {
      id: createId('assistant_task'),
      role: 'assistant',
      content: buildInteractionTaskPrompt(interaction),
      createdAt: new Date().toISOString(),
      isInteractionTask: true,
    };
    setPendingInteraction(interaction);
    setMessages((current) => [...current, taskMessage]);
    setStatus('请先完成互动任务，我会根据你的回答评价和纠偏');
    setErrorMessage('');
  }

  function persistInteractionMemory(interaction, userAnswer, assistantId, forcedEvaluation = null) {
    setMessages((currentMessages) => {
      const evaluation = forcedEvaluation ?? currentMessages.find((message) => message.id === assistantId)?.content ?? '';
      saveInteractionEvent({
        id: interaction.id,
        conversationId: activeConversationId,
        sourceAssistantMessageId: interaction.sourceAssistantMessageId,
        interactionType: interaction.interactionType,
        selectedOption: interaction.optionText,
        optionText: interaction.optionText,
        userAnswer,
        evaluationExcerpt: evaluation,
        mode: interaction.mode,
        topic: interaction.topic,
      });
      refreshLearnerProfile(loadConversations());
      return currentMessages;
    });
  }

  return (
    <div className="flex h-screen min-h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <div className="fixed right-5 top-5 z-30">
        <AnimatedThemeToggle />
      </div>
      <div className="mx-auto grid min-h-0 w-full max-w-[1600px] flex-1 gap-4 p-4 lg:grid-cols-[clamp(220px,18vw,300px)_minmax(0,1fr)_clamp(220px,20vw,320px)]">
        <SettingsSidebar
          subject={subject}
          mode={mode}
          onSubjectChange={setSubject}
          onModeChange={handleModeChange}
        />
        <ChatShell
          messages={messages}
          input={input}
          attachments={attachments}
          isStreaming={isStreaming}
          status={status}
          errorMessage={errorMessage}
          pendingInteraction={pendingInteraction}
          modeSwitchNotice={modeSwitchNotice}
          feedbackByMessage={feedbackByMessage}
          interactiveOptions={interactiveOptions}
          onInputChange={setInput}
          onAddAttachments={handleAddAttachments}
          onRemoveAttachment={handleRemoveAttachment}
          onSend={() => handleSend()}
          onCopyMessage={handleCopyMessage}
          onFeedback={handleFeedback}
          onOptionSelect={handleOptionSelect}
        />
        <ConversationHistory
          conversations={conversations}
          activeConversationId={activeConversationId}
          learnerProfile={buildLearnerProfileSummary(learnerProfile)}
          onSelect={handleSelectConversation}
          onClear={handleClearConversations}
        />
      </div>
    </div>
  );
}

function SettingsSidebar({
  subject,
  mode,
  onSubjectChange,
  onModeChange,
}) {
  const currentMode = MODES.find((item) => item.id === mode) || MODES[0];

  return (
    <aside className="hidden min-h-0 flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--panel)] shadow-2xl shadow-black/15 lg:flex">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-base font-semibold text-[var(--text)]">学习设置</h2>
        <p className="mt-1 text-[0.8125rem] text-[var(--subtle)]">左侧只保留轻量配置</p>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <Field label="学科">
          <select className="field-select" value={subject} onChange={(event) => onSubjectChange(event.target.value)}>
            {SUBJECTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="学习模式">
          <div className="space-y-2">
            {MODES.map((item) => (
              <button
                key={item.id}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  item.id === mode
                    ? 'border-teal-300/40 bg-teal-300/10 text-teal-50'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'
                }`}
                type="button"
                onClick={() => onModeChange(item.id)}
              >
                <span className="font-medium">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{item.hint}</span>
              </button>
            ))}
          </div>
        </Field>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
          <h3 className="mb-2 font-semibold text-white">当前路径</h3>
          <p>{currentMode.hint}</p>
          <p className="mt-2 text-xs text-slate-500">前端只调用本地 Express。密钥由后端环境变量提供，缺 key 时自动 fallback。</p>
          <p className="mt-2 text-xs text-slate-500">不解析 PPTX / 图片，不调用旧 parse-ppt 接口。</p>
        </section>
      </div>
    </aside>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function extractInteractiveOptions(content) {
  const marker = '## 你可以继续选择';
  const markerIndex = content.indexOf(marker);

  if (markerIndex === -1) {
    return [];
  }

  return content
    .slice(markerIndex + marker.length)
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^\d+[.)]\s*/, '').replace(/^[-*]\s*/, ''))
    .filter((line) => line && !line.startsWith('##'))
    .slice(0, 4);
}

function getModeSpecificOptions(mode, content) {
  const parsed = extractInteractiveOptions(content);
  const fallback = buildModeSpecificOptions(mode, content);

  if (mode === 'context_stacking') {
    return isContextStackingOptions(parsed) ? parsed.slice(0, 4) : fallback;
  }

  if (mode === 'feynman') {
    return isFeynmanOptions(parsed) ? parsed.slice(0, 4) : fallback;
  }

  return parsed.length >= 3 ? parsed.slice(0, 4) : fallback;
}

function buildModeSpecificOptions(mode, content = '') {
  const topic = extractTopicFromContent(content) || '这部分内容';

  if (mode === 'context_stacking') {
    return [
      '帮我建立课前预习路线',
      `找出${topic}和前置知识的连接`,
      '给我课堂验证清单',
      '预测老师可能怎么考',
    ];
  }

  if (mode === 'feynman') {
    return [
      '我来反讲，请你纠错',
      '用 12 岁小孩能懂的话解释',
      '给我一个检验理解的问题',
      '找出我最可能混淆的概念',
    ];
  }

  return [
    '展开核心概念',
    '讲考试常考点',
    '指出最容易误解的地方',
    '给我一道检查题',
  ];
}

function isContextStackingOptions(options) {
  const text = options.join(' ');
  return /预习|前置知识|课堂验证|老师可能怎么考|课前/.test(text);
}

function isFeynmanOptions(options) {
  const text = options.join(' ');
  return /反讲|纠错|12 岁|检验理解|混淆/.test(text);
}

function getInteractionBehavior(mode, optionText) {
  if (mode === 'feynman') {
    return 'user_answer_required';
  }

  if (mode === 'context_stacking') {
    return 'direct_generation';
  }

  return /我来做|我来回答|检验我|给我一道题我来做/.test(String(optionText || ''))
    ? 'user_answer_required'
    : 'direct_generation';
}

function createPendingInteraction({ mode, optionText, sourceAssistantMessageId, topic }) {
  return {
    id: createId('interaction'),
    mode,
    optionText,
    interactionType: 'user_answer_required',
    sourceAssistantMessageId,
    topic,
    createdAt: new Date().toISOString(),
  };
}

function buildInteractionTaskPrompt(interaction) {
  const option = interaction.optionText;

  if (interaction.mode === 'context_stacking') {
    if (/预习路线/.test(option)) {
      return '## 互动任务\n请你先说明目前对这一章前置知识的掌握程度，用 2-3 句话写出来。我会根据你的回答校正并补全课前预习路线。';
    }
    if (/前置知识|连接/.test(option)) {
      return '## 互动任务\n请你先写出你认为它和前面哪一章或哪个概念有关。我会帮你判断连接是否准确，并指出需要补的知识。';
    }
    if (/课堂验证/.test(option)) {
      return '## 互动任务\n请你先列出上课最想验证的 2 个问题。我会把它们补全成课堂验证清单。';
    }
    if (/怎么考|考/.test(option)) {
      return '## 互动任务\n请你先尝试说一个可能出现的考题方向。我会根据材料修正，并扩展成更像老师会考的版本。';
    }
    return '## 互动任务\n请你先写下你对这部分内容的预习判断，我会帮你校正前置知识和课堂关注点。';
  }

  if (interaction.mode === 'feynman') {
    if (/反讲|纠错/.test(option)) {
      return '## 互动任务\n请你用自己的话反讲这个概念。可以不完美，我会根据你的表达指出准确点、偏差和下一步修正建议。';
    }
    if (/12 岁/.test(option)) {
      return '## 互动任务\n请你先试着用 12 岁小孩也能懂的话解释这个概念。我会判断哪里还像背术语，哪里可以更清楚。';
    }
    if (/检验理解|问题/.test(option)) {
      return '## 互动任务\n请先回答这个检查题：如果把这个概念换到一个新例子里，你会如何判断它是否仍然成立？';
    }
    if (/混淆/.test(option)) {
      return '## 互动任务\n请你先说说你认为这几个相关概念的区别。我会判断你可能混淆在哪里。';
    }
    return '## 互动任务\n请你先用自己的话解释一次，我会按费曼反讲标准帮你纠错。';
  }

  if (/考|检查题|题/.test(option)) {
    return '## 互动任务\n请你先尝试回答一个小检查：这个知识点最容易考察的关键判断是什么？我会评价你的回答。';
  }

  return '## 互动任务\n请你先写下自己的理解或答案，我会根据你的表达进行评价、纠错和补充。';
}

function buildModeSwitchNotice(nextMode) {
  if (nextMode === 'context_stacking') {
    return '已切换到 Context Stacking 超前学习。请重新输入或发送材料，我会主动生成预习路线、前置连接、课堂验证清单和可能考法。';
  }

  if (nextMode === 'feynman') {
    return '已切换到费曼反讲。请重新输入或发送问题，我会先建立摘要框架，再引导你反讲并进行纠错。';
  }

  return '已切换到默认知识解析。请重新输入或发送问题，我会按总结、框架、核心概念和交互选项重新生成。';
}

function buildClientFallback(messageText, reason) {
  const topic = messageText.length > 22 ? `${messageText.slice(0, 22)}...` : messageText;

  return `## 总结
**${topic}** 可以先按“问题背景 → 核心机制 → 边界条件 → 应用验证”的顺序学习。当前后端请求失败，页面已使用本地兜底讲解，原因：${reason}。

## 框架
1. 明确这个知识点解决什么问题。
2. 找到输入、过程、输出三段结构。
3. 标记容易混淆的概念边界。
4. 用一道小题检查能否迁移。

## 5 个核心概念
1. **问题背景（problem context）**：知识点存在是为了解决具体限制。
2. **核心机制（core mechanism）**：用最少步骤描述它如何工作。
3. **边界条件（boundary condition）**：说明什么时候会失效或变形。
4. **常见误区（misconception）**：提前暴露容易答错的位置。
5. **迁移检查（transfer check）**：把概念换到新例子里验证理解。

## 你可以继续选择
1. 展开核心概念。
2. 讲考试常考点。
3. 指出最容易误解的地方。
4. 给我一道检查题。`;
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function inferFileType(name) {
  const extension = String(name || '').split('.').pop()?.toLowerCase();
  return extension ? `file/${extension}` : 'unknown';
}

function buildFeedbackMap(events) {
  return events.reduce((map, event) => {
    if (event.messageId) {
      map[event.messageId] = event.rating;
    }
    return map;
  }, {});
}

function fallbackCopyText(text) {
  if (typeof document === 'undefined') {
    return false;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

function extractTopicFromContent(content) {
  const firstHeading = String(content || '').match(/^##\s+(.+)$/m)?.[1];
  if (firstHeading && firstHeading !== '总结') {
    return firstHeading.slice(0, 80);
  }

  return String(content || '').replace(/[#*_`>]/g, '').trim().slice(0, 80);
}
