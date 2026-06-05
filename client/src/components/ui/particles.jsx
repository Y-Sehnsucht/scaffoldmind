import { useEffect, useRef } from 'react';

function resolveCanvasColor(color) {
  if (color) return color;
  if (typeof document === 'undefined') return '#ffffff';
  return document.documentElement.classList.contains('light') || document.documentElement.dataset.theme === 'light' ? '#111827' : '#ffffff';
}

export function Particles({ className = '', quantity = 100, staticity = 50, ease = 80, color = '', refresh = false, topBias = false, size = 1 }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particlesRef.current = createParticles(quantity, rect.width, rect.height, topBias, size);
    }

    function drawParticle(particle, resolvedColor) {
      context.beginPath();
      context.globalAlpha = particle.alpha;
      context.fillStyle = resolvedColor;
      context.arc(particle.x + particle.offsetX, particle.y + particle.offsetY, particle.radius, 0, Math.PI * 2);
      context.fill();
    }

    function render() {
      const rect = canvas.getBoundingClientRect();
      const resolvedColor = resolveCanvasColor(color);
      context.clearRect(0, 0, rect.width, rect.height);

      particlesRef.current.forEach((particle) => {
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const force = Math.max(0, 1 - distance / (staticity * 4));
          particle.offsetX += ((-dx / distance) * force * 18 - particle.offsetX) / ease;
          particle.offsetY += ((-dy / distance) * force * 18 - particle.offsetY) / ease;
        } else {
          particle.offsetX += (0 - particle.offsetX) / ease;
          particle.offsetY += (0 - particle.offsetY) / ease;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -8) particle.x = rect.width + 8;
        if (particle.x > rect.width + 8) particle.x = -8;
        if (particle.y < -8) particle.y = rect.height + 8;
        if (particle.y > rect.height + 8) particle.y = -8;

        drawParticle(particle, resolvedColor);
      });

      frameRef.current = window.requestAnimationFrame(render);
    }

    function handleMouseMove(event) {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
      mouseRef.current = {
        x,
        y,
        active: inside,
      };
    }

    function handleMouseLeave() {
      mouseRef.current.active = false;
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    frameRef.current = window.requestAnimationFrame(render);
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handleMouseMove, { passive: true });
    window.addEventListener('pointerleave', handleMouseLeave);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerleave', handleMouseLeave);
    };
  }, [color, ease, quantity, refresh, staticity, topBias, size]);

  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />;
}

function createParticles(quantity, width, height, topBias = false, size = 1) {
  return Array.from({ length: quantity }).map((_, index) => {
    const seed = index + 1;
    return {
      x: pseudoRandom(seed * 13) * width,
      y: (topBias ? Math.pow(pseudoRandom(seed * 29), 1.75) : pseudoRandom(seed * 29)) * height,
      radius: (0.7 + pseudoRandom(seed * 37) * 1.6) * size,
      alpha: 0.16 + pseudoRandom(seed * 41) * 0.54,
      vx: (pseudoRandom(seed * 53) - 0.5) * 0.08,
      vy: (pseudoRandom(seed * 61) - 0.5) * 0.08,
      offsetX: 0,
      offsetY: 0,
    };
  });
}

function pseudoRandom(seed) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}
