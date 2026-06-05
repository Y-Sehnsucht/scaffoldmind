import { LightRays } from './ui/light-rays.jsx';

export function AppBackground({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-bg)]">
      <LightRays />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
