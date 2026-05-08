import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function SpeedChart({ speedHistory }) {
  if (!speedHistory || speedHistory.length === 0) {
    return (
      <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        Collecting speed data...
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          borderRadius: 10, padding: '10px 14px', fontSize: 12
        }}>
          <div style={{ color: 'var(--text-secondary)' }}>{label}</div>
          <div style={{ color: '#6c63ff', fontWeight: 700 }}>{payload[0].value?.toLocaleString()} km/h</div>
        </div>
      );
    }
    return null;
  };

  const avg = Math.round(speedHistory.reduce((s, d) => s + d.speed, 0) / speedHistory.length);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={speedHistory} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="speedGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6c63ff" />
            <stop offset="100%" stopColor="#00d2ff" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="time"
          tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={avg} stroke="rgba(255,107,157,0.4)" strokeDasharray="4 4" label={{ value: 'Avg', fill: '#ff6b9d', fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="speed"
          stroke="url(#speedGrad)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: '#6c63ff', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
