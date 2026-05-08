import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNews } from '../services/api';
import toast from 'react-hot-toast';

const CACHE_KEY    = 'iss_news_cache';
const CACHE_EXPIRY = 15 * 60 * 1000;

export function useNews() {
  const [news,        setNews]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const initDone = useRef(false);
  const prevQuery = useRef('');

  const normalise = (item) => ({
    title:       item.title       || 'No title',
    source:      item.source_id   || 'Unknown',
    author:      Array.isArray(item.creator) ? item.creator.join(', ') : (item.creator || 'Staff'),
    image:       item.image_url   || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
    date:        item.pubDate     || new Date().toISOString(),
    description: item.description || item.content || 'No description available.',
    url:         item.link        || '#',
  });

  const loadNews = useCallback(async (query = '', forceRefresh = false) => {
    setLoading(true);
    setError(null);

    // Serve from cache if valid and no search query
    if (!query && !forceRefresh) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
        if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
          setNews(cached.data);
          setLoading(false);
          return;
        }
      } catch { /* ignore */ }
    }

    try {
      const data = await fetchNews(query);

      if (data?.status === 'success' && Array.isArray(data.results)) {
        const articles = data.results.slice(0, 10).map(normalise);
        setNews(articles);
        if (!query) {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: articles }));
        }
        if (forceRefresh) toast.success('News refreshed!');
      } else {
        setError('No articles returned.');
      }
    } catch (err) {
      console.error('News hook error:', err.message);
      setError('News unavailable. Showing cached or sample data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    loadNews('');
  }, [loadNews]);

  // Search change
  useEffect(() => {
    if (searchQuery === prevQuery.current) return;
    prevQuery.current = searchQuery;
    if (initDone.current) loadNews(searchQuery);
  }, [searchQuery, loadNews]);

  return {
    news,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refreshNews: () => loadNews(searchQuery, true),
  };
}
