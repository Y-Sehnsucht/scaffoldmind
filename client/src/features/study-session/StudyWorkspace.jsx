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
  const [status, setStatus] = useState('本地 Mock 就绪');
  const [mockSource, setMockSource] = useState(MOCK_SOURCES.local);
  const [loadingAction, setLoadingAction] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [materialText, setMaterialText] = useState(
    '缓存未命中（cache miss）表示请求的数据不在缓存中。局部性（locality）解释了缓存为什么能提升性能。',
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
    setStatus(usesBackendPath ? `正在调用${getSourceLabel(mockSource)}...` : '正在生成本地 Mock...');

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
      setStatus(usesBackendPath ? `${getSourceLabel(mockSource)}解析已生成` : '本地 Mock 解析已生成');
    } catch (error) {
      setErrorMessage(formatError(error));
      setStatus('Mock 请求失败');
    } finally {
      setLoadingAction('');
    }
  }

  async function handleDeepDive(question) {
    setLoadingAction(`deep-dive:${question.id}`);
    setErrorMessage('');
    setStatus(usesBackendPath ? `正在调用${getSourceLabel(mockSource)}追问...` : '正在生成本地追问回答...');

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
        status: usesBackendPath ? `${getSourceLabel(mockSource)}已回答` : '本地 Mock 已回答',
        createdAt: new Date().toISOString(),
      };

      setDeepDive(nextDeepDive);
      setQuestionHistory((current) => [historyItem, ...current]);
      setStatus('提问记录已更新');
    } catch (error) {
      setErrorMessage(formatError(error));
      setStatus('追问请求失败');
    } finally {
      setLoadingAction('');
    }
  }

  async function handleDiagnose() {
    setLoadingAction('diagnose');
    setErrorMessage('');
    setStatus(usesBackendPath ? `正在调用${getSourceLabel(mockSource)}诊断...` : '正在生成本地诊断...');

    try {
      const nextDiagnosis =
        usesBackendPath
          ? await requestBackendDiagnosis({ subject, mode, question: analysis?.userTask, userAttempt: userAnswer, mockSource })
          : buildMockDiagnosis(userAnswer);

      setDiagnosis(nextDiagnosis);
      setStatus(usesBackendPath ? `${getSourceLabel(mockSource)}诊断已生成` : '本地 Mock 诊断已生成');
    } catch (error) {
      setErrorMessage(formatError(error));
      setStatus('诊断请求失败');
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
    setStatus('学习记录已保存');
  }

  function handleClearQuestions() {
    clearQuestionHistory();
    setQuestionHistory([]);
    setStatus('提问记录已清空');
  }

  function handleClearRecords() {
    const confirmed = window.confirm('确认清空全部学习记录吗？');
    if (!confirmed) {
      return;
    }

    clearLearningRecords();
    setLearningRecords([]);
    setStatus('学习记录已清空');
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
      setStatus('Obsidian 笔记已复制');
    } catch (error) {
      if (error.name === 'ApiResponseError') {
        setErrorMessage(formatError(error));
      }

      setCopyFallbackVisible(true);
      setStatus('已显示 Obsidian 手动复制文本');
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
    return `API 错误（${error.code}）：${error.message}`;
  }

  return error?.message || '请求失败，请检查后端开发服务是否正在运行。';
}

function getSourceLabel(source) {
  const labels = {
    [MOCK_SOURCES.local]: '本地 Mock',
    [MOCK_SOURCES.backend]: '后端 Mock',
    [MOCK_SOURCES.realApi]: '真实 API',
  };

  return labels[source] || '本地 Mock';
}

function getSourceStatus(source) {
  const statuses = {
    [MOCK_SOURCES.local]: '已选择本地 Mock',
    [MOCK_SOURCES.backend]: '已选择后端 Mock',
    [MOCK_SOURCES.realApi]: '已选择真实 API',
  };

  return statuses[source] || '已选择本地 Mock';
}
