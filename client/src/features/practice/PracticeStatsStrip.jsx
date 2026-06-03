import { getPracticeAccuracy } from '../../shared/storage/practiceStorage.js';

export function PracticeStatsStrip({ stats }) {
  const accuracy = getPracticeAccuracy(stats);
  const minutes = Math.round(Number(stats.totalSeconds || 0) / 60);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <StatCard label="已刷题数" value={`${stats.totalQuestions || 0} 题`} helper="本地统计，刷新后保留" />
      <StatCard label="累计时长" value={`${minutes} 分钟`} helper="从生成题目开始计时" />
      <StatCard label="正确率" value={`${accuracy}%`} helper={`${stats.correctCount || 0}/${stats.totalQuestions || 0} 次答对`} />
    </div>
  );
}

function StatCard({ label, value, helper }) {
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-sm">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">{value}</p>
      <p className="mt-2 text-xs text-[var(--subtle)]">{helper}</p>
    </article>
  );
}
