const GridIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)
const AnalyzeIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const HistoryIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h6v6h-6z"/>
  </svg>
)

export default function Sidebar({ tab, setTab, total }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: <GridIcon /> },
    { id: 'analyze',   label: 'Analyze',   icon: <AnalyzeIcon /> },
    { id: 'history',   label: 'History',   icon: <HistoryIcon />,
      badge: total > 0 ? total : null },
  ]
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">
          <div className="logo-dot" />
          <span>Sentiment AI</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {items.map(it => (
          <button key={it.id}
            className={`nav-item ${tab === it.id ? 'active' : ''}`}
            onClick={() => setTab(it.id)}>
            {it.icon}
            <span>{it.label}</span>
            {it.badge != null && (
              <span style={{marginLeft:'auto',fontSize:11,background:'var(--accent-bg)',
                color:'var(--accent)',padding:'1px 7px',borderRadius:20,
                border:'1px solid var(--accent-border)'}}>{it.badge}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">BERT · HuggingFace · MySQL</div>
    </aside>
  )
}
