import { useState } from 'react';
import { RippleButton } from '../../components/ui/ripple-button.jsx';

export function TodayTasks({ tasks, onAdd, onToggle, onDelete }) {
  const [title, setTitle] = useState('');

  function submit(event) {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;
    onAdd(value);
    setTitle('');
  }

  return (
    <section className="rounded-[30px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--subtle)]">Today</p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--text)]">今日任务</h2>
        </div>
        <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1 text-xs text-[var(--muted)]">{tasks.filter((task) => !task.completed).length} 待完成</span>
      </div>
      <form className="mt-5 flex gap-2" onSubmit={submit}>
        <input className="field-input min-h-11" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="添加一个学习任务" />
        <RippleButton className="shrink-0 rounded-xl bg-[var(--text)] px-4 text-sm font-semibold text-[var(--bg)]" type="submit">添加</RippleButton>
      </form>
      <div className="mt-5 space-y-2">
        {tasks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm leading-6 text-[var(--muted)]">今天还没有任务，可以先添加一个 25 分钟学习块。</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-3">
              <input type="checkbox" checked={Boolean(task.completed)} onChange={() => onToggle(task.id)} />
              <span className={`min-w-0 flex-1 text-sm ${task.completed ? 'text-[var(--subtle)] line-through' : 'text-[var(--text)]'}`}>{task.title}</span>
              <RippleButton className="rounded-full px-2 py-1 text-xs text-[var(--subtle)] hover:text-rose-300" type="button" onClick={() => onDelete(task.id)}>删除</RippleButton>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
