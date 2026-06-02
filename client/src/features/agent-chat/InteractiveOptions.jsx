export function InteractiveOptions({ options = [], disabled, onSelect }) {
  if (!options.length) {
    return null;
  }

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option}
          className="min-w-0 rounded-2xl border border-teal-300/20 bg-teal-300/[0.06] px-4 py-3 text-left text-sm leading-6 text-teal-50 transition hover:border-teal-300/50 hover:bg-teal-300/10 disabled:cursor-not-allowed disabled:opacity-50"
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
