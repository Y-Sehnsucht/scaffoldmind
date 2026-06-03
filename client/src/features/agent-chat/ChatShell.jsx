import { useEffect, useRef } from 'react';
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
  scrollTargetId,
  onInputChange,
  onAddAttachments,
  onRemoveAttachment,
  onSend,
  onCopyMessage,
  onFeedback,
  onOptionSelect,
  onScrollHandled,
}) {
  const latestAssistantId = [...messages].reverse().find((message) => message.role === 'assistant')?.id;
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!scrollTargetId) return;

    window.requestAnimationFrame(() => {
      if (scrollTargetId === '__bottom__') {
        bottomRef.current?.scrollIntoView({ block: 'end' });
      } else if (scrollTargetId === '__bottom_if_near__') {
        if (isUserNearBottom(scrollRef.current)) {
          bottomRef.current?.scrollIntoView({ block: 'end' });
        }
      } else {
        document.getElementById(scrollTargetId)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
      onScrollHandled?.();
    });
  }, [scrollTargetId, onScrollHandled]);

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-[var(--border-soft)] bg-[var(--panel-bg)] shadow-2xl shadow-black/15">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border-soft)] px-6 py-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-[var(--text-primary)]">ScaffoldMind 明序</h1>
          <p className="mt-1 text-[0.8125rem] text-[var(--text-muted)]">中间主导式 AI 学习智能体</p>
        </div>
        <span className="shrink-0 rounded-full border border-[var(--accent-green)]/25 bg-[var(--panel-strong)] px-3 py-1 text-xs text-[var(--accent-green)]">
          {isStreaming ? '正在生成' : '就绪'}
        </span>
      </header>

      <section ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="flex w-full min-w-0 flex-col gap-5">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            messages.map((message) => (
              <div id={message.id} key={message.id} className="scroll-mt-6">
                <ChatMessage
                  message={message}
                  feedbackRating={feedbackByMessage?.[message.id]}
                  interactiveOptions={!pendingInteraction && !message.isInteractionTask && message.id === latestAssistantId ? interactiveOptions : []}
                  isLatestAssistant={message.id === latestAssistantId}
                  disabled={isStreaming}
                  onCopyMessage={onCopyMessage}
                  onFeedback={onFeedback}
                  onOptionSelect={onOptionSelect}
                />
              </div>
            ))
          )}
          <div ref={bottomRef} />
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
    <div className="mx-auto flex min-h-[52vh] w-full max-w-5xl flex-col justify-center text-center">
      <p className="font-serif-display text-5xl italic text-[var(--text-primary)] md:text-6xl">What shall we structure today?</p>
      <p className="mx-auto mt-4 max-w-3xl text-base leading-[1.65] text-[var(--text-secondary)]">
        粘贴 CSAPP 或数据结构材料，明序会先搭框架，再通过追问、反馈和本地记忆形成学习闭环。PPTX 和图片只作为附件 metadata，不解析内容。
      </p>
      <div className="mt-7 grid gap-3 text-left sm:grid-cols-3">
        {['默认知识解析', 'Context Stacking', '费曼反讲'].map((item) => (
          <div key={item} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel-strong)] p-4 text-sm text-[var(--text-secondary)]">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function isUserNearBottom(element) {
  if (!element) return true;
  const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
  return distance < 180;
}
