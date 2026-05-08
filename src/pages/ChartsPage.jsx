import { useISS } from '../context/ISSContext';
import { useNewsContext } from '../context/NewsContext';
import SpeedChart from '../charts/SpeedChart';
import NewsDistributionChart from '../charts/NewsChart';
import ISSMap from '../components/ISSMap';

export default function ChartsPage() {
  const { position, trajectory, speedHistory, refreshISS } = useISS();
  const { news, refreshNews } = useNewsContext();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
          📊 <span className="gradient-text">Charts & Visualizations</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
          Interactive live data charts for ISS tracking and news analysis
        </p>
      </div>

      {/* Speed Chart */}
      <div className="glass" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>🚀 ISS Speed Over Time</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Last 30 tracked speed readings (km/h)</p>
          </div>
          <button onClick={refreshISS} className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>🔄 Refresh</button>
        </div>
        <SpeedChart speedHistory={speedHistory} />

        {/* Speed legend */}
        <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Current: <span style={{ color: '#6c63ff', fontWeight: 700 }}>{position?.speed?.toLocaleString() ?? '—'} km/h</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Data points: <span style={{ color: '#00d2ff', fontWeight: 700 }}>{speedHistory.length}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Region: <span style={{ color: '#ff6b9d', fontWeight: 700 }}>{position?.nearest ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* News Distribution + ISS Map side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* News Doughnut */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>📰 News by Source</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Distribution of articles by news source</p>
            </div>
            <button onClick={refreshNews} className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>🔄</button>
          </div>
          <NewsDistributionChart news={news} />
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
            {news.length} articles from {new Set(news.map(n => n.source)).size} sources
          </div>
        </div>

        {/* ISS Live Map */}
        <div className="glass" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>🛸 ISS Live Map</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Real-time position with trajectory path</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>LIVE</span>
            </div>
          </div>
          <ISSMap position={position} trajectory={trajectory} />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="glass" style={{ padding: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>📋 Data Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { label: 'Speed Readings', value: speedHistory.length, color: '#6c63ff', icon: '🚀' },
            { label: 'Trajectory Points', value: trajectory.length, color: '#00d2ff', icon: '📍' },
            { label: 'News Articles', value: news.length, color: '#ff6b9d', icon: '📰' },
            { label: 'News Sources', value: new Set(news.map(n => n.source)).size, color: '#f59e0b', icon: '🏢' },
          ].map((item, i) => (
            <div key={i} style={{
              background: `${item.color}15`, border: `1px solid ${item.color}30`,
              borderRadius: 12, padding: '16px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: item.color, fontFamily: "'Space Grotesk', sans-serif" }}>{item.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
