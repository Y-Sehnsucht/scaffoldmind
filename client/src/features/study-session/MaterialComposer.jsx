const modeInputLabels = {
  context_stacking: ['上周内容', '本周内容', '阅读材料或未完成作业'],
  after_class_review: ['PPT 页文字 / 课程材料'],
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
  isSaving = false,
  loadingMessage = '正在分析材料...',
  mockSource = 'local',
}) {
  const labels = modeInputLabels[currentMode.id] || modeInputLabels.after_class_review;

  return (
    <section className="rounded-[22px] border border-white/10 bg-[#20262e] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">提问或粘贴学习材料</h3>
          <p className="mt-1 text-xs text-slate-400">上传文本材料后会自动填入这里；也可以直接粘贴课程笔记或题目。</p>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-400">{currentMode.label}</span>
      </div>

      {isLoading ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-teal-300/20 bg-teal-300/10 px-4 py-3 text-sm text-teal-100">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-teal-300" />
          {loadingMessage}
        </div>
      ) : null}

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
            ? '分析中...'
            : mockSource === 'real_api'
              ? '生成真实 AI 解析'
              : mockSource === 'backend'
                ? '生成后端演示解析'
                : '生成本地演示解析'}
        </button>
        <button
          className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-teal-300/50 hover:bg-teal-300/10 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={!canSave || isSaving}
          onClick={onSaveRecord}
        >
          {isSaving ? '保存中...' : '保存本次学习记录'}
        </button>
      </div>
    </section>
  );
}
