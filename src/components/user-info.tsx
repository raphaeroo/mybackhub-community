"use client";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function UserInfo() {
  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return null; // Don't render user info if not authenticated
  }

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="w-12 h-12">
        <AvatarFallback className="font-semibold">
          {session.user?.name && session.user.name[0]}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold">{session.user?.name}</p>
        <p className="text-muted-foreground text-xs">{session.user?.email}</p>
      </div>
    </div>
  );
}
