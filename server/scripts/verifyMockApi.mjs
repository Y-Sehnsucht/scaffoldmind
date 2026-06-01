import assert from 'node:assert/strict';
import { createApp } from '../app.js';

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
