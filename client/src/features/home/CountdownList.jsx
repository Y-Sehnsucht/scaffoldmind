import { useState } from 'react';
import { RippleButton } from '../../components/ui/ripple-button.jsx';
import { daysUntil, urgencyForDays } from '../../shared/storage/homeStorage.js';

const URGENCY_CLASS = {
  high: {
    card: 'border-rose-300 bg-rose-50/95',
    title: 'text-rose-950',
    meta: 'text-rose-800',
    days: 'text-rose-900',
    action: 'text-rose-800 hover:bg-rose-100 hover:text-rose-950',
    badge: 'bg-rose-700 text-white',
    label: '紧急',
  },
  medium: {
    card: 'border-amber-300 bg-amber-50/95',
    title: 'text-amber-950',
    meta: 'text-amber-800',
    days: 'text-amber-900',
    action: 'text-amber-800 hover:bg-amber-100 hover:text-amber-950',
    badge: 'bg-amber-600 text-white',
    label: '临近',
  },
  low: {
    card: 'border-emerald-300 bg-emerald-50/95',
    title: 'text-emerald-950',
    meta: 'text-emerald-800',
    days: 'text-emerald-900',
    action: 'text-emerald-800 hover:bg-emerald-100 hover:text-emerald-950',
    badge: 'bg-emerald-700 text-white',
    label: '从容',
  },
};

const COMPLETED_CLASS = {
  card: 'border-blue-300 bg-blue-50/95',
  title: 'text-blue-950',
  meta: 'text-blue-800',
  days: 'text-blue-900',
  action: 'text-blue-800 hover:bg-blue-100 hover:text-blue-950',
  badge: 'bg-blue-700 text-white',
  label: '已完成',
};

export function CountdownList({ countdowns, onAdd, onDelete, onToggleComplete }) {
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
    <section className="rounded-[30px] border border-[var(--border-soft)] bg-[var(--panel-bg)] p-6 shadow-sm">
      <div>
        <p className="text-sm text-[var(--text-muted)]">Countdown</p>
        <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">倒数日</h2>
      </div>
      <form className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto_auto]" onSubmit={submit}>
        <input
          className="field-input min-h-11"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="考试 / 项目 / 复盘"
        />
        <input className="field-input min-h-11" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <RippleButton className="rounded-xl bg-[var(--text-primary)] px-4 py-2 text-sm font-semibold text-[var(--app-bg)]" type="submit">
          添加
        </RippleButton>
      </form>
      <div className="mt-5 space-y-2">
        {sorted.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border-soft)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
            还没有倒数日。
          </p>
        ) : (
          sorted.map((item) => {
            const urgency = item.completed ? COMPLETED_CLASS : URGENCY_CLASS[item.urgency] || URGENCY_CLASS.low;
            return (
              <div key={item.id} className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-sm ${urgency.card}`}>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className={`truncate text-sm font-bold ${urgency.title}`}>{item.title}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.68rem] font-bold ${urgency.badge}`}>{urgency.label}</span>
                  </div>
                  <p className={`mt-1 text-xs font-semibold ${urgency.meta}`}>{item.date}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`text-sm font-extrabold ${urgency.days}`}>{item.days >= 0 ? `${item.days} 天` : '已到期'}</span>
                  <RippleButton
                    className={`rounded-full px-2 py-1 text-xs font-bold transition ${urgency.action}`}
                    type="button"
                    onClick={() => onDelete(item.id)}
                  >
                    删除
                  </RippleButton>
                  <RippleButton
                    className={`rounded-full border px-2 py-1 text-xs font-bold transition ${
                      item.completed
                        ? 'border-blue-300 bg-blue-100 text-blue-900 hover:bg-blue-200'
                        : 'border-blue-200 text-blue-800 hover:bg-blue-100 hover:text-blue-950'
                    }`}
                    type="button"
                    onClick={() => onToggleComplete(item.id)}
                    aria-pressed={item.completed}
                  >
                    {item.completed ? '取消完成' : '已完成'}
                  </RippleButton>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
