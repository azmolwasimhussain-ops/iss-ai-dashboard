export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass" style={{ padding: 20 }}>
          <div className="skeleton" style={{ height: 180, marginBottom: 16, borderRadius: 12 }} />
          <div className="skeleton" style={{ height: 18, marginBottom: 8, width: '80%' }} />
          <div className="skeleton" style={{ height: 14, marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 14, width: '60%' }} />
        </div>
      ))}
    </div>
  );
}
