import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseStore } from '@/hooks/useSupabaseStore';

type AppStoreReturn = ReturnType<typeof useSupabaseStore>;

const AppContext = createContext<AppStoreReturn | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const store = useSupabaseStore();
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
