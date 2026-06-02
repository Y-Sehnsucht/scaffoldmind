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
import { validateMaterialInput, validateUserAttempt } from '../../utils/inputValidation.js';
import { formatRecoverableError } from '../../utils/errorMessages.js';
import { buildQuestionHistoryFromRecords, buildQuestionTypeStats } from '../../utils/profileInsights.js';
import { buildReviewPlanMarkdown } from '../../utils/reviewPlan.js';
import { AnalysisPanel } from './AnalysisPanel.jsx';
import {
  MOCK_SOURCES,
  combineMaterialText,
  requestAiStatus,
  requestBackendAnalysis,
  requestBackendDeepDive,
  requestBackendDiagnosis,
  requestBackendObsidian,
  requestClearLearningRecords,
  requestLearningRecords,
  requestMaterialExtraction,
  requestPptParsing,
  requestProfileSummary,
  requestSaveLearningRecord,
} from './backendMockLearning.js';
import { InputPanel } from './InputPanel.jsx';
import { MaterialComposer } from './MaterialComposer.jsx';
import { TopBar } from './TopBar.jsx';

export function StudyWorkspace() {
  const [subject, setSubject] = useState(SUBJECTS[0].id);
  const [mode, setMode] = useState('after_class_review');
  const [status, setStatus] = useState('本地演示就绪');
  const [mockSource, setMockSource] = useState(MOCK_SOURCES.local);
  const [loadingAction, setLoadingAction] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const [materialText, setMaterialText] = useState(
    '缓存未命中（cache miss）表示请求的数据不在缓存中。局部性（locality）解释了缓存为什么能提升性能。',
  );
  const [materialFields, setMaterialFields] = useState({});
  const [selectedPreferences, setSelectedPreferences] = useState(['framework_first', 'why_chain', 'exam_focus']);
  const [sourceFile, setSourceFile] = useState(null);
  const [materialInfo, setMaterialInfo] = useState(null);
  const [parsedPpt, setParsedPpt] = useState(null);
  const [sourceStatus, setSourceStatus] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [activeRecordId, setActiveRecordId] = useState('');
  const [deepDive, setDeepDive] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [diagnosis, setDiagnosis] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [questionHistory, setQuestionHistory] = useState(() => loadQuestionHistory());
  const [learningRecords, setLearningRecords] = useState(() => loadLearningRecords());
  const [profileSummary, setProfileSummary] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copyFallbackVisible, setCopyFallbackVisible] = useState(false);
  const [backendObsidianMarkdown, setBackendObsidianMarkdown] = useState('');
  const [aiStatus, setAiStatus] = useState(null);

  const currentMode = useMemo(() => LEARNING_MODES.find((item) => item.id === mode) || LEARNING_MODES[0], [mode]);
  const localObsidianMarkdown = useMemo(() => buildObsidianMarkdown(analysis, diagnosis), [analysis, diagnosis]);
  const usesBackendPath = mockSource !== MOCK_SOURCES.local;
  const obsidianMarkdown = usesBackendPath ? backendObsidianMarkdown : localObsidianMarkdown;
  const questionTypeStats = useMemo(() => {
    const localStats = buildQuestionTypeStats(questionHistory);
    return localStats.length ? localStats : profileSummary?.commonQuestionTypes || [];
  }, [profileSummary?.commonQuestionTypes, questionHistory]);

  useEffect(() => {
    saveQuestionHistory(questionHistory);
  }, [questionHistory]);

  useEffect(() => {
    saveLearningRecords(learningRecords);
  }, [learningRecords]);

  useEffect(() => {
    let cancelled = false;

    async function loadBackendState() {
      try {
        const [nextStatus, records, profile] = await Promise.all([
          requestAiStatus(),
          requestLearningRecords(20),
          requestProfileSummary(),
        ]);

        if (!cancelled) {
          setAiStatus(nextStatus);
          setLearningRecords((current) => (records.length ? records : current));
          setQuestionHistory((current) => (current.length ? current : buildQuestionHistoryFromRecords(records)));
          setProfileSummary(profile);
        }
      } catch {
        if (!cancelled) {
          setAiStatus(null);
        }
      }
    }

    loadBackendState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!analysis || !activeRecordId) {
      return;
    }

    const autoRecord = buildLearningRecord(activeRecordId, {
      analysis,
      subject,
      mode,
      modeLabel: currentMode.label,
      mockSource,
      materialText,
      sourceFile,
      deepDive,
      userAnswer,
      diagnosis,
      obsidianMarkdown,
      questionHistory,
    });

    setLearningRecords((current) => {
      const rest = current.filter((record) => record.id !== activeRecordId);
      return [autoRecord, ...rest].slice(0, 20);
    });
  }, [
    activeRecordId,
    analysis,
    currentMode.label,
    deepDive,
    diagnosis,
    materialText,
    mockSource,
    mode,
    obsidianMarkdown,
    questionHistory,
    sourceFile,
    subject,
    userAnswer,
  ]);

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
    setStatus(getSourceStatus(nextSource, aiStatus));
  }

  async function handleFileSelect(file) {
    setErrorMessage('');
    setMaterialInfo(null);
    setParsedPpt(null);
    setSourceStatus('');

    if (!file) {
      setSourceFile(null);
      return;
    }

    const nextFile = {
      name: file.name,
      size: file.size,
      type: file.type || inferFileType(file.name),
      selectedAt: new Date().toISOString(),
    };
    setSourceFile(nextFile);
    setLoadingAction('material');

    try {
      if (file.name.toLowerCase().endsWith('.pptx')) {
        setStatus(`正在解析 PPTX：${file.name}`);
        setSourceStatus('正在读取 PPTX 全部幻灯片文本和图片占位结构...');
        const fileBase64 = await readFileAsBase64(file);
        const parsed = await requestPptParsing({
          fileName: file.name,
          fileBase64,
          pageNumber,
        });
        setParsedPpt(parsed);
        applyParsedSlide(parsed, parsed.pageNumber);
        setSourceStatus(`已解析 ${parsed.slideCount} 页，可在下方选择页面。`);
        setStatus('PPTX 全部页面已解析');
        return;
      }

      if (isTextMaterial(file.name)) {
        setStatus(`正在提取材料：${file.name}`);
        setSourceStatus('正在提取 TXT / Markdown / PDF 文本...');
        const extracted = await requestMaterialExtraction(file);
        setMaterialInfo(extracted);
        setMaterialText(extracted.extractedText || '');
        setSourceStatus(
          extracted.warnings?.length
            ? `材料已导入，但 ${extracted.warnings[0]}`
            : `材料已导入：${extracted.fileName}`,
        );
        setStatus('材料已导入输入框');
        return;
      }

      const fallbackText = [
        `【文件来源】${file.name}`,
        `当前版本支持 TXT、Markdown、PDF 文本提取和 PPTX 轻量解析。`,
        '图片 OCR、旧版 .ppt 和视觉结构理解需要后续专门解析服务。',
      ].join('\n');
      setMaterialText(fallbackText);
      setSourceStatus('该文件类型暂不支持真实提取，已填入可编辑来源占位。');
      setStatus('来源占位已填入输入框');
    } catch (error) {
      setErrorMessage(formatRecoverableError(error, file.name.toLowerCase().endsWith('.pptx') ? 'ppt' : 'material'));
      setSourceStatus('材料提取失败，页面已保留原有输入。');
      setStatus('材料提取失败');
    } finally {
      setLoadingAction('');
    }
  }

  function handleUseParsedSlide(nextPageNumber) {
    if (!parsedPpt) {
      return;
    }

    setPageNumber(nextPageNumber);
    applyParsedSlide(parsedPpt, nextPageNumber);
    setStatus(`已切换到 PPT 第 ${nextPageNumber} 页`);
  }

  function applyParsedSlide(parsed, selectedPageNumber) {
    const slide = parsed.slides.find((item) => item.pageNumber === Number(selectedPageNumber)) || parsed.slides[0];
    if (!slide) {
      return;
    }

    setPageNumber(slide.pageNumber);
    setMaterialText(formatParsedSlideText(parsed, slide));
  }

  async function handleGenerate() {
    const validation = validateMaterialInput(materialText, materialFields);
    if (!validation.valid) {
      setErrorMessage(validation.message);
      setStatus('等待学习材料');
      return;
    }

    setLoadingAction('generate');
    setErrorMessage('');
    setStatus(usesBackendPath ? `正在调用${getSourceLabel(mockSource)}分析材料...` : '正在生成本地演示解析...');

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

      const nextRecordId = result.analysis?.id || `record_${Date.now()}`;

      setAnalysis(result.analysis);
      setActiveRecordId(nextRecordId);
      setBackendObsidianMarkdown(result.obsidianMarkdown || '');
      setDeepDive(null);
      setDiagnosis(null);
      setUserAnswer('');
      setCopied(false);
      setCopyFallbackVisible(false);
      appendGeneratedQuestions(result.analysis);
      setStatus(usesBackendPath ? `${getSourceLabel(mockSource)}解析已生成并自动保存` : '本地演示解析已生成并自动保存');
    } catch (error) {
      setErrorMessage(formatRecoverableError(error, mockSource === MOCK_SOURCES.realApi ? 'real_api' : 'backend'));
      setStatus('生成请求失败');
    } finally {
      setLoadingAction('');
    }
  }

  async function handleDeepDive(question) {
    setLoadingAction(`deep-dive:${question.id}`);
    setErrorMessage('');
    setStatus(usesBackendPath ? `正在调用${getSourceLabel(mockSource)}回答追问...` : '正在生成本地演示追问...');

    try {
      const nextDeepDive =
        usesBackendPath
          ? await requestBackendDeepDive({ subject, mode, pageNumber, materialText, materialFields, question, mockSource })
          : buildMockDeepDive(question);

      setDeepDive(nextDeepDive);
      markQuestionAnswered(question);
      setStatus('追问已回答并自动保存');
    } catch (error) {
      setErrorMessage(formatRecoverableError(error, mockSource === MOCK_SOURCES.realApi ? 'real_api' : 'backend'));
      setStatus('追问请求失败');
    } finally {
      setLoadingAction('');
    }
  }

  async function handleDiagnose() {
    const validation = validateUserAttempt(userAnswer);
    if (!validation.valid) {
      setErrorMessage(validation.message);
      setStatus('等待用户回答');
      return;
    }

    setLoadingAction('diagnose');
    setErrorMessage('');
    setStatus(usesBackendPath ? `正在调用${getSourceLabel(mockSource)}诊断回答...` : '正在生成本地演示诊断...');

    try {
      const nextDiagnosis =
        usesBackendPath
          ? await requestBackendDiagnosis({ subject, mode, question: analysis?.userTask, userAttempt: userAnswer, mockSource })
          : buildMockDiagnosis(userAnswer);

      setDiagnosis(nextDiagnosis);
      markQuestionsReinforced();
      setStatus(usesBackendPath ? `${getSourceLabel(mockSource)}诊断已生成并自动保存` : '本地演示诊断已生成并自动保存');
    } catch (error) {
      setErrorMessage(formatRecoverableError(error, mockSource === MOCK_SOURCES.realApi ? 'real_api' : 'backend'));
      setStatus('诊断请求失败');
    } finally {
      setLoadingAction('');
    }
  }

  async function handleSaveRecord() {
    if (!analysis || !activeRecordId) {
      return;
    }

    const record = buildLearningRecord(activeRecordId, {
      analysis,
      subject,
      mode,
      modeLabel: currentMode.label,
      mockSource,
      materialText,
      sourceFile,
      deepDive,
      userAnswer,
      diagnosis,
      obsidianMarkdown,
      questionHistory,
    });

    setLoadingAction('save-record');
    setErrorMessage('');

    try {
      const savedRecord = await requestSaveLearningRecord(record);
      const [records, profile] = await Promise.all([requestLearningRecords(20), requestProfileSummary()]);
      setLearningRecords(records);
      setProfileSummary(profile);
      setStatus(`学习记录已保存到后端：${savedRecord.title}`);
    } catch (error) {
      setLearningRecords((current) => [record, ...current.filter((item) => item.id !== record.id)].slice(0, 20));
      setErrorMessage(formatRecoverableError(error, 'backend'));
      setStatus('后端保存失败，已临时保存到浏览器本地');
    } finally {
      setLoadingAction('');
    }
  }

  function handleClearQuestions() {
    clearQuestionHistory();
    setQuestionHistory([]);
    setStatus('提问记录已清空');
  }

  async function handleClearRecords() {
    const confirmed = window.confirm('确认清空全部学习记录吗？');
    if (!confirmed) {
      return;
    }

    setLoadingAction('clear-records');
    setErrorMessage('');

    try {
      await requestClearLearningRecords();
      const profile = await requestProfileSummary();
      clearLearningRecords();
      setLearningRecords([]);
      setActiveRecordId('');
      setProfileSummary(profile);
      setStatus('学习记录已清空');
    } catch (error) {
      clearLearningRecords();
      setLearningRecords([]);
      setActiveRecordId('');
      setErrorMessage(formatRecoverableError(error, 'backend'));
      setStatus('后端清空失败，已清空浏览器本地记录');
    } finally {
      setLoadingAction('');
    }
  }

  function handleSelectRecord(record) {
    if (!record?.analysis) {
      setErrorMessage('这条学习记录缺少结构化解析内容，暂时无法恢复。');
      return;
    }

    setActiveRecordId(record.id);
    setSubject(record.subject || SUBJECTS[0].id);
    setMode(record.mode || 'after_class_review');
    setMockSource(record.mockSource || MOCK_SOURCES.local);
    setMaterialText(record.input || '');
    setSourceFile(record.sourceFile || null);
    setAnalysis(record.analysis);
    setDeepDive(record.deepDive || null);
    setUserAnswer(record.userAnswer || '');
    setDiagnosis(record.diagnosis || null);
    setQuestionHistory(record.questionHistory?.length ? record.questionHistory : loadQuestionHistory());
    setBackendObsidianMarkdown(record.obsidianMarkdown || '');
    setErrorMessage('');
    setCopied(false);
    setCopyFallbackVisible(false);
    setStatus(`已恢复学习记录：${record.title || record.analysis.topic}`);
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
        setErrorMessage(formatRecoverableError(error, mockSource === MOCK_SOURCES.realApi ? 'real_api' : 'backend'));
      }

      setCopyFallbackVisible(true);
      setStatus('已显示 Obsidian 手动复制文本');
    }
  }

  async function handleCopyReviewPlan() {
    setErrorMessage('');

    try {
      const markdown = buildReviewPlanMarkdown(profileSummary, learningRecords, questionHistory, questionTypeStats);

      if (!navigator.clipboard?.writeText) {
        throw new Error('当前浏览器不支持自动复制。');
      }

      await navigator.clipboard.writeText(markdown);
      setStatus('复习计划已复制，可粘贴到 Obsidian');
    } catch (error) {
      setErrorMessage(`复习计划复制失败：${error?.message || '请检查浏览器剪贴板权限。'}`);
      setStatus('复习计划复制失败');
    }
  }

  function appendGeneratedQuestions(nextAnalysis) {
    const questions = nextAnalysis?.guidedQuestions || [];
    if (questions.length === 0) {
      return;
    }

    const additions = questions.map((question) => ({
      id: `auto_${nextAnalysis.id}_${question.id}`,
      questionId: question.id,
      question: question.question,
      pageNumber: question.pageNumber,
      concept: question.concept,
      type: question.type,
      typeLabel: question.typeLabel,
      status: '待追问',
      createdAt: new Date().toISOString(),
    }));

    setQuestionHistory((current) => {
      const existingQuestionIds = new Set(current.map((item) => item.questionId));
      const uniqueAdditions = additions.filter((item) => !existingQuestionIds.has(item.questionId));
      return [...uniqueAdditions, ...current].slice(0, 50);
    });
  }

  function markQuestionAnswered(question) {
    const statusLabel = usesBackendPath ? `${getSourceLabel(mockSource)}已回答` : '本地演示已回答';
    setQuestionHistory((current) => {
      let updated = false;
      const nextItems = current.map((item) => {
        if (item.questionId !== question.id) {
          return item;
        }

        updated = true;
        return {
          ...item,
          status: statusLabel,
          answeredAt: new Date().toISOString(),
        };
      });

      if (updated) {
        return nextItems;
      }

      return [
        {
          id: `history_${Date.now()}`,
          questionId: question.id,
          question: question.question,
          pageNumber: question.pageNumber,
          concept: question.concept,
          type: question.type,
          typeLabel: question.typeLabel,
          status: statusLabel,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 50);
    });
  }

  function markQuestionsReinforced() {
    setQuestionHistory((current) =>
      current.map((item, index) =>
        index === 0 || item.status.includes('已回答')
          ? { ...item, status: '已强化', reinforcedAt: new Date().toISOString() }
          : item,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-[#101419] text-slate-100">
      <TopBar
        subject={subject}
        subjects={SUBJECTS}
        mode={mode}
        modes={LEARNING_MODES}
        status={status}
        mockSource={mockSource}
        aiStatus={aiStatus}
        onSubjectChange={setSubject}
        onModeChange={setMode}
        onMockSourceChange={handleMockSourceChange}
      />

      {errorMessage ? (
        <div className="mx-auto mt-4 px-4">
          <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-100">
            {errorMessage}
          </div>
        </div>
      ) : null}

      <section className="grid h-[calc(100vh-84px)] w-full gap-4 px-4 py-4 xl:grid-cols-[25vw_minmax(0,1fr)_25vw]">
        <InputPanel
          currentMode={currentMode}
          pageNumber={pageNumber}
          selectedPreferences={selectedPreferences}
          preferences={LEARNING_PREFERENCES}
          sourceFile={sourceFile}
          materialInfo={materialInfo}
          parsedPpt={parsedPpt}
          sourceStatus={sourceStatus}
          onPageNumberChange={setPageNumber}
          onPreferenceToggle={handlePreferenceToggle}
          onFileSelect={handleFileSelect}
          onUseParsedSlide={handleUseParsedSlide}
          isFileLoading={loadingAction === 'material'}
        />

        <div className="min-h-0 overflow-y-auto rounded-[22px] border border-white/10 bg-[#1d2229] shadow-2xl shadow-black/20">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#1d2229]/95 px-5 py-4 backdrop-blur">
            <div>
              <h2 className="text-base font-semibold text-white">对话</h2>
              <p className="mt-1 text-xs text-slate-400">中间输入、结构化解析、追问、诊断与笔记输出</p>
            </div>
            <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-slate-400">{currentMode.label}</span>
          </div>
          <div className="space-y-4 p-5">
            <MaterialComposer
              currentMode={currentMode}
              materialText={materialText}
              materialFields={materialFields}
              onMaterialTextChange={setMaterialText}
              onMaterialFieldChange={handleMaterialFieldChange}
              onGenerate={handleGenerate}
              onSaveRecord={handleSaveRecord}
              canSave={Boolean(analysis)}
              isLoading={loadingAction === 'generate'}
              isSaving={loadingAction === 'save-record'}
              loadingMessage={mockSource === MOCK_SOURCES.realApi ? '正在分析材料，真实 AI 可能需要稍等...' : '正在分析材料...'}
              mockSource={mockSource}
            />
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
              sourceLabel={getSourceLabel(mockSource)}
            />
            <ObsidianExport
              markdown={obsidianMarkdown}
              copied={copied}
              fallbackVisible={copyFallbackVisible}
              onCopy={handleCopyObsidian}
            />
          </div>
        </div>

        <QuestionHistoryPanel
          items={questionHistory}
          records={learningRecords}
          profileSummary={profileSummary}
          questionTypeStats={questionTypeStats}
          activeRecordId={activeRecordId}
          onSelectRecord={handleSelectRecord}
          onCopyReviewPlan={handleCopyReviewPlan}
          onClearQuestions={handleClearQuestions}
          onClearRecords={handleClearRecords}
        />
      </section>

      <PageDrawer open={drawerOpen} analysis={analysis} fileName={sourceFile?.name || ''} onClose={() => setDrawerOpen(false)} />
    </main>
  );
}

function buildLearningRecord(id, data) {
  return {
    id,
    title: data.analysis.topic,
    subject: data.subject,
    mode: data.mode,
    modeLabel: data.modeLabel,
    mockSource: data.mockSource,
    input: data.materialText,
    sourceFile: data.sourceFile,
    analysis: data.analysis,
    deepDive: data.deepDive,
    userAnswer: data.userAnswer,
    diagnosis: data.diagnosis,
    obsidianMarkdown: data.obsidianMarkdown,
    questionHistory: data.questionHistory || [],
    updatedAt: new Date().toISOString(),
    createdAt: data.analysis.id?.replace('analysis_', '') || new Date().toISOString(),
  };
}

function getSourceLabel(source) {
  const labels = {
    [MOCK_SOURCES.local]: '本地演示',
    [MOCK_SOURCES.backend]: '后端演示',
    [MOCK_SOURCES.realApi]: '真实 AI',
  };

  return labels[source] || '本地演示';
}

function getSourceStatus(source, aiStatus) {
  const statuses = {
    [MOCK_SOURCES.local]: '已选择本地演示',
    [MOCK_SOURCES.backend]: '已选择后端演示，请确认 Express 后端已启动',
    [MOCK_SOURCES.realApi]: aiStatus?.hasApiKey
      ? `已选择真实 AI：${aiStatus.providerLabel} / ${aiStatus.model}`
      : `已选择真实 AI：${aiStatus?.providerLabel || 'provider'} 未配置 API Key`,
  };

  return statuses[source] || '已选择本地演示';
}

function inferFileType(fileName) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith('.ppt') || lowerName.endsWith('.pptx')) {
    return 'PowerPoint';
  }
  if (lowerName.endsWith('.pdf')) {
    return 'PDF';
  }
  if (lowerName.endsWith('.md') || lowerName.endsWith('.markdown')) {
    return 'Markdown';
  }
  if (lowerName.endsWith('.txt')) {
    return 'TXT';
  }
  return '文件';
}

function isTextMaterial(fileName) {
  const lowerName = fileName.toLowerCase();
  return lowerName.endsWith('.txt') || lowerName.endsWith('.md') || lowerName.endsWith('.markdown') || lowerName.endsWith('.pdf');
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
    reader.onerror = () => reject(new Error('读取文件失败。'));
    reader.readAsDataURL(file);
  });
}

function formatParsedSlideText(parsed, slide) {
  const text =
    slide.textBlocks.map((block) => block.text).filter(Boolean).join('\n') ||
    '当前页没有可直接读取的文本。若文字在图片中，需要 OCR 或视觉模型。';
  const structure = (slide.structure || [])
    .map((item) => {
      if (item.type === 'text') {
        return `- 文本 ${item.order}: ${item.text}`;
      }
      return `- 图片 ${item.order}: ${item.description}`;
    })
    .join('\n');
  const warnings = (parsed.warnings || []).map((warning) => `- ${warning}`).join('\n');

  return [
    `【PPTX 解析结果】${parsed.fileName}`,
    `来源页码：PPT 第 ${slide.pageNumber} 页 / 共 ${parsed.slideCount} 页`,
    '',
    '## 提取文字',
    text,
    '',
    '## 页面结构',
    structure || '- 未识别到结构元素。',
    '',
    '## 解析说明',
    warnings,
  ].join('\n');
}
