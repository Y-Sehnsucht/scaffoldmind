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

const agentWorkspaceSource = readFileSync(new URL('../src/features/agent-chat/AgentWorkspace.jsx', import.meta.url), 'utf8');
const chatMessageSource = readFileSync(new URL('../src/features/agent-chat/ChatMessage.jsx', import.meta.url), 'utf8');

assert.match(chatMessageSource, /MessageActions/, 'ChatMessage should render MessageActions');
assert.match(agentWorkspaceSource, /ConversationHistory/, 'AgentWorkspace should render ConversationHistory');
assert.match(agentWorkspaceSource, /AnimatedThemeToggle/, 'AgentWorkspace should render AnimatedThemeToggle');
assert.match(agentWorkspaceSource, /pendingInteraction/, 'AgentWorkspace should include pending interaction state');
assert.match(agentWorkspaceSource, /createPendingInteraction/, 'AgentWorkspace should create pending interactions on option click');
assert.match(agentWorkspaceSource, /buildInteractionTaskPrompt/, 'AgentWorkspace should show user-answer-required task prompts');
assert.match(agentWorkspaceSource, /getModeSpecificOptions/, 'AgentWorkspace should provide mode-specific options fallback');
assert.match(agentWorkspaceSource, /getInteractionBehavior/, 'AgentWorkspace should choose interaction behavior by mode');
assert.ok(
  agentWorkspaceSource.includes("if (mode === 'context_stacking')") && agentWorkspaceSource.includes("return 'direct_generation';"),
  'Context Stacking options should direct-generate instead of pending interaction',
);
assert.ok(
  agentWorkspaceSource.includes("if (mode === 'feynman')") && agentWorkspaceSource.includes("return 'user_answer_required';"),
  'Feynman options should require user answer',
);
assert.match(agentWorkspaceSource, /handleModeChange/, 'AgentWorkspace should have explicit mode-change handler');
assert.ok(agentWorkspaceSource.includes('setPendingInteraction(null)'), 'mode change should clear pending interaction');
assert.match(agentWorkspaceSource, /buildModeSwitchNotice/, 'mode change should show re-input notice');
assert.ok(agentWorkspaceSource.includes("setActiveConversationId(createId('conversation'))"), 'mode change should start a fresh conversation boundary');
assert.match(agentWorkspaceSource, /课前预习路线/, 'Context Stacking fallback should include preview route');
assert.match(agentWorkspaceSource, /前置知识/, 'Context Stacking fallback should include prerequisites');
assert.match(agentWorkspaceSource, /课堂验证清单/, 'Context Stacking fallback should include classroom checklist');
assert.match(agentWorkspaceSource, /老师可能怎么考/, 'Context Stacking fallback should include exam prediction');
assert.match(agentWorkspaceSource, /evaluate_interaction_answer/, 'AgentWorkspace should send evaluation request type for pending interactions');
assert.doesNotMatch(agentWorkspaceSource, /API Key|Provider|API URL|loadAiConfig|saveAiConfig|apiKey/, 'new AgentWorkspace should not expose AI configuration or API key fields');
assert.doesNotMatch(agentWorkspaceSource, /parsePpt|requestPptParsing|\/api\/parse-ppt/, 'new AgentWorkspace should not call PPT parsing');

const feedback = saveFeedbackEvent({
  messageId: 'assistant_1',
  conversationId: 'conversation_1',
  rating: 'positive',
  messageExcerpt: '## 总结\n缓存未命中（cache miss）',
  mode: 'default',
});
assert.equal(feedback.rating, 'positive', 'feedback helper should save positive rating');

saveConversation({
  id: 'conversation_1',
  subject: 'CSAPP',
  mode: 'default',
  messages: [
    { id: 'user_1', role: 'user', content: '考试会怎么考缓存未命中（cache miss）？', createdAt: 'now' },
    { id: 'assistant_1', role: 'assistant', content: '## 总结\n缓存未命中（cache miss）', createdAt: 'now' },
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
      optionText: '我来反讲，请你纠错',
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

function createAgentStream() {
  const encoder = new TextEncoder();
  const chunks = [
    'data: {"type":"status","message":"正在分析材料..."}\n\n',
    'data: {"type":"delta","text":"## 总结\\n缓存未命中（cache miss）需要从更慢层级取数据。"}\n\n',
    'data: {"type":"done"}\n\n',
  ];

  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}
