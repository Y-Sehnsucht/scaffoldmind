const MODE_LABELS = {
  default: '默认知识解析',
  context_stacking: 'Context Stacking',
  feynman: '费曼反讲',
};

export function ConversationHistory({ conversations = [], activeConversationId, learnerProfile, onSelect, onClear }) {
  return (
    <aside className="hidden min-h-0 flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--panel)] shadow-2xl shadow-black/15 lg:flex">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">最近学习记录</h2>
            <p className="mt-1 text-[0.8125rem] text-[var(--subtle)]">自动保存本机对话</p>
          </div>
          <button
            className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            disabled={!conversations.length}
            onClick={onClear}
          >
            清空
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        <ProfileSummary profile={learnerProfile} />

        <section className="space-y-3">
          {conversations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm leading-6 text-slate-500">
              开始一次对话后，这里会显示最近 10 条学习记录。刷新页面后可以从这里恢复上下文。
            </div>
          ) : (
            conversations.slice(0, 10).map((conversation) => (
              <button
                key={conversation.id}
                className={`w-full min-w-0 rounded-2xl border p-4 text-left transition ${
                  conversation.id === activeConversationId
                    ? 'border-teal-300/40 bg-teal-300/10'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                }`}
                type="button"
                onClick={() => onSelect(conversation)}
              >
                <p className="min-w-0 truncate text-sm font-semibold text-slate-100">{conversation.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {MODE_LABELS[conversation.mode] || conversation.mode} · {formatTime(conversation.updatedAt)}
                </p>
                <p className="mt-2 text-xs text-slate-500">{conversation.messages?.length || 0} 条消息</p>
              </button>
            ))
          )}
        </section>
      </div>
    </aside>
  );
}

function ProfileSummary({ profile }) {
  const style = profile?.answerStylePreference || {};
  const styleLabels = [
    style.wantsConcise ? '偏好简洁' : null,
    style.wantsExamples ? '喜欢例子' : null,
    style.wantsExamFocus ? '关注考点' : null,
    style.wantsStepByStep ? '需要分步' : null,
  ].filter(Boolean);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="text-sm font-semibold text-white">学习画像</h3>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
        <Metric label="对话" value={profile?.totalConversations || 0} />
        <Metric label="反馈" value={`${profile?.positiveFeedbackCount || 0}/${profile?.negativeFeedbackCount || 0}`} />
      </div>
      {profile?.frequentTopics?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.frequentTopics.slice(0, 4).map((item) => (
            <span key={item.label} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-slate-300">
              {item.label}
            </span>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs leading-5 text-slate-500">
        {styleLabels.length ? styleLabels.join('、') : '画像会随反馈、追问和选项点击逐步更新。'}
      </p>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-3 py-2">
      <p>{label}</p>
      <p className="mt-1 font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function formatTime(value) {
  if (!value) {
    return '刚刚';
  }

  try {
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '最近';
  }
}
