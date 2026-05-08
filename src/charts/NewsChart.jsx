import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6c63ff', '#00d2ff', '#ff6b9d', '#f59e0b', '#22c55e', '#8b85ff', '#ff9a9e', '#67e8f9'];

export default function NewsDistributionChart({ news }) {
  if (!news || news.length === 0) {
    return (
      <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        No news data available
      </div>
    );
  }

  // Count articles by source
  const sourceCounts = news.reduce((acc, article) => {
    const src = article.source || 'Unknown';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          borderRadius: 10, padding: '10px 14px', fontSize: 12
        }}>
          <div style={{ color: 'var(--text-secondary)' }}>{payload[0].name}</div>
          <div style={{ fontWeight: 700, color: payload[0].payload.fill }}>{payload[0].value} articles</div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
