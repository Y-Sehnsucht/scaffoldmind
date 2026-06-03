export function LearningCalendar({ events, selectedDate, onSelectDate }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const eventDates = new Set(events.map((event) => event.date));
  const todayKey = new Date().toISOString().slice(0, 10);
  const cells = [
    ...Array.from({ length: startOffset }, (_, index) => ({ key: `blank_${index}`, blank: true })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().slice(0, 10);
      return { key: dateKey, day, dateKey, hasEvent: eventDates.has(dateKey), isToday: dateKey === todayKey };
    }),
  ];

  return (
    <section className="rounded-[30px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--subtle)]">Calendar</p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--text)]">本月学习日历</h2>
        </div>
        <span className="rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-3 py-1.5 text-sm text-[var(--muted)]">
          {year} / {String(month + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs text-[var(--subtle)]">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((cell) =>
          cell.blank ? (
            <div key={cell.key} className="aspect-square" />
          ) : (
            <button
              key={cell.key}
              className={`relative aspect-square rounded-2xl border text-sm transition ${
                selectedDate === cell.dateKey
                  ? 'border-teal-300 bg-teal-300/16 text-[var(--text)] shadow-lg shadow-teal-950/10'
                  : 'border-[var(--border)] bg-[var(--panel-soft)] text-[var(--text)] hover:border-teal-300/45'
              }`}
              type="button"
              onClick={() => onSelectDate(cell.dateKey)}
            >
              <span className={cell.isToday ? 'font-semibold text-teal-300' : ''}>{cell.day}</span>
              {cell.hasEvent && <span className="absolute bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-teal-300" />}
            </button>
          ),
        )}
      </div>
      <p className="mt-5 text-sm leading-6 text-[var(--muted)]">点击日期可添加或查看本地学习事件。</p>
    </section>
  );
}
