import { useEffect, useState } from 'react';
import { RippleButton } from '../components/ui/ripple-button.jsx';
import { PriorityConcepts } from '../features/review/PriorityConcepts.jsx';
import { RecommendedPractice } from '../features/review/RecommendedPractice.jsx';
import { ReviewPlanList } from '../features/review/ReviewPlanList.jsx';
import { ReviewSummary } from '../features/review/ReviewSummary.jsx';
import { requestReviewPlan } from '../shared/api/reviewClient.js';
import { loadConversations, loadLearnerProfile } from '../shared/storage/agentMemoryStorage.js';
import { loadPracticeMistakes, loadPracticeStats } from '../shared/storage/practiceStorage.js';

export function ReviewPage() {
  const [plan, setPlan] = useState(() => buildFallbackReviewPlan());
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('复习计划会根据本地学习记录生成。');

  useEffect(() => {
    refreshPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshPlan() {
    const payload = buildReviewPayload();
    setLoading(true);
    setStatus('正在整理本地画像、历史和错题...');

    try {
      const data = await requestReviewPlan(payload);
      setPlan(data);
      setStatus(data.providerStatus === 'fallback' ? '后端已使用 fallback 复习计划。' : '复习计划已更新。');
    } catch (error) {
      setPlan(buildFallbackReviewPlan(payload));
      setStatus(`后端暂不可用，已使用本地 fallback：${error.message || '请求失败'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="h-full overflow-y-auto bg-[var(--bg)] px-6 py-6 text-[var(--text)] lg:px-8">
      <div className="mx-auto flex w-full max-w-none flex-col gap-6">
        <section className="rounded-[36px] border border-[var(--border)] bg-[var(--panel-strong)] p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm text-teal-300">Review</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">把散落记录排成复习顺序。</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
                综合 learnerProfile、对话历史、刷题统计和错题，生成下一轮复习计划。所有跳转都回到本地页面。
              </p>
            </div>
            <RippleButton
              className="rounded-2xl bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={refreshPlan}
              disabled={loading}
            >
              {loading ? '正在生成...' : '重新生成计划'}
            </RippleButton>
          </div>
          <p className="mt-4 rounded-2xl bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--muted)]">{status}</p>
        </section>

        <ReviewSummary plan={plan} />
        <PriorityConcepts concepts={plan.priorityConcepts || []} />

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
          <ReviewPlanList items={plan.reviewPlan || []} />
          <RecommendedPractice items={plan.recommendedPractice || []} />
        </div>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-base font-semibold text-[var(--text)]">下一步建议</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            {(plan.nextActions || []).map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </section>
      </div>
    </main>
  );
}

function buildReviewPayload() {
  const learnerProfile = loadLearnerProfile();
  const recentConversations = loadConversations().slice(0, 8);
  const practiceStats = loadPracticeStats();
  const mistakes = loadPracticeMistakes();
  const weakConcepts = [
    ...(learnerProfile.weakConceptHints || []).map((item) => item.label).filter(Boolean),
    ...mistakes.map((item) => item.knowledgePoint).filter(Boolean),
  ];

  return {
    learnerProfile,
    recentConversations,
    practiceStats,
    weakConcepts: Array.from(new Set(weakConcepts)).slice(0, 8),
  };
}

function buildFallbackReviewPlan(payload = buildReviewPayload()) {
  const concepts = payload.weakConcepts?.length ? payload.weakConcepts : ['缓存未命中（cache miss）', '补码溢出', '栈帧（stack frame）'];
  const priorityConcepts = concepts.slice(0, 5);

  return {
    priorityConcepts,
    reviewPlan: priorityConcepts.map((concept, index) => ({
      id: `local_review_${index}_${concept}`,
      title: concept,
      reason: index === 0 ? '来自最近错题或负反馈，建议优先复盘。' : '来自历史对话和画像中的高频概念。',
      suggestedAction: 'chat',
      estimatedMinutes: index === 0 ? 20 : 15,
    })),
    recommendedPractice: priorityConcepts.slice(0, 3).map((concept) => ({
      knowledgePoint: concept,
      reason: '用一题简答题检查概念边界。',
    })),
    nextActions: ['先复习优先级最高的概念', '再进入强化练习做同知识点题目', '最后回到 /chat 用自己的话复述'],
    providerStatus: 'local_fallback',
  };
}
