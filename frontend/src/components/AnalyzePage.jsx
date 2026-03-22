import { useState, useRef } from 'react'

const EXAMPLES = [
  "The product quality exceeded my expectations — absolutely love it!",
  "Terrible experience. The service was slow and staff were rude.",
  "It was okay, nothing special but nothing terrible either.",
  "Absolutely fantastic! Best purchase I've made this year.",
  "I'm disappointed. The item arrived damaged and support was unhelpful.",
]

export default function AnalyzePage({ apiUrl, onResult }) {
  const [text, setText]       = useState('')
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  // batch
  const [batchLoading, setBatchLoading] = useState(false)
  const [batchResults, setBatchResults] = useState([])
  const [batchError, setBatchError]     = useState(null)
  const [dragOver, setDragOver]         = useState(false)
  const fileRef = useRef()

  const analyze = async () => {
    if (!text.trim() || loading) return
    setLoading(true); setError(null); setResult(null)
    try {
      const res  = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      onResult()
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const uploadBatch = async (file) => {
    if (!file) return
    setBatchLoading(true); setBatchError(null); setBatchResults([])
    const form = new FormData()
    form.append('file', file)
    try {
      const res  = await fetch(`${apiUrl}/api/batch`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBatchResults(data.results || [])
      onResult()
    } catch (e) { setBatchError(e.message) }
    finally { setBatchLoading(false) }
  }

  const sentColor = (label) =>
    label === 'Positive' ? 'var(--pos)' :
    label === 'Negative' ? 'var(--neg)' : 'var(--neu)'

  return (
    <>
      <div className="page-header">
        <div className="page-title">Sentiment Analysis</div>
        <div className="page-sub">Single text or batch CSV — powered by RoBERTa (BERT-based)</div>
      </div>

      <div className="analyze-layout">
        {/* ── Main ── */}
        <div className="analyze-main">

          {/* Single analysis */}
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:18}}>
            <div className="section-title" style={{marginBottom:10}}>Single text analysis</div>
            <textarea
              className="text-input"
              placeholder="Type or paste text to analyze sentiment…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) analyze() }}
            />
            <div style={{fontSize:11,color:'var(--text3)',margin:'6px 0 12px'}}>
              Ctrl+Enter to analyze · {text.length}/512 characters
            </div>
            <div className="btn-row">
              <button className="btn-primary" onClick={analyze} disabled={!text.trim() || loading}>
                {loading
                  ? <><svg className="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Analyzing…</>
                  : <>Analyze</>}
              </button>
              <button className="btn-outline" onClick={() => {
                setText(EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)])
                setResult(null)
              }}>Try example</button>
              {text && <button className="btn-outline" onClick={() => { setText(''); setResult(null) }}>Clear</button>}
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Result */}
          {result && (
            <div className="result-card">
              <div style={{fontSize:12,color:'var(--text2)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.04em'}}>Result</div>
              <div className="result-label" style={{color: sentColor(result.label)}}>
                {result.label === 'Positive' ? '↑ ' : result.label === 'Negative' ? '↓ ' : '→ '}
                {result.label}
              </div>
              <div style={{fontSize:13,color:'var(--text2)',marginBottom:10}}>
                Confidence: <span style={{color:'var(--text)',fontFamily:'var(--mono)',fontWeight:500}}>
                  {Math.round(result.score * 100)}%
                </span>
              </div>
              <div className="result-score-bar">
                <div className={`result-score-fill ${result.label}`}
                  style={{width: `${Math.round(result.score * 100)}%`}} />
              </div>
              <div className="result-meta">{result.latency_ms}ms · {result.text.length} chars</div>
            </div>
          )}

          {/* Batch CSV */}
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:18}}>
            <div className="section-title" style={{marginBottom:10}}>Batch CSV analysis</div>
            <div
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); uploadBatch(e.dataTransfer.files[0]) }}
              onClick={() => !batchLoading && fileRef.current?.click()}
              style={{padding:'24px 20px'}}
            >
              <div className="upload-title">Drop a CSV file here</div>
              <div className="upload-sub">One text per row · first column used · max 500 rows</div>
              <button className="btn-primary" disabled={batchLoading} style={{marginTop:10}}>
                {batchLoading ? 'Processing…' : 'Browse CSV'}
              </button>
              <input ref={fileRef} type="file" accept=".csv,.txt"
                style={{display:'none'}} onChange={e => uploadBatch(e.target.files[0])} />
            </div>
            {batchError && <div className="alert alert-error">{batchError}</div>}
          </div>

          {/* Batch results */}
          {batchResults.length > 0 && (
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'var(--radius)',overflow:'hidden'}}>
              <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',
                fontSize:12,color:'var(--text2)',display:'flex',justifyContent:'space-between'}}>
                <span style={{textTransform:'uppercase',letterSpacing:'.04em',fontWeight:500}}>
                  Batch results
                </span>
                <span>{batchResults.length} texts analysed</span>
              </div>
              <div style={{maxHeight:320,overflowY:'auto'}}>
                {batchResults.map((r, i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,
                    padding:'10px 16px',borderBottom:'1px solid var(--border)',fontSize:13}}>
                    <span style={{color:'var(--text3)',fontFamily:'var(--mono)',fontSize:11,
                      minWidth:24}}>{i+1}</span>
                    <span style={{flex:1,color:'var(--text2)',overflow:'hidden',
                      textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.text}</span>
                    <span className={`badge ${r.label}`}>{r.label}</span>
                    <span style={{fontSize:11,color:'var(--text3)',fontFamily:'var(--mono)',
                      minWidth:36,textAlign:'right'}}>{Math.round(r.score*100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Side panel ── */}
        <div className="analyze-side">
          <div style={{fontSize:12,fontWeight:500,color:'var(--text2)',
            textTransform:'uppercase',letterSpacing:'.04em',marginBottom:14}}>
            Quick examples
          </div>
          {EXAMPLES.map((ex, i) => (
            <div key={i}
              onClick={() => { setText(ex); setResult(null) }}
              style={{padding:'10px 12px',background:'var(--bg3)',borderRadius:'var(--radius-sm)',
                marginBottom:8,cursor:'pointer',fontSize:12,color:'var(--text2)',
                lineHeight:1.6,transition:'all .15s',border:'1px solid transparent'}}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent-border)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}>
              {ex}
            </div>
          ))}

          <div style={{marginTop:20,fontSize:12,fontWeight:500,color:'var(--text2)',
            textTransform:'uppercase',letterSpacing:'.04em',marginBottom:10}}>
            Model info
          </div>
          {[
            ['Model', 'RoBERTa-base'],
            ['Fine-tuned on', 'Twitter sentiment'],
            ['Classes', 'Positive · Negative · Neutral'],
            ['Max tokens', '512'],
            ['Accuracy', '91%+ on benchmark'],
          ].map(([k, v]) => (
            <div key={k} style={{display:'flex',justifyContent:'space-between',
              padding:'6px 0',borderBottom:'1px solid var(--border)',fontSize:12}}>
              <span style={{color:'var(--text3)'}}>{k}</span>
              <span style={{color:'var(--text2)',textAlign:'right',maxWidth:160}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
