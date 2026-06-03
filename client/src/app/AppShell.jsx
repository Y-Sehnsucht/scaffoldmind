import { useEffect } from 'react';
import { AnimatedThemeToggle } from '../features/agent-chat/AnimatedThemeToggle.jsx';
import { handleRouteClick } from '../routes/navigation.js';
import { addStudySeconds, markCheckin, toDateKey } from '../shared/storage/homeStorage.js';
import { SidebarNav } from './SidebarNav.jsx';

export function AppShell({ activePath, pageTitle, children }) {
  const isChat = activePath === '/chat';

  useEffect(() => {
    const todayKey = toDateKey();
    markCheckin(todayKey);

    const timer = window.setInterval(() => {
      const studyTime = addStudySeconds(todayKey, 15);
      const checkins = markCheckin(todayKey);
      window.dispatchEvent(new CustomEvent('scaffoldmind:study-time-updated', { detail: { studyTime, checkins } }));
    }, 15000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--app-bg)] text-[var(--text-primary)]">
      <SidebarNav activePath={activePath} />

      <main className="h-full w-full flex-1 overflow-hidden pl-16">
        {isChat ? (
          children
        ) : (
          <div className="h-full w-full overflow-y-auto">
            <header className="flex w-full items-center justify-between gap-4 px-6 pb-2 pt-6">
              <div>
                <p className="text-sm text-[var(--text-muted)]">ScaffoldMind 明序</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-normal text-[var(--text-primary)]">{pageTitle}</h1>
              </div>
              <div className="flex items-center gap-3">
                <a
                  className="hidden rounded-full border border-[var(--border-soft)] bg-[var(--panel-strong)] px-4 py-2 text-sm text-[var(--text-primary)] transition hover:border-[var(--accent-blue)] lg:inline-flex"
                  href="/chat"
                  onClick={(event) => handleRouteClick(event, '/chat')}
                >
                  进入对话
                </a>
                <AnimatedThemeToggle />
              </div>
            </header>
            <div className="w-full pb-8 pt-3">{children}</div>
          </div>
        )}
      </main>
    </div>
  );
}
