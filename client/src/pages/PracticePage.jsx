import { useEffect, useMemo, useState } from 'react';
import { EvaluationCard } from '../features/practice/EvaluationCard.jsx';
import { MistakeList } from '../features/practice/MistakeList.jsx';
import { PracticeControls } from '../features/practice/PracticeControls.jsx';
import { PracticeQuestionCard } from '../features/practice/PracticeQuestionCard.jsx';
import { PracticeStatsStrip } from '../features/practice/PracticeStatsStrip.jsx';
import { getCurrentSearchParams } from '../routes/navigation.js';
import { generatePracticeQuestion, evaluatePracticeAnswer } from '../shared/api/practiceClient.js';
import { loadLearnerProfile } from '../shared/storage/agentMemoryStorage.js';
import {
  loadPracticeMistakes,
  loadPracticeStats,
  recordPracticeAttempt,
} from '../shared/storage/practiceStorage.js';

export function PracticePage() {
  const initialConcept = useMemo(() => getInitialConcept(), []);
  const [concept, setConcept] = useState(initialConcept);
  const [difficulty, setDifficulty] = useState('medium');
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [stats, setStats] = useState(() => loadPracticeStats());
  const [mistakes, setMistakes] = useState(() => loadPracticeMistakes());
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [startedAt, setStartedAt] = useState(null);

  useEffect(() => {
    if (initialConcept) {
      handleGenerate(initialConcept);
    }
    // Run once for query prefill.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGenerate(nextConcept = concept) {
    const normalizedConcept = String(nextConcept || '').trim() || '补码溢出';
    setLoading(true);
    setStatus('正在生成常考题...');
    setEvaluation(null);
    setAnswer('');

    try {
      const data = await generatePracticeQuestion({
        subject: 'CSAPP',
        concept: normalizedConcept,
        difficulty,
        learnerProfile: loadLearnerProfile(),
        recentMistakes: loadPracticeMistakes().slice(0, 8),
      });
      setQuestion(data);
      setStatus(data.providerStatus === 'fallback' ? '后端已使用 fallback 题目。' : '题目已生成。');
    } catch (error) {
      const fallback = buildFallbackQuestion(normalizedConcept, difficulty);
      setQuestion(fallback);
      setStatus(`后端暂不可用，已使用本地 fallback：${error.message || '请求失败'}`);
    } finally {
      setStartedAt(Date.now());
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!question || !answer.trim()) return;

    setLoading(true);
    setStatus('正在评价你的答案...');

    try {
      const data = await evaluatePracticeAnswer({
        question: question.question,
        userAnswer: answer,
        expectedKeyPoints: question.expectedKeyPoints || [],
        knowledgePoint: question.knowledgePoint,
        subject: 'CSAPP',
      });
      completeAttempt(data);
      setStatus(data.providerStatus === 'fallback' ? '后端已使用 fallback 评价。' : '评价已完成。');
    } catch (error) {
      const fallback = buildFallbackEvaluation(question, answer);
      completeAttempt(fallback);
      setStatus(`后端暂不可用，已使用本地 fallback：${error.message || '请求失败'}`);
    } finally {
      setLoading(false);
    }
  }

  function completeAttempt(result) {
    const elapsedSeconds = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 0;
    const withAnswer = { ...result, userAnswer: answer };
    setEvaluation(withAnswer);
    setStats(recordPracticeAttempt({ question, evaluation: withAnswer, elapsedSeconds }));
    setMistakes(loadPracticeMistakes());
  }

  return (
    <main className="h-full overflow-y-auto bg-[var(--bg)] px-6 py-6 text-[var(--text)] lg:px-8">
      <div className="mx-auto flex w-full max-w-none flex-col gap-6">
        <section className="rounded-[36px] border border-[var(--border)] bg-[var(--panel-strong)] p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm text-teal-300">Practice</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">把薄弱概念变成一道题。</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                根据你提问过的知识点、错题和当前选择的 concept 生成常考题。统计和错题只保存在本地 localStorage。
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--muted)]">
              {status || '后端失败时会自动 fallback，不影响刷题。'}
            </div>
          </div>
        </section>

        <PracticeStatsStrip stats={stats} />
        <PracticeControls
          concept={concept}
          difficulty={difficulty}
          loading={loading}
          onConceptChange={setConcept}
          onDifficultyChange={setDifficulty}
          onGenerate={() => handleGenerate()}
        />

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <PracticeQuestionCard
              question={question}
              answer={answer}
              loading={loading}
              onAnswerChange={setAnswer}
              onSubmit={handleSubmit}
              onRegenerateSameConcept={() => handleGenerate(question?.knowledgePoint || concept)}
            />
            <EvaluationCard evaluation={evaluation} />
          </div>
          <MistakeList mistakes={mistakes} />
        </div>
      </div>
    </main>
  );
}

function getInitialConcept() {
  const params = getCurrentSearchParams();
  const fromQuery = params.get('concept');
  if (fromQuery) return fromQuery;
  const latestMistake = loadPracticeMistakes()[0];
  return latestMistake?.knowledgePoint || '补码溢出';
}

function buildFallbackQuestion(concept, difficulty) {
  return {
    id: `local_practice_${Date.now()}`,
    question: `请解释「${concept}」在 CSAPP 或数据结构题目中最容易被考察的边界条件，并举一个会出错的判断。`,
    answerType: 'short_answer',
    choices: [],
    knowledgePoint: concept,
    difficulty,
    expectedKeyPoints: ['说清定义', '指出边界条件', '说明常见误区', '给出修正判断'],
    hint: '先写概念本质，再写一个容易误判的例子。',
    providerStatus: 'local_fallback',
  };
}

function buildFallbackEvaluation(question, userAnswer) {
  const expected = question.expectedKeyPoints || [];
  const hitPoints = expected.filter((point) => userAnswer.includes(point.slice(0, 2)));
  const correct = hitPoints.length >= Math.max(2, Math.ceil(expected.length / 2));

  return {
    correct,
    score: correct ? 82 : 55,
    feedback: correct
      ? '你的回答已经覆盖了主要判断，但还可以补一个更具体的反例。'
      : `你的回答提到了「${userAnswer.slice(0, 24)}」，但没有把概念边界和常见误判说完整。`,
    mainIssue: correct ? '缺少具体反例' : '概念定义和边界条件没有分开说明',
    correctKeyPoints: hitPoints.length ? hitPoints : ['能主动作答'],
    missedKeyPoints: expected.filter((point) => !hitPoints.includes(point)),
    nextAction: correct ? 'next_concept' : 'same_concept',
    providerStatus: 'local_fallback',
  };
}
