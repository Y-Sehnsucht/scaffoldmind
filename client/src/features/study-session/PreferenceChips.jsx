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
                ? 'border-teal-300/70 bg-teal-300 text-[#111418] shadow-sm'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-teal-300/50 hover:bg-teal-300/10 hover:text-white'
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
