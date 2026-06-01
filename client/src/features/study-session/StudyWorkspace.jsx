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
import { InputPanel } from './InputPanel.jsx';
import { TopBar } from './TopBar.jsx';

export function StudyWorkspace() {
  const [subject, setSubject] = useState(SUBJECTS[0].id);
  const [mode, setMode] = useState('after_class_review');
  const [status, setStatus] = useState('Mock 就绪');
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

  const currentMode = useMemo(() => LEARNING_MODES.find((item) => item.id === mode) || LEARNING_MODES[0], [mode]);
  const obsidianMarkdown = useMemo(() => buildObsidianMarkdown(analysis, diagnosis), [analysis, diagnosis]);

  useEffect(() => {
    saveQuestionHistory(questionHistory);
  }, [questionHistory]);

  useEffect(() => {
    saveLearningRecords(learningRecords);
  }, [learningRecords]);

  function handlePreferenceToggle(preferenceId) {
    setSelectedPreferences((current) =>
      current.includes(preferenceId)
        ? current.filter((item) => item !== preferenceId)
        : [...current, preferenceId],
    );
  }

  function handleMaterialFieldChange(field, value) {
    setMaterialFields((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleGenerate() {
    const combinedMaterial = [materialText, ...Object.entries(materialFields).map(([key, value]) => `${key}: ${value}`)]
      .filter((item) => item && !item.endsWith(': '))
      .join('\n\n');
    const nextAnalysis = buildMockAnalysis({
      subject,
      mode,
      preferences: selectedPreferences,
      pageNumber,
      materialText: combinedMaterial,
    });

    setAnalysis(nextAnalysis);
    setDeepDive(null);
    setDiagnosis(null);
    setUserAnswer('');
    setCopied(false);
    setCopyFallbackVisible(false);
    setStatus('已生成 mock 解析');
  }

  function handleDeepDive(question) {
    const nextDeepDive = buildMockDeepDive(question);
    const historyItem = {
      id: `history_${Date.now()}`,
      question: question.question,
      pageNumber: question.pageNumber,
      concept: question.concept,
      status: '已回答',
      createdAt: new Date().toISOString(),
    };

    setDeepDive(nextDeepDive);
    setQuestionHistory((current) => [historyItem, ...current]);
    setStatus('已添加追问记录');
  }

  function handleDiagnose() {
    const nextDiagnosis = buildMockDiagnosis(userAnswer);
    setDiagnosis(nextDiagnosis);
    setStatus('已生成 mock 诊断');
  }

  function handleSaveRecord() {
    if (!analysis) {
      return;
    }

    const modeLabel = currentMode.label;
    const nextRecord = {
      id: `record_${Date.now()}`,
      title: analysis.topic,
      subject,
      mode,
      modeLabel,
      input: materialText,
      analysis,
      deepDive,
      userAnswer,
      diagnosis,
      obsidianMarkdown,
      createdAt: new Date().toISOString(),
    };

    setLearningRecords((current) => [nextRecord, ...current]);
    setStatus('已保存学习记录');
  }

  function handleClearQuestions() {
    clearQuestionHistory();
    setQuestionHistory([]);
    setStatus('已清空提问记录');
  }

  function handleClearRecords() {
    const confirmed = window.confirm('确认清空全部学习记录吗？');
    if (!confirmed) {
      return;
    }

    clearLearningRecords();
    setLearningRecords([]);
    setStatus('已清空学习记录');
  }

  async function handleCopyObsidian() {
    setCopied(false);
    setCopyFallbackVisible(false);

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }

      await navigator.clipboard.writeText(obsidianMarkdown);
      setCopied(true);
      setStatus('Obsidian 笔记已复制');
    } catch {
      setCopyFallbackVisible(true);
      setStatus('请手动复制 Obsidian 文本');
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
        onSubjectChange={setSubject}
        onModeChange={setMode}
      />

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
