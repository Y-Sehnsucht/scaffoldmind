import { useEffect, useMemo, useState } from 'react';
import { CountdownList } from '../features/home/CountdownList.jsx';
import { LearningCalendar } from '../features/home/LearningCalendar.jsx';
import { RecentLearningCard } from '../features/home/RecentLearningCard.jsx';
import { StudyStats } from '../features/home/StudyStats.jsx';
import { TodayTasks } from '../features/home/TodayTasks.jsx';
import { loadConversations } from '../shared/storage/agentMemoryStorage.js';
import {
  calculateStreak,
  createHomeId,
  loadCheckins,
  loadCountdowns,
  loadHomeEvents,
  loadHomeTasks,
  loadStudyTime,
  markCheckin,
  saveCountdowns,
  saveHomeEvents,
  saveHomeTasks,
  toDateKey,
} from '../shared/storage/homeStorage.js';

const EMPTY_EVENT_FORM = { title: '', note: '' };

export function HomePage() {
  const todayKey = toDateKey();
  const [events, setEvents] = useState(() => loadHomeEvents());
  const [tasks, setTasks] = useState(() => loadHomeTasks());
  const [countdowns, setCountdowns] = useState(() => loadCountdowns());
  const [studyTime, setStudyTime] = useState(() => loadStudyTime());
  const [checkins, setCheckins] = useState(() => markCheckin(todayKey));
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM);
  const [editingEventId, setEditingEventId] = useState('');
  const conversations = useMemo(() => loadConversations(), []);
  const selectedEvents = events.filter((event) => event.date === selectedDate);

  useEffect(() => {
    function handleStudyTimeUpdate(event) {
      setStudyTime(event.detail?.studyTime || loadStudyTime());
      setCheckins(event.detail?.checkins || loadCheckins());
    }

    window.addEventListener('scaffoldmind:study-time-updated', handleStudyTimeUpdate);
    return () => window.removeEventListener('scaffoldmind:study-time-updated', handleStudyTimeUpdate);
  }, []);

  function handleSelectDate(dateKey) {
    setSelectedDate(dateKey);
    setEventForm(EMPTY_EVENT_FORM);
    setEditingEventId('');
  }

  function handleSubmitEvent(event) {
    event.preventDefault();
    const title = eventForm.title.trim();
    const note = eventForm.note.trim();
    if (!title) return;

    const now = new Date().toISOString();
    const next = editingEventId
      ? events.map((item) => (item.id === editingEventId ? { ...item, title, note, updatedAt: now } : item))
      : [{ id: createHomeId('event'), date: selectedDate, title, note, createdAt: now }, ...events];

    setEvents(next);
    saveHomeEvents(next);
    setEventForm(EMPTY_EVENT_FORM);
    setEditingEventId('');
  }

  function handleEditEvent(event) {
    setEditingEventId(event.id);
    setEventForm({ title: event.title || '', note: event.note || '' });
  }

  function handleDeleteEvent(eventId) {
    if (!window.confirm('确认删除这个学习事件吗？')) return;
    const next = events.filter((event) => event.id !== eventId);
    setEvents(next);
    saveHomeEvents(next);
    if (editingEventId === eventId) {
      setEventForm(EMPTY_EVENT_FORM);
      setEditingEventId('');
    }
  }

  function handleCancelEdit() {
    setEventForm(EMPTY_EVENT_FORM);
    setEditingEventId('');
  }

  function handleAddTask(title) {
    const next = [{ id: createHomeId('task'), title, completed: false, createdAt: new Date().toISOString() }, ...tasks];
    setTasks(next);
    saveHomeTasks(next);
  }

  function handleToggleTask(id) {
    const next = tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
    setTasks(next);
    saveHomeTasks(next);
  }

  function handleDeleteTask(id) {
    const next = tasks.filter((task) => task.id !== id);
    setTasks(next);
    saveHomeTasks(next);
  }

  function handleAddCountdown(title, date) {
    const next = [{ id: createHomeId('countdown'), title, date, createdAt: new Date().toISOString() }, ...countdowns];
    setCountdowns(next);
    saveCountdowns(next);
  }

  function handleDeleteCountdown(id) {
    const next = countdowns.filter((item) => item.id !== id);
    setCountdowns(next);
    saveCountdowns(next);
  }

  return (
    <div className="h-full w-full overflow-y-auto p-6">
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[36px] border border-[var(--border-soft)] bg-[var(--panel-bg)] px-7 py-8">
          <div className="absolute right-0 top-0 h-40 w-72 rounded-full bg-[var(--accent-soft)] blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]">Learning Dashboard</p>
              <h2 className="mt-3 font-serif-display text-5xl italic tracking-normal text-[var(--text-primary)]">今天先把秩序搭起来。</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
                日历、任务、倒数日和最近对话都只保存在本地，用来帮你把学习节奏从“临时想起”变成“持续推进”。
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-strong)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              今日：{todayKey}
            </div>
          </div>
        </section>

        <StudyStats todaySeconds={studyTime[todayKey] || 0} streak={calculateStreak(checkins, todayKey)} totalConversations={conversations.length} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
          <div className="space-y-6">
            <LearningCalendar events={events} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
            <SelectedDateEvents
              date={selectedDate}
              events={selectedEvents}
              form={eventForm}
              editingEventId={editingEventId}
              onFormChange={setEventForm}
              onSubmit={handleSubmitEvent}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onCancelEdit={handleCancelEdit}
            />
          </div>
          <div className="space-y-6">
            <TodayTasks tasks={tasks} onAdd={handleAddTask} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
            <CountdownList countdowns={countdowns} onAdd={handleAddCountdown} onDelete={handleDeleteCountdown} />
            <RecentLearningCard conversations={conversations} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectedDateEvents({ date, events, form, editingEventId, onFormChange, onSubmit, onEdit, onDelete, onCancelEdit }) {
  return (
    <section className="rounded-[30px] border border-[var(--border-soft)] bg-[var(--panel-bg)] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--text-muted)]">Selected Day</p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">选中日期事件</h2>
        </div>
        <span className="rounded-full bg-[var(--panel-strong)] px-3 py-1 text-xs text-[var(--text-secondary)]">{date}</span>
      </div>

      <form className="mt-5 grid gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-strong)] p-4" onSubmit={onSubmit}>
        <input
          className="field-input"
          value={form.title}
          onChange={(event) => onFormChange({ ...form, title: event.target.value })}
          placeholder="添加学习事件，例如：复盘 cache miss 题目"
        />
        <textarea
          className="field-input min-h-20 resize-y"
          value={form.note}
          onChange={(event) => onFormChange({ ...form, note: event.target.value })}
          placeholder="备注，可选"
        />
        <div className="flex flex-wrap gap-2">
          <button className="rounded-full bg-[var(--text-primary)] px-4 py-2 text-sm font-medium text-[var(--app-bg)]" type="submit">
            {editingEventId ? '保存修改' : '添加事件'}
          </button>
          {editingEventId && (
            <button className="rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm text-[var(--text-secondary)]" type="button" onClick={onCancelEdit}>
              取消编辑
            </button>
          )}
        </div>
      </form>

      <div className="mt-5 space-y-2">
        {events.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border-soft)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
            这一天还没有事件。可以在上方添加多个本地学习事件。
          </p>
        ) : (
          events.map((event) => (
            <article key={event.id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-strong)] px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">{event.title}</h3>
                  {event.note && <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{event.note}</p>}
                </div>
                <div className="flex gap-2">
                  <button className="rounded-full border border-[var(--border-soft)] px-3 py-1.5 text-xs text-[var(--text-secondary)]" type="button" onClick={() => onEdit(event)}>
                    编辑
                  </button>
                  <button className="rounded-full border border-[var(--danger)] px-3 py-1.5 text-xs text-[var(--danger)]" type="button" onClick={() => onDelete(event.id)}>
                    删除
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
