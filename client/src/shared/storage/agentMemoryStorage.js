import { loadJson, saveJson } from './localStorage.js';

export const AGENT_MEMORY_KEYS = {
  conversations: 'scaffoldmind.agent.conversations',
  feedback: 'scaffoldmind.agent.feedback',
  profile: 'scaffoldmind.agent.profile',
  optionStats: 'scaffoldmind.agent.optionStats',
  repeatedQuestions: 'scaffoldmind.agent.repeatedQuestions',
  interactionEvents: 'scaffoldmind.agent.interactions',
  theme: 'scaffoldmind.agent.theme',
};

export function loadFeedbackEvents() {
  return loadJson(AGENT_MEMORY_KEYS.feedback, []);
}

export function loadConversations() {
  return loadJson(AGENT_MEMORY_KEYS.conversations, []);
}

export function saveConversation(conversation) {
  const normalized = normalizeConversation(conversation);
  const conversations = loadConversations();
  const withoutCurrent = conversations.filter((item) => item.id !== normalized.id);
  const nextConversations = [normalized, ...withoutCurrent].slice(0, 30);
  saveJson(AGENT_MEMORY_KEYS.conversations, nextConversations);
  return normalized;
}

export function clearConversations() {
  saveJson(AGENT_MEMORY_KEYS.conversations, []);
}

export function deleteConversation(conversationId) {
  const nextConversations = loadConversations().filter((item) => item.id !== conversationId);
  saveJson(AGENT_MEMORY_KEYS.conversations, nextConversations);
  return nextConversations;
}

export function saveFeedbackEvent(event) {
  const events = loadFeedbackEvents();
  const nextEvent = normalizeFeedbackEvent(event);
  const withoutSameMessage = events.filter((item) => item.messageId !== nextEvent.messageId);
  const nextEvents = [nextEvent, ...withoutSameMessage].slice(0, 300);
  saveJson(AGENT_MEMORY_KEYS.feedback, nextEvents);
  return nextEvent;
}

export function getFeedbackForMessage(messageId) {
  return loadFeedbackEvents().find((event) => event.messageId === messageId) || null;
}

export function loadLearnerProfile() {
  return normalizeLearnerProfile(loadJson(AGENT_MEMORY_KEYS.profile, null));
}

export function saveLearnerProfile(profile) {
  const normalized = normalizeLearnerProfile(profile);
  saveJson(AGENT_MEMORY_KEYS.profile, normalized);
  return normalized;
}

export function loadOptionStats() {
  return loadJson(AGENT_MEMORY_KEYS.optionStats, {});
}

export function loadInteractionEvents() {
  return loadJson(AGENT_MEMORY_KEYS.interactionEvents, []);
}

export function saveInteractionEvent(event) {
  const events = loadInteractionEvents();
  const normalized = normalizeInteractionEvent(event);
  const nextEvents = [normalized, ...events.filter((item) => item.id !== normalized.id)].slice(0, 300);
  saveJson(AGENT_MEMORY_KEYS.interactionEvents, nextEvents);
  return normalized;
}

export function recordSelectedOption(option) {
  const key = classifyOption(option);
  const stats = loadOptionStats();
  const nextStats = {
    ...stats,
    [key]: (stats[key] || 0) + 1,
  };
  saveJson(AGENT_MEMORY_KEYS.optionStats, nextStats);
  return nextStats;
}

export function loadRepeatedQuestionStats() {
  return loadJson(AGENT_MEMORY_KEYS.repeatedQuestions, {});
}

export function recordUserQuestion(text) {
  const normalized = normalizeQuestion(text);
  if (!normalized) {
    return loadRepeatedQuestionStats();
  }

  const stats = loadRepeatedQuestionStats();
  const nextStats = {
    ...stats,
    [normalized]: (stats[normalized] || 0) + 1,
  };
  saveJson(AGENT_MEMORY_KEYS.repeatedQuestions, nextStats);
  return nextStats;
}

export function buildLearnerProfile({ conversations, feedbackEvents, optionStats, repeatedQuestionStats, interactionEvents = [] }) {
  const allMessages = conversations.flatMap((conversation) => conversation.messages || []);
  const userMessages = allMessages.filter((message) => message.role === 'user');
  const preferredModes = topEntries(countValues(conversations.map((conversation) => conversation.mode).filter(Boolean)), 5, 'mode');
  const frequentTopics = topEntries(countValues(userMessages.flatMap((message) => extractTopicHints(message.content))), 8, 'label');
  const weakConceptHints = topEntries(
    countValues(
      [
        ...feedbackEvents.filter((event) => event.rating === 'negative').map((event) => event.topic).filter(Boolean),
        ...interactionEvents.flatMap((event) => extractWeakHints(`${event.optionText}\n${event.userAnswer}\n${event.evaluationExcerpt}`)),
        ...userMessages.flatMap((message) => extractWeakHints(message.content)),
      ],
    ),
    8,
    'label',
  );
  const repeatedQuestionPatterns = Object.entries(repeatedQuestionStats || {})
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([normalizedQuestion, count]) => ({ normalizedQuestion, count }));

  return normalizeLearnerProfile({
    totalMessages: allMessages.length,
    totalConversations: conversations.length,
    positiveFeedbackCount: feedbackEvents.filter((event) => event.rating === 'positive').length,
    negativeFeedbackCount: feedbackEvents.filter((event) => event.rating === 'negative').length,
    preferredModes,
    frequentTopics,
    weakConceptHints,
    repeatedQuestionPatterns,
    selectedOptionStats: topEntries(optionStats || {}, 8, 'label'),
    answerStylePreference: inferAnswerStylePreference(userMessages, feedbackEvents, interactionEvents),
    lastUpdatedAt: new Date().toISOString(),
  });
}

export function buildLearnerProfileSummary(profile) {
  const normalized = normalizeLearnerProfile(profile);
  const preferences = normalized.answerStylePreference;
  const style = [
    preferences.wantsConcise ? '偏好简洁' : null,
    preferences.wantsExamples ? '喜欢例子或代码' : null,
    preferences.wantsExamFocus ? '关注考试和易错点' : null,
    preferences.wantsStepByStep ? '需要分步骤解释' : null,
    preferences.dislikesTooLong ? '不喜欢过长回答' : null,
  ].filter(Boolean);

  return {
    ...normalized,
    recentFeedbackSummary: [
      `正反馈 ${normalized.positiveFeedbackCount} 次，负反馈 ${normalized.negativeFeedbackCount} 次。`,
      style.length ? `回答风格：${style.join('、')}。` : '',
      normalized.frequentTopics.length ? `常问方向：${normalized.frequentTopics.map((item) => item.label).join('、')}。` : '',
      normalized.repeatedQuestionPatterns.length ? '存在反复追问的问题，回答应优先用例子和分步解释。' : '',
    ].filter(Boolean).join(' '),
  };
}

export function normalizeFeedbackEvent(event = {}) {
  return {
    id: event.id || `feedback_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    messageId: event.messageId || '',
    conversationId: event.conversationId || '',
    rating: event.rating === 'negative' ? 'negative' : 'positive',
    messageExcerpt: String(event.messageExcerpt || '').slice(0, 300),
    topic: event.topic || '',
    mode: event.mode || 'default',
    createdAt: event.createdAt || new Date().toISOString(),
    reason: event.reason || '',
    source: event.source || 'message_action',
  };
}

function normalizeInteractionEvent(event = {}) {
  return {
    id: event.id || `interaction_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    conversationId: event.conversationId || '',
    sourceAssistantMessageId: event.sourceAssistantMessageId || '',
    interactionType: event.interactionType || 'user_answer_required',
    selectedOption: String(event.selectedOption || event.optionText || '').slice(0, 160),
    optionText: String(event.optionText || event.selectedOption || '').slice(0, 160),
    userAnswer: String(event.userAnswer || '').slice(0, 1000),
    evaluationExcerpt: String(event.evaluationExcerpt || '').slice(0, 500),
    mode: event.mode || 'default',
    topic: event.topic || '',
    createdAt: event.createdAt || new Date().toISOString(),
  };
}

function normalizeConversation(conversation = {}) {
  const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
  const firstUserMessage = messages.find((message) => message.role === 'user')?.content || '';
  const updatedAt = conversation.updatedAt || new Date().toISOString();

  return {
    id: conversation.id || `conversation_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title: conversation.title || buildConversationTitle(firstUserMessage),
    subject: conversation.subject || 'CSAPP',
    mode: conversation.mode || 'default',
    messages: messages.slice(-80).map(normalizeMessage),
    createdAt: conversation.createdAt || updatedAt,
    updatedAt,
  };
}

function normalizeMessage(message = {}) {
  return {
    id: message.id || `message_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: String(message.content || ''),
    attachments: Array.isArray(message.attachments) ? message.attachments.map(normalizeAttachment) : [],
    createdAt: message.createdAt || new Date().toISOString(),
  };
}

function normalizeAttachment(attachment = {}) {
  return {
    name: String(attachment.name || '未命名附件'),
    size: Number(attachment.size || 0),
    type: String(attachment.type || 'unknown'),
    selectedAt: String(attachment.selectedAt || ''),
  };
}

function normalizeLearnerProfile(profile = {}) {
  return {
    totalMessages: Number(profile?.totalMessages || 0),
    totalConversations: Number(profile?.totalConversations || 0),
    positiveFeedbackCount: Number(profile?.positiveFeedbackCount || 0),
    negativeFeedbackCount: Number(profile?.negativeFeedbackCount || 0),
    preferredModes: Array.isArray(profile?.preferredModes) ? profile.preferredModes : [],
    frequentTopics: Array.isArray(profile?.frequentTopics) ? profile.frequentTopics : [],
    weakConceptHints: Array.isArray(profile?.weakConceptHints) ? profile.weakConceptHints : [],
    repeatedQuestionPatterns: Array.isArray(profile?.repeatedQuestionPatterns) ? profile.repeatedQuestionPatterns : [],
    selectedOptionStats: Array.isArray(profile?.selectedOptionStats) ? profile.selectedOptionStats : [],
    answerStylePreference: {
      wantsConcise: Boolean(profile?.answerStylePreference?.wantsConcise),
      wantsExamples: Boolean(profile?.answerStylePreference?.wantsExamples),
      wantsExamFocus: Boolean(profile?.answerStylePreference?.wantsExamFocus),
      wantsStepByStep: Boolean(profile?.answerStylePreference?.wantsStepByStep),
      dislikesTooLong: Boolean(profile?.answerStylePreference?.dislikesTooLong),
    },
    lastUpdatedAt: profile?.lastUpdatedAt || '',
  };
}

function buildConversationTitle(text) {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return '新的学习对话';
  }
  return cleaned.length > 24 ? `${cleaned.slice(0, 24)}...` : cleaned;
}

function normalizeQuestion(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, '')
    .slice(0, 80);
}

function classifyOption(option) {
  const text = String(option || '');
  if (/考试|考点|易错/.test(text)) return 'exam_focus';
  if (/例子|代码|应用/.test(text)) return 'examples';
  if (/一步|分步|详细|从头/.test(text)) return 'step_by_step';
  if (/简洁|总结|框架/.test(text)) return 'concise_framework';
  if (/反讲|纠错|费曼/.test(text)) return 'feynman_correction';
  return text.slice(0, 40) || 'unknown_option';
}

function extractTopicHints(text) {
  const value = String(text || '');
  const matches = value.match(/[\u4e00-\u9fa5A-Za-z0-9]+（[A-Za-z0-9\s-]+）/g) || [];
  const keywords = [];
  if (/缓存|cache/i.test(value)) keywords.push('缓存（cache）');
  if (/指针|pointer/i.test(value)) keywords.push('指针（pointer）');
  if (/栈|stack/i.test(value)) keywords.push('栈（stack）');
  if (/复杂度|complexity/i.test(value)) keywords.push('时间复杂度（time complexity）');
  return [...matches, ...keywords].slice(0, 6);
}

function extractWeakHints(text) {
  const value = String(text || '');
  if (/不懂|不会|混淆|讲不清|还是不明白|再讲/.test(value)) {
    return extractTopicHints(value);
  }
  return [];
}

function inferAnswerStylePreference(userMessages, feedbackEvents, interactionEvents = []) {
  const text = [
    userMessages.map((message) => message.content).join('\n'),
    interactionEvents.map((event) => `${event.userAnswer}\n${event.evaluationExcerpt}`).join('\n'),
  ].join('\n');
  return {
    wantsConcise: /简洁|短一点|少一点|太啰嗦|讲太多/.test(text),
    wantsExamples: /举例|例子|代码|案例/.test(text),
    wantsExamFocus: /考试|考点|易错|出题/.test(text),
    wantsStepByStep: /一步步|分步|详细|从头/.test(text),
    dislikesTooLong: /太长|太啰嗦|讲太多/.test(text) || feedbackEvents.filter((event) => event.rating === 'negative').length >= 2,
  };
}

function countValues(values) {
  return values.reduce((map, value) => {
    if (value) {
      map[value] = (map[value] || 0) + 1;
    }
    return map;
  }, {});
}

function topEntries(values, limit, labelKey) {
  return Object.entries(values)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ [labelKey]: label, count }));
}
