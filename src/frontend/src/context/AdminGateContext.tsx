import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminGateContextType {
  isUnlocked: boolean;
  isPromptOpen: boolean;
  openPrompt: () => void;
  closePrompt: () => void;
  unlock: () => void;
  lock: () => void;
}

const AdminGateContext = createContext<AdminGateContextType | undefined>(undefined);

export function AdminGateProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const openPrompt = () => setIsPromptOpen(true);
  const closePrompt = () => setIsPromptOpen(false);

  const unlock = () => {
    setIsUnlocked(true);
    closePrompt();
  };

  const lock = () => {
    setIsUnlocked(false);
  };

  return (
    <AdminGateContext.Provider
      value={{
        isUnlocked,
        isPromptOpen,
        openPrompt,
        closePrompt,
        unlock,
        lock,
      }}
    >
      {children}
    </AdminGateContext.Provider>
  );
}

export function useAdminGate() {
  const context = useContext(AdminGateContext);
  if (!context) {
    throw new Error('useAdminGate must be used within AdminGateProvider');
  }
  return context;
}
