"use client";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function UserInfo() {
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return null; // Don't render user info if not authenticated
  }

  return (
    <div className="flex items-start space-x-2">
      <Avatar className="w-10 h-10">
        <AvatarFallback className="font-semibold">
          {session.user?.name && session.user.name[0]}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-normal">{session.user?.name || "Example User"}</p>
        <p className="text-muted-foreground text-xs">{session.user?.email || "example@mybackhub.com"}</p>
      </div>
    </div>
  );
}
