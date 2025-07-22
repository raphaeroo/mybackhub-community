"useClient";
import {
  QueryObserverResult,
  RefetchOptions,
  useQuery,
} from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useState, createContext, useContext, useEffect } from "react";
import { fetchUserData, QueryKeys } from "~/core/api/queries";
import { UserResponse } from "~/types/user";

const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

interface MeContextType {
  me: UserResponse | null;
  setMe: (user: UserResponse | null) => void;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<UserResponse, Error>>;
}

const MeContext = createContext<MeContextType | undefined>(undefined);

export const MeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [me, setMe] = useState<UserResponse | null>(null);
  const { data, error, isLoading, refetch } = useQuery<UserResponse>({
    queryKey: [QueryKeys.UserData],
    queryFn: () => fetchUserData(MOCK_USER_ID), // Replace with actual externalId
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (data) {
      setMe(data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">
          Error loading application, please try again later.{" "}
        </p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  return (
    <MeContext.Provider value={{ me, setMe, refetch }}>
      {children}
    </MeContext.Provider>
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
