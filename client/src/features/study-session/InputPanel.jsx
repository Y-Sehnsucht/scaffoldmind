import { PreferenceChips } from './PreferenceChips.jsx';

const modeInputLabels = {
  context_stacking: ['上周内容', '本周内容', '阅读材料/未完成作业'],
  after_class_review: ['PPT 页文字'],
  examiner_perspective: ['题目', '我的初步思路', '相关知识点'],
  feynman: ['概念名称', '我的解释', '参考材料'],
  multi_source_collision: ['资料 A', '资料 B', '资料 C'],
};

export function InputPanel({
  currentMode,
  pageNumber,
  materialText,
  materialFields,
  selectedPreferences,
  preferences,
  fileName,
  onPageNumberChange,
  onMaterialTextChange,
  onMaterialFieldChange,
  onPreferenceToggle,
  onFileNameChange,
  onGenerate,
  onSaveRecord,
  canSave,
  isLoading = false,
  mockSource = 'local',
}) {
  const labels = modeInputLabels[currentMode.id] || modeInputLabels.after_class_review;

  return (
    <aside className="space-y-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <section>
        <h2 className="text-sm font-semibold text-slate-950">学习方法便签</h2>
        <p className="mt-1 text-xs text-slate-500">{currentMode.hint}</p>
        <div className="mt-3">
          <PreferenceChips
            preferences={preferences}
            selectedPreferences={selectedPreferences}
            onToggle={onPreferenceToggle}
          />
        </div>
      </section>

      <section className="space-y-3 border-t border-slate-100 pt-4">
        <div className="grid grid-cols-[1fr_110px] gap-3">
          <label className="text-xs font-medium text-slate-600">
            页码
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              min="1"
              type="number"
              value={pageNumber}
              onChange={(event) => onPageNumberChange(Number(event.target.value || 1))}
            />
          </label>

          <label className="text-xs font-medium text-slate-600">
            图片占位
            <input
              className="mt-1 block w-full text-xs text-slate-500 file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-2 file:text-xs file:font-medium file:text-slate-700"
              type="file"
              accept="image/*"
              onChange={(event) => onFileNameChange(event.target.files?.[0]?.name || '')}
            />
          </label>
        </div>

        {fileName ? (
          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            已选择截图占位：{fileName}
          </div>
        ) : null}

        {labels.map((label, index) => (
          <label key={label} className="block text-xs font-medium text-slate-600">
            {label}
            <textarea
              className="mt-1 min-h-24 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              placeholder={`输入${label}，用于 mock 学习闭环`}
              value={index === 0 ? materialText : materialFields[label] || ''}
              onChange={(event) => {
                if (index === 0) {
                  onMaterialTextChange(event.target.value);
                } else {
                  onMaterialFieldChange(label, event.target.value);
                }
              }}
            />
          </label>
        ))}
      </section>

      <section className="space-y-2 border-t border-slate-100 pt-4">
        <button
          className="w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
          type="button"
          disabled={isLoading}
          onClick={onGenerate}
        >
          {isLoading ? 'Mock 生成中...' : mockSource === 'backend' ? '生成后端 Mock 解析' : '生成本地 Mock 解析'}
        </button>
        <button
          className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={!canSave}
          onClick={onSaveRecord}
        >
          保存本次学习记录
        </button>
      </section>
    </aside>
  );
}
