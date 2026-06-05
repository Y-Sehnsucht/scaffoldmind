export function ShimmerButton({
  as: Component = 'button',
  children,
  className = '',
  shimmerColor = 'var(--shimmer-button-light)',
  shimmerSize = '0.08em',
  borderRadius = '100px',
  shimmerDuration = '3s',
  background = 'var(--shimmer-button-bg)',
  style,
  ...props
}) {
  return (
    <Component
      className={`shimmer-button ${className}`}
      style={{
        '--shimmer-color': shimmerColor,
        '--shimmer-size': shimmerSize,
        '--shimmer-radius': borderRadius,
        '--shimmer-duration': shimmerDuration,
        '--shimmer-bg': background,
        ...style,
      }}
      {...props}
    >
      <span className="shimmer-button__ring" aria-hidden="true" />
      <span className="shimmer-button__glow" aria-hidden="true" />
      <span className="relative z-10">{children}</span>
    </Component>
  );
}
