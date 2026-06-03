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

export function HomePage() {
  const todayKey = toDateKey();
  const [events, setEvents] = useState(() => loadHomeEvents());
  const [tasks, setTasks] = useState(() => loadHomeTasks());
  const [countdowns, setCountdowns] = useState(() => loadCountdowns());
  const [studyTime, setStudyTime] = useState(() => loadStudyTime());
  const [checkins, setCheckins] = useState(() => markCheckin(todayKey));
  const [selectedDate, setSelectedDate] = useState(todayKey);
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
    const existing = events.filter((event) => event.date === dateKey);
    const title = window.prompt(
      existing.length
        ? `这一天已有事件：${existing.map((event) => event.title).join('、')}\n继续输入可新增事件。`
        : '为这一天添加一个学习事件',
    );

    if (!title?.trim()) return;
    const next = [...events, { id: createHomeId('event'), date: dateKey, title: title.trim(), createdAt: new Date().toISOString() }];
    setEvents(next);
    saveHomeEvents(next);
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
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[36px] border border-[var(--border)] bg-[var(--panel)] px-7 py-8">
        <div className="absolute right-0 top-0 h-40 w-72 rounded-full bg-teal-300/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--subtle)]">Learning Dashboard</p>
            <h2 className="mt-3 font-serif-display text-5xl italic tracking-normal text-[var(--text)]">今天先把秩序搭起来。</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              日历、任务、倒数日和最近对话都只保存在本地，用来帮助你把学习节奏从“临时想起”变成“持续推进”。
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--muted)]">
            今日：{todayKey}
          </div>
        </div>
      </section>

      <StudyStats todaySeconds={studyTime[todayKey] || 0} streak={calculateStreak(checkins, todayKey)} totalConversations={conversations.length} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <div className="space-y-6">
          <LearningCalendar events={events} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
          <section className="rounded-[30px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[var(--subtle)]">Selected Day</p>
                <h2 className="mt-1 text-2xl font-semibold text-[var(--text)]">选中日期事件</h2>
              </div>
              <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1 text-xs text-[var(--muted)]">{selectedDate}</span>
            </div>
            <div className="mt-5 space-y-2">
              {selectedEvents.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm leading-6 text-[var(--muted)]">这一天还没有事件。</p>
              ) : (
                selectedEvents.map((event) => (
                  <p key={event.id} className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--text)]">{event.title}</p>
                ))
              )}
            </div>
          </section>
        </div>
        <div className="space-y-6">
          <TodayTasks tasks={tasks} onAdd={handleAddTask} onToggle={handleToggleTask} onDelete={handleDeleteTask} />
          <CountdownList countdowns={countdowns} onAdd={handleAddCountdown} onDelete={handleDeleteCountdown} />
          <RecentLearningCard conversations={conversations} />
        </div>
      </div>
    </div>
  );
}
