import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastContainer } from "@/components/toast-container";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Shopbox KDS",
  description: "Kitchen Display System for Shopbox",
};

export const viewport: Viewport = {
  themeColor: "#043129",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lexend.variable} h-full`}>
      <body className="min-h-full bg-shopbox-surface text-shopbox-text font-(family-name:--font-lexend) antialiased">
        <ThemeProvider>
          {children}
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
