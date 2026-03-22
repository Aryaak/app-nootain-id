import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
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
  title: "nootain.id - Kasir Sahabat UMKM",
  description: "Aplikasi Kasir dan Manajemen Produk Terbaik untuk UMKM.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "nootain.id",
  },
};

export const viewport: Viewport = {
  themeColor: "#44ACFF",
};

import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "@/hooks/useAuthContext";
import PWARegistration from "@/components/PWARegistration";
import InstallPWA from "@/components/InstallPWA";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="stylesheet" href="/fontawesome/all.min.css" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <PWARegistration />
        <Toaster position="top-center" />
        <AuthProvider>
          <AuthGuard>{children}</AuthGuard>
          <InstallPWA />
        </AuthProvider>
      </body>
    </html>
  );
}
