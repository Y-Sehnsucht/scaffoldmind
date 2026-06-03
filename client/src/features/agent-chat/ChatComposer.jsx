import { useRef } from 'react';
import { AttachmentChips } from './AttachmentChips.jsx';

const ACCEPTED_ATTACHMENTS = '.txt,.md,.markdown,.pdf,.docx,.pptx,.png,.jpg,.jpeg,.webp';

export function ChatComposer({
  value,
  attachments,
  disabled,
  status,
  errorMessage,
  pendingInteraction,
  modeSwitchNotice,
  onChange,
  onAddAttachments,
  onRemoveAttachment,
  onSend,
}) {
  const fileInputRef = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();
    onSend();
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  function handleFiles(event) {
    onAddAttachments(Array.from(event.target.files || []));
    event.target.value = '';
  }

  return (
    <form className="border-t border-[var(--border)] bg-[var(--panel)]/95 px-6 py-4 backdrop-blur" onSubmit={handleSubmit}>
      <div className="mx-auto w-full max-w-6xl">
        {attachments.length > 0 && (
          <div className="mb-3">
            <AttachmentChips attachments={attachments} onRemove={onRemoveAttachment} />
            <p className="mt-2 text-xs text-slate-500">PPTX 和图片已附加，当前版本只保存 metadata，不解析内容。</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {errorMessage}
          </div>
        )}

        {modeSwitchNotice && (
          <div className="mb-3 rounded-2xl border border-sky-300/25 bg-sky-300/10 px-4 py-3 text-sm leading-6 text-sky-50">
            {modeSwitchNotice}
          </div>
        )}

        {pendingInteraction && (
          <div className="mb-3 rounded-2xl border border-teal-300/25 bg-teal-300/10 px-4 py-3 text-sm leading-6 text-teal-50">
            正在进行：{getInteractionLabel(pendingInteraction)}。请先写下你的回答，我会进行评价和指正。
          </div>
        )}

        <div className="flex min-w-0 items-end gap-3 rounded-[28px] border border-[var(--border)] bg-[var(--panel-strong)] p-2 shadow-2xl shadow-black/10 focus-within:border-teal-300/50">
          <input ref={fileInputRef} className="hidden" type="file" multiple accept={ACCEPTED_ATTACHMENTS} onChange={handleFiles} />
          <button
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/10 text-xl text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="添加附件"
            title="添加附件"
            disabled={disabled}
          >
            +
          </button>
          <textarea
            className="max-h-56 min-h-[58px] flex-1 resize-none bg-transparent px-1 py-3.5 text-base leading-[1.55] text-[var(--text)] outline-none placeholder:text-[var(--subtle)]"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingInteraction ? '在这里写下你的回答，我会进行评价和纠偏...' : '粘贴课程材料、代码片段，或直接提问...'}
            disabled={disabled}
          />
          <button
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-lg font-semibold text-[#111418] transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            type="submit"
            disabled={disabled}
            aria-label="发送"
            title="发送"
          >
            →
          </button>
        </div>

        <div className="mt-2 flex min-h-5 items-center justify-between gap-3 text-[0.8125rem] text-[var(--subtle)]">
          <span>{status || 'Enter 发送，Shift + Enter 换行'}</span>
          <span>附件只保存 metadata，不解析内容</span>
        </div>
      </div>
    </form>
  );
}

function getInteractionLabel(interaction) {
  if (interaction.mode === 'feynman') {
    return '费曼反讲纠错';
  }
  if (interaction.mode === 'context_stacking') {
    return 'Context Stacking 预习生成';
  }
  return '互动自测';
}
