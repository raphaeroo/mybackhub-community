"use client";
// import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function UserInfo() {
  // const { data: session, status } = useSession();

  // if (status !== "authenticated") {
  //   return null; // Don't render user info if not authenticated
  // }

  return (
    <div className="flex items-start space-x-2">
      <Avatar className="w-10 h-10">
        <AvatarFallback className="font-semibold">
          {/* {session.user?.name && session.user.name[0]} */}
          R
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-normal">Raphael Freitas</p>
        <p className="text-muted-foreground text-xs">raphael@example.com</p>
      </div>
    </div>
  );
}
