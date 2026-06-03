const STYLE_LABELS = [
  ['wantsConcise', '偏好简洁总结'],
  ['wantsExamples', '喜欢例子或代码'],
  ['wantsExamFocus', '关注考试与易错点'],
  ['wantsStepByStep', '需要分步解释'],
  ['dislikesTooLong', '不喜欢过长回答'],
];

export function StylePreferencePanel({ preference }) {
  const active = STYLE_LABELS.filter(([key]) => Boolean(preference?.[key]));

  return (
    <section className="rounded-[30px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <p className="text-sm text-[var(--subtle)]">Style</p>
      <h2 className="mt-1 text-2xl font-semibold text-[var(--text)]">回答风格偏好</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {active.length === 0 ? (
          <p className="text-sm leading-6 text-[var(--muted)]">暂未形成稳定偏好。多次追问和反馈后会自动更新。</p>
        ) : (
          active.map(([, label]) => (
            <span key={label} className="rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1.5 text-sm text-teal-100">
              {label}
            </span>
          ))
        )}
      </div>
    </section>
  );
}
