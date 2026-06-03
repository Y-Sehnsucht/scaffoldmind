import { AnimatedThemeToggle } from '../features/agent-chat/AnimatedThemeToggle.jsx';
import { handleRouteClick } from '../routes/navigation.js';

const NAV_ITEMS = [
  { path: '/landing', label: 'Landing', short: 'L', description: '明序宣言' },
  { path: '/home', label: 'Home', short: 'H', description: '学习仪表盘' },
  { path: '/chat', label: 'Chat', short: 'C', description: 'AI 学习主路径' },
  { path: '/history', label: 'History', short: 'R', description: '检索学习记录' },
  { path: '/profile', label: 'Profile', short: 'P', description: '用户画像' },
  { path: '/practice', label: 'Practice', short: 'T', description: '占位入口' },
  { path: '/review', label: 'Review', short: 'V', description: '占位入口' },
  { path: '/settings', label: 'Settings', short: 'S', description: '本地设置' },
];

export function SidebarNav({ activePath }) {
  return (
    <aside className="liquid-glass group fixed left-0 top-0 z-50 flex h-full w-16 flex-col justify-between overflow-hidden rounded-none border-r border-white/10 bg-[#0d1117]/82 text-white shadow-2xl shadow-black/30 transition-all duration-300 ease-in-out hover:w-64">
      <div className="min-h-0 flex-1">
        <a
          className="flex h-20 items-center gap-3 px-3 text-white"
          href="/landing"
          onClick={(event) => handleRouteClick(event, '/landing')}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-base font-bold text-slate-950">明</span>
          <span className="min-w-0 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="block text-base font-semibold">ScaffoldMind</span>
            <span className="block text-xs text-white/48">明序</span>
          </span>
        </a>

        <nav className="flex min-h-0 flex-col gap-1 px-2" aria-label="主导航">
          {NAV_ITEMS.map((item) => {
            const active = activePath === item.path;

            return (
              <a
                key={item.path}
                className={`flex h-12 items-center gap-3 rounded-2xl px-2 text-sm transition ${
                  active ? 'bg-white text-slate-950' : 'text-white/64 hover:bg-white/10 hover:text-white'
                }`}
                href={item.path}
                onClick={(event) => handleRouteClick(event, item.path)}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-semibold ${active ? 'bg-slate-950 text-white' : 'bg-white/8 text-white'}`}>
                  {item.short}
                </span>
                <span className="min-w-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <span className="block truncate font-medium">{item.label}</span>
                  <span className={`block truncate text-xs ${active ? 'text-slate-600' : 'text-white/42'}`}>{item.description}</span>
                </span>
              </a>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-3">
        <AnimatedThemeToggle />
      </div>
    </aside>
  );
}
