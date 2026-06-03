export function KnowledgeGraph({ nodes, selectedId, onSelect }) {
  if (!nodes.length) {
    return (
      <section className="rounded-[30px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
        <p className="text-sm text-[var(--subtle)]">Knowledge Graph</p>
        <h2 className="mt-1 text-2xl font-semibold text-[var(--text)]">轻量知识图谱</h2>
        <p className="mt-5 rounded-2xl border border-dashed border-[var(--border)] p-6 text-center text-sm leading-6 text-[var(--muted)]">
          暂无足够画像数据。完成几次对话、追问或反馈后，这里会出现常问主题与薄弱概念。
        </p>
      </section>
    );
  }

  const center = { x: 260, y: 170 };

  return (
    <section className="rounded-[30px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--subtle)]">Knowledge Graph</p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--text)]">轻量知识图谱</h2>
        </div>
        <span className="rounded-full bg-[var(--panel-soft)] px-3 py-1 text-xs text-[var(--subtle)]">SVG 本地绘制</span>
      </div>
      <svg className="mt-5 h-[380px] w-full rounded-[28px] border border-[var(--border)] bg-[var(--panel-soft)]" viewBox="0 0 520 340" role="img" aria-label="学习画像知识图谱">
        {nodes.map((node) => (
          <line key={`line_${node.id}`} x1={center.x} y1={center.y} x2={node.x} y2={node.y} stroke="currentColor" strokeOpacity="0.12" />
        ))}
        <circle cx={center.x} cy={center.y} r="36" fill="rgba(45,212,191,0.16)" stroke="rgba(45,212,191,0.55)" />
        <text x={center.x} y={center.y + 4} textAnchor="middle" className="fill-[var(--text)] text-xs font-semibold">明序画像</text>
        {nodes.map((node) => (
          <g key={node.id} role="button" tabIndex="0" onClick={() => onSelect(node.id)} className="cursor-pointer">
            <circle
              cx={node.x}
              cy={node.y}
              r={node.radius}
              fill={node.weak ? 'rgba(251,113,133,0.18)' : 'rgba(45,212,191,0.16)'}
              stroke={selectedId === node.id ? 'rgba(255,255,255,0.9)' : node.weak ? 'rgba(251,113,133,0.55)' : 'rgba(45,212,191,0.55)'}
              strokeWidth={selectedId === node.id ? 2.5 : 1.5}
            />
            <text x={node.x} y={node.y + node.radius + 16} textAnchor="middle" className="fill-[var(--muted)] text-[11px]">
              {node.label.length > 10 ? `${node.label.slice(0, 10)}...` : node.label}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}
