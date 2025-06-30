"use client";
import {
  Home,
  BookUser,
  Lock,
  LogOut,
  CreditCard,
  LayoutGrid,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

// Menu items.
const items = [
  {
    title: "Start",
    url: "/",
    icon: Home,
  },
  {
    title: "Personal Information",
    url: "/personal-info",
    icon: BookUser,
  },
  {
    title: "Connected Applications",
    url: "/connected-applications",
    icon: LayoutGrid,
  },
  {
    title: "Security",
    url: "/security",
    icon: Lock,
  },
  {
    title: "Payments and Subscriptions",
    url: "/payments-and-subscriptions",
    icon: CreditCard,
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
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center md:mb-6 md:pt-2">
          {open ? (
            <Image src="/mbh-logo.png" alt="Logo" width={179} height={32} />
          ) : (
            <Image src="/mbh-logo-icon.png" alt="Logo" width={24} height={24} />
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === pathname}
                    className="data-[active=true]:bg-color-blue-600!"
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
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton asChild>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => signOut()}
          >
            <LogOut className="text-red-600" />
            <span className="text-red-600">Logout</span>
          </Button>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
