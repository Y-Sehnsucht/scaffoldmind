export function SettingsSection({ title, description, children }) {
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--panel)] p-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
