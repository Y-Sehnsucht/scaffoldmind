import { ChatComposer } from './ChatComposer.jsx';
import { ChatMessage } from './ChatMessage.jsx';

export function ChatShell({
  messages,
  input,
  attachments,
  isStreaming,
  status,
  errorMessage,
  pendingInteraction,
  modeSwitchNotice,
  feedbackByMessage,
  interactiveOptions,
  onInputChange,
  onAddAttachments,
  onRemoveAttachment,
  onSend,
  onCopyMessage,
  onFeedback,
  onOptionSelect,
}) {
  const latestAssistantId = [...messages].reverse().find((message) => message.role === 'assistant')?.id;

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--panel)] shadow-2xl shadow-black/15">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-[var(--text)]">ScaffoldMind 明序</h1>
          <p className="mt-1 text-[0.8125rem] text-[var(--subtle)]">中间主导式 AI 学习智能体</p>
        </div>
        <span className="shrink-0 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs text-teal-100">
          {isStreaming ? '正在生成' : '就绪'}
        </span>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                feedbackRating={feedbackByMessage?.[message.id]}
                interactiveOptions={!pendingInteraction && !message.isInteractionTask && message.id === latestAssistantId ? interactiveOptions : []}
                isLatestAssistant={message.id === latestAssistantId}
                disabled={isStreaming}
                onCopyMessage={onCopyMessage}
                onFeedback={onFeedback}
                onOptionSelect={onOptionSelect}
              />
            ))
          )}
        </div>
      </section>

      <ChatComposer
        value={input}
        attachments={attachments}
        disabled={isStreaming}
        status={status}
        errorMessage={errorMessage}
        pendingInteraction={pendingInteraction}
        modeSwitchNotice={modeSwitchNotice}
        onChange={onInputChange}
        onAddAttachments={onAddAttachments}
        onRemoveAttachment={onRemoveAttachment}
        onSend={onSend}
      />
    </main>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex min-h-[52vh] max-w-2xl flex-col justify-center text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] text-2xl">明</div>
      <h2 className="mt-5 text-2xl font-semibold text-[var(--text)]">把材料放进来，我先帮你搭框架</h2>
      <p className="mt-3 text-base leading-[1.65] text-[var(--muted)]">
        粘贴 CSAPP 或数据结构材料后，我会先输出总结、框架、5 个核心概念和可继续选择的学习路径。PPTX 和图片可以作为附件标记，但当前版本不解析内容。
      </p>
      <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
        {['长文本先总结', '先框架后细节', '可连续追问'].map((item) => (
          <div key={item} className="rounded-2xl border border-[var(--border)] bg-[var(--panel-soft)] p-4 text-sm text-[var(--muted)]">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
