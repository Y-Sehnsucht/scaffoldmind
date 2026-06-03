const MODE_OPTIONS = [
  { id: 'all', label: '全部模式' },
  { id: 'default', label: '默认解析' },
  { id: 'context_stacking', label: 'Context Stacking' },
  { id: 'feynman', label: '费曼反讲' },
];

const TIME_OPTIONS = [
  { id: 'all', label: '全部时间' },
  { id: 'today', label: '今天' },
  { id: 'week', label: '本周' },
  { id: 'month', label: '本月' },
];

export function HistoryFilters({ mode, timeRange, onModeChange, onTimeRangeChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label>
        <span className="mb-2 block text-sm font-medium text-[var(--subtle)]">模式筛选</span>
        <select className="field-select min-h-12 rounded-2xl" value={mode} onChange={(event) => onModeChange(event.target.value)}>
          {MODE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      </label>
      <label>
        <span className="mb-2 block text-sm font-medium text-[var(--subtle)]">时间筛选</span>
        <select className="field-select min-h-12 rounded-2xl" value={timeRange} onChange={(event) => onTimeRangeChange(event.target.value)}>
          {TIME_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      </label>
    </div>
  );
}
