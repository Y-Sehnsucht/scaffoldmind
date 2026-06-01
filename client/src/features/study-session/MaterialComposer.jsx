const modeInputLabels = {
  context_stacking: ['上周内容', '本周内容', '阅读材料或未完成作业'],
  after_class_review: ['PPT 页文字'],
  examiner_perspective: ['题目', '我的初步思路', '相关知识点'],
  feynman: ['概念名称', '我的解释', '参考材料'],
  multi_source_collision: ['资料 A', '资料 B', '资料 C'],
};

export function MaterialComposer({
  currentMode,
  materialText,
  materialFields,
  onMaterialTextChange,
  onMaterialFieldChange,
  onGenerate,
  onSaveRecord,
  canSave,
  isLoading = false,
  mockSource = 'local',
}) {
  const labels = modeInputLabels[currentMode.id] || modeInputLabels.after_class_review;

  return (
    <section className="rounded-[22px] border border-white/10 bg-[#20262e] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">提问或粘贴学习材料</h3>
          <p className="mt-1 text-xs text-slate-400">输入区放在对话中心，生成后会自动保存本次学习过程和问题链。</p>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">{currentMode.label}</span>
      </div>

      <div className="mt-4 grid gap-3">
        {labels.map((label, index) => (
          <label key={label} className="block text-xs font-medium text-slate-400">
            {label}
            <textarea
              className="mt-1 min-h-24 w-full resize-y rounded-2xl border border-white/10 bg-[#14181e] px-4 py-3 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20"
              placeholder={`输入${label}，用于学习闭环`}
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
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#111418] shadow-sm transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
          type="button"
          disabled={isLoading}
          onClick={onGenerate}
        >
          {isLoading
            ? '生成中...'
            : mockSource === 'real_api'
              ? '生成真实 API 解析'
              : mockSource === 'backend'
                ? '生成后端 Mock 解析'
                : '生成本地 Mock 解析'}
        </button>
        <button
          className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-teal-300/50 hover:bg-teal-300/10 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={!canSave}
          onClick={onSaveRecord}
        >
          保存当前快照
        </button>
      </div>
    </section>
  );
}
