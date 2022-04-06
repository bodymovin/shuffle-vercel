import {
  createContext, ReactNode, useContext,
} from 'react';
import { Speeds } from '~/interfaces/speeds';

type SpeedContextType = Speeds;

const SpeedContext = createContext<SpeedContextType>(Speeds.MEDIUM);

function SpeedProvider({ children, speed }: { children: ReactNode, speed: Speeds }) {
  return (
    <SpeedContext.Provider value={speed}>
      {children}
    </SpeedContext.Provider>
  );
}

function useSpeed() {
  const context = useContext(SpeedContext);
  if (context === undefined) {
    throw new Error('useSpeed must be used within a SpeedProvider');
  }
  return context;
}

export { SpeedProvider, useSpeed };
