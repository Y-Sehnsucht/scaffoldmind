import { useMemo, useState } from 'react';

const ACTIONS = [
  { id: 'copy', label: '复制', icon: CopyIcon },
  { id: 'positive', label: '有帮助', icon: ThumbsUpIcon },
  { id: 'negative', label: '不准确', icon: ThumbsDownIcon },
];

export function MessageActions({ message, rating, onCopy, onFeedback }) {
  const [copied, setCopied] = useState(false);
  const copyLabel = copied ? '已复制' : '复制';
  const actions = useMemo(
    () => ACTIONS.map((action) => (action.id === 'copy' ? { ...action, label: copyLabel } : action)),
    [copyLabel],
  );

  async function handleAction(actionId) {
    if (actionId === 'copy') {
      const ok = await onCopy?.(message);
      if (ok) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
      return;
    }

    onFeedback?.(message, actionId);
  }

  return (
    <div className="mt-4 flex items-center gap-1.5 border-t border-[var(--border-soft)] pt-3 text-[var(--text-muted)]">
      {actions.map((action) => {
        const Icon = action.icon;
        const selected = action.id === rating;

        return (
          <button
            key={action.id}
            className={`group relative grid h-8 w-8 place-items-center rounded-full border text-sm transition ${
              selected
                ? 'border-[var(--accent-green)] bg-[var(--accent-soft)] text-[var(--text-primary)]'
                : 'border-transparent hover:border-[var(--border-soft)] hover:bg-[var(--panel-strong)] hover:text-[var(--text-primary)]'
            }`}
            type="button"
            onClick={() => handleAction(action.id)}
            aria-label={action.label}
          >
            <Icon />
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--border-soft)] bg-[var(--panel-strong)] px-2 py-1 text-xs text-[var(--text-primary)] opacity-0 shadow-xl shadow-black/20 transition group-hover:opacity-100">
              {action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ThumbsUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 10v11" />
      <path d="M15 5.3 14 10h5.4a2 2 0 0 1 1.9 2.4l-1.3 6A3 3 0 0 1 17 21H7" />
      <path d="M7 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
      <path d="M14 10V5.5a2.5 2.5 0 0 0-4.4-1.7L7 7v3" />
    </svg>
  );
}

function ThumbsDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 14V3" />
      <path d="M9 18.7 10 14H4.6a2 2 0 0 1-1.9-2.4l1.3-6A3 3 0 0 1 7 3h10" />
      <path d="M17 14h3a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3" />
      <path d="M10 14v4.5a2.5 2.5 0 0 0 4.4 1.7L17 17v-3" />
    </svg>
  );
}
