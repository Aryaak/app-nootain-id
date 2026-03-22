"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      const isPublicPath = pathname === "/login" || pathname === "/register";
      if (!user && !isPublicPath) {
        router.push("/login");
      } else if (user && isPublicPath) {
        router.push("/");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-500 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and trying to access protected route, don't show children
  const isPublicPath = pathname === "/login" || pathname === "/register";
  if (!user && !isPublicPath) {
    return null;
  }

  return <>{children}</>;
}
