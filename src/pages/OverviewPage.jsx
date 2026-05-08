import { motion } from 'framer-motion';
import { useISS } from '../context/ISSContext';
import { useNewsContext } from '../context/NewsContext';
import StatCard from '../components/StatCard';
import ISSMap from '../components/ISSMap';
import SpeedChart from '../charts/SpeedChart';
import NewsCard from '../components/NewsCard';

export default function OverviewPage() {
  const { position, trajectory, speedHistory, astronauts, loading, error, refreshISS } = useISS();
  const { news } = useNewsContext();

  const lat = position?.lat != null ? `${position.lat.toFixed(4)}°` : '—';
  const lon = position?.lon != null ? `${position.lon.toFixed(4)}°` : '—';
  const speed = position?.speed != null ? `${position.speed.toLocaleString()} km/h` : '~27,600 km/h';
  const altitude = position?.altitude != null ? `${position.altitude} km` : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div>
        <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", marginBottom: 4 }}>
          ISS & AI News Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Live ISS tracking, top news & AI-powered insights — all in one place
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard icon="🌐" label="Latitude"         value={loading ? 'Loading…' : lat}      color="#6c63ff" pulse={!!position} />
        <StatCard icon="🌐" label="Longitude"        value={loading ? 'Loading…' : lon}      color="#00d2ff" />
        <StatCard icon="🚀" label="Speed"            value={loading ? 'Loading…' : speed}    color="#ff6b9d" pulse={!!position} />
        <StatCard icon="🏔️" label="Altitude"         value={loading ? 'Loading…' : altitude} color="#f59e0b" />
        <StatCard icon="👨‍🚀" label="Astronauts (ISS)" value={loading ? '…' : astronauts.length} sub="Currently aboard" color="#22c55e" />
        <StatCard icon="📌" label="Points Tracked"  value={trajectory.length}               sub="Last 15 positions" color="#8b85ff" />
        <StatCard icon="📰" label="News Articles"   value={news.length}                     sub="Loaded & cached" color="#6c63ff" />
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: '14px 20px', color: '#ef4444',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>⚠️ {error}</span>
          <button onClick={refreshISS} className="btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}>Retry</button>
        </div>
      )}

      {/* Map + Speed Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="glass" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16 }}>🛸 Live ISS Map</h2>
            <button onClick={refreshISS} className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>🔄 Refresh</button>
          </div>
          <ISSMap position={position} trajectory={trajectory} />
          {position && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
              📍 {position.nearest} &nbsp;|&nbsp; 👁️ {position.visibility}
            </div>
          )}
        </div>

        <div className="glass" style={{ padding: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>📈 Speed History</h2>
          <SpeedChart speedHistory={speedHistory} />
          <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Current: <span style={{ color: '#6c63ff', fontWeight: 700 }}>{speed}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Region: <span style={{ color: '#00d2ff', fontWeight: 600 }}>{position?.nearest ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Astronauts */}
      {astronauts.length > 0 && (
        <div className="glass" style={{ padding: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>👨‍🚀 Astronauts Aboard ISS</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {astronauts.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,210,255,0.1))',
                  border: '1px solid rgba(108,99,255,0.25)',
                  borderRadius: 20, padding: '8px 16px', fontSize: 13, fontWeight: 500
                }}
              >
                👨‍🚀 {a.name}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Latest News Preview */}
      {news.length > 0 && (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>📰 Latest News</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {news.slice(0, 3).map((article, i) => (
              <NewsCard key={i} article={article} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Empty news state */}
      {!loading && news.length === 0 && (
        <div className="glass" style={{ padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <div>News loading... Add your <code>VITE_NEWS_API_KEY</code> in <code>.env</code></div>
        </div>
      )}
    </div>
  );
}
