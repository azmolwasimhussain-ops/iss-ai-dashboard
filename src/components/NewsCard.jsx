import { motion } from 'framer-motion';
import { formatDate, truncateText } from '../utils/helpers';

export default function NewsCard({ article, index }) {
  return (
    <motion.div
      className="glass card-hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* Image */}
      <div style={{ position: 'relative', overflow: 'hidden', height: 180 }}>
        <img
          src={article.image}
          alt={article.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop'; }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7))'
        }} />
        {article.source && (
          <div style={{
            position: 'absolute', bottom: 10, left: 12,
            background: 'rgba(108,99,255,0.9)', color: 'white',
            borderRadius: 6, padding: '2px 10px', fontSize: 11, fontWeight: 600
          }}>{article.source}</div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {truncateText(article.title, 90)}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
          {truncateText(article.description, 120)}
        </p>

        {/* Meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            ✍️ {truncateText(article.author, 30)} • {formatDate(article.date)}
          </div>
        </div>

        {/* Read More */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ display: 'block', textAlign: 'center', textDecoration: 'none', fontSize: 13, padding: '8px 16px', marginTop: 4 }}
        >
          Read More →
        </a>
      </div>
    </motion.div>
  );
}
