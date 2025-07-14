"use client";
import { createContext, useContext, ReactNode, useState } from "react";

interface ActiveContextType {
  activeName: string;
  setActiveName: (name: string) => void;
}

interface ActiveProviderProps {
  children: ReactNode;
}

const ActiveContext = createContext<ActiveContextType | undefined>(undefined);

export function ActiveProvider({ children }: ActiveProviderProps) {
  const [activeName, setActiveName] = useState<string>("Categories");

  const value = {
    activeName,
    setActiveName,
  };

  return (
    <ActiveContext.Provider value={value}>{children}</ActiveContext.Provider>
  );
}

export function useActive(): ActiveContextType {
  const context = useContext(ActiveContext);

  if (context === undefined) {
    throw new Error("useActive must be used within an ActiveProvider");
  }

  return context;
}
