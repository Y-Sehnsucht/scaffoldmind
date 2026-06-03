export function HistorySearch({ value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--subtle)]">搜索历史对话</span>
      <input
        className="field-input min-h-12 rounded-2xl"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜索标题、用户问题或 AI 摘要"
      />
    </label>
  );
}
