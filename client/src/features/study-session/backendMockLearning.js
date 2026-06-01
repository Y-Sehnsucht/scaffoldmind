import { mockBackendApi } from '../../shared/api/client.js';

export const MOCK_SOURCES = {
  local: 'local',
  backend: 'backend',
  realApi: 'real_api',
};

export function combineMaterialText(materialText, materialFields) {
  return [materialText, ...Object.entries(materialFields).map(([key, value]) => `${key}: ${value}`)]
    .filter((item) => item && !item.endsWith(': '))
    .join('\n\n');
}

export async function requestBackendAnalysis({ subject, mode, preferences, pageNumber, materialText, materialFields, mockSource }) {
  const combinedMaterial = combineMaterialText(materialText, materialFields);
  const commonPayload = {
    subject,
    mode,
    preferences,
    pageNumber,
    materialText: combinedMaterial,
    aiSource: mockSource === MOCK_SOURCES.realApi ? 'real_api' : 'backend_mock',
  };

  const [analysisData, collisionData] = await Promise.all([
    mockBackendApi.analyze(commonPayload),
    mode === 'multi_source_collision' ? mockBackendApi.collision(buildCollisionPayload(commonPayload, materialFields)) : null,
  ]);

  const analysis = normalizeAnalysis(analysisData, {
    mode,
    pageNumber,
    materialText: combinedMaterial,
    collisionData,
  });
  const obsidianMarkdown = await requestBackendObsidian(analysis);

  return {
    analysis,
    obsidianMarkdown,
  };
}

export async function requestBackendDeepDive({ subject, mode, pageNumber, materialText, materialFields, question, mockSource }) {
  const data = await mockBackendApi.deepDive({
    subject,
    mode,
    pageNumber,
    materialText: combineMaterialText(materialText, materialFields),
    question,
    aiSource: mockSource === MOCK_SOURCES.realApi ? 'real_api' : 'backend_mock',
  });

  return normalizeDeepDive(data, question, pageNumber);
}

export async function requestBackendDiagnosis({ subject, mode, question, userAttempt, mockSource }) {
  return mockBackendApi.diagnose({
    subject,
    mode,
    question: question?.question || question || 'Current user task',
    userAttempt,
    aiSource: mockSource === MOCK_SOURCES.realApi ? 'real_api' : 'backend_mock',
  });
}

export async function requestBackendObsidian(analysis, mockSource = MOCK_SOURCES.backend) {
  const data = await mockBackendApi.obsidian({
    analysis,
    aiSource: mockSource === MOCK_SOURCES.realApi ? 'real_api' : 'backend_mock',
  });
  return data.obsidianMarkdown || '';
}

function buildCollisionPayload(commonPayload, materialFields) {
  const values = Object.values(materialFields).filter(Boolean);

  return {
    ...commonPayload,
    sourceA: commonPayload.materialText || 'Source A',
    sourceB: values[0] || commonPayload.materialText || 'Source B',
    sourceC: values[1] || commonPayload.materialText || 'Source C',
  };
}

function normalizeAnalysis(data, fallback) {
  const coreConcepts = Array.isArray(data.coreConcepts) ? data.coreConcepts : [];
  const guidedQuestions = Array.isArray(data.guidedQuestions) ? data.guidedQuestions : [];

  return {
    ...data,
    id: data.id || `backend_analysis_${Date.now()}`,
    mode: data.mode || fallback.mode,
    pageNumber: Number(data.pageNumber || fallback.pageNumber || 1),
    topic: data.topic || 'Backend Mock Analysis',
    summary: data.summary || 'Backend mock returned a structured analysis.',
    coreConcepts,
    guidedQuestions,
    whyThisMatters: data.whyThisMatters || 'Backend mock explanation placeholder.',
    contextRelation: data.contextRelation || { previous: '', current: '', next: '' },
    examFocus: Array.isArray(data.examFocus) ? data.examFocus : [],
    engineeringUse: Array.isArray(data.engineeringUse) ? data.engineeringUse : [],
    pitfalls: Array.isArray(data.pitfalls) ? data.pitfalls : [],
    userTask: data.userTask || {
      question: 'Explain this concept in your own words.',
      expectedKeyPoints: [],
    },
    pageText: data.pageText || fallback.materialText,
    modeSpecific:
      fallback.mode === 'multi_source_collision' && fallback.collisionData
        ? normalizeCollisionSection(fallback.collisionData)
        : data.modeSpecific,
  };
}

function normalizeCollisionSection(data) {
  return {
    type: 'multi_source_collision',
    title: 'Backend Mock: 多维信息对撞输出',
    sourceViews: (data.sourceSummaries || []).map((item) => ({
      source: `资料 ${item.source}`,
      view: item.coreView,
    })),
    conflicts: data.conflicts || [],
    evidenceStrength: data.evidenceComparison || [],
    adoptableConclusions: data.adoptableConclusions || [],
    doubtsToKeep: data.openDoubts || [],
  };
}

function normalizeDeepDive(data, question, pageNumber) {
  return {
    ...data,
    id: data.id || `backend_deep_${Date.now()}`,
    title: data.title || question.question,
    pageNumber: data.pageNumber || question.pageNumber || pageNumber,
    concept: data.concept || question.concept,
  };
}
