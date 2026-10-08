import { useEffect, useMemo, useState } from 'react';
import {
  buildLearnerProfile,
  buildLearnerProfileSummary,
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
import { RippleButton } from '../../components/ui/ripple-button.jsx';
import { getCurrentPath, getCurrentSearchParams } from '../../routes/navigation.js';
import { streamAgentChat } from './agentChatApi.js';
import { ChatShell } from './ChatShell.jsx';
import { CurrentQuestionIndex } from './CurrentQuestionIndex.jsx';

const SUBJECTS = [
  { id: 'CSAPP', label: 'CSAPP' },
  { id: 'DATA_STRUCTURES', label: '数据结构' },
];

const MODES = [
  { id: 'default', label: '默认知识解析', hint: '根据真实问题动态组织回答，不机械套模板。' },
  { id: 'context_stacking', label: 'Context Stacking', hint: '主动搭建预习路线、前置连接、课堂验证和可能考法。' },
  { id: 'feynman', label: '费曼反讲', hint: '先让你用自己的话解释，再评价、纠偏和追问。' },
];

export function AgentWorkspace() {
  const routeState = useMemo(() => readRouteState(), []);
  const initialConversation = useMemo(() => findConversationById(routeState.conversationId), [routeState.conversationId]);
  const [conversations, setConversations] = useState(() => loadConversations());
  const [activeConversationId, setActiveConversationId] = useState(() => initialConversation?.id || createId('conversation'));
  const [subject, setSubject] = useState(initialConversation?.subject || 'CSAPP');
  const [mode, setMode] = useState(initialConversation?.mode || routeState.mode || 'default');
  const [messages, setMessages] = useState(() => initialConversation?.messages || []);
  const [input, setInput] = useState(() => routeState.concept ? `围绕「${routeState.concept}」开始一次新的学习。` : '');
  const [attachments, setAttachments] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState(initialConversation ? '已恢复历史对话' : '新的空对话已就绪');
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackByMessage, setFeedbackByMessage] = useState(() => buildFeedbackMap(loadFeedbackEvents()));
  const [learnerProfile, setLearnerProfile] = useState(() => loadLearnerProfile());
  const [pendingInteraction, setPendingInteraction] = useState(null);
  const [modeSwitchNotice, setModeSwitchNotice] = useState(routeState.concept ? `将围绕「${routeState.concept}」开始新的学习，不会恢复旧对话。` : '');
  const [scrollTargetId, setScrollTargetId] = useState('');
  const [activeQuestionId, setActiveQuestionId] = useState('');

  const latestAssistant = useMemo(() => [...messages].reverse().find((message) => message.role === 'assistant'), [messages]);
  const userQuestionIndex = useMemo(() => buildCurrentQuestionIndex(messages), [messages]);
  const interactiveOptions = useMemo(
    () => dedupeOptions(getModeSpecificOptions(mode, latestAssistant?.content || '')),
    [latestAssistant, mode],
  );

  useEffect(() => {
    function handleRouteChange() {
      if (getCurrentPath() !== '/chat') return;
      if (isStreaming) return;
      applyRouteState(readRouteState());
    }

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [isStreaming]);

  function applyRouteState(nextRouteState) {
    const conversation = findConversationById(nextRouteState.conversationId);

    if (conversation) {
      setActiveConversationId(conversation.id);
      setSubject(conversation.subject || 'CSAPP');
      setMode(conversation.mode || 'default');
      setMessages(conversation.messages || []);
      setActiveQuestionId(findLastUserMessageId(conversation.messages || []));
      setInput('');
      setAttachments([]);
      setPendingInteraction(null);
      setModeSwitchNotice('');
      setErrorMessage('');
      setStatus('已恢复历史对话');
      window.requestAnimationFrame(() => setScrollTargetId('__bottom__'));
      return;
    }

    setActiveConversationId(createId('conversation'));
    setSubject('CSAPP');
    setMode(nextRouteState.mode || 'default');
    setMessages([]);
    setActiveQuestionId('');
    setInput(nextRouteState.concept ? `围绕「${nextRouteState.concept}」开始一次新的学习。` : '');
    setAttachments([]);
    setPendingInteraction(null);
    setErrorMessage('');
    setModeSwitchNotice(nextRouteState.concept ? `将围绕「${nextRouteState.concept}」开始新的学习，不会恢复旧对话。` : '');
    setStatus('新的空对话已就绪');
  }

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
    refreshLearnerProfile(loadConversations());
  }

  function handleModeChange(nextMode) {
    if (nextMode === mode) return;
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
    setActiveQuestionId('');
    setActiveConversationId(createId('conversation'));
    setModeSwitchNotice(buildModeSwitchNotice(nextMode));
    setStatus('已切换模式，新的空对话已就绪');
  }

  async function handleSend(forcedText) {
    const messageText = String(forcedText ?? input).trim();
    if (!messageText) {
      setErrorMessage('请输入要学习或追问的内容。附件只做 metadata 标记，当前主路径不会解析文件内容。');
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
    setActiveQuestionId(userMessage.id);
    setScrollTargetId('__bottom__');
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
          if (message) setStatus(message);
        },
        onDelta(text) {
          appendAssistantDelta(assistantId, text);
          setScrollTargetId('__bottom_if_near__');
        },
        onDone() {
          finishAssistantMessage(assistantId);
          persistConversation(assistantId);
          if (activeInteraction) {
            persistInteractionMemory(activeInteraction, messageText, assistantId);
            setPendingInteraction(null);
          }
          setStatus('回答完成，可以继续追问');
          setIsStreaming(false);
          setScrollTargetId('__bottom__');
        },
        onError(error) {
          const fallback = buildClientFallback({ messageText, mode, reason: error?.code || 'REQUEST_ERROR', interaction: activeInteraction });
          setErrorMessage(error?.message || '请求失败，已显示本地 fallback。');
          replaceAssistantMessage(assistantId, fallback);
          persistConversation(assistantId, fallback);
          if (activeInteraction) {
            persistInteractionMemory(activeInteraction, messageText, assistantId, fallback);
            setPendingInteraction(null);
          }
          setStatus('后端暂不可用，已显示本地 fallback');
          setIsStreaming(false);
          setScrollTargetId('__bottom__');
        },
      },
    );

    refreshLearnerProfile(loadConversations(), repeatedQuestionStats);
  }

  function appendAssistantDelta(id, text) {
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, content: `${message.content}${text}` } : message)));
  }

  function finishAssistantMessage(id) {
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, isStreaming: false } : message)));
  }

  function replaceAssistantMessage(id, content) {
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, content, isStreaming: false } : message)));
  }

  function persistConversation(assistantId, forcedAssistantContent = null) {
    setMessages((currentMessages) => {
      const completedMessages = currentMessages.map((message) =>
        message.id === assistantId ? { ...message, content: forcedAssistantContent ?? message.content, isStreaming: false } : message,
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
    setScrollTargetId('__bottom__');
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
    <div className="h-full w-full overflow-hidden bg-transparent text-[var(--text-primary)]">
      <div className="flex h-full w-full gap-6 p-6">
        <div className="hidden w-72 shrink-0 xl:flex">
          <CurrentQuestionIndex
            questions={userQuestionIndex}
            activeMessageId={activeQuestionId}
            onSelect={(messageId) => {
              setActiveQuestionId(messageId);
              setScrollTargetId(messageId);
            }}
          />
        </div>

        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <ModeBar subject={subject} mode={mode} isStreaming={isStreaming} onSubjectChange={setSubject} onModeChange={handleModeChange} />
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
            scrollTargetId={scrollTargetId}
            onInputChange={setInput}
            onAddAttachments={handleAddAttachments}
            onRemoveAttachment={handleRemoveAttachment}
            onSend={() => handleSend()}
            onCopyMessage={handleCopyMessage}
            onFeedback={handleFeedback}
            onOptionSelect={handleOptionSelect}
            onScrollHandled={() => setScrollTargetId('')}
          />
        </section>

        <SettingsSidebar subject={subject} mode={mode} onSubjectChange={setSubject} onModeChange={handleModeChange} />
      </div>
    </div>
  );
}

function ModeBar({ subject, mode, isStreaming, onSubjectChange, onModeChange }) {
  return (
    <div className="mx-auto flex w-fit max-w-full shrink-0 items-center gap-2 overflow-x-auto rounded-full border border-[var(--border-soft)] bg-[var(--panel-bg)] p-1 shadow-lg shadow-black/10 backdrop-blur">
      <select
        className="h-10 shrink-0 rounded-full border border-transparent bg-[var(--panel-strong)] px-3 text-sm text-[var(--text-primary)] outline-none"
        value={subject}
        onChange={(event) => onSubjectChange(event.target.value)}
        disabled={isStreaming}
        aria-label="选择学科"
      >
        {SUBJECTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      {MODES.map((item) => (
        <RippleButton
          key={item.id}
          className={`h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-sm transition ${
            item.id === mode
              ? 'bg-[var(--text-primary)] text-[var(--app-bg)]'
              : 'text-[var(--text-secondary)] hover:bg-[var(--panel-strong)] hover:text-[var(--text-primary)]'
          }`}
          type="button"
          disabled={isStreaming}
          onClick={() => onModeChange(item.id)}
          title={item.hint}
        >
          {item.label}
        </RippleButton>
      ))}
    </div>
  );
}

function SettingsSidebar({ subject, mode, onSubjectChange, onModeChange }) {
  const currentMode = MODES.find((item) => item.id === mode) || MODES[0];

  return (
    <aside className="hidden min-h-0 w-80 shrink-0 flex-col overflow-hidden rounded-[24px] border border-[var(--border-soft)] bg-[var(--panel-bg)] shadow-2xl shadow-black/15 2xl:flex">
      <div className="border-b border-[var(--border-soft)] px-5 py-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">学习设置</h2>
        <p className="mt-1 text-[0.8125rem] text-[var(--text-muted)]">只保留学科与模式，不提供前端密钥配置。</p>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <Field label="学科">
          <select className="field-select" value={subject} onChange={(event) => onSubjectChange(event.target.value)}>
            {SUBJECTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </Field>

        <Field label="学习模式">
          <div className="space-y-2">
            {MODES.map((item) => (
              <RippleButton
                key={item.id}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  item.id === mode
                    ? 'border-[var(--accent-blue)] bg-[var(--accent-soft)] text-[var(--text-primary)]'
                    : 'border-[var(--border-soft)] bg-[var(--panel-strong)] text-[var(--text-secondary)] hover:border-[var(--accent-blue)]'
                }`}
                type="button"
                onClick={() => onModeChange(item.id)}
              >
                <span className="font-medium">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">{item.hint}</span>
              </RippleButton>
            ))}
          </div>
        </Field>

        <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-strong)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
          <h3 className="mb-2 font-semibold text-[var(--text-primary)]">当前路径</h3>
          <p>{currentMode.hint}</p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">前端只调用本地 Express。真实 API Key 由后端环境变量提供，缺 key 时自动 fallback。</p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">PPTX / 图片只保存 metadata，不调用旧 parse-ppt 接口。</p>
        </section>
      </div>
    </aside>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">{label}</span>
      {children}
    </label>
  );
}

function extractInteractiveOptions(content) {
  const markers = ['## 你可以继续选择', '## 可继续选择', '## 下一步选择'];
  const marker = markers.find((item) => content.includes(item));
  if (!marker) return [];

  return content
    .slice(content.indexOf(marker) + marker.length)
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^\d+[.)、]\s*/, '').replace(/^[-*]\s*/, ''))
    .filter((line) => line && !line.startsWith('##'))
    .slice(0, 8);
}

function getModeSpecificOptions(mode, content) {
  const parsed = extractInteractiveOptions(content);
  const fallback = buildModeSpecificOptions(mode, content);
  const merged = parsed.length >= 3 ? parsed : [...parsed, ...fallback];
  return dedupeOptions(merged).slice(0, 4);
}

function buildModeSpecificOptions(mode, content = '') {
  const topic = extractTopicFromContent(content) || '这部分内容';
  if (mode === 'context_stacking') {
    return ['帮我建立课前预习路线', `找出${topic}和前置知识的连接`, '给我课堂验证清单', '预测老师可能怎么考'];
  }
  if (mode === 'feynman') {
    return ['我来反讲，请你纠错', '用 12 岁小孩也能懂的话解释', '给我一个检验理解的问题', '找出我最可能混淆的概念'];
  }
  return ['展开核心概念', '讲考试常考点', '指出最容易误解的地方', '给我一道检查题'];
}

function dedupeOptions(options = []) {
  const seen = new Set();
  const result = [];
  for (const option of options) {
    const normalized = normalizeOptionText(option);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(option);
  }
  return result;
}

function normalizeOptionText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/^\s*\d+[.)、]\s*/, '')
    .replace(/[，。！？、,.!?;；:\s]/g, '')
    .trim();
}

function getInteractionBehavior(mode, optionText) {
  if (mode === 'feynman') return 'user_answer_required';
  if (mode === 'context_stacking') return 'direct_generation';
  return /我来|我先|检查题|作答|回答/.test(String(optionText || '')) ? 'user_answer_required' : 'direct_generation';
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
  if (interaction.mode === 'feynman') {
    return '## 互动任务\n请你先用自己的话解释这个概念。不要背定义，可以讲得不完美。我会从准确点、思维漏洞、概念混淆、改写建议和下一步追问来评价。';
  }
  return '## 互动任务\n请先写下你的理解或答案，我会根据你的表达进行评价、纠错和补充。';
}

function buildModeSwitchNotice(nextMode) {
  if (nextMode === 'context_stacking') {
    return '已切换到 Context Stacking。我会主动生成预习路线、前置连接、课堂验证清单、可能考法和学习风险点。';
  }
  if (nextMode === 'feynman') {
    return '已切换到费曼反讲。请先用自己的话解释，我会评价、找漏洞、指出混淆并给改写建议。';
  }
  return '已切换到默认知识解析。我会根据你的真实问题动态组织回答。';
}

function buildClientFallback({ messageText, mode, reason, interaction }) {
  if (interaction || mode === 'feynman') {
    return `## 评价
当前为本地 fallback，原因：${reason}。请先保留你的原始表达，我会按费曼反讲的方式检查它是否真正讲清楚。

## 准确点
你已经开始用自己的话表达，而不是只等待答案。

## 思维漏洞
如果只说结论、不解释为什么成立，听的人仍然无法迁移到新题。

## 概念混淆
最常见的混淆是把术语名称当成本质，把例子当成定义。

## 如何改写
用三句话重写：它解决什么问题；它如何工作；它在什么情况下会失效。

## 下一步追问
请用一个具体例子重新解释，并说明这个例子为什么能代表该概念。`;
  }

  if (mode === 'context_stacking') {
    return `## 预习路线
当前为本地 fallback，原因：${reason}。先把「${messageText.slice(0, 28)}」放进课前脚手架：先看问题背景，再补前置概念，最后带着验证问题进入课堂。

## 前置知识连接
把它和上周学过的抽象数据类型、数组/链表、复杂度分析连接起来，重点看“为什么需要这种结构”。

## 课堂验证清单
1. 老师是否强调冲突处理或边界情况。
2. 是否出现平均复杂度与最坏复杂度的对比。
3. 是否要求手推一个小例子。

## 可能考法
常见考法会让你分析插入、查找、冲突处理和复杂度退化。

## 学习风险点
不要只记接口名，要能解释结构选择背后的代价。`;
  }

  return `## 学习主线
当前为本地 fallback，原因：${reason}。我会按你的问题动态回答，而不是固定套“四段模板”。

## 一、学习框架
先确认这个知识点解决什么问题，再看核心机制、边界条件和迁移场景。

## 二、核心概念
围绕「${messageText.slice(0, 28)}」至少要抓住：问题背景、数据组织、操作流程、复杂度、边界误区。

## 三、与旧知识的关系
把它和上周学过的基础结构、复杂度分析、内存模型或抽象数据类型连接起来。

## 四、教给零基础的人
先用生活类比建立直觉，再用一个小例子演示操作，最后再引入术语。

## 五、下一步建议
拿一道小题检查你是否能从定义迁移到具体判断。`;
}

function buildCurrentQuestionIndex(messages) {
  return messages
    .filter((message) => message.role === 'user')
    .map((message, index) => ({
      id: message.id,
      index: index + 1,
      label: String(message.content || '').replace(/\s+/g, ' ').trim().slice(0, 42) || `问题 ${index + 1}`,
      createdAt: message.createdAt,
    }));
}

function findLastUserMessageId(messages = []) {
  return [...messages].reverse().find((message) => message.role === 'user')?.id || '';
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function inferFileType(name) {
  const extension = String(name || '').split('.').pop()?.toLowerCase();
  return extension ? `file/${extension}` : 'unknown';
}

function readRouteState() {
  if (typeof window === 'undefined') return { conversationId: '', concept: '', mode: '' };
  const params = getCurrentSearchParams();
  const mode = params.get('mode') || '';
  return {
    conversationId: params.get('conversationId') || '',
    concept: params.get('concept') || '',
    mode: ['default', 'context_stacking', 'feynman'].includes(mode) ? mode : '',
  };
}

function findConversationById(conversationId) {
  if (!conversationId) return null;
  return loadConversations().find((conversation) => conversation.id === conversationId) || null;
}

function buildFeedbackMap(events) {
  return events.reduce((map, event) => {
    if (event.messageId) map[event.messageId] = event.rating;
    return map;
  }, {});
}

function fallbackCopyText(text) {
  if (typeof document === 'undefined') return false;
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
  if (firstHeading && firstHeading !== '总结') return firstHeading.slice(0, 80);
  return String(content || '').replace(/[#*_`>]/g, '').trim().slice(0, 80);
}

export const __agentWorkspaceTestUtils = {
  dedupeOptions,
  normalizeOptionText,
  buildCurrentQuestionIndex,
  getModeSpecificOptions,
};
