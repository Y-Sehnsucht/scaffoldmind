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
      return {
        key: dateKey,
        day,
        dateKey,
        hasEvent: eventDates.has(dateKey),
        isToday: dateKey === todayKey,
        isSelected: selectedDate === dateKey,
      };
    }),
  ];

  return (
    <section className="rounded-[30px] border border-[var(--border-soft)] bg-[var(--panel-bg)] p-6 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--text-muted)]">Calendar</p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--text-primary)]">本月学习日历</h2>
        </div>
        <span className="rounded-full border border-[var(--border-soft)] bg-[var(--panel-strong)] px-3 py-1.5 text-sm text-[var(--text-secondary)]">
          {year} / {String(month + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-sm font-medium text-[var(--text-muted)]">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((cell) =>
          cell.blank ? (
            <div key={cell.key} className="aspect-square" />
          ) : (
            <button
              key={cell.key}
              className={buildDayClass(cell)}
              type="button"
              onClick={() => onSelectDate(cell.dateKey)}
              aria-pressed={cell.isSelected}
            >
              <span className={cell.isToday ? 'font-bold' : ''}>{cell.day}</span>
              {cell.hasEvent && (
                <span
                  className={`absolute bottom-3 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full ${
                    cell.isSelected ? 'bg-[var(--app-bg)]' : 'bg-[var(--accent-green)]'
                  }`}
                />
              )}
            </button>
          ),
        )}
      </div>

      <p className="mt-5 text-sm leading-6 text-[var(--text-secondary)]">
        点击日期后，在下方“选中日期事件”面板添加、编辑或删除本地学习事件。
      </p>
    </section>
  );
}

function buildDayClass(cell) {
  const base = 'relative flex aspect-square items-center justify-center rounded-[22px] border-2 text-lg font-medium transition';
  if (cell.isSelected) {
    return `${base} border-[var(--accent-blue)] bg-[var(--accent-blue)] text-[var(--app-bg)] shadow-lg shadow-black/10`;
  }

  const eventStyle = cell.hasEvent ? 'bg-[var(--accent-soft)]' : 'bg-[var(--panel-strong)]';
  const todayStyle = cell.isToday ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border-soft)] text-[var(--text-primary)]';
  return `${base} ${eventStyle} ${todayStyle} hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]`;
}
