import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNewsContext } from '../context/NewsContext';
import NewsCard from '../components/NewsCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { debounce } from '../utils/helpers';

export default function NewsPage() {
  const { news, loading, error, setSearchQuery, refreshNews } = useNewsContext();
  const [sortBy, setSortBy] = useState('date');
  const [localSearch, setLocalSearch] = useState('');

  // Stable debounced setter — won't recreate on re-render
  const debouncedSearch = useRef(debounce((val) => setSearchQuery(val), 500)).current;

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const sortedNews = [...news].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'source') return (a.source || '').localeCompare(b.source || '');
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>
            📰 <span className="gradient-text-pink">News Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Latest tech &amp; space news — cached for 15 minutes
          </p>
        </div>
        <button onClick={refreshNews} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          🔄 Refresh
        </button>
      </div>

      {/* Search + Sort Controls */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input-glass"
          placeholder="🔍 Search articles..."
          value={localSearch}
          onChange={handleSearchChange}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 10, padding: '10px 16px', color: 'var(--text-primary)',
            fontFamily: 'Inter, sans-serif', outline: 'none', cursor: 'pointer',
            backdropFilter: 'blur(10px)', width: 160, fontSize: 14
          }}
        >
          <option value="date">Sort by Date</option>
          <option value="source">Sort by Source</option>
        </select>
        {!loading && (
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {sortedNews.length} articles
          </div>
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
          <button onClick={refreshNews} className="btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}>Retry</button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && <LoadingSkeleton count={6} />}

      {/* News Grid */}
      {!loading && sortedNews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          <AnimatePresence>
            {sortedNews.map((article, i) => (
              <NewsCard key={article.url || i} article={article} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedNews.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>No articles found</div>
          <div style={{ fontSize: 14 }}>Try a different search term or refresh</div>
          <button onClick={refreshNews} className="btn-primary" style={{ marginTop: 16 }}>Refresh News</button>
        </div>
      )}
    </div>
  );
}
