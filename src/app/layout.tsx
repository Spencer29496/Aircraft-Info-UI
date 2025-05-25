import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aircraft Information System | Fleet Management Dashboard",
  description: "Professional aircraft fleet management system with real-time tracking, status monitoring, and interactive visualization. Monitor aircraft availability, maintenance status, and locations with intuitive controls.",
  keywords: "aircraft management, fleet tracking, aviation dashboard, aircraft status, maintenance monitoring",
  authors: [{ name: "Aircraft Management Solutions" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
