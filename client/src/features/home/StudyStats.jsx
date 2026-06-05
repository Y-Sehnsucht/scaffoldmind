export function StudyStats({ todaySeconds, streak, totalConversations }) {
  const stats = [
    { label: '今日学习时长', value: formatDuration(todaySeconds), hint: '按站内停留时间本地累计', tone: 'from-teal-300/18 to-transparent' },
    { label: '连续打卡', value: `${streak} 天`, hint: '根据访问日期和学习记录计算', tone: 'from-sky-300/16 to-transparent' },
    { label: '对话记录', value: `${totalConversations} 次`, hint: '来自本地 AI 对话记忆', tone: 'from-violet-300/16 to-transparent' },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {stats.map((item) => (
        <article key={item.label} className="relative min-h-[132px] overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
          <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${item.tone}`} />
          <div className="relative">
            <p className="text-sm text-[var(--subtle)]">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-normal text-[var(--text)]">{item.value}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.hint}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

function formatDuration(seconds) {
  const safe = Math.max(0, Number(seconds || 0));
  const minutes = Math.floor(safe / 60);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${rest}m`;
  }

  return `${Math.max(1, rest || (safe > 0 ? 1 : 0))}m`;
}
