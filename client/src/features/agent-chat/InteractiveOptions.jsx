export function InteractiveOptions({ options = [], disabled, onSelect }) {
  if (!options.length) return null;

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option}
          className="min-w-0 rounded-2xl border border-[var(--accent-green)]/25 bg-[var(--panel-strong)] px-4 py-3 text-left text-sm leading-6 text-[var(--text-secondary)] transition hover:border-[var(--accent-green)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
