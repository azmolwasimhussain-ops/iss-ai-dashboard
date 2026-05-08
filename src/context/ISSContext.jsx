import { createContext, useContext } from 'react';
import { useISSData } from '../hooks/useISSData';

const ISSContext = createContext();

export function ISSProvider({ children }) {
  const issData = useISSData();
  return <ISSContext.Provider value={issData}>{children}</ISSContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useISS() {
  return useContext(ISSContext);
}

