import { motion } from 'framer-motion';

export default function StatCard({ icon, label, value, sub, color = '#6c63ff', pulse = false }) {
  return (
    <motion.div
      className={`glass card-hover ${pulse ? 'stat-pulse' : ''}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Background accent */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: `${color}20`, filter: 'blur(20px)'
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `linear-gradient(135deg, ${color}30, ${color}10)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, border: `1px solid ${color}30`
        }}>{icon}</div>
      </div>
    </motion.div>
  );
}
