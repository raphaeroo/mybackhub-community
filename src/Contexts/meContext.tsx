"use client";
import {
  QueryObserverResult,
  RefetchOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useState, createContext, useContext, useEffect } from "react";
import { toast } from "sonner";
import { createUserByExternalId } from "~/core/api/mutations";
import { fetchUserData, QueryKeys } from "~/core/api/queries";
import { ssoFetchUserData, SSOQueryKeys, SSOUser } from "~/core/sso/queries";
import { UserResponse } from "~/types/user";

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
  
  // Check localStorage for existing external ID
  const [externalId, setExternalId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("externalId") || "";
    }
    return "";
  });

  // First, fetch SSO user data
  const { data: ssoUserData, error: ssoUserError, isLoading: ssoUserLoading } = useQuery<SSOUser>({
    queryKey: [SSOQueryKeys.UserData],
    queryFn: ssoFetchUserData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Use SSO user ID or stored external ID for fetching user data
  const effectiveExternalId = ssoUserData?.id || externalId;

  // Fetch user data only when we have an external ID
  const { data, error, isLoading, refetch } = useQuery<UserResponse>({
    queryKey: [QueryKeys.UserData, effectiveExternalId],
    queryFn: () => fetchUserData(effectiveExternalId),
    enabled: !!effectiveExternalId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { mutate } = useMutation({
    mutationFn: createUserByExternalId,
    onSuccess: (user) => {
      // Save external ID to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("externalId", user.externalId);
      }
      setExternalId(user.externalId);
      refetch();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong, try again later."
      );
    },
  });

  useEffect(() => {
    if (data) {
      // User exists, update local state and storage
      if (typeof window !== "undefined" && data.externalId) {
        localStorage.setItem("externalId", data.externalId);
      }
      setMe(data);
    } else if (error && !isLoading && ssoUserData && effectiveExternalId === ssoUserData.id) {
      // User doesn't exist but we have SSO data, create the user
      mutate({
        externalId: ssoUserData.id,
        username: `${ssoUserData.firstName}_${ssoUserData.id}`,
        email: ssoUserData.email,
        firstName: ssoUserData.firstName,
        lastName: ssoUserData.lastName,
      });
    }
  }, [data, isLoading, error, ssoUserData, effectiveExternalId, mutate]);

  if (isLoading || ssoUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error || ssoUserError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">
          Error loading application, please try again later.{" "}
        </p>
        <p className="text-sm text-muted-foreground">
          {(error || ssoUserError) instanceof Error
            ? (error || ssoUserError)?.message
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
