import { useState } from 'react'

export default function HistoryTable({ history }) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = history.filter(h => {
    const matchLabel  = filter === 'All' || h.label === filter
    const matchSearch = h.text.toLowerCase().includes(search.toLowerCase())
    return matchLabel && matchSearch
  })

  const sentColor = (label) =>
    label === 'Positive' ? 'var(--pos)' :
    label === 'Negative' ? 'var(--neg)' : 'var(--neu)'

  return (
    <>
      <div className="page-header">
        <div className="page-title">Analysis history</div>
        <div className="page-sub">{history.length} records stored in MySQL</div>
      </div>

      <div style={{padding:'16px 24px',borderBottom:'1px solid var(--border)',
        background:'var(--bg2)',display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search text…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:'var(--radius-sm)',
            padding:'7px 12px',fontSize:13,color:'var(--text)',outline:'none',width:220,
            fontFamily:'var(--font)'}}
        />
        {/* Filter pills */}
        {['All','Positive','Negative','Neutral'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`badge ${f === 'All' ? '' : f}`}
            style={{cursor:'pointer',border:'none',
              background: filter === f
                ? f === 'All' ? 'var(--accent-bg)' : undefined
                : 'var(--bg3)',
              color: filter === f
                ? f === 'All' ? 'var(--accent)' : undefined
                : 'var(--text2)',
              padding:'5px 14px',fontSize:12}}>
            {f}
          </button>
        ))}
        <span style={{marginLeft:'auto',fontSize:12,color:'var(--text3)'}}>
          {filtered.length} of {history.length}
        </span>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'0 24px 24px'}}>
        {filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'48px 0',color:'var(--text3)',fontSize:13}}>
            {history.length === 0
              ? 'No analyses yet — go to Analyze to get started'
              : 'No results match your filter'}
          </div>
        ) : (
          <table className="history-table" style={{marginTop:16}}>
            <thead>
              <tr>
                <th>#</th>
                <th>Text</th>
                <th>Label</th>
                <th>Confidence</th>
                <th>Latency</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id}>
                  <td style={{color:'var(--text3)',fontFamily:'var(--mono)',fontSize:11}}>{row.id}</td>
                  <td className="td-text" title={row.text}>{row.text}</td>
                  <td>
                    <span className={`badge ${row.label}`}>{row.label}</span>
                  </td>
                  <td style={{fontFamily:'var(--mono)',fontSize:12,color: sentColor(row.label)}}>
                    {Math.round(row.score * 100)}%
                  </td>
                  <td style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--text3)'}}>
                    {row.latency_ms}ms
                  </td>
                  <td style={{fontSize:11,color:'var(--text3)',whiteSpace:'nowrap'}}>
                    {row.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
