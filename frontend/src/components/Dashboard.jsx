import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts'

const COLORS = { Positive: '#22c55e', Negative: '#f87171', Neutral: '#60a5fa' }
const TIP = { background:'#1e2438', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, fontSize:12 }

export default function Dashboard({ stats, history }) {
  const dist = stats.distribution || {}
  const pieData = Object.entries(dist).map(([name, value]) => ({ name, value }))

  const recentLatency = history.slice(0, 20).reverse().map((h, i) => ({
    i: i + 1, ms: h.latency_ms
  }))

  const total = stats.total || 0
  const pos   = dist.Positive || 0
  const neg   = dist.Negative || 0
  const neu   = dist.Neutral  || 0

  return (
    <>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">Real-time sentiment analytics — auto-refreshes every 8 seconds</div>
      </div>

      <div className="stats-row">
        {[
          ['Total analyses', total, 'All time'],
          ['Positive', pos, `${total ? Math.round(pos/total*100) : 0}% of total`],
          ['Negative', neg, `${total ? Math.round(neg/total*100) : 0}% of total`],
          ['Avg latency', `${stats.avg_latency_ms}`, 'ms per prediction'],
        ].map(([label, val, sub]) => (
          <div className="stat-card" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-val" style={{
              color: label==='Positive' ? 'var(--pos)' :
                     label==='Negative' ? 'var(--neg)' : 'var(--text)'
            }}>{val}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      <div className="dashboard">
        <div className="chart-grid">

          {/* Pie chart */}
          <div className="chart-section">
            <div className="section-title">Sentiment distribution</div>
            {pieData.length === 0
              ? <div style={{color:'var(--text3)',fontSize:13,padding:'20px 0',textAlign:'center'}}>No data yet</div>
              : <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50}
                        outerRadius={80} dataKey="value" paddingAngle={3}>
                        {pieData.map((d) => (
                          <Cell key={d.name} fill={COLORS[d.name] || '#8b90a4'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TIP} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div>
                    {pieData.map(d => (
                      <div className="legend-row" key={d.name}>
                        <div className="legend-dot" style={{background: COLORS[d.name]}} />
                        <span className="legend-label">{d.name}</span>
                        <span className="legend-val">{d.value}</span>
                        <span style={{fontSize:11,color:'var(--text3)',marginLeft:8}}>
                          {total ? Math.round(d.value/total*100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
            }
          </div>

          {/* Latency line */}
          <div className="chart-section">
            <div className="section-title">Inference latency (last 20)</div>
            {recentLatency.length === 0
              ? <div style={{color:'var(--text3)',fontSize:13,padding:'20px 0',textAlign:'center'}}>No data yet</div>
              : <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={recentLatency}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="i" tick={{fill:'#4a566a',fontSize:11}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill:'#4a566a',fontSize:11}} axisLine={false} tickLine={false} unit="ms" />
                    <Tooltip contentStyle={TIP} labelStyle={{color:'#7e8da4'}} itemStyle={{color:'#e2e8f0'}} />
                    <Line type="monotone" dataKey="ms" stroke="#2dd4bf" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
            }
          </div>
        </div>

        {/* 7-day trend */}
        <div className="chart-section" style={{marginTop:16}}>
          <div className="section-title">7-day sentiment trend</div>
          {(stats.trend || []).length === 0
            ? <div style={{color:'var(--text3)',fontSize:13,padding:'20px 0',textAlign:'center'}}>No trend data yet — run some analyses first</div>
            : <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.trend} barSize={16}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{fill:'#4a566a',fontSize:11}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill:'#4a566a',fontSize:11}} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={TIP} />
                  <Legend wrapperStyle={{fontSize:12,color:'#7e8da4'}} />
                  <Bar dataKey="Positive" stackId="a" fill="#22c55e" radius={[0,0,0,0]} />
                  <Bar dataKey="Neutral"  stackId="a" fill="#60a5fa" />
                  <Bar dataKey="Negative" stackId="a" fill="#f87171" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
          }
        </div>
      </div>
    </>
  )
}
