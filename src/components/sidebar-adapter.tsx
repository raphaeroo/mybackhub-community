"use client";

import { AppSidebar } from "@mybackhub/shared-sidebar/components/AppSidebar";
import {
  BookUser,
  Home,
  Bookmark,
  Edit,
  LayoutGrid,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useActive } from "~/Contexts/activeContext";
import { useMe } from "~/Contexts/meContext";

export function SidebarAdapter() {
  const { status } = useSession();
  const { me, isLoading, subscriptionType, profilePictureUrl } = useMe();
  const { activeName, setActiveName } = useActive();

  const isLightTicket = subscriptionType === 1;
  const isFree = !subscriptionType || subscriptionType <= 0;

  const handleLogout = async () => {
    // Remove accessToken from localStorage first
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }

    // Sign out from NextAuth (clears local session)
    await signOut({ redirect: false });

    // Redirect to SSO logout page which will clear SSO session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const isDev =
      baseUrl.includes("staging") || process.env.NODE_ENV === "development";

    const ssoLogoutUrl = isDev
      ? `https://staging-sso.mybackhub.com/auth/logout?return_to=${encodeURIComponent(
          baseUrl
        )}`
      : `https://sso.mybackhub.com/auth/logout?return_to=${encodeURIComponent(
          baseUrl
        )}`;

    window.location.href = ssoLogoutUrl;
  };

  // Check if sidebar should render
  const shouldRender =
    status === "authenticated" && !isLoading && !isLightTicket && !isFree;

  return (
    <AppSidebar
      logo={{
        full: "/mbh-logo.png",
        icon: "/mbh-logo-icon.png",
        alt: "MyBackHub",
        width: 179,
        height: 32,
      }}
      navigation={{
        mainGroup: {
          label: "Community",
          items: [
            {
              title: "Categories",
              url: "/",
              icon: Home,
              isActive: activeName === "Categories",
              onClick: () => setActiveName("Categories"),
            },
            {
              title: "Saved Topics",
              url: "/saved-topics",
              icon: Bookmark,
              isActive: activeName === "Saved Topics",
              onClick: () => setActiveName("Saved Topics"),
            },
            {
              title: "My Topics",
              url: "/my-topics",
              icon: Edit,
              isActive: activeName === "My Topics",
              onClick: () => setActiveName("My Topics"),
            },
          ],
        },
        additionalGroups: [
          {
            label: "More Apps",
            items: [
              {
                title: "Dashboard",
                url: "https://platform.mybackhub.com/",
                icon: LayoutGrid,
              },
              {
                title: "Account",
                url: "https://account.mybackhub.com/",
                icon: BookUser,
              },
            ],
          },
        ],
      }}
      user={
        me
          ? {
              firstName: me.firstName,
              lastName: me.lastName,
              email: me.email,
              avatar: profilePictureUrl || undefined,
            }
          : undefined
      }
      onLogout={handleLogout}
      shouldRender={shouldRender}
      variant="inset"
    />
  );
}
