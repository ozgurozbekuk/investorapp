import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";
import Ticker from "@/components/Ticker";
import QueryProvider from "@/components/QueryProvider";
import ScrollToTop from "@/components/ScrollToTop";
import dynamic from "next/dynamic";

const interDisplay = Inter({
  variable: "--font-display",
  subsets: ["latin"],
});

const MobileBottomNav = dynamic(() => import("@/components/MobileBottomNav"), {
  ssr: false,
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${interDisplay.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <div className="min-h-screen">
                <Navbar />
                <Ticker />
                <main className="pt-8 pb-24 md:pb-8">
                  <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="hidden lg:block lg:col-span-3">
                        <Sidebar />
                      </div>
                      <div className="lg:col-span-9">{children}</div>
                      <MobileBottomNav />
                    </div>
                  </div>
                </main>
              </div>
            </QueryProvider>
            <Toaster />
            <ScrollToTop />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
