export function BorderBeam({ className = '' }) {
  return (
    <span className={`border-beam pointer-events-none absolute inset-0 rounded-[inherit] ${className}`} aria-hidden="true">
      <span />
    </span>
  );
}
