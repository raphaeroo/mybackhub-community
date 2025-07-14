import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";
// import { getServerSession } from "next-auth";

import "./globals.css";

// import SessionProvider from "~/providers/SessionProvider";
import QueryClientProvider from "~/providers/QueryProvider";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { ActiveProvider } from "~/Contexts/activeContext";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const gotham = localFont({
  src: [
    {
      path: "../../public/fonts/Gotham-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gotham-Book.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gotham-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gotham-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Gotham-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-gotham",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MyBackHub | Community Hub",
  description: "Access the MyBackHub products and services.",
  icons: {
    icon: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const session = await getServerSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${openSans.variable} ${gotham.variable} antialiased font-mono`}
      >
        {/* <SessionProvider session={session}> */}
        <SidebarProvider>
          <ActiveProvider>
            <AppSidebar />
          </ActiveProvider>
          <main className="w-full bg-gray-50">
            <SidebarTrigger />
            <QueryClientProvider>{children}</QueryClientProvider>
          </main>
        </SidebarProvider>
        <Toaster />
        {/* </SessionProvider> */}
      </body>
    </html>
  );
}
