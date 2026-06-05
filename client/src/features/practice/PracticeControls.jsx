import { RippleButton } from '../../components/ui/ripple-button.jsx';

const DIFFICULTIES = [
  { id: 'easy', label: '基础' },
  { id: 'medium', label: '中等' },
  { id: 'hard', label: '进阶' },
];

export function PracticeControls({ concept, difficulty, loading, onConceptChange, onDifficultyChange, onGenerate }) {
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <label className="flex-1">
          <span className="text-sm font-medium text-[var(--text)]">知识点</span>
          <input
            className="field-input mt-2"
            value={concept}
            onChange={(event) => onConceptChange(event.target.value)}
            placeholder="例如：补码溢出、缓存未命中（cache miss）、栈帧（stack frame）"
          />
        </label>
        <label className="lg:w-44">
          <span className="text-sm font-medium text-[var(--text)]">难度</span>
          <select className="field-select mt-2" value={difficulty} onChange={(event) => onDifficultyChange(event.target.value)}>
            {DIFFICULTIES.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <RippleButton
          className="rounded-2xl bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={onGenerate}
          disabled={loading}
        >
          {loading ? '正在生成题目...' : '生成常考题'}
        </RippleButton>
      </div>
    </section>
  );
}
