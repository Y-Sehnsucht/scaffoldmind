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
  requestPptParsing,
} from './backendMockLearning.js';
import { InputPanel } from './InputPanel.jsx';
import { MaterialComposer } from './MaterialComposer.jsx';
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
  const [sourceFile, setSourceFile] = useState(null);
  const [sourceFileObject, setSourceFileObject] = useState(null);
  const [parsedPpt, setParsedPpt] = useState(null);
  const [pptParseStatus, setPptParseStatus] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [activeRecordId, setActiveRecordId] = useState('');
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
    setStatus(getSourceStatus(nextSource));
  }

  function handleFileSelect(file) {
    if (!file) {
      return;
    }

    setSourceFile({
      name: file.name,
      size: file.size,
      type: file.type || inferFileType(file.name),
      selectedAt: new Date().toISOString(),
    });
    setSourceFileObject(file);
    setParsedPpt(null);
    setPptParseStatus('文件已添加。PPTX 可解析全部页面文本和图片占位。');
    setStatus('来源文件已添加');
  }

  async function handleParsePpt() {
    if (!sourceFile || !sourceFileObject) {
      setErrorMessage('请先添加 PPT、PDF 或图片文件。');
      return;
    }

    if (!sourceFile.name.toLowerCase().endsWith('.pptx')) {
      const fallbackText = [
        `【文件来源】${sourceFile.name}`,
        `PPT 第 ${pageNumber} 页：系统已建立来源链接。`,
        '当前轻量解析器只支持 .pptx 的文本和图片占位结构读取。',
        'PDF、图片 OCR、旧版 .ppt 和图片结构精准识别需要后续专门解析服务。',
      ].join('\n');

      setMaterialText(fallbackText);
      setPptParseStatus('该文件类型暂不支持真实解析，已填入可编辑来源占位。');
      setStatus('来源占位已填入输入框');
      return;
    }

    setLoadingAction('parse-ppt');
    setErrorMessage('');
    setPptParseStatus('正在读取 PPTX 全部幻灯片文本和图片占位结构...');

    try {
      const fileBase64 = await readFileAsBase64(sourceFileObject);
      const parsed = await requestPptParsing({
        fileName: sourceFile.name,
        fileBase64,
        pageNumber,
      });

      setParsedPpt(parsed);
      applyParsedSlide(parsed, parsed.pageNumber);
      setPptParseStatus(`已解析 ${parsed.slideCount} 页。可在左侧选择任意页填入中间输入框。`);
      setStatus('PPTX 全部页面已解析');
    } catch (error) {
      const fallbackText = [
        `【PPT 解析失败 fallback】文件：${sourceFile.name}`,
        `PPT 第 ${pageNumber} 页：请手动粘贴该页文字。`,
        '系统保留文件来源和页码，不清空已有输入。',
      ].join('\n');

      setMaterialText((current) => current || fallbackText);
      setPptParseStatus('解析失败，已保留当前输入。请确认后端服务运行且文件为 .pptx。');
      setErrorMessage(formatError(error));
      setStatus('PPTX 解析失败');
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
      setStatus(usesBackendPath ? `${getSourceLabel(mockSource)}解析已生成并自动保存` : '本地 Mock 解析已生成并自动保存');
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

      setDeepDive(nextDeepDive);
      markQuestionAnswered(question);
      setStatus('追问已回答并自动保存');
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
      setStatus(usesBackendPath ? `${getSourceLabel(mockSource)}诊断已生成并自动保存` : '本地 Mock 诊断已生成并自动保存');
    } catch (error) {
      setErrorMessage(formatError(error));
      setStatus('诊断请求失败');
    } finally {
      setLoadingAction('');
    }
  }

  function handleSaveRecord() {
    if (!analysis || !activeRecordId) {
      return;
    }

    setStatus('当前学习记录已自动保存');
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
    setActiveRecordId('');
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
    const fallbackItem = {
      id: `history_${Date.now()}`,
      questionId: question.id,
      question: question.question,
      pageNumber: question.pageNumber,
      concept: question.concept,
      status: usesBackendPath ? `${getSourceLabel(mockSource)}已回答` : '本地 Mock 已回答',
      createdAt: new Date().toISOString(),
    };

    setQuestionHistory((current) => {
      let updated = false;
      const nextItems = current.map((item) => {
        if (item.questionId !== question.id) {
          return item;
        }

        updated = true;
        return {
          ...item,
          status: fallbackItem.status,
          answeredAt: new Date().toISOString(),
        };
      });

      return updated ? nextItems : [fallbackItem, ...current].slice(0, 50);
    });
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
        onSubjectChange={setSubject}
        onModeChange={setMode}
        onMockSourceChange={handleMockSourceChange}
      />

      {errorMessage ? (
        <div className="mx-auto mt-4 px-4">
          <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
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
          parsedPpt={parsedPpt}
          pptParseStatus={pptParseStatus}
          onPageNumberChange={setPageNumber}
          onPreferenceToggle={handlePreferenceToggle}
          onFileSelect={handleFileSelect}
          onParsePpt={handleParsePpt}
          onUseParsedSlide={handleUseParsedSlide}
          isParsing={loadingAction === 'parse-ppt'}
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
    updatedAt: new Date().toISOString(),
    createdAt: data.analysis.id?.replace('analysis_', '') || new Date().toISOString(),
  };
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

function inferFileType(fileName) {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith('.ppt') || lowerName.endsWith('.pptx')) {
    return 'PowerPoint';
  }
  if (lowerName.endsWith('.pdf')) {
    return 'PDF';
  }
  return '文件';
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
  const text = slide.textBlocks.map((block) => block.text).filter(Boolean).join('\n') ||
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
