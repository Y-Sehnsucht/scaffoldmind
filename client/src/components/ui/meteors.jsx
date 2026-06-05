export function Meteors({ number = 20, minDelay = 0.2, maxDelay = 1.2, minDuration = 2, maxDuration = 10, className = '' }) {
  const delayRange = Math.max(0, maxDelay - minDelay);
  const durationRange = Math.max(0.1, maxDuration - minDuration);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {Array.from({ length: number }).map((_, index) => (
        <span
          key={index}
          className="meteor"
          style={{
            '--meteor-delay': `${minDelay + (((index * 37) % 100) / 100) * delayRange}s`,
            '--meteor-duration': `${minDuration + (((index * 53) % 100) / 100) * durationRange}s`,
            '--meteor-left': `${24 + ((index * 29) % 92)}%`,
            '--meteor-top': `${-32 + ((index * 41) % 86)}%`,
            '--meteor-travel-x': `${-360 - (index % 5) * 44}px`,
            '--meteor-travel-y': `${360 + (index % 5) * 44}px`,
          }}
        >
          <span className="meteor__body" />
        </span>
      ))}
    </div>
  );
}
