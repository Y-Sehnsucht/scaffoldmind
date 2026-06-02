import { PreferenceChips } from './PreferenceChips.jsx';

const modeInputLabels = {
  context_stacking: ['上周内容', '本周内容', '阅读材料或未完成作业'],
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
  materialInfo,
  onPageNumberChange,
  onMaterialTextChange,
  onMaterialFieldChange,
  onPreferenceToggle,
  onMaterialFileChange,
  onGenerate,
  onSaveRecord,
  canSave,
  isLoading = false,
  isSaving = false,
  isMaterialLoading = false,
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
            材料文件
            <input
              className="mt-1 block w-full text-xs text-slate-500 file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-2 file:text-xs file:font-medium file:text-slate-700"
              type="file"
              accept=".txt,.md,.markdown,.pdf,text/plain,text/markdown,application/pdf"
              disabled={isMaterialLoading}
              onChange={(event) => onMaterialFileChange(event.target.files?.[0] || null)}
            />
          </label>
        </div>

        {fileName ? (
          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {isMaterialLoading
              ? `正在提取：${fileName}`
              : materialInfo
                ? `已导入：${materialInfo.fileName} · ${materialInfo.sourceType}${materialInfo.pageCount ? ` · ${materialInfo.pageCount} 页` : ''} · ${materialInfo.extractedText.length} 字`
                : `已选择：${fileName}`}
            {materialInfo?.warnings?.length ? (
              <div className="mt-1 text-amber-700">{materialInfo.warnings.join('；')}</div>
            ) : null}
          </div>
        ) : null}

        {labels.map((label, index) => (
          <label key={label} className="block text-xs font-medium text-slate-600">
            {label}
            <textarea
              className="mt-1 min-h-24 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              placeholder={`输入${label}，或上传 TXT / MD / PDF 自动提取`}
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
          disabled={isLoading || isMaterialLoading}
          onClick={onGenerate}
        >
          {isMaterialLoading
            ? '材料提取中...'
            : isLoading
            ? '生成中...'
            : mockSource === 'real_api'
              ? '生成真实 AI 解析'
              : mockSource === 'backend'
                ? '生成后端演示解析'
                : '生成本地演示解析'}
        </button>
        <button
          className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={!canSave || isSaving}
          onClick={onSaveRecord}
        >
          {isSaving ? '保存中...' : '保存本次学习记录'}
        </button>
      </section>
    </aside>
  );
}
