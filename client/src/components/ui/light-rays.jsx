export function LightRays({ className = '' }) {
  return (
    <div className={`light-rays pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`} aria-hidden="true">
      <span className="light-rays__beam light-rays__beam--one" />
      <span className="light-rays__beam light-rays__beam--two" />
      <span className="light-rays__beam light-rays__beam--three" />
    </div>
  );
}
