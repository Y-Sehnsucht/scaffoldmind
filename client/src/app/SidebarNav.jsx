import { AnimatedThemeToggle } from '../features/agent-chat/AnimatedThemeToggle.jsx';
import { handleRouteClick, routeHref } from '../routes/navigation.js';

const NAV_ITEMS = [
  { path: '/landing', label: 'Landing', short: 'L', description: '产品入口' },
  { path: '/home', label: 'Home', short: 'H', description: '学习仪表盘' },
  { path: '/chat', label: 'Chat', short: 'C', description: 'AI 学习主路径' },
  { path: '/history', label: 'History', short: 'R', description: '学习记录' },
  { path: '/profile', label: 'Profile', short: 'P', description: '用户画像' },
  { path: '/practice', label: 'Practice', short: 'T', description: '刷题强化' },
  { path: '/review', label: 'Review', short: 'V', description: '复习计划' },
  { path: '/settings', label: 'Settings', short: 'S', description: '本地设置' },
];

export function SidebarNav({ activePath }) {
  return (
    <aside className="group fixed left-0 top-0 z-50 flex h-full w-16 flex-col justify-between overflow-hidden border-r border-[var(--border-soft)] bg-[var(--panel-bg)] shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 ease-in-out hover:w-64">
      <div className="min-h-0 flex-1">
        <a
          className="flex h-20 items-center gap-3 px-3 text-[var(--text-primary)]"
          href={routeHref('/landing')}
          onClick={(event) => handleRouteClick(event, '/landing')}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[var(--text-primary)] text-base font-bold text-[var(--app-bg)]">明</span>
          <span className="min-w-0 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="block text-base font-semibold">ScaffoldMind</span>
            <span className="block text-xs text-[var(--text-muted)]">明序</span>
          </span>
        </a>

        <nav className="flex min-h-0 flex-col gap-1 px-2" aria-label="主导航">
          {NAV_ITEMS.map((item) => {
            const active = activePath === item.path;

            return (
              <a
                key={item.path}
                className={`flex h-12 items-center gap-3 rounded-2xl px-2 text-sm transition ${
                  active
                    ? 'bg-[var(--text-primary)] text-[var(--app-bg)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--panel-strong)] hover:text-[var(--text-primary)]'
                }`}
                href={routeHref(item.path)}
                onClick={(event) => handleRouteClick(event, item.path)}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-semibold ${
                  active ? 'bg-[var(--app-bg)] text-[var(--text-primary)]' : 'bg-[var(--panel-strong)] text-[var(--text-primary)]'
                }`}>
                  {item.short}
                </span>
                <span className="min-w-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="block truncate font-medium">{item.label}</span>
                  <span className={`block truncate text-xs ${active ? 'text-[var(--app-bg)]' : 'text-[var(--text-muted)]'}`}>{item.description}</span>
                </span>
              </a>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[var(--border-soft)] p-3">
        <AnimatedThemeToggle />
      </div>
    </aside>
  );
}
