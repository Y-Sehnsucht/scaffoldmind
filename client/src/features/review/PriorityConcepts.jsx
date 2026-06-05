import { RippleButton } from '../../components/ui/ripple-button.jsx';
import { navigateTo } from '../../routes/navigation.js';

export function PriorityConcepts({ concepts }) {
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-5">
      <h2 className="text-base font-semibold text-[var(--text)]">待复习概念</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {concepts.length ? concepts.map((concept) => (
          <RippleButton
            key={concept}
            className="rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-2 text-sm text-[var(--text)] transition hover:border-teal-300/60"
            type="button"
            onClick={() => navigateTo(`/chat?concept=${encodeURIComponent(concept)}`)}
          >
            {concept}
          </RippleButton>
        )) : (
          <p className="text-sm text-[var(--muted)]">暂无明显薄弱概念。完成几轮对话或刷题后，这里会自动聚合。</p>
        )}
      </div>
    </section>
  );
}
