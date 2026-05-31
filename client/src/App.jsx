import { LEARNING_MODES, SUBJECTS } from './core/constants.js';

export default function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">ScaffoldMind 明序</h1>
            <p className="text-sm text-slate-600">AI learning loop workspace skeleton</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded border border-slate-200 px-2 py-1">{SUBJECTS[0].label}</span>
            <span className="rounded border border-slate-200 px-2 py-1">{LEARNING_MODES.length} modes</span>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
        <aside className="rounded border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold">Input & Settings</h2>
          <p className="mt-2 text-sm text-slate-600">
            Subject, learning mode, preference chips, and material inputs will live here.
          </p>
        </aside>

        <section className="rounded border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold">Learning Loop</h2>
          <p className="mt-2 text-sm text-slate-600">
            Structured analysis, guided questions, user attempts, diagnosis, reinforcement tasks,
            and Obsidian output will render here.
          </p>
        </section>

        <aside className="rounded border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold">Question History</h2>
          <p className="mt-2 text-sm text-slate-600">
            The right-side question history sidebar is reserved and must remain part of the MVP.
          </p>
        </aside>
      </section>
    </main>
  );
}
