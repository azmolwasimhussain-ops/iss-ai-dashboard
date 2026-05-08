import { createContext, useContext } from 'react';
import { useISSData } from '../hooks/useISSData';

const ISSContext = createContext();

export function ISSProvider({ children }) {
  const issData = useISSData();
  return <ISSContext.Provider value={issData}>{children}</ISSContext.Provider>;
}

export const useISS = () => useContext(ISSContext);
