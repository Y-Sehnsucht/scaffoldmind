import { useState } from 'react';
import { daysUntil, urgencyForDays } from '../../shared/storage/homeStorage.js';

const URGENCY_CLASS = {
  high: 'border-rose-300/30 bg-rose-300/10 text-rose-100',
  medium: 'border-amber-300/30 bg-amber-300/10 text-amber-100',
  low: 'border-teal-300/30 bg-teal-300/10 text-teal-100',
};

export function CountdownList({ countdowns, onAdd, onDelete }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  function submit(event) {
    event.preventDefault();
    if (!title.trim() || !date) return;
    onAdd(title.trim(), date);
    setTitle('');
    setDate('');
  }

  const sorted = countdowns
    .map((item) => ({ ...item, days: daysUntil(item.date), urgency: urgencyForDays(daysUntil(item.date)) }))
    .sort((a, b) => a.days - b.days);

  return (
    <section className="rounded-[30px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <div>
        <p className="text-sm text-[var(--subtle)]">Countdown</p>
        <h2 className="mt-1 text-2xl font-semibold text-[var(--text)]">倒数日</h2>
      </div>
      <form className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto_auto]" onSubmit={submit}>
        <input className="field-input min-h-11" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="考试 / 项目 / 复盘" />
        <input className="field-input min-h-11" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <button className="rounded-xl bg-[var(--text)] px-4 py-2 text-sm font-semibold text-[var(--bg)]" type="submit">添加</button>
      </form>
      <div className="mt-5 space-y-2">
        {sorted.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm leading-6 text-[var(--muted)]">还没有倒数日。</p>
        ) : (
          sorted.map((item) => (
            <div key={item.id} className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${URGENCY_CLASS[item.urgency]}`}>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs opacity-75">{item.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{item.days >= 0 ? `${item.days} 天` : '已到期'}</span>
                <button className="text-xs opacity-70 hover:opacity-100" type="button" onClick={() => onDelete(item.id)}>删除</button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
