export function ProfileSummaryCards({ profile, practiceStats }) {
  const cards = [
    { label: '累计对话', value: profile.totalConversations || 0, hint: '来自本地对话记录' },
    { label: '反馈倾向', value: `${profile.positiveFeedbackCount || 0}/${profile.negativeFeedbackCount || 0}`, hint: '点赞 / 点踩' },
    { label: '常问主题', value: profile.frequentTopics?.length || 0, hint: '从用户问题抽取' },
    { label: '刷题正确率', value: formatAccuracy(practiceStats), hint: '如无刷题记录则为空' },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
          <p className="text-sm text-[var(--subtle)]">{card.label}</p>
          <p className="mt-3 text-4xl font-semibold tracking-normal text-[var(--text)]">{card.value}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{card.hint}</p>
        </article>
      ))}
    </section>
  );
}

function formatAccuracy(stats = {}) {
  const total = Number(stats.total || stats.totalQuestions || 0);
  const correct = Number(stats.correct || stats.correctCount || 0);
  if (!total) return '暂无';
  return `${Math.round((correct / total) * 100)}%`;
}
