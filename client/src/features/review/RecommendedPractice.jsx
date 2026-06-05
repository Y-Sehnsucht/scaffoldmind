import { RippleButton } from '../../components/ui/ripple-button.jsx';
import { navigateTo } from '../../routes/navigation.js';

export function RecommendedPractice({ items }) {
  return (
    <aside className="rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-5">
      <h2 className="text-base font-semibold text-[var(--text)]">强化练习入口</h2>
      <div className="mt-4 space-y-3">
        {items.length ? items.map((item) => {
          const concept = item.knowledgePoint || item.title || item;
          return (
            <RippleButton
              key={concept}
              className="block w-full rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4 text-left transition hover:border-teal-300/60"
              type="button"
              onClick={() => navigateTo(`/practice?concept=${encodeURIComponent(concept)}`)}
            >
              <span className="block text-sm font-medium text-[var(--text)]">{concept}</span>
              <span className="mt-1 block text-xs text-[var(--muted)]">{item.reason || '围绕该知识点生成常考题'}</span>
            </RippleButton>
          );
        }) : (
          <p className="rounded-2xl bg-[var(--panel-soft)] p-4 text-sm text-[var(--muted)]">还没有推荐练习。刷题后会优先推荐错题同类概念。</p>
        )}
      </div>
    </aside>
  );
}
