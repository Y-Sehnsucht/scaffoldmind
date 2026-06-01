export function PreferenceChips({ preferences, selectedPreferences, onToggle }) {
  return (
    <div className="flex flex-wrap gap-2">
      {preferences.map((item) => {
        const selected = selectedPreferences.includes(item.id);
        return (
          <button
            key={item.id}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              selected
                ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50'
            }`}
            type="button"
            onClick={() => onToggle(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
