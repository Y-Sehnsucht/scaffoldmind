import { useMemo, useState } from 'react';
import { FeedbackTrend } from '../features/profile/FeedbackTrend.jsx';
import { KnowledgeGraph } from '../features/profile/KnowledgeGraph.jsx';
import { ProfileSummaryCards } from '../features/profile/ProfileSummaryCards.jsx';
import { StylePreferencePanel } from '../features/profile/StylePreferencePanel.jsx';
import { WeakConceptList } from '../features/profile/WeakConceptList.jsx';
import {
  buildLearnerProfile,
  loadConversations,
  loadFeedbackEvents,
  loadInteractionEvents,
  loadLearnerProfile,
  loadOptionStats,
  loadRepeatedQuestionStats,
} from '../shared/storage/agentMemoryStorage.js';
import { loadJson } from '../shared/storage/localStorage.js';

export function ProfilePage() {
  const conversations = useMemo(() => loadConversations(), []);
  const feedbackEvents = useMemo(() => loadFeedbackEvents(), []);
  const profile = useMemo(() => {
    const saved = loadLearnerProfile();
    if (saved.totalMessages || saved.frequentTopics?.length || saved.weakConceptHints?.length) {
      return saved;
    }

    return buildLearnerProfile({
      conversations,
      feedbackEvents,
      optionStats: loadOptionStats(),
      repeatedQuestionStats: loadRepeatedQuestionStats(),
      interactionEvents: loadInteractionEvents(),
    });
  }, [conversations, feedbackEvents]);
  const practiceStats = useMemo(() => loadJson('scaffoldmind.practice.stats', {}), []);
  const practiceMistakes = useMemo(() => loadJson('scaffoldmind.practice.mistakes', []), []);
  const nodes = useMemo(() => buildGraphNodes(profile, practiceMistakes), [profile, practiceMistakes]);
  const [selectedNodeId, setSelectedNodeId] = useState(() => nodes[0]?.id || '');
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) || null;
  const relatedConversations = selectedNode ? findRelatedConversations(conversations, selectedNode.label) : [];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[36px] border border-[var(--border)] bg-[var(--panel)] px-7 py-8">
        <div className="absolute right-8 top-0 h-36 w-72 rounded-full bg-violet-300/10 blur-3xl" />
        <div className="relative">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--subtle)]">Learner Profile</p>
          <h2 className="mt-3 font-serif-display text-5xl italic tracking-normal text-[var(--text)]">你的学习画像正在成形。</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
            画像基于本地对话、反馈、重复提问与互动记录生成。这里不做云同步，也不引入图数据库。
          </p>
        </div>
      </section>

      <ProfileSummaryCards profile={profile} practiceStats={practiceStats} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-6">
          <KnowledgeGraph nodes={nodes} selectedId={selectedNodeId} onSelect={setSelectedNodeId} />
          <section className="rounded-[30px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
            <p className="text-sm text-[var(--subtle)]">Related Records</p>
            <h2 className="mt-1 text-2xl font-semibold text-[var(--text)]">关联历史记录</h2>
            {!selectedNode ? (
              <p className="mt-5 text-sm text-[var(--muted)]">选择一个节点后查看相关记录。</p>
            ) : relatedConversations.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-dashed border-[var(--border)] p-4 text-sm leading-6 text-[var(--muted)]">
                “{selectedNode.label}” 暂无可定位的历史记录。
              </p>
            ) : (
              <div className="mt-5 space-y-2">
                {relatedConversations.map((conversation) => (
                  <a
                    key={conversation.id}
                    className="block rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-3 text-sm text-[var(--text)] transition hover:border-teal-300/45"
                    href={`/history?concept=${encodeURIComponent(selectedNode.label)}`}
                  >
                    {conversation.title}
                  </a>
                ))}
              </div>
            )}
          </section>
        </div>
        <div className="space-y-6">
          <WeakConceptList concepts={mergeWeakConcepts(profile.weakConceptHints, practiceMistakes)} />
          <FeedbackTrend positive={profile.positiveFeedbackCount || 0} negative={profile.negativeFeedbackCount || 0} />
          <StylePreferencePanel preference={profile.answerStylePreference} />
        </div>
      </div>
    </div>
  );
}

function buildGraphNodes(profile, mistakes) {
  const rawNodes = [
    ...(profile.frequentTopics || []).map((item) => ({ label: item.label, count: item.count || 1, weak: false })),
    ...(profile.weakConceptHints || []).map((item) => ({ label: item.label, count: item.count || 1, weak: true })),
    ...(profile.repeatedQuestionPatterns || []).map((item) => ({ label: item.normalizedQuestion, count: item.count || 1, weak: true })),
    ...(Array.isArray(mistakes) ? mistakes.map((item) => ({ label: item.knowledgePoint || item.concept || item.title || '错题概念', count: 1, weak: true })) : []),
  ].filter((item) => item.label);

  const deduped = Array.from(
    rawNodes.reduce((map, item) => {
      const current = map.get(item.label) || { ...item, count: 0, weak: false };
      map.set(item.label, { ...current, count: current.count + item.count, weak: current.weak || item.weak });
      return map;
    }, new Map()).values(),
  ).slice(0, 10);

  return deduped.map((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(1, deduped.length) - Math.PI / 2;
    const distance = 112 + (index % 3) * 22;
    return {
      ...node,
      id: `node_${index}_${node.label}`,
      radius: Math.min(34, 16 + Number(node.count || 1) * 4),
      x: 260 + Math.cos(angle) * distance,
      y: 170 + Math.sin(angle) * distance,
    };
  });
}

function mergeWeakConcepts(profileHints = [], mistakes = []) {
  const map = new Map();
  for (const item of profileHints) {
    map.set(item.label, { label: item.label, count: item.count || 1 });
  }
  for (const mistake of Array.isArray(mistakes) ? mistakes : []) {
    const label = mistake.knowledgePoint || mistake.concept || mistake.title;
    if (!label) continue;
    const current = map.get(label) || { label, count: 0 };
    map.set(label, { label, count: current.count + 1 });
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 8);
}

function findRelatedConversations(conversations, label) {
  const needle = String(label || '').toLowerCase();
  if (!needle) return [];
  return conversations
    .filter((conversation) => [conversation.title, ...(conversation.messages || []).map((message) => message.content)].join('\n').toLowerCase().includes(needle))
    .slice(0, 5);
}
