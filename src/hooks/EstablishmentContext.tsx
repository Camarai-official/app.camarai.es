'use client';

import * as React from 'react';

interface EstablishmentContextType {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

const EstablishmentContext = React.createContext<EstablishmentContextType | undefined>(undefined);

const ACTIVE_ESTABLISHMENT_KEY = 'activeEstablishmentId';

export function EstablishmentProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveIdState] = React.useState<string | null>(null);

  // Initialize from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(ACTIVE_ESTABLISHMENT_KEY);
      if (saved) {
        try {
          setActiveIdState(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing saved establishment ID", e);
        }
      }
    }
  }, []);

  const setActiveId = React.useCallback((id: string | null) => {
    setActiveIdState(id);
    if (typeof window !== 'undefined' && id) {
      localStorage.setItem(ACTIVE_ESTABLISHMENT_KEY, JSON.stringify(id));
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_ESTABLISHMENT_KEY);
    }
  }, []);

  return (
    <EstablishmentContext.Provider value={{ activeId, setActiveId }}>
      {children}
    </EstablishmentContext.Provider>
  );
}

export function useEstablishmentContext() {
  const context = React.useContext(EstablishmentContext);
  if (context === undefined) {
    throw new Error('useEstablishmentContext must be used within an EstablishmentProvider');
  }
  return context;
}
