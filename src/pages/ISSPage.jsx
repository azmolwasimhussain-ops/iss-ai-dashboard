import { motion } from 'framer-motion';
import { useISS } from '../context/ISSContext';
import StatCard from '../components/StatCard';
import ISSMap from '../components/ISSMap';
import { formatTimestamp } from '../utils/helpers';

export default function ISSPage() {
  const { position, trajectory, astronauts, loading, error, refreshISS } = useISS();

  const lat   = position?.lat  != null ? `${position.lat.toFixed(4)}°`  : '—';
  const lon   = position?.lon  != null ? `${position.lon.toFixed(4)}°`  : '—';
  const speed = position?.speed != null ? `${position.speed.toLocaleString()} km/h` : '—';
  const alt   = position?.altitude ? `${position.altitude} km` : '—';
  const vis   = position?.visibility ?? '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
            🛰️ <span className="gradient-text">ISS Live Tracker</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Real-time ISS position via wheretheiss.at — auto-updates every 15 seconds
          </p>
        </div>
        <button onClick={refreshISS} className="btn-primary">
          🔄 Manual Refresh
        </button>
      </div>

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: error ? '#ef4444' : '#22c55e',
          boxShadow: `0 0 10px ${error ? '#ef4444' : '#22c55e'}`
        }} />
        <span style={{ fontSize: 13, color: error ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
          {error ? 'CONNECTION ERROR' : 'LIVE — Tracking Active'}
        </span>
        {position && (
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Last update: {formatTimestamp(position.timestamp)}
          </span>
        )}
      </div>

      {/* Error */}
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

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
        <StatCard icon="🌐" label="Latitude"         value={loading ? 'Loading…' : lat}   color="#6c63ff" pulse={!!position} />
        <StatCard icon="🌐" label="Longitude"        value={loading ? 'Loading…' : lon}   color="#00d2ff" />
        <StatCard icon="🚀" label="Speed"            value={loading ? 'Loading…' : speed} color="#ff6b9d" pulse={!!position} />
        <StatCard icon="🏔️" label="Altitude"         value={loading ? 'Loading…' : alt}   color="#f59e0b" />
        <StatCard icon="☀️" label="Visibility"       value={loading ? '…' : vis}          color="#22c55e" />
        <StatCard icon="📌" label="Points Tracked"   value={trajectory.length}            sub="Max 15 stored" color="#8b85ff" />
        <StatCard icon="👨‍🚀" label="Crew (ISS)"       value={astronauts.length}            sub="Aboard right now" color="#6c63ff" />
      </div>

      {/* Full Map */}
      <div className="glass" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontWeight: 700, fontSize: 17 }}>🗺️ Live ISS Map with Trajectory</h2>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            <span style={{ color: '#6c63ff' }}>— — —</span> Trajectory path
          </div>
        </div>
        <ISSMap position={position} trajectory={trajectory} />
        {position && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <span>📍 {position.nearest}</span>
            <span>👁️ {position.visibility}</span>
            <span>🏔️ {position.altitude} km altitude</span>
          </div>
        )}
      </div>

      {/* Trajectory Table + Astronauts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Trajectory */}
        <div className="glass" style={{ padding: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>📜 Position History</h2>
          {trajectory.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 30 }}>
              {loading ? '⏳ Fetching first position…' : 'Collecting data…'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
              {[...trajectory].reverse().map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: i === 0 ? 'rgba(108,99,255,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${i === 0 ? 'rgba(108,99,255,0.3)' : 'var(--border-color)'}`,
                    borderRadius: 8, padding: '8px 12px', fontSize: 12
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {i === 0 && <span style={{ color: '#22c55e', marginRight: 6 }}>●</span>}
                    {formatTimestamp(p.timestamp)}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {p.lat.toFixed(3)}°, {p.lon.toFixed(3)}°
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Astronauts */}
        <div className="glass" style={{ padding: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>👨‍🚀 ISS Crew</h2>
          {astronauts.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 30 }}>
              {loading ? '⏳ Loading crew data…' : 'No crew data'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {astronauts.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'rgba(255,255,255,0.04)', borderRadius: 10,
                    padding: '12px 14px', border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, hsl(${i * 45}, 80%, 60%), hsl(${i * 45 + 60}, 80%, 50%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                  }}>👨‍🚀</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>🛸 {a.craft}</div>
                  </div>
                  <div style={{
                    fontSize: 11, background: 'rgba(34,197,94,0.1)', color: '#22c55e',
                    borderRadius: 6, padding: '3px 10px', border: '1px solid rgba(34,197,94,0.2)'
                  }}>In Space</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
