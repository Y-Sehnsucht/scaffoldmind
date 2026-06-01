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
  const usesBackendPath = mockSource !== MOCK_SOURCES.local;
  const obsidianMarkdown = usesBackendPath ? backendObsidianMarkdown : localObsidianMarkdown;

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
    setStatus(getSourceStatus(nextSource));
  }

  async function handleGenerate() {
    setLoadingAction('generate');
    setErrorMessage('');
    setStatus(usesBackendPath ? `Calling ${getSourceLabel(mockSource)}...` : 'Generating local mock...');

    try {
      const combinedMaterial = combineMaterialText(materialText, materialFields);
      const result =
        usesBackendPath
          ? await requestBackendAnalysis({
              subject,
              mode,
              preferences: selectedPreferences,
              pageNumber,
              materialText,
              materialFields,
              mockSource,
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
      setStatus(usesBackendPath ? `${getSourceLabel(mockSource)} analysis ready` : 'Local mock analysis ready');
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
    setStatus(usesBackendPath ? `Calling ${getSourceLabel(mockSource)} deep-dive...` : 'Generating local deep-dive...');

    try {
      const nextDeepDive =
        usesBackendPath
          ? await requestBackendDeepDive({ subject, mode, pageNumber, materialText, materialFields, question, mockSource })
          : buildMockDeepDive(question);
      const historyItem = {
        id: `history_${Date.now()}`,
        question: question.question,
        pageNumber: question.pageNumber,
        concept: question.concept,
        status: usesBackendPath ? `${getSourceLabel(mockSource)} answered` : 'Local mock answered',
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
    setStatus(usesBackendPath ? `Calling ${getSourceLabel(mockSource)} diagnosis...` : 'Generating local diagnosis...');

    try {
      const nextDiagnosis =
        usesBackendPath
          ? await requestBackendDiagnosis({ subject, mode, question: analysis?.userTask, userAttempt: userAnswer, mockSource })
          : buildMockDiagnosis(userAnswer);

      setDiagnosis(nextDiagnosis);
      setStatus(usesBackendPath ? `${getSourceLabel(mockSource)} diagnosis ready` : 'Local mock diagnosis ready');
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
      if (usesBackendPath && analysis && !markdownToCopy) {
        markdownToCopy = await requestBackendObsidian(analysis, mockSource);
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
    return `API error (${error.code}): ${error.message}`;
  }

  return error?.message || 'Request failed. Check whether the backend dev server is running.';
}

function getSourceLabel(source) {
  const labels = {
    [MOCK_SOURCES.local]: 'Local mock',
    [MOCK_SOURCES.backend]: 'Backend mock',
    [MOCK_SOURCES.realApi]: 'Real API',
  };

  return labels[source] || 'Local mock';
}

function getSourceStatus(source) {
  const statuses = {
    [MOCK_SOURCES.local]: 'Local mock selected',
    [MOCK_SOURCES.backend]: 'Backend mock selected',
    [MOCK_SOURCES.realApi]: 'Real API selected',
  };

  return statuses[source] || 'Local mock selected';
}
