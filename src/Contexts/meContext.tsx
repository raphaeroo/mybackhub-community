"use client";
import { DialogContent, DialogDescription } from "@radix-ui/react-dialog";
import {
  QueryObserverResult,
  RefetchOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useState, createContext, useContext, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createUserByExternalId } from "~/core/api/mutations";
import { fetchUserData, QueryKeys } from "~/core/api/queries";
import { UserResponse } from "~/types/user";

// const MOCK_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

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
  const [userId, setUserId] = useState(
    typeof window !== "undefined" ? localStorage.getItem("externalId") || "" : ""
  ); // temporary,
  const [userKnowsID, setUserKnowsID] = useState<boolean>(false);
  // This is temporary, once the production is ready you will be able to register using the
  const [requestUser, setRequestUser] = useState<boolean>(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const { data, error, isLoading, refetch } = useQuery<UserResponse>({
    queryKey: [QueryKeys.UserData],
    queryFn: () => fetchUserData(userId), // Replace with actual externalId
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { mutate } = useMutation({
    mutationFn: createUserByExternalId,
    onSuccess: (user) => {
      setMe(user);
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
      if (typeof window !== "undefined") {
        localStorage.setItem("externalId", data.externalId);
      }
      setMe(data);
    } else if (error && !isLoading) {
      // mutate({
      //   externalId: MOCK_USER_ID,
      //   username: "Guest",
      //   email: "guest@example.com",
      //   firstName: "Guest",
      //   lastName: "User",
      // });

      setRequestUser(true); // TEMPORARY: Create workaround for QA validation
    }
  }, [data, isLoading, error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (error && !requestUser) {
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

  if (requestUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Dialog open={requestUser}>
          <DialogHeader>
            <DialogTitle>Request User</DialogTitle>
            <DialogDescription>
              <p className="text-sm muted">
                This is temporary, once the production is ready you will be able
                to register using the SSO
              </p>
            </DialogDescription>
            {error && !userKnowsID ? (
              <DialogContent className="space-y-4">
                <Label className="mt-6">First Name:</Label>
                <Input
                  value={firstName}
                  onChange={(e) => {
                    e.preventDefault();
                    setFirstName(e.target.value);
                  }}
                />
                <Label>Last Name:</Label>
                <Input
                  value={lastName}
                  onChange={(e) => {
                    e.preventDefault();
                    setLastName(e.target.value);
                  }}
                />
                <Label>Email Address:</Label>
                <Input
                  value={email}
                  onChange={(e) => {
                    e.preventDefault();
                    setEmail(e.target.value);
                  }}
                />
                <Button
                  className="mr-6"
                  onClick={(e) => {
                    e.preventDefault();
                    if (firstName && lastName && email) {
                      mutate({
                        externalId: Math.random().toString(36).substring(2, 15),
                        username: `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${email}`,
                        email,
                        firstName,
                        lastName,
                      });
                      setRequestUser(false);
                    } else {
                      toast.error("Please fill in all fields.");
                    }
                  }}
                >
                  Submit
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setUserKnowsID(true);
                  }}
                >
                  I have an ID
                </Button>
              </DialogContent>
            ) : (
              <DialogContent className="space-y-4">
                <Label className="mt-6">User ID:</Label>
                <Input
                  value={userId}
                  onChange={(e) => {
                    e.preventDefault();
                    setUserId(e.target.value);
                  }}
                />
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    if (userId) {
                      refetch();
                      setRequestUser(false);
                    } else {
                      toast.error("Please enter a valid User ID.");
                    }
                  }}
                >
                  Fetch User
                </Button>
              </DialogContent>
            )}
          </DialogHeader>
        </Dialog>
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
