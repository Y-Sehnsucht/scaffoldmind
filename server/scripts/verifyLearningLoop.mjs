import assert from 'node:assert/strict';
import { createApp } from '../app.js';
import { validateAiOutput } from '../services/aiSchemas.js';

const app = createApp();
const server = app.listen(0);

try {
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  await deleteJson(`${baseUrl}/api/records`);

  const materialForm = new FormData();
  materialForm.append(
    'material',
    new Blob(['缓存未命中（cache miss）和局部性（locality）是理解缓存性能的核心材料。'], {
      type: 'text/plain',
    }),
    'cache-note.txt',
  );

  const material = await postFormData(`${baseUrl}/api/materials/extract`, materialForm);
  assert.equal(material.status, 200, 'material extraction should succeed');
  assert.match(material.body.data.extractedText, /缓存未命中/, 'material extraction should return text');

  const analysis = await postJson(`${baseUrl}/api/analyze`, {
    subject: 'CSAPP',
    mode: 'after_class_review',
    preferences: ['framework_first', 'why_chain'],
    pageNumber: 3,
    materialText: material.body.data.extractedText,
  });
  assert.equal(analysis.status, 200, 'analysis should succeed');
  assert.equal(validateAiOutput('analysis', analysis.body.data).valid, true, 'analysis should be structured');
  assert.ok(analysis.body.data.guidedQuestions.length >= 1, 'analysis should include guided questions');

  const question = analysis.body.data.guidedQuestions[0];
  const deepDive = await postJson(`${baseUrl}/api/deep-dive`, {
    subject: 'CSAPP',
    mode: 'after_class_review',
    materialText: material.body.data.extractedText,
    question,
  });
  assert.equal(deepDive.status, 200, 'deep dive should succeed');
  assert.equal(validateAiOutput('deepDive', deepDive.body.data).valid, true, 'deep dive should be structured');

  const userAttempt = '缓存未命中就是缓存太小，所以只要把缓存变大就能解决。';
  const diagnosis = await postJson(`${baseUrl}/api/diagnose`, {
    subject: 'CSAPP',
    mode: 'after_class_review',
    question: analysis.body.data.userTask,
    userAttempt,
  });
  assert.equal(diagnosis.status, 200, 'diagnosis should succeed');
  assert.equal(validateAiOutput('diagnosis', diagnosis.body.data).valid, true, 'diagnosis should be structured');
  assert.match(diagnosis.body.data.quotedIssue, /缓存太小/, 'diagnosis should quote the user attempt');
  assert.ok(diagnosis.body.data.reinforcementTask, 'diagnosis should include reinforcement task');

  const obsidian = await postJson(`${baseUrl}/api/obsidian`, {
    analysis: analysis.body.data,
    diagnosis: diagnosis.body.data,
  });
  assert.equal(obsidian.status, 200, 'obsidian export should succeed');
  assert.equal(validateAiOutput('obsidian', obsidian.body.data).valid, true, 'obsidian output should be structured');
  assert.match(obsidian.body.data.obsidianMarkdown, /\[\[/, 'obsidian output should include wikilink');

  const savedRecord = await postJson(`${baseUrl}/api/records`, {
    title: analysis.body.data.topic,
    subject: 'CSAPP',
    mode: 'after_class_review',
    modeLabel: '课后深度复习',
    mockSource: 'backend',
    input: material.body.data.extractedText,
    analysis: analysis.body.data,
    deepDive: deepDive.body.data,
    userAnswer: userAttempt,
    diagnosis: diagnosis.body.data,
    obsidianMarkdown: obsidian.body.data.obsidianMarkdown,
    questionHistory: [
      {
        id: 'loop_question_1',
        questionId: question.id,
        question: question.question,
        type: question.type,
        typeLabel: question.typeLabel,
        concept: question.concept,
        pageNumber: question.pageNumber,
        status: '已强化',
      },
    ],
  });
  assert.equal(savedRecord.status, 201, 'record save should succeed');
  assert.equal(savedRecord.body.data.questionHistory.length, 1, 'saved record should persist question history');

  const records = await getJson(`${baseUrl}/api/records`);
  assert.equal(records.status, 200, 'record list should succeed');
  assert.equal(records.body.data.length, 1, 'record list should include the saved loop');
  assert.equal(records.body.data[0].diagnosis.quotedIssue, userAttempt, 'record should retain diagnosis and user answer');

  const profile = await getJson(`${baseUrl}/api/profile/summary`);
  assert.equal(profile.status, 200, 'profile summary should succeed');
  assert.equal(profile.body.data.totalRecords, 1, 'profile should count saved loop');
  assert.ok(profile.body.data.weakConcepts.length >= 1, 'profile should include weak concepts');
  assert.ok(profile.body.data.commonQuestionTypes.length >= 1, 'profile should include question type stats');
  assert.ok(profile.body.data.nextReviewSuggestion, 'profile should include next review suggestion');

  console.log('Learning loop verification passed.');
} finally {
  await deleteJson(`http://127.0.0.1:${server.address()?.port}/api/records`).catch(() => {});
  await new Promise((resolve) => server.close(resolve));
}

async function getJson(url) {
  const response = await fetch(url);
  return {
    status: response.status,
    body: await response.json(),
  };
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return {
    status: response.status,
    body: await response.json(),
  };
}

async function postFormData(url, formData) {
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  return {
    status: response.status,
    body: await response.json(),
  };
}

async function deleteJson(url) {
  const response = await fetch(url, {
    method: 'DELETE',
  });

  return {
    status: response.status,
    body: await response.json(),
  };
}
