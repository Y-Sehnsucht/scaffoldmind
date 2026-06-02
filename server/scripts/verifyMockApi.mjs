import assert from 'node:assert/strict';
import { createApp } from '../app.js';
import { validateAiOutput } from '../services/aiSchemas.js';

const app = createApp();
const server = app.listen(0);

try {
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const health = await getJson(`${baseUrl}/api/health`);
  assert.equal(health.status, 200, 'health should return 200');
  assert.equal(health.body.ok, true, 'health should use ok response');
  assert.equal(health.body.data.service, 'scaffoldmind-server', 'health should identify service');

  const aiStatus = await getJson(`${baseUrl}/api/ai/status`);
  assert.equal(aiStatus.status, 200, 'ai status should return 200');
  assert.equal(aiStatus.body.data.jsonResponseFormat, 'json_object', 'ai status should expose JSON response mode');

  const materialForm = new FormData();
  materialForm.append('material', new Blob(['# Cache\nLocality material'], { type: 'text/markdown' }), 'cache.md');
  const validMaterial = await postFormData(`${baseUrl}/api/materials/extract`, materialForm);
  assert.equal(validMaterial.status, 200, 'materials extract should return 200 for markdown input');
  assert.equal(validMaterial.body.ok, true, 'materials extract should use ok/data shape');
  assert.equal(validMaterial.body.data.sourceType, 'markdown', 'materials extract should classify markdown files');
  assert.match(validMaterial.body.data.extractedText, /Locality material/, 'materials extract should return file text');

  const pdfForm = new FormData();
  pdfForm.append('material', new Blob([createSamplePdf()], { type: 'application/pdf' }), 'sample.pdf');
  const validPdfMaterial = await postFormData(`${baseUrl}/api/materials/extract`, pdfForm);
  assert.equal(validPdfMaterial.status, 200, 'materials extract should return 200 for pdf input');
  assert.equal(validPdfMaterial.body.data.sourceType, 'pdf', 'materials extract should classify pdf files');
  assert.equal(validPdfMaterial.body.data.pageCount, 1, 'materials extract should return pdf page count');
  assert.match(validPdfMaterial.body.data.extractedText, /Cache locality/, 'materials extract should return pdf text');

  const validAnalyze = await postJson(`${baseUrl}/api/analyze`, {
    subject: 'CSAPP',
    mode: 'after_class_review',
    preferences: ['framework_first'],
    pageNumber: 12,
    materialText: 'cache material',
  });
  assert.equal(validAnalyze.status, 200, 'analyze should return 200 for valid input');
  assert.equal(validAnalyze.body.ok, true, 'analyze should use ok/data shape');
  assert.ok(validAnalyze.body.data.topic, 'analyze should return mock analysis topic');
  assert.equal(validateAiOutput('analysis', validAnalyze.body.data).valid, true, 'analyze output should match AI schema');

  const invalidAnalyze = await postJson(`${baseUrl}/api/analyze`, {
    subject: 'CSAPP',
    mode: 'after_class_review',
  });
  assert.equal(invalidAnalyze.status, 400, 'analyze should return 400 for missing materialText');
  assert.equal(invalidAnalyze.body.ok, false, 'validation errors should use ok false');
  assert.equal(invalidAnalyze.body.error.code, 'VALIDATION_ERROR', 'validation error code should be stable');

  const validDiagnose = await postJson(`${baseUrl}/api/diagnose`, {
    subject: 'CSAPP',
    mode: 'after_class_review',
    question: 'Explain cache miss.',
    userAttempt: 'Cache is too small.',
  });
  assert.equal(validDiagnose.status, 200, 'diagnose should return 200 for valid input');
  assert.equal(validDiagnose.body.ok, true, 'diagnose should use ok/data shape');
  assert.equal(validDiagnose.body.data.quotedIssue, 'Cache is too small.', 'diagnose should quote user attempt');
  assert.equal(validateAiOutput('diagnosis', validDiagnose.body.data).valid, true, 'diagnosis output should match AI schema');

  const invalidAiShape = validateAiOutput('diagnosis', { rawText: 'plain text answer' });
  assert.equal(invalidAiShape.valid, false, 'schema validation should reject unstructured diagnosis output');

  const validDeepDive = await postJson(`${baseUrl}/api/deep-dive`, {
    subject: 'CSAPP',
    mode: 'after_class_review',
    materialText: 'cache material',
    question: validAnalyze.body.data.guidedQuestions[0],
  });
  assert.equal(validDeepDive.status, 200, 'deep dive should return 200 for valid input');
  assert.equal(validateAiOutput('deepDive', validDeepDive.body.data).valid, true, 'deep dive output should match AI schema');

  const validObsidian = await postJson(`${baseUrl}/api/obsidian`, {
    analysis: validAnalyze.body.data,
  });
  assert.equal(validObsidian.status, 200, 'obsidian should return 200 for valid input');
  assert.equal(validateAiOutput('obsidian', validObsidian.body.data).valid, true, 'obsidian output should match AI schema');

  const validCollision = await postJson(`${baseUrl}/api/collision`, {
    subject: 'CSAPP',
    mode: 'multi_source_collision',
    sourceA: 'course material',
    sourceB: 'engineering article',
    sourceC: 'opposing view',
  });
  assert.equal(validCollision.status, 200, 'collision should return 200 for valid input');
  assert.equal(validateAiOutput('collision', validCollision.body.data).valid, true, 'collision output should match AI schema');

  await deleteJson(`${baseUrl}/api/records`);
  const savedRecord = await postJson(`${baseUrl}/api/records`, {
    title: 'Cache Miss',
    subject: 'CSAPP',
    mode: 'after_class_review',
    modeLabel: '课后深度复习',
    mockSource: 'backend',
    input: 'cache material',
    analysis: validAnalyze.body.data,
    diagnosis: validDiagnose.body.data,
    obsidianMarkdown: '# [[Cache Miss]]',
    questionHistory: [
      {
        id: 'q_history_1',
        questionId: 'q_exam',
        question: '为什么缓存未命中（cache miss）常被考察？',
        type: 'exam',
        typeLabel: '考试常考型',
        concept: '缓存未命中（cache miss）',
        status: '已回答',
      },
    ],
  });
  assert.equal(savedRecord.status, 201, 'records should return 201 when saved');
  assert.equal(savedRecord.body.ok, true, 'records save should use ok/data shape');
  assert.equal(savedRecord.body.data.title, 'Cache Miss', 'records save should return saved title');

  const records = await getJson(`${baseUrl}/api/records`);
  assert.equal(records.status, 200, 'records list should return 200');
  assert.equal(records.body.data.length, 1, 'records list should include saved record');

  const profile = await getJson(`${baseUrl}/api/profile/summary`);
  assert.equal(profile.status, 200, 'profile summary should return 200');
  assert.equal(profile.body.data.totalRecords, 1, 'profile summary should count saved records');
  assert.deepEqual(
    profile.body.data.commonQuestionTypes[0],
    { label: '考试常考型', count: 1 },
    'profile summary should count saved question types',
  );
  assert.ok(profile.body.data.nextReviewSuggestion, 'profile summary should include next review suggestion');

  const deletedRecord = await deleteJson(`${baseUrl}/api/records/${savedRecord.body.data.id}`);
  assert.equal(deletedRecord.status, 200, 'record delete should return 200');
  assert.equal(deletedRecord.body.data.deleted, true, 'record delete should report deleted true');

  const validPptParse = await postJson(`${baseUrl}/api/parse-ppt`, {
    fileName: 'demo.pptx',
    pageNumber: 1,
    fileBase64: createTinyPptxBase64(),
  });
  assert.equal(validPptParse.status, 200, 'parse-ppt should return 200 for a valid pptx');
  assert.equal(validPptParse.body.ok, true, 'parse-ppt should use ok/data shape');
  assert.match(validPptParse.body.data.extractedText, /Cache memory/, 'parse-ppt should extract slide text');
  assert.equal(validPptParse.body.data.slideCount, 2, 'parse-ppt should return all parsed slides');
  assert.match(validPptParse.body.data.slides[1].textBlocks[0].text, /Second slide/, 'parse-ppt should include second slide text');
  assert.equal(validPptParse.body.data.images.length, 1, 'parse-ppt should detect image placeholders');

  console.log('Mock API verification passed.');
} finally {
  await deleteJson(`http://127.0.0.1:${server.address()?.port}/api/records`).catch(() => {});
  await new Promise((resolve) => server.close(resolve));
}

function createTinyPptxBase64() {
  const files = [
    {
      name: 'ppt/slides/slide1.xml',
      content:
        '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Cache memory uses locality.</a:t></a:r></a:p></p:txBody></p:sp><p:pic><p:blipFill><a:blip r:embed="rId2"/></p:blipFill></p:pic></p:spTree></p:cSld></p:sld>',
    },
    {
      name: 'ppt/slides/_rels/slide1.xml.rels',
      content:
        '<Relationships><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/></Relationships>',
    },
    {
      name: 'ppt/slides/slide2.xml',
      content:
        '<p:sld><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Second slide explains cache lines.</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>',
    },
  ];

  return createZip(files).toString('base64');
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.name);
    const content = Buffer.from(file.content);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt32LE(0, 10);
    localHeader.writeUInt32LE(0, 14);
    localHeader.writeUInt32LE(content.length, 18);
    localHeader.writeUInt32LE(content.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, name, content);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt32LE(0, 12);
    centralHeader.writeUInt32LE(0, 16);
    centralHeader.writeUInt32LE(content.length, 20);
    centralHeader.writeUInt32LE(content.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);

    offset += localHeader.length + name.length + content.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const localDirectory = Buffer.concat(localParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDirectory.length, 12);
  eocd.writeUInt32LE(localDirectory.length, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([localDirectory, centralDirectory, eocd]);
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

async function postFormData(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    body,
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

function createSamplePdf() {
  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '5 0 obj\n<< /Length 48 >>\nstream\nBT /F1 24 Tf 100 700 Td (Cache locality) Tj ET\nendstream\nendobj\n',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'ascii'));
    pdf += object;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'ascii');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'ascii');
}
