import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { streamAgentChat } from '../src/features/agent-chat/agentChatApi.js';

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

global.window = {
  localStorage: createMemoryStorage(),
};

const {
  buildLearnerProfile,
  buildLearnerProfileSummary,
  loadInteractionEvents,
  loadConversations,
  recordSelectedOption,
  recordUserQuestion,
  saveConversation,
  saveFeedbackEvent,
  saveInteractionEvent,
} = await import('../src/shared/storage/agentMemoryStorage.js');

const sources = {
  agentWorkspace: readSource('../src/features/agent-chat/AgentWorkspace.jsx'),
  chatShell: readSource('../src/features/agent-chat/ChatShell.jsx'),
  chatComposer: readSource('../src/features/agent-chat/ChatComposer.jsx'),
  chatMessage: readSource('../src/features/agent-chat/ChatMessage.jsx'),
  currentQuestionIndex: readSource('../src/features/agent-chat/CurrentQuestionIndex.jsx'),
  appShell: readSource('../src/app/AppShell.jsx'),
  sidebarNav: readSource('../src/app/SidebarNav.jsx'),
  homePage: readSource('../src/pages/HomePage.jsx'),
  learningCalendar: readSource('../src/features/home/LearningCalendar.jsx'),
};

assert.match(sources.chatMessage, /MessageActions/, 'ChatMessage should render MessageActions');
assert.match(sources.agentWorkspace, /CurrentQuestionIndex/, 'AgentWorkspace should render current-conversation question index');
assert.doesNotMatch(sources.agentWorkspace, /<ConversationHistory\b/, 'AgentWorkspace should not render global conversation history in /chat');
assert.match(sources.agentWorkspace, /activeQuestionId/, 'AgentWorkspace should keep active question highlight state');
assert.match(sources.currentQuestionIndex, /questions = \[\]/, 'CurrentQuestionIndex should accept question list');
assert.match(sources.currentQuestionIndex, /onSelect\(question\.id\)/, 'CurrentQuestionIndex should jump to selected question');
assert.match(sources.chatShell, /scrollTargetId/, 'ChatShell should accept scroll target id');
assert.match(sources.chatShell, /__bottom_if_near__/, 'ChatShell should support near-bottom streaming follow');
assert.match(sources.chatShell, /scrollIntoView/, 'ChatShell should scroll to restored history or selected question');
assert.doesNotMatch(sources.appShell, /max-w-\[1440px\]|max-w-4xl|max-w-\[920px\]/, 'AppShell should not constrain app pages with a narrow max width');
assert.match(sources.appShell, /pl-16/, 'AppShell should keep fixed nav offset without squeezing /chat');
assert.match(sources.appShell + sources.sidebarNav, /AnimatedThemeToggle/, 'App shell should keep theme toggle');
assert.doesNotMatch(sources.sidebarNav, /text-white|bg-\[#0d1117\]/, 'SidebarNav should use theme variables instead of hardcoded dark text');
assert.doesNotMatch(sources.chatComposer, /max-w-6xl|text-white|border-white/, 'ChatComposer should stay wide and use theme variables');
assert.doesNotMatch(sources.homePage, /window\.prompt/, 'Home calendar should not use prompt for event editing');
assert.match(sources.homePage, /SelectedDateEvents/, 'Home page should render selected date event panel');
assert.match(sources.homePage, /handleEditEvent/, 'Home page should support inline event editing');
assert.match(sources.homePage, /handleDeleteEvent/, 'Home page should support event deletion');
assert.match(sources.learningCalendar, /isSelected/, 'Calendar should track selected date state');
assert.match(sources.learningCalendar, /hasEvent/, 'Calendar should track event date state');
assert.match(sources.learningCalendar, /isToday/, 'Calendar should track today state');
assert.match(sources.agentWorkspace, /pendingInteraction/, 'AgentWorkspace should include pending interaction state');
assert.match(sources.agentWorkspace, /createPendingInteraction/, 'AgentWorkspace should create pending interactions on option click');
assert.match(sources.agentWorkspace, /buildInteractionTaskPrompt/, 'AgentWorkspace should show user-answer-required task prompts');
assert.match(sources.agentWorkspace, /getModeSpecificOptions/, 'AgentWorkspace should provide mode-specific options fallback');
assert.match(sources.agentWorkspace, /getInteractionBehavior/, 'AgentWorkspace should choose interaction behavior by mode');
assert.ok(
  sources.agentWorkspace.includes("if (mode === 'context_stacking')") && sources.agentWorkspace.includes("return 'direct_generation';"),
  'Context Stacking options should direct-generate instead of pending interaction',
);
assert.ok(
  sources.agentWorkspace.includes("if (mode === 'feynman')") && sources.agentWorkspace.includes("return 'user_answer_required';"),
  'Feynman options should require user answer',
);
assert.match(sources.agentWorkspace, /handleModeChange/, 'AgentWorkspace should have explicit mode-change handler');
assert.ok(sources.agentWorkspace.includes('setPendingInteraction(null)'), 'mode change should clear pending interaction');
assert.match(sources.agentWorkspace, /buildModeSwitchNotice/, 'mode change should show re-input notice');
assert.ok(sources.agentWorkspace.includes("setActiveConversationId(createId('conversation'))"), 'mode change should start a fresh conversation boundary');
assert.match(sources.agentWorkspace, /预习路线/, 'Context Stacking fallback should include preview route');
assert.match(sources.agentWorkspace, /前置知识/, 'Context Stacking fallback should include prerequisites');
assert.match(sources.agentWorkspace, /课堂验证清单/, 'Context Stacking fallback should include classroom checklist');
assert.match(sources.agentWorkspace, /可能考法/, 'Context Stacking fallback should include exam prediction');
assert.match(sources.agentWorkspace, /evaluate_interaction_answer/, 'AgentWorkspace should send evaluation request type for pending interactions');
assert.doesNotMatch(
  sources.agentWorkspace,
  /loadAiConfig|saveAiConfig|TEXT_GENERATION_API_KEY|apiKey\s*[:=]|provider\s*[:=]\s*input|model\s*[:=]\s*input/i,
  'new AgentWorkspace should not expose AI configuration or API key fields',
);
assert.doesNotMatch(
  sources.agentWorkspace,
  /requestPptParsing|parsePpt\s*\(|fetch\([^)]*\/api\/parse-ppt/,
  'new AgentWorkspace should not call PPT parsing',
);

const feedback = saveFeedbackEvent({
  messageId: 'assistant_1',
  conversationId: 'conversation_1',
  rating: 'positive',
  messageExcerpt: '## 总结\n缓存未命中（cache miss）会触发更慢层级的数据访问。',
  mode: 'default',
});
assert.equal(feedback.rating, 'positive', 'feedback helper should save positive rating');

saveConversation({
  id: 'conversation_1',
  subject: 'CSAPP',
  mode: 'default',
  messages: [
    { id: 'user_1', role: 'user', content: '考试会怎么考缓存未命中（cache miss）？', createdAt: 'now' },
    { id: 'assistant_1', role: 'assistant', content: '## 总结\n缓存未命中（cache miss）需要从更慢层级取数据。', createdAt: 'now' },
  ],
});
assert.equal(loadConversations().length, 1, 'conversation helper should persist conversations');

const repeatedStats = recordUserQuestion('考试会怎么考缓存未命中（cache miss）？');
recordUserQuestion('考试会怎么考缓存未命中（cache miss）？');
const optionStats = recordSelectedOption('讲考试常考点。');
const profile = buildLearnerProfile({
  conversations: loadConversations(),
  feedbackEvents: [feedback],
  optionStats,
  repeatedQuestionStats: repeatedStats,
  interactionEvents: [
    saveInteractionEvent({
      conversationId: 'conversation_1',
      optionText: '我来反讲，请你纠错。',
      userAnswer: '缓存就是快一点的内存。',
      evaluationExcerpt: '## 主要偏差\n混淆缓存（cache）和内存（memory）。',
      mode: 'feynman',
      topic: '缓存（cache）',
    }),
  ],
});
const profileSummary = buildLearnerProfileSummary(profile);
assert.ok(profile.totalMessages >= 2, 'learner profile should count messages');
assert.match(profileSummary.recentFeedbackSummary, /正反馈/, 'learner profile summary should include feedback summary');
assert.equal(loadInteractionEvents().length, 1, 'interaction helper should persist evaluation events');

const calls = [];

global.fetch = async (url, options = {}) => {
  calls.push({ url, options });

  if (url.endsWith('/error')) {
    return new Response(JSON.stringify({ ok: false, data: null, error: { code: 'VALIDATION_ERROR', message: '请输入内容。' } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(createAgentStream(), {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
};

const events = [];
await streamAgentChat(
  {
    subject: 'CSAPP',
    mode: 'default',
    message: '解释缓存未命中（cache miss）。',
    attachments: [{ name: 'lecture.pptx', size: 2048, type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', selectedAt: 'now' }],
    history: [],
    learnerProfile: profileSummary,
  },
  {
    onStatus: (message) => events.push({ type: 'status', message }),
    onDelta: (text) => events.push({ type: 'delta', text }),
    onDone: () => events.push({ type: 'done' }),
  },
);

assert.equal(calls[0].url, 'http://localhost:3001/api/agent/chat/stream', 'agent client should call stream endpoint');
assert.equal(calls[0].options.method, 'POST', 'agent client should use POST');
const body = JSON.parse(calls[0].options.body);
assert.equal(body.mode, 'default', 'agent client should send selected mode');
assert.ok(body.learnerProfile, 'agent client should send learner profile summary');
assert.ok(!Object.prototype.hasOwnProperty.call(body, 'aiConfig'), 'agent client should not send frontend AI config');
assert.equal(body.attachments[0].name, 'lecture.pptx', 'agent client should send attachment metadata');
assert.ok(!Object.prototype.hasOwnProperty.call(body.attachments[0], 'content'), 'agent client should not send attachment content');
assert.ok(events.some((event) => event.type === 'status'), 'agent client should parse status event');
assert.ok(events.some((event) => event.type === 'delta' && event.text.includes('## 总结')), 'agent client should parse delta event');
assert.ok(events.some((event) => event.type === 'done'), 'agent client should parse done event');

console.log('Agent Chat client verification passed.');

function readSource(path) {
  return readFileSync(new URL(path, import.meta.url), 'utf8');
}

function createAgentStream() {
  const encoder = new TextEncoder();
  const chunks = [
    'data: {"type":"status","message":"正在分析材料..."}\n\n',
    'data: {"type":"delta","text":"## 总结\\n缓存未命中（cache miss）需要从更慢层级取数据。"}\n\n',
    'data: {"type":"done"}\n\n',
  ];

  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}
