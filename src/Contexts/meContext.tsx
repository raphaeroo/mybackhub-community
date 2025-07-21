"useClient";
import { useState, createContext, useContext } from "react";
import { UserResponse } from "~/types/user";

interface MeContextType {
  me: UserResponse | null;
  setMe: (user: UserResponse | null) => void;
}

const MeContext = createContext<MeContextType | undefined>(undefined);

export const MeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [me, setMe] = useState<UserResponse | null>(null);

  return (
    <MeContext.Provider value={{ me, setMe }}>{children}</MeContext.Provider>
  );
};

export const useMe = () => {
  const context = useContext(MeContext);
  if (!context) {
    throw new Error("useMe must be used within a MeProvider");
  }
  return context;
};

export const MeConsumer = MeContext.Consumer;
