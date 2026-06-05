import { useMemo, useState } from 'react';
import { RippleButton } from '../components/ui/ripple-button.jsx';
import { FeedbackRecordPanel } from '../features/history/FeedbackRecordPanel.jsx';
import { HistoryFilters } from '../features/history/HistoryFilters.jsx';
import { HistoryList } from '../features/history/HistoryList.jsx';
import { HistorySearch } from '../features/history/HistorySearch.jsx';
import { clearConversations, deleteConversation, loadConversations, loadFeedbackEvents } from '../shared/storage/agentMemoryStorage.js';

export function HistoryPage() {
  const [conversations, setConversations] = useState(() => loadConversations());
  const [feedbackEvents] = useState(() => loadFeedbackEvents());
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [selectedId, setSelectedId] = useState(() => conversations[0]?.id || '');

  const filtered = useMemo(
    () => conversations.filter((conversation) => matchesSearch(conversation, query) && matchesMode(conversation, mode) && matchesTime(conversation, timeRange)),
    [conversations, query, mode, timeRange],
  );
  const selected = conversations.find((conversation) => conversation.id === selectedId) || filtered[0] || null;

  function handleDelete(id) {
    if (!window.confirm('确定删除这条学习记录吗？此操作只影响本地 localStorage。')) return;
    const next = deleteConversation(id);
    setConversations(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id || '');
    }
  }

  function handleClear() {
    if (!window.confirm('确定清空全部历史对话吗？此操作不可撤销。')) return;
    clearConversations();
    setConversations([]);
    setSelectedId('');
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[36px] border border-[var(--border)] bg-[var(--panel)] px-7 py-8">
        <div className="absolute right-12 top-0 h-36 w-72 rounded-full bg-sky-300/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--subtle)]">Learning Archive</p>
            <h2 className="mt-3 font-serif-display text-5xl italic tracking-normal text-[var(--text)]">把学过的内容重新找回来。</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
              历史记录来自本地对话记忆。你可以搜索、筛选、恢复某次学习，也可以查看这次回答留下的反馈。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Metric label="记录" value={conversations.length} />
            <Metric label="反馈" value={feedbackEvents.length} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">
          <div className="rounded-[30px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                <HistorySearch value={query} onChange={setQuery} />
              </div>
              <RippleButton
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--subtle)] transition hover:border-rose-300/50 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                disabled={!conversations.length}
                onClick={handleClear}
              >
                清空全部
              </RippleButton>
            </div>
            <div className="mt-5">
              <HistoryFilters mode={mode} timeRange={timeRange} onModeChange={setMode} onTimeRangeChange={setTimeRange} />
            </div>
          </div>
          <HistoryList conversations={filtered} selectedId={selected?.id} onSelect={setSelectedId} onDelete={handleDelete} />
        </section>
        <FeedbackRecordPanel conversation={selected} feedbackEvents={feedbackEvents} />
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3">
      <p className="text-xs text-[var(--subtle)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[var(--text)]">{value}</p>
    </div>
  );
}

function matchesSearch(conversation, query) {
  const value = query.trim().toLowerCase();
  if (!value) return true;
  const haystack = [
    conversation.title,
    ...(conversation.messages || []).map((message) => message.content),
  ].join('\n').toLowerCase();
  return haystack.includes(value);
}

function matchesMode(conversation, mode) {
  return mode === 'all' || conversation.mode === mode;
}

function matchesTime(conversation, range) {
  if (range === 'all') return true;
  const updated = new Date(conversation.updatedAt || conversation.createdAt || 0);
  const now = new Date();
  const diffDays = (now.getTime() - updated.getTime()) / 86400000;
  if (range === 'today') return updated.toDateString() === now.toDateString();
  if (range === 'week') return diffDays <= 7;
  if (range === 'month') return diffDays <= 31;
  return true;
}
