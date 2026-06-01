import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_PAGE_NUMBER, LEARNING_MODES, LEARNING_PREFERENCES, SUBJECTS } from '../../core/constants.js';
import { QuestionHistoryPanel } from '../question-history/QuestionHistoryPanel.jsx';
import { ObsidianExport } from '../obsidian-export/ObsidianExport.jsx';
import { PageDrawer } from '../page-drawer/PageDrawer.jsx';
import {
  clearLearningRecords,
  clearQuestionHistory,
  loadLearningRecords,
  loadQuestionHistory,
  saveLearningRecords,
  saveQuestionHistory,
} from '../../shared/storage/learningStorage.js';
import { buildMockAnalysis, buildMockDeepDive, buildMockDiagnosis, buildObsidianMarkdown } from '../../utils/mockLearning.js';
import { AnalysisPanel } from './AnalysisPanel.jsx';
import {
  MOCK_SOURCES,
  combineMaterialText,
  requestBackendAnalysis,
  requestBackendDeepDive,
  requestBackendDiagnosis,
  requestBackendObsidian,
} from './backendMockLearning.js';
import { InputPanel } from './InputPanel.jsx';
import { TopBar } from './TopBar.jsx';

export function StudyWorkspace() {
  const [subject, setSubject] = useState(SUBJECTS[0].id);
  const [mode, setMode] = useState('after_class_review');
  const [status, setStatus] = useState('Local mock ready');
  const [mockSource, setMockSource] = useState(MOCK_SOURCES.local);
  const [loadingAction, setLoadingAction] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [materialText, setMaterialText] = useState(
    'Cache miss means the requested data is not found in the cache. Locality explains why cache can improve performance.',
  );
  const [materialFields, setMaterialFields] = useState({});
  const [selectedPreferences, setSelectedPreferences] = useState(['framework_first', 'why_chain', 'exam_focus']);
  const [fileName, setFileName] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [deepDive, setDeepDive] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [diagnosis, setDiagnosis] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [questionHistory, setQuestionHistory] = useState(() => loadQuestionHistory());
  const [learningRecords, setLearningRecords] = useState(() => loadLearningRecords());
  const [copied, setCopied] = useState(false);
  const [copyFallbackVisible, setCopyFallbackVisible] = useState(false);
  const [backendObsidianMarkdown, setBackendObsidianMarkdown] = useState('');

  const currentMode = useMemo(() => LEARNING_MODES.find((item) => item.id === mode) || LEARNING_MODES[0], [mode]);
  const localObsidianMarkdown = useMemo(() => buildObsidianMarkdown(analysis, diagnosis), [analysis, diagnosis]);
  const obsidianMarkdown = mockSource === MOCK_SOURCES.backend ? backendObsidianMarkdown : localObsidianMarkdown;

  useEffect(() => {
    saveQuestionHistory(questionHistory);
  }, [questionHistory]);

  useEffect(() => {
    saveLearningRecords(learningRecords);
  }, [learningRecords]);

  function handlePreferenceToggle(preferenceId) {
    setSelectedPreferences((current) =>
      current.includes(preferenceId) ? current.filter((item) => item !== preferenceId) : [...current, preferenceId],
    );
  }

  function handleMaterialFieldChange(field, value) {
    setMaterialFields((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleMockSourceChange(nextSource) {
    setMockSource(nextSource);
    setErrorMessage('');
    setStatus(nextSource === MOCK_SOURCES.backend ? 'Backend mock selected' : 'Local mock selected');
  }

  async function handleGenerate() {
    setLoadingAction('generate');
    setErrorMessage('');
    setStatus(mockSource === MOCK_SOURCES.backend ? 'Calling backend mock...' : 'Generating local mock...');

    try {
      const combinedMaterial = combineMaterialText(materialText, materialFields);
      const result =
        mockSource === MOCK_SOURCES.backend
          ? await requestBackendAnalysis({
              subject,
              mode,
              preferences: selectedPreferences,
              pageNumber,
              materialText,
              materialFields,
            })
          : {
              analysis: buildMockAnalysis({
                subject,
                mode,
                preferences: selectedPreferences,
                pageNumber,
                materialText: combinedMaterial,
              }),
              obsidianMarkdown: '',
            };

      setAnalysis(result.analysis);
      setBackendObsidianMarkdown(result.obsidianMarkdown || '');
      setDeepDive(null);
      setDiagnosis(null);
      setUserAnswer('');
      setCopied(false);
      setCopyFallbackVisible(false);
      setStatus(mockSource === MOCK_SOURCES.backend ? 'Backend mock analysis ready' : 'Local mock analysis ready');
    } catch (error) {
      setErrorMessage(formatError(error));
      setStatus('Mock request failed');
    } finally {
      setLoadingAction('');
    }
  }

  async function handleDeepDive(question) {
    setLoadingAction(`deep-dive:${question.id}`);
    setErrorMessage('');
    setStatus(mockSource === MOCK_SOURCES.backend ? 'Calling backend mock deep-dive...' : 'Generating local deep-dive...');

    try {
      const nextDeepDive =
        mockSource === MOCK_SOURCES.backend
          ? await requestBackendDeepDive({ subject, mode, pageNumber, materialText, materialFields, question })
          : buildMockDeepDive(question);
      const historyItem = {
        id: `history_${Date.now()}`,
        question: question.question,
        pageNumber: question.pageNumber,
        concept: question.concept,
        status: mockSource === MOCK_SOURCES.backend ? 'Backend mock answered' : 'Local mock answered',
        createdAt: new Date().toISOString(),
      };

      setDeepDive(nextDeepDive);
      setQuestionHistory((current) => [historyItem, ...current]);
      setStatus('Question history updated');
    } catch (error) {
      setErrorMessage(formatError(error));
      setStatus('Deep-dive request failed');
    } finally {
      setLoadingAction('');
    }
  }

  async function handleDiagnose() {
    setLoadingAction('diagnose');
    setErrorMessage('');
    setStatus(mockSource === MOCK_SOURCES.backend ? 'Calling backend mock diagnosis...' : 'Generating local diagnosis...');

    try {
      const nextDiagnosis =
        mockSource === MOCK_SOURCES.backend
          ? await requestBackendDiagnosis({ subject, mode, question: analysis?.userTask, userAttempt: userAnswer })
          : buildMockDiagnosis(userAnswer);

      setDiagnosis(nextDiagnosis);
      setStatus(mockSource === MOCK_SOURCES.backend ? 'Backend mock diagnosis ready' : 'Local mock diagnosis ready');
    } catch (error) {
      setErrorMessage(formatError(error));
      setStatus('Diagnosis request failed');
    } finally {
      setLoadingAction('');
    }
  }

  function handleSaveRecord() {
    if (!analysis) {
      return;
    }

    const nextRecord = {
      id: `record_${Date.now()}`,
      title: analysis.topic,
      subject,
      mode,
      modeLabel: currentMode.label,
      mockSource,
      input: materialText,
      analysis,
      deepDive,
      userAnswer,
      diagnosis,
      obsidianMarkdown,
      createdAt: new Date().toISOString(),
    };

    setLearningRecords((current) => [nextRecord, ...current]);
    setStatus('Learning record saved');
  }

  function handleClearQuestions() {
    clearQuestionHistory();
    setQuestionHistory([]);
    setStatus('Question history cleared');
  }

  function handleClearRecords() {
    const confirmed = window.confirm('Clear all learning records?');
    if (!confirmed) {
      return;
    }

    clearLearningRecords();
    setLearningRecords([]);
    setStatus('Learning records cleared');
  }

  async function handleCopyObsidian() {
    setCopied(false);
    setCopyFallbackVisible(false);
    setErrorMessage('');

    let markdownToCopy = obsidianMarkdown;

    try {
      if (mockSource === MOCK_SOURCES.backend && analysis && !markdownToCopy) {
        markdownToCopy = await requestBackendObsidian(analysis);
        setBackendObsidianMarkdown(markdownToCopy);
      }

      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }

      await navigator.clipboard.writeText(markdownToCopy);
      setCopied(true);
      setStatus('Obsidian note copied');
    } catch (error) {
      if (error.name === 'ApiResponseError') {
        setErrorMessage(formatError(error));
      }

      setCopyFallbackVisible(true);
      setStatus('Manual Obsidian copy fallback shown');
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <TopBar
        subject={subject}
        subjects={SUBJECTS}
        mode={mode}
        modes={LEARNING_MODES}
        status={status}
        mockSource={mockSource}
        onSubjectChange={setSubject}
        onModeChange={setMode}
        onMockSourceChange={handleMockSourceChange}
      />

      {errorMessage ? (
        <div className="mx-auto mt-4 max-w-[1440px] px-4">
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {errorMessage}
          </div>
        </div>
      ) : null}

      <section className="mx-auto grid max-w-[1440px] gap-4 px-4 py-4 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <InputPanel
          currentMode={currentMode}
          pageNumber={pageNumber}
          materialText={materialText}
          materialFields={materialFields}
          selectedPreferences={selectedPreferences}
          preferences={LEARNING_PREFERENCES}
          fileName={fileName}
          onPageNumberChange={setPageNumber}
          onMaterialTextChange={setMaterialText}
          onMaterialFieldChange={handleMaterialFieldChange}
          onPreferenceToggle={handlePreferenceToggle}
          onFileNameChange={setFileName}
          onGenerate={handleGenerate}
          onSaveRecord={handleSaveRecord}
          canSave={Boolean(analysis)}
          isLoading={loadingAction === 'generate'}
          mockSource={mockSource}
        />

        <div className="space-y-4">
          <AnalysisPanel
            analysis={analysis}
            deepDive={deepDive}
            diagnosis={diagnosis}
            userAnswer={userAnswer}
            onUserAnswerChange={setUserAnswer}
            onOpenPage={() => setDrawerOpen(true)}
            onDeepDive={handleDeepDive}
            onDiagnose={handleDiagnose}
            loadingAction={loadingAction}
          />
          <ObsidianExport
            markdown={obsidianMarkdown}
            copied={copied}
            fallbackVisible={copyFallbackVisible}
            onCopy={handleCopyObsidian}
          />
        </div>

        <QuestionHistoryPanel
          items={questionHistory}
          records={learningRecords}
          onClearQuestions={handleClearQuestions}
          onClearRecords={handleClearRecords}
        />
      </section>

      <PageDrawer open={drawerOpen} analysis={analysis} fileName={fileName} onClose={() => setDrawerOpen(false)} />
    </main>
  );
}

function formatError(error) {
  if (error?.code) {
    return `Mock API error (${error.code}): ${error.message}`;
  }

  return error?.message || 'Mock request failed. Check whether the backend dev server is running.';
}
