import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import AnalyzePage from './components/AnalyzePage'
import HistoryTable from './components/HistoryTable'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function App() {
  const [tab, setTab]     = useState('analyze')
  const [stats, setStats] = useState({ total: 0, distribution: {}, avg_latency_ms: 0, trend: [] })
  const [history, setHistory] = useState([])

  const refresh = () => {
    fetch(`${API}/api/stats`).then(r => r.json()).then(setStats).catch(() => {})
    fetch(`${API}/api/history?limit=100`).then(r => r.json()).then(d => setHistory(d.history || [])).catch(() => {})
  }

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 8000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="app">
      <Sidebar tab={tab} setTab={setTab} total={stats.total} />
      <main className="main">
        {tab === 'dashboard' && <Dashboard stats={stats} history={history} />}
        {tab === 'analyze'   && <AnalyzePage apiUrl={API} onResult={refresh} />}
        {tab === 'history'   && <HistoryTable history={history} />}
      </main>
    </div>
  )
}
