export function KineticText({ text, className = '', stableColor = false }) {
  return (
    <span className={`kinetic-text ${stableColor ? 'kinetic-text--stable' : ''} ${className}`} aria-label={text}>
      {Array.from(text).map((char, index) => (
        <span key={`${char}-${index}`} className="kinetic-text__char" aria-hidden="true">
          {char}
        </span>
      ))}
    </span>
  );
}
