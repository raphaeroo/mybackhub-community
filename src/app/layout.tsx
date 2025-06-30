import type { Metadata } from "next";
import { Open_Sans, Montserrat } from "next/font/google";
// import { getServerSession } from "next-auth";

import "./globals.css";

// import SessionProvider from "~/providers/SessionProvider";
import QueryClientProvider from "~/providers/QueryProvider";
import { Toaster } from "sonner";
import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";

const geistSans = Open_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Montserrat({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <SessionProvider session={session}> */}
        <SidebarProvider>
          <AppSidebar />
          <main className="md:w-screen pb-12">
            <QueryClientProvider>{children}</QueryClientProvider>
          </main>
        </SidebarProvider>
        <Toaster />
        {/* </SessionProvider> */}
      </body>
    </html>
  );
}
