"use client";
import { Home, BookUser, LogOut, Edit, Bookmark } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Separator } from "./ui/separator";
import { UserInfo } from "~/components/user-info";

// Menu items.
const items = [
  {
    title: "Categories",
    url: "/",
    icon: Home,
  },
  {
    title: "My Topics",
    url: "/my-topics",
    icon: Edit,
  },
  {
    title: "Saved Topics",
    url: "/saved-topics",
    icon: Bookmark,
  },
];

const moreApps = [
  {
    title: "Account",
    url: "https://account.mybackhub.com/",
    icon: BookUser,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  // const { status } = useSession();
  const { open } = useSidebar();

  // if (status !== "authenticated") {
  //   return null; // Don't render sidebar if not authenticated
  // }

  return (
    <Sidebar
      variant="inset"
      className="border-r m-0 bg-white"
    >
      <SidebarHeader className="items-center justify-center py-4 bg-white">
        <div className="flex justify-center items-center">
          {open ? (
            <Image src="/mbh-logo.png" alt="Logo" width={179} height={32} />
          ) : (
            <Image src="/mbh-logo-icon.png" alt="Logo" width={24} height={24} />
          )}
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel>Community</SidebarGroupLabel>
          <SidebarGroupContent className="p-o m-0">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === pathname}
                    className="data-[active=true]:bg-primary! data-[active=true]:text-white!"
                  >
                    <Link href={item.url} passHref>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel>More Apps</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {moreApps.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === pathname}
                    className="data-[active=true]:bg-color-blue-600!"
                  >
                    <a href={item.url} target="_self" rel="noopener noreferrer">
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-white">
        <div className="w-full flex items-start justify-start px-2">
          <UserInfo />
        </div>
        <Separator className="my-2" />
        <div className="px-16 mb-4">
          <SidebarMenuButton
            asChild
            className="flex items-start justify-center"
          >
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut />
              <span>Logout</span>
            </Button>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
