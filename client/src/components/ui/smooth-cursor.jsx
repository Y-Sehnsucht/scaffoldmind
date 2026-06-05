import { useEffect, useRef } from 'react';

const TEXT_CURSOR_SELECTOR = 'input, textarea, select, [contenteditable="true"]';
const POSITION_SPRING = {
  damping: 32,
  mass: 1,
  stiffness: 520,
};
const ROTATION_SPRING = {
  damping: 30,
  mass: 1,
  stiffness: 260,
};

export function SmoothCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;

    document.body.classList.add('smooth-cursor-active');

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { ...target };
    const velocity = { x: 0, y: 0 };
    let rotation = 0;
    let targetRotation = 0;
    let rotationVelocity = 0;
    let lastTime = performance.now();
    let frameId = 0;

    function move(event) {
      target.x = event.clientX;
      target.y = event.clientY;

      const targetElement = event.target;
      const overTextInput = targetElement instanceof Element && targetElement.closest(TEXT_CURSOR_SELECTOR);
      if (cursorRef.current) {
        cursorRef.current.style.opacity = overTextInput ? '0' : '1';
      }
    }

    function tick(time) {
      const delta = Math.min(0.032, Math.max(0.001, (time - lastTime) / 1000));
      lastTime = time;

      stepSpring(current, velocity, target, POSITION_SPRING, delta);

      const speed = Math.hypot(velocity.x, velocity.y);
      if (speed > 8) {
        targetRotation = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI);
      }

      const angleDelta = shortestAngleDelta(rotation, targetRotation);
      const angleAcceleration = (ROTATION_SPRING.stiffness * angleDelta - ROTATION_SPRING.damping * rotationVelocity) / ROTATION_SPRING.mass;
      rotationVelocity += angleAcceleration * delta;
      rotation += rotationVelocity * delta;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) rotate(${rotation}deg)`;
      }

      frameId = window.requestAnimationFrame(tick);
    }

    window.addEventListener('pointermove', move, { passive: true });
    frameId = window.requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove('smooth-cursor-active');
      window.removeEventListener('pointermove', move);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div ref={cursorRef} className="smooth-cursor-pointer" aria-hidden="true">
      <svg className="smooth-cursor-pointer__svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M25.1 14 4.9 3.9c-1.45-.72-2.92.86-2.09 2.25L7.42 14l-4.61 7.85c-.83 1.39.64 2.97 2.09 2.25L25.1 14Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

function stepSpring(current, velocity, target, config, delta) {
  const ax = (config.stiffness * (target.x - current.x) - config.damping * velocity.x) / config.mass;
  const ay = (config.stiffness * (target.y - current.y) - config.damping * velocity.y) / config.mass;

  velocity.x += ax * delta;
  velocity.y += ay * delta;
  current.x += velocity.x * delta;
  current.y += velocity.y * delta;
}

function shortestAngleDelta(from, to) {
  return ((((to - from) % 360) + 540) % 360) - 180;
}
