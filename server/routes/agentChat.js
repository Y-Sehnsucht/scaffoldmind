import { Router } from 'express';
import { generateTextStream } from '../services/aiService.js';
import { buildAgentChatPrompt, buildAgentEvaluationPrompt } from '../services/promptBuilder.js';
import { sendValidationError } from '../utils/responses.js';

export const agentChatRouter = Router();

agentChatRouter.post('/chat/stream', async (req, res, next) => {
  const input = normalizeAgentInput(req.body);

  if (!input.subject) return sendValidationError(res, '请选择学习学科。');
  if (!input.mode) return sendValidationError(res, '请选择学习模式。');
  if (!input.message) return sendValidationError(res, '请输入要学习或追问的内容。');

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
    requestType: body.requestType === 'evaluate_interaction_answer' ? 'evaluate_interaction_answer' : 'chat',
    message: String(body.message || '').trim(),
    interaction: normalizeInteraction(body.interaction),
    attachments: normalizeAttachments(body.attachments),
    history: normalizeHistory(body.history),
    learnerProfile: normalizeLearnerProfile(body.learnerProfile),
  };
}

function normalizeMode(mode) {
  const value = String(mode || '').trim();
  if (['default', 'context_stacking', 'feynman'].includes(value)) return value;
  return 'default';
}

function normalizeAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  return attachments.slice(0, 12).map((item) => ({
    name: String(item?.name || '未命名附件').slice(0, 180),
    size: Number(item?.size || 0),
    type: String(item?.type || 'unknown').slice(0, 120),
    selectedAt: String(item?.selectedAt || ''),
  }));
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => item?.role === 'user' || item?.role === 'assistant')
    .slice(-6)
    .map((item) => ({
      role: item.role,
      content: String(item.content || '').slice(0, 2000),
    }));
}

function normalizeLearnerProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;
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
  if (!interaction || typeof interaction !== 'object') return null;
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
  if (!Array.isArray(items)) return [];
  return items
    .slice(0, 6)
    .map((item) => ({
      [labelKey]: String(item?.[labelKey] || item?.label || item?.mode || '').slice(0, 80),
      count: Number(item?.count || 0),
    }))
    .filter((item) => item[labelKey]);
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
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const text = line.trim();
      if (!text.startsWith('data:')) continue;

      const payload = text.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

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
  const answer = input.message || '用户回答为空';

  return `## 评价
当前为 fallback 评价，原因：${reason}。你已经完成了“${option}”这一步，我会按费曼反讲的方式检查表达是否真正讲清楚。

## 准确点
你愿意先给出自己的判断，而不是直接等待答案，这有利于暴露真实理解。你的原话中可被继续校正的部分是：“${answer.slice(0, 120)}”。

## 思维漏洞
目前回答还需要更明确地区分“术语名称”和“因果机制”。如果只说结论、不解释为什么成立，听的人仍然无法迁移到新题。

## 概念混淆
最常见的混淆是把例子当定义、把现象当原因。请把“它是什么”“为什么这样”“什么时候失效”分开说。

## 如何改写
改成三句话：第一句说明问题背景，第二句解释核心机制，第三句给一个具体例子或边界情况。

## 下一步追问
请用不超过 80 字重写一版，并刻意加入一个具体例子。`;
}

function buildFallbackMarkdown(input, reason) {
  if (input.mode === 'context_stacking') return buildContextFallback(input, reason);
  if (input.mode === 'feynman') return buildFeynmanFallback(input, reason);
  return buildDefaultFallback(input, reason);
}

function buildDefaultFallback(input, reason) {
  const topic = extractTopic(input.message);
  const attachmentNote = buildAttachmentNote(input.attachments);

  return `## 学习主线
当前为 fallback 讲解，原因：${reason}。我会围绕“${topic}”动态组织回答，而不是套固定模板。${attachmentNote}

## 一、先回答你的问题
这个问题要先确认它解决什么矛盾：为什么某种结构、机制或规则会被设计出来，以及它比朴素做法强在哪里。

## 二、核心概念
1. **问题背景（problem context）**：先知道它要解决什么。
2. **核心机制（core mechanism）**：再看它如何把输入变成结果。
3. **边界条件（boundary condition）**：什么时候有效，什么时候会退化。
4. **复杂度（complexity）**：时间和空间成本分别是什么。
5. **迁移应用（transfer）**：能否放到新题或工程场景里解释。

## 三、与旧知识的关系
把它和你已经学过的数组、链表、内存层级、抽象数据类型或复杂度分析连接起来，重点找“为什么旧方法不够”和“新方法补了什么”。

## 四、如果教给零基础的人
先用生活类比建立直觉，再用一个最小例子演示流程，最后才引入术语。判断是否真懂的标准是：能解释为什么这样做，而不只是背定义。

## 五、下一步建议
你可以继续让我展开某个核心概念、补一道检查题，或者把这个主题改写成能讲给零基础同学听的版本。`;
}

function buildContextFallback(input, reason) {
  const topic = extractTopic(input.message);
  const attachmentNote = buildAttachmentNote(input.attachments);

  return `## 预习路线
当前为 fallback 讲解，原因：${reason}。围绕“${topic}”，先看它要解决的问题，再看前置概念，最后带着验证清单进课堂。${attachmentNote}

## 前置知识连接
把它和上周学过的基础结构、复杂度分析、内存模型或抽象数据类型连接起来。重点问：为什么旧知识不够，需要引入这一节的新机制？

## 课堂验证清单
1. 老师是否强调边界情况或退化情况。
2. 是否出现平均复杂度和最坏复杂度的对比。
3. 是否要求手推一个小例子。
4. 是否提到工程中的真实代价。

## 老师可能怎么考
常见考法会让你分析流程、判断边界、比较两种结构，或者解释某个操作为什么会退化。

## 学习风险点
不要只记接口名或定义。要能说清“为什么需要它”“它牺牲了什么”“它在哪些情况下失效”。`;
}

function buildFeynmanFallback(input, reason) {
  const topic = extractTopic(input.message);
  const hasExplanation = looksLikeUserExplanation(input.message);

  if (!hasExplanation) {
    return `## 先别急着看讲义
当前为 fallback 引导，原因：${reason}。费曼反讲不是我直接长篇解释“${topic}”，而是先让你暴露自己的理解。

## 你的任务
请用自己的话解释这个概念。不要背定义，可以讲得不完整，但要说出：
1. 它解决什么问题。
2. 它大概怎么工作。
3. 你觉得最容易混淆的地方是什么。

## 我会如何评价
我会从准确点、思维漏洞、概念混淆、如何改写和下一步追问来纠偏。`;
  }

  return buildEvaluationFallbackMarkdown(input, reason);
}

function buildAttachmentNote(attachments) {
  return attachments.length > 0
    ? '\n\n你已附加 PPTX 或图片。已附加，当前版本暂不解析内容；以下讲解只基于你输入的文本。'
    : '';
}

function extractTopic(message) {
  const firstLine = String(message || '').split(/\r?\n/).find((line) => line.trim()) || '当前知识点';
  const cleaned = firstLine.replace(/^#+\s*/, '').trim();
  return cleaned.length > 28 ? `${cleaned.slice(0, 28)}...` : cleaned;
}

function looksLikeUserExplanation(message) {
  const text = String(message || '');
  return /我认为|我觉得|我的理解|因为|所以|本质|举例|可以理解为/.test(text) && text.length > 28;
}

function isUnparsedAttachment(file) {
  const value = `${file.name || ''} ${file.type || ''}`.toLowerCase();
  return /\.(pptx|png|jpg|jpeg|webp)$/.test(value) || value.includes('image/');
}
