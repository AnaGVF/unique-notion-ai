import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Unique Notion AI",
    template: "%s — Unique Notion AI",
  },
  description: "Real-time collaborative Notion-style workspace powered by Liveblocks and Cloudflare Workers AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning className="min-h-screen bg-background text-foreground antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />

            <div className="flex min-h-[calc(100vh-61px)] print:min-h-0 print:block">
              <Sidebar />
              <div className="flex-1 p-3 sm:p-5 md:p-6 bg-gray-100/60 dark:bg-zinc-950/60 overflow-y-auto scrollbar-hide print:p-0 print:bg-transparent print:overflow-visible">
                {children}
              </div>
            </div>
            <Toaster position="top-center" />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
