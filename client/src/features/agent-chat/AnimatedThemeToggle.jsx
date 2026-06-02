import { useEffect, useState } from 'react';
import { AGENT_MEMORY_KEYS } from '../../shared/storage/agentMemoryStorage.js';

export function AnimatedThemeToggle() {
  const [theme, setTheme] = useState(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const update = () => {
      setTheme(nextTheme);
      window.localStorage.setItem(AGENT_MEMORY_KEYS.theme, nextTheme);
    };

    if (document.startViewTransition) {
      document.startViewTransition(update);
    } else {
      update();
    }
  }

  return (
    <button
      className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-[var(--panel-soft)] text-[var(--text)] shadow-lg shadow-black/10 transition hover:border-teal-300/50 hover:text-teal-200"
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? '切换到日间模式' : '切换到夜间模式'}
      title={theme === 'dark' ? '切换到日间模式' : '切换到夜间模式'}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const saved = window.localStorage.getItem(AGENT_MEMORY_KEYS.theme);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle('light', theme === 'light');
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 7 7 0 1 0 20.5 14.5Z" />
    </svg>
  );
}
