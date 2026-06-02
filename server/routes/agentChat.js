import { Router } from 'express';
import { generateTextStream } from '../services/aiService.js';
import { buildAgentChatPrompt, buildAgentEvaluationPrompt } from '../services/promptBuilder.js';
import { sendValidationError } from '../utils/responses.js';

export const agentChatRouter = Router();

agentChatRouter.post('/chat/stream', async (req, res, next) => {
  const input = normalizeAgentInput(req.body);

  if (!input.subject) {
    return sendValidationError(res, '请选择学习学科。');
  }

  if (!input.mode) {
    return sendValidationError(res, '请选择学习模式。');
  }

  if (!input.message) {
    return sendValidationError(res, '请输入要学习或追问的内容。');
  }

  try {
    prepareSse(res);
    sendSse(res, { type: 'status', message: '正在分析材料...' });

    const isEvaluation = input.requestType === 'evaluate_interaction_answer' && input.mode !== 'context_stacking';
    const prompt = isEvaluation ? buildAgentEvaluationPrompt(input) : buildAgentChatPrompt(input);
    const result = await generateTextStream(prompt);

    if (result.error || !result.stream) {
      streamFallback(res, input, result.error?.code || 'AI_STREAM_UNAVAILABLE');
      return;
    }

    const streamed = await pipeProviderStream(result.stream, res);

    if (!streamed) {
      streamFallback(res, input, 'AI_EMPTY_RESPONSE');
      return;
    }

    sendSse(res, { type: 'done' });
    res.end();
  } catch (error) {
    if (res.headersSent) {
      streamFallback(res, input, 'AI_CALL_FAILED');
      return;
    }

    next(error);
  }
});

function normalizeAgentInput(body = {}) {
  return {
    subject: String(body.subject || '').trim(),
    mode: normalizeMode(body.mode),
    requestType: normalizeRequestType(body.requestType),
    message: String(body.message || '').trim(),
    interaction: normalizeInteraction(body.interaction),
    attachments: normalizeAttachments(body.attachments),
    history: normalizeHistory(body.history),
    learnerProfile: normalizeLearnerProfile(body.learnerProfile),
  };
}

function normalizeRequestType(requestType) {
  return requestType === 'evaluate_interaction_answer' ? 'evaluate_interaction_answer' : 'chat';
}

function normalizeMode(mode) {
  const value = String(mode || '').trim();
  if (['default', 'context_stacking', 'feynman'].includes(value)) {
    return value;
  }
  return 'default';
}

function normalizeAttachments(attachments) {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments.slice(0, 12).map((item) => ({
    name: String(item?.name || '未命名附件').slice(0, 180),
    size: Number(item?.size || 0),
    type: String(item?.type || 'unknown').slice(0, 120),
    selectedAt: String(item?.selectedAt || ''),
  }));
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => item?.role === 'user' || item?.role === 'assistant')
    .slice(-6)
    .map((item) => ({
      role: item.role,
      content: String(item.content || '').slice(0, 2000),
    }));
}

function normalizeLearnerProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    return null;
  }

  return {
    totalMessages: Number(profile.totalMessages || 0),
    totalConversations: Number(profile.totalConversations || 0),
    positiveFeedbackCount: Number(profile.positiveFeedbackCount || 0),
    negativeFeedbackCount: Number(profile.negativeFeedbackCount || 0),
    preferredModes: normalizeProfileItems(profile.preferredModes, 'mode'),
    frequentTopics: normalizeProfileItems(profile.frequentTopics, 'label'),
    weakConceptHints: normalizeProfileItems(profile.weakConceptHints, 'label'),
    repeatedQuestionPatterns: Array.isArray(profile.repeatedQuestionPatterns)
      ? profile.repeatedQuestionPatterns.slice(0, 5).map((item) => ({
          normalizedQuestion: String(item.normalizedQuestion || '').slice(0, 120),
          count: Number(item.count || 0),
        }))
      : [],
    selectedOptionStats: normalizeProfileItems(profile.selectedOptionStats, 'label'),
    answerStylePreference: {
      wantsConcise: Boolean(profile.answerStylePreference?.wantsConcise),
      wantsExamples: Boolean(profile.answerStylePreference?.wantsExamples),
      wantsExamFocus: Boolean(profile.answerStylePreference?.wantsExamFocus),
      wantsStepByStep: Boolean(profile.answerStylePreference?.wantsStepByStep),
      dislikesTooLong: Boolean(profile.answerStylePreference?.dislikesTooLong),
    },
    recentFeedbackSummary: String(profile.recentFeedbackSummary || '').slice(0, 500),
  };
}

function normalizeInteraction(interaction) {
  if (!interaction || typeof interaction !== 'object') {
    return null;
  }

  return {
    id: String(interaction.id || '').slice(0, 120),
    mode: normalizeMode(interaction.mode),
    optionText: String(interaction.optionText || '').slice(0, 180),
    interactionType: String(interaction.interactionType || 'user_answer_required').slice(0, 80),
    sourceAssistantMessageId: String(interaction.sourceAssistantMessageId || '').slice(0, 120),
    topic: String(interaction.topic || '').slice(0, 120),
    createdAt: String(interaction.createdAt || '').slice(0, 80),
  };
}

function normalizeProfileItems(items, labelKey) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.slice(0, 6).map((item) => ({
    [labelKey]: String(item?.[labelKey] || item?.label || item?.mode || '').slice(0, 80),
    count: Number(item?.count || 0),
  })).filter((item) => item[labelKey]);
}

function prepareSse(res) {
  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
}

function sendSse(res, event) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

async function pipeProviderStream(stream, res) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let emitted = false;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const text = line.trim();

      if (!text.startsWith('data:')) {
        continue;
      }

      const payload = text.slice(5).trim();

      if (!payload || payload === '[DONE]') {
        continue;
      }

      const delta = extractProviderDelta(payload);

      if (delta) {
        emitted = true;
        sendSse(res, { type: 'delta', text: delta });
      }
    }
  }

  return emitted;
}

function extractProviderDelta(payload) {
  try {
    const event = JSON.parse(payload);
    return (
      event.choices?.[0]?.delta?.content ||
      event.choices?.[0]?.message?.content ||
      event.delta?.text ||
      event.output_text ||
      event.text ||
      ''
    );
  } catch {
    return '';
  }
}

function streamFallback(res, input, reason) {
  sendSse(res, { type: 'status', message: '真实 provider 暂不可用，已切换到本地讲解。' });
  sendSse(res, {
    type: 'delta',
    text: input.requestType === 'evaluate_interaction_answer'
      ? buildEvaluationFallbackMarkdown(input, reason)
      : buildFallbackMarkdown(input, reason),
  });
  sendSse(res, { type: 'done' });
  res.end();
}

function buildEvaluationFallbackMarkdown(input, reason) {
  const option = input.interaction?.optionText || '互动任务';
  const answer = input.message || '你的回答';
  const modeNote = input.mode === 'context_stacking'
    ? '这次评价会重点看前置知识、章节连接、预习路线和课堂验证问题是否具体。'
    : input.mode === 'feynman'
      ? '这次评价会重点看你是否用自己的话解释，是否只是在背术语，以及是否混淆了概念。'
      : '这次评价会重点看你的理解是否完整、可迁移。';

  return `## 评价
你已经完成了“${option}”这一步。当前为 fallback 评价，原因：${reason}。${modeNote}

## 准确点
1. 你愿意先给出自己的判断，而不是直接等答案，这有利于暴露真实理解。
2. 你的回答中已经出现了可被校正的表达：“${answer.slice(0, 80)}”。

## 主要偏差
1. 目前回答还需要更明确地区分“概念定义”和“为什么这样做”。
2. 如果只是列术语，还不足以说明你真正理解了因果关系。

## 修改建议
把回答改成“三句话”：第一句说明问题背景，第二句解释核心机制，第三句给一个例子或课堂验证问题。

## 下一步练习
请用不超过 80 字重新写一版回答，并刻意加入一个具体例子。`;
}

function buildFallbackMarkdown(input, reason) {
  const topic = extractTopic(input.message);
  const attachmentNote = input.attachments.some((file) => isUnparsedAttachment(file))
    ? '\n\n你已附加 PPTX 或图片。已附加，当前版本暂不解析内容；以下讲解只基于你输入的文本。'
    : '';
  const optionLines = buildModeOptions(input.mode);

  return `## 总结
**${topic}** 的学习重点不是记住零散定义，而是看清它在系统中的位置：先明确问题背景，再抽出核心机制，最后用例子验证。当前回答为 fallback 讲解，原因：${reason}。${attachmentNote}

## 框架
1. 先定位主题：它解决什么问题。
2. 再拆机制：输入、过程、输出分别是什么。
3. 接着看边界：什么时候有效，什么时候会出错。
4. 最后做迁移：把概念放到题目或工程场景里验证。

## 5 个核心概念
1. **核心问题（core problem）**：任何知识点都先对应一个要解决的问题。
2. **抽象层次（abstraction level）**：先分清硬件、系统、语言或算法层面的解释范围。
3. **因果链（causal chain）**：用“因为...所以...”连接概念，避免背碎片。
4. **边界条件（boundary condition）**：知道规则在哪些情况下不成立，才能真正会用。
5. **迁移应用（transfer）**：能把概念换到新题或新代码里，才算完成理解。

## 你可以继续选择
${optionLines}`;
}

function buildModeOptions(mode) {
  if (mode === 'context_stacking') {
    return [
      '1. 帮我建立课前预习路线。',
      '2. 找出这部分和前置知识的连接。',
      '3. 给我课堂验证清单。',
      '4. 预测老师可能怎么考。',
    ].join('\n');
  }

  if (mode === 'feynman') {
    return [
      '1. 我来反讲，请你纠错。',
      '2. 用 12 岁小孩也能懂的话再讲一遍。',
      '3. 出一道检查题。',
      '4. 帮我区分易混概念。',
    ].join('\n');
  }

  return [
    '1. 展开核心概念。',
    '2. 讲考试常考点。',
    '3. 指出最容易误解的地方。',
    '4. 给我一道检查题。',
  ].join('\n');
}

function extractTopic(message) {
  const firstLine = String(message || '').split(/\r?\n/).find((line) => line.trim()) || '当前知识点';
  const cleaned = firstLine.replace(/^#+\s*/, '').trim();
  return cleaned.length > 22 ? `${cleaned.slice(0, 22)}...` : cleaned;
}

function isUnparsedAttachment(file) {
  const value = `${file.name || ''} ${file.type || ''}`.toLowerCase();
  return /\.(pptx|png|jpg|jpeg|webp)$/.test(value) || value.includes('image/');
}
