import { useState } from 'react';

export function RippleButton({ as: Component = 'button', className = '', rippleClassName = '', children, onPointerDown, ...props }) {
  const [ripples, setRipples] = useState([]);

  function handlePointerDown(event) {
    onPointerDown?.(event);
    if (props.disabled) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      size,
      x: event.clientX - rect.left - size / 2,
      y: event.clientY - rect.top - size / 2,
    };
    setRipples((current) => [...current, ripple].slice(-4));
    window.setTimeout(() => {
      setRipples((current) => current.filter((item) => item.id !== ripple.id));
    }, 650);
  }

  return (
    <Component className={`ripple-button relative overflow-hidden ${className}`} onPointerDown={handlePointerDown} {...props}>
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={`ripple-button__ink ${rippleClassName}`}
          style={{ height: ripple.size, left: ripple.x, top: ripple.y, width: ripple.size }}
        />
      ))}
    </Component>
  );
}
