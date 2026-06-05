import { RippleButton } from '../../components/ui/ripple-button.jsx';

const UNPARSED_PATTERN = /\.(pptx|png|jpg|jpeg|webp)$/i;

export function AttachmentChips({ attachments = [], onRemove }) {
  if (!attachments.length) return null;

  return (
    <div className="flex min-w-0 flex-wrap gap-2">
      {attachments.map((file) => (
        <span
          key={`${file.name}-${file.selectedAt}`}
          className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--panel-strong)] px-3 py-1.5 text-xs text-[var(--text-secondary)]"
        >
          <span className="min-w-0 truncate">{file.name}</span>
          {isUnparsed(file) && <span className="shrink-0 text-[var(--accent)]">暂不解析</span>}
          {onRemove && (
            <RippleButton
              className="shrink-0 rounded-full text-[var(--text-muted)] hover:text-[var(--danger)]"
              type="button"
              onClick={() => onRemove(file)}
              aria-label={`移除 ${file.name}`}
            >
              ×
            </RippleButton>
          )}
        </span>
      ))}
    </div>
  );
}

function isUnparsed(file) {
  const value = `${file.name || ''} ${file.type || ''}`;
  return UNPARSED_PATTERN.test(value) || value.toLowerCase().includes('image/');
}
