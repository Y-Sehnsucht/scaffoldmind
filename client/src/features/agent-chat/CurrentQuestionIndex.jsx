import { RippleButton } from '../../components/ui/ripple-button.jsx';

export function CurrentQuestionIndex({ questions = [], activeMessageId, onSelect }) {
  return (
    <aside className="flex min-h-0 w-full flex-col overflow-hidden rounded-[24px] border border-[var(--border-soft)] bg-[var(--panel-bg)] shadow-2xl shadow-black/15">
      <div className="border-b border-[var(--border-soft)] px-5 py-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">当前对话问题</h2>
        <p className="mt-1 text-[0.8125rem] text-[var(--text-muted)]">只索引本次 conversation 内的用户问题</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-soft)] p-4 text-sm leading-6 text-[var(--text-muted)]">
            新会话还没有问题。发送第一条消息后，这里会出现当前对话的问题索引。
          </div>
        ) : (
          <ol className="space-y-2">
            {questions.map((question) => {
              const active = activeMessageId === question.id;
              return (
                <li key={question.id}>
                  <RippleButton
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      active
                        ? 'border-[var(--accent-blue)] bg-[var(--accent-soft)] text-[var(--text-primary)]'
                        : 'border-[var(--border-soft)] bg-[var(--panel-strong)] text-[var(--text-secondary)] hover:border-[var(--accent-blue)]'
                    }`}
                    type="button"
                    onClick={() => onSelect(question.id)}
                  >
                    <span className="mb-1 block text-xs text-[var(--text-muted)]">问题 {question.index}</span>
                    <span className="line-clamp-2">{question.label}</span>
                  </RippleButton>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </aside>
  );
}
