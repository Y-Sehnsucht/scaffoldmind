import { RippleButton } from '../../components/ui/ripple-button.jsx';

export function PracticeQuestionCard({ question, answer, loading, onAnswerChange, onSubmit, onRegenerateSameConcept }) {
  if (!question) {
    return (
      <section className="rounded-[32px] border border-dashed border-[var(--border)] bg-[var(--panel-soft)] p-8 text-center">
        <p className="text-lg font-semibold text-[var(--text)]">选择一个知识点，生成第一道练习题。</p>
        <p className="mt-2 text-sm text-[var(--muted)]">题目会优先围绕你在对话和错题里暴露出的薄弱概念生成；后端不可用时自动使用 fallback。</p>
      </section>
    );
  }

  return (
    <section className="rounded-[32px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
        <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1">{question.knowledgePoint}</span>
        <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1">{question.difficulty}</span>
        <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1">{question.answerType === 'short_answer' ? '简答题' : '选择题'}</span>
      </div>
      <h2 className="mt-5 text-2xl font-semibold leading-snug text-[var(--text)]">{question.question}</h2>
      {question.hint ? <p className="mt-4 rounded-2xl bg-teal-400/10 p-4 text-sm text-teal-200">提示：{question.hint}</p> : null}

      <label className="mt-6 block">
        <span className="text-sm font-medium text-[var(--text)]">你的答案</span>
        <textarea
          className="field-input mt-2 min-h-36 resize-y"
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          placeholder="用自己的话写出关键判断、推理过程和容易错的边界。"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-3">
        <RippleButton
          className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={onSubmit}
          disabled={loading || !answer.trim()}
        >
          {loading ? '正在评价...' : '提交答案'}
        </RippleButton>
        <RippleButton
          className="rounded-2xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-teal-300/60"
          type="button"
          onClick={onRegenerateSameConcept}
          disabled={loading}
        >
          再来一道同知识点题目
        </RippleButton>
      </div>
    </section>
  );
}
