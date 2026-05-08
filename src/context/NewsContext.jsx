import { createContext, useContext } from 'react';
import { useNews } from '../hooks/useNews';

const NewsContext = createContext();

export function NewsProvider({ children }) {
  const newsData = useNews();
  return <NewsContext.Provider value={newsData}>{children}</NewsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNewsContext() {
  return useContext(NewsContext);
}
