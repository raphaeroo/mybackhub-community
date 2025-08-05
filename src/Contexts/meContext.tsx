"use client";
import {
  QueryObserverResult,
  RefetchOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { Loader } from "lucide-react";
import {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  createUserByExternalId,
  updateUser,
  CreateUser,
} from "~/core/api/mutations";
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
  const { status } = useSession();

  // Check localStorage for existing external ID
  const [externalId, setExternalId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("externalId") || "";
    }
    return "";
  });

  // First, fetch SSO user data only if authenticated
  const {
    data: ssoUserData,
    error: ssoUserError,
    isLoading: ssoUserLoading,
  } = useQuery<SSOUser>({
    queryKey: [SSOQueryKeys.UserData],
    queryFn: ssoFetchUserData,
    enabled: status === "authenticated",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Use SSO user ID or stored external ID for fetching user data
  const effectiveExternalId = ssoUserData?.id || externalId;

  if (typeof window !== "undefined" && effectiveExternalId) {
    localStorage.setItem("externalId", effectiveExternalId);
  }

  // Fetch user data only when we have an external ID
  const { data, error, isLoading, refetch } = useQuery<UserResponse>({
    queryKey: [QueryKeys.UserData, effectiveExternalId],
    queryFn: () => fetchUserData(effectiveExternalId),
    enabled: !!effectiveExternalId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { mutate, isPending: isCreatingUser } = useMutation({
    mutationFn: createUserByExternalId,
    onSuccess: () => {
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

  const { mutate: updateUserMutate } = useMutation({
    mutationFn: ({
      userId,
      userData,
    }: {
      userId: string;
      userData: Partial<CreateUser>;
    }) => updateUser(userId, userData),
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Failed to sync user data:", error);
      // Silently fail user sync, don't show error to user unless critical
    },
  });

  // Function to check if SSO data differs from backend data
  const shouldUpdateUser = useCallback(
    (ssoData: SSOUser, backendData: UserResponse): boolean => {
      return (
        ssoData.firstName !== backendData.firstName ||
        ssoData.lastName !== backendData.lastName ||
        ssoData.email !== backendData.email
      );
    },
    []
  );

  useEffect(() => {
    if (data && ssoUserData) {
      // User exists, check if SSO data differs from backend data
      if (shouldUpdateUser(ssoUserData, data)) {
        // SSO data is newer, update backend
        updateUserMutate({
          userId: data.id,
          userData: {
            firstName: ssoUserData.firstName,
            lastName: ssoUserData.lastName,
            email: ssoUserData.email,
          },
        });
      }

      setExternalId(data.id);
      setMe(data);
    } else if (
      error &&
      !isLoading &&
      ssoUserData &&
      effectiveExternalId === ssoUserData.id
    ) {
      // User doesn't exist but we have SSO data, create the user
      mutate({
        externalId: ssoUserData.id,
        username: `${ssoUserData.firstName}_${ssoUserData.id}`,
        email: ssoUserData.email,
        firstName: ssoUserData.firstName,
        lastName: ssoUserData.lastName,
      });
    } else if (data && !ssoUserData) {
      setExternalId(data.id);
      setMe(data);
    }
  }, [
    data,
    isLoading,
    error,
    ssoUserData,
    effectiveExternalId,
    mutate,
    updateUserMutate,
    shouldUpdateUser,
  ]);

  // Don't show loading/error states if user is not authenticated
  if (status === "unauthenticated" || status === "loading") {
    return (
      <MeContext.Provider value={{ me: null, setMe, refetch }}>
        {children}
      </MeContext.Provider>
    );
  }

  if (isLoading || ssoUserLoading || isCreatingUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  // Only show error if SSO fails or if backend fails AND we're not in the middle of creating a user
  const shouldShowError =
    ssoUserError ||
    (error && !ssoUserData && !ssoUserLoading && !isCreatingUser);

  if (shouldShowError) {
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
