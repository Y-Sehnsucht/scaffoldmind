import { useEffect, useMemo, useState } from 'react';
import { CountdownList } from '../features/home/CountdownList.jsx';
import { LearningCalendar } from '../features/home/LearningCalendar.jsx';
import { RecentLearningCard } from '../features/home/RecentLearningCard.jsx';
import { StudyStats } from '../features/home/StudyStats.jsx';
import { TodayTasks } from '../features/home/TodayTasks.jsx';
import { BorderBeam } from '../components/ui/border-beam.jsx';
import { KineticText } from '../components/ui/kinetic-text.jsx';
import { Meteors } from '../components/ui/meteors.jsx';
import { Particles } from '../components/ui/particles.jsx';
import { RippleButton } from '../components/ui/ripple-button.jsx';
import { TypingAnimation } from '../components/ui/typing-animation.jsx';
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
const HOME_HERO_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_171521_25968ba2-b594-4b32-aab7-f6b69398a6fa.mp4';

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
  const [heroVideoError, setHeroVideoError] = useState(false);
  const [headerTypingCycle, setHeaderTypingCycle] = useState(0);
  const [homeParticleColor, setHomeParticleColor] = useState(() => getHomeParticleColor());
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

  useEffect(() => {
    const timer = window.setInterval(() => setHeaderTypingCycle((cycle) => cycle + 1), 10000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => setHomeParticleColor(getHomeParticleColor()));
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => observer.disconnect();
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
    const next = [{ id: createHomeId('countdown'), title, date, completed: false, createdAt: new Date().toISOString() }, ...countdowns];
    setCountdowns(next);
    saveCountdowns(next);
  }

  function handleToggleCountdown(id) {
    const next = countdowns.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item));
    setCountdowns(next);
    saveCountdowns(next);
  }

  function handleDeleteCountdown(id) {
    const next = countdowns.filter((item) => item.id !== id);
    setCountdowns(next);
    saveCountdowns(next);
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-y-auto bg-transparent pb-12">
      <div className="pointer-events-none absolute inset-0 z-0 bg-transparent opacity-20 dark:opacity-100">
        <Particles className="absolute inset-0 h-full w-full bg-transparent" quantity={780} staticity={80} ease={70} color={homeParticleColor} size={0.6} refresh topBias />
      </div>

      <div className="relative z-10 w-full space-y-6 bg-transparent px-8">
        <HomeHeader typingCycle={headerTypingCycle} />

        <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.55fr)]">
          <HomeVideoCard videoError={heroVideoError} onVideoError={() => setHeroVideoError(true)} />
          <HomeHeroCard todayKey={todayKey} />
        </div>

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
            <CountdownList countdowns={countdowns} onAdd={handleAddCountdown} onDelete={handleDeleteCountdown} onToggleComplete={handleToggleCountdown} />
            <RecentLearningCard conversations={conversations} />
          </div>
        </div>
      </div>
    </div>
  );
}

function getHomeParticleColor() {
  if (typeof document === 'undefined') return '#ffffff';
  return document.documentElement.classList.contains('light') || document.documentElement.dataset.theme === 'light' ? '#404040' : '#ffffff';
}

function HomeHeader({ typingCycle }) {
  return (
    <div className="relative flex h-32 w-full items-center justify-between bg-transparent">
      <div className="flex w-1/4 items-center justify-start">
        <TypingAnimation key={typingCycle} text="Hello World! 👋" className="font-mono text-3xl tracking-wider text-[var(--text-muted)]" speed={58} />
      </div>

      <div className="flex flex-1 select-none items-center justify-center -translate-y-3">
        <div className="text-[var(--text-primary)]">
          <KineticText
            text="SCAFFOLDMIND"
            className="font-serif-display text-5xl font-medium uppercase leading-none tracking-[0.36em] text-[var(--text-primary)] md:text-6xl"
          />
        </div>
      </div>

      <div className="w-1/4" aria-hidden="true" />
    </div>
  );
}
function HomeHeroCard({ todayKey }) {
  return (
    <section className="relative flex min-h-[250px] items-end overflow-hidden rounded-[36px] border border-[var(--border-soft)] bg-[var(--panel-bg)] px-7 py-8 shadow-sm">
      <BorderBeam />
      <Meteors number={30} />
      <div className="absolute right-0 top-0 h-44 w-80 rounded-full bg-[var(--accent-soft)] blur-3xl" />
      <div className="relative z-10 flex w-full flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]">Learning Dashboard</p>
          <h2 className="mt-3 min-h-[3.75rem] font-serif-display text-5xl italic tracking-normal text-[var(--text-primary)]">
            <TypingAnimation text="今天先把秩序搭起来。" speed={56} />
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)]">
            日历、任务、倒数日和最近对话都只保存在本地，用来帮你把学习节奏从“临时想起”变成“持续推进”。
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-strong)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          今日：{todayKey}
        </div>
      </div>
    </section>
  );
}

function HomeVideoCard({ videoError, onVideoError }) {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-[var(--border-soft)] bg-[var(--panel-bg)] p-4 shadow-sm">
      <BorderBeam />
      <div className="relative min-h-[250px] overflow-hidden rounded-[24px] border border-[var(--border-soft)] bg-[var(--panel-strong)] shadow-sm">
        {videoError ? (
          <div className="flex h-full min-h-[250px] items-center justify-center px-6 text-center text-sm leading-6 text-[var(--text-secondary)]">
            视频暂时无法加载，学习面板仍可正常使用。
          </div>
        ) : (
          <video
            className="h-full min-h-[250px] w-full object-cover"
            src={HOME_HERO_VIDEO_URL}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={onVideoError}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          今日学习仪表盘
        </div>
      </div>
    </section>
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
          <RippleButton className="rounded-full bg-[var(--text-primary)] px-4 py-2 text-sm font-medium text-[var(--app-bg)]" type="submit">
            {editingEventId ? '保存修改' : '添加事件'}
          </RippleButton>
          {editingEventId && (
            <RippleButton className="rounded-full border border-[var(--border-soft)] px-4 py-2 text-sm text-[var(--text-secondary)]" type="button" onClick={onCancelEdit}>
              取消编辑
            </RippleButton>
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
                  <RippleButton className="rounded-full border border-[var(--border-soft)] px-3 py-1.5 text-xs text-[var(--text-secondary)]" type="button" onClick={() => onEdit(event)}>
                    编辑
                  </RippleButton>
                  <RippleButton className="rounded-full border border-[var(--danger)] px-3 py-1.5 text-xs text-[var(--danger)]" type="button" onClick={() => onDelete(event.id)}>
                    删除
                  </RippleButton>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
