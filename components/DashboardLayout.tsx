"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "./Sidebar";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  noPadding?: boolean;
}

const DashboardLayout = ({ children, title = "Dasbor", noPadding = false }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { settings } = useSettings();
  const { user, refreshUser } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // Only refresh from network if online and maybe not on every page change
    // The context already handles initial load and offline sync
    if (navigator.onLine) {
       refreshUser();
    }
  }, []); // Run once on mount instead of every pathname change

  const isExpired = user?.expired_at ? new Date(user.expired_at) < new Date() : true;
  const isSettingsPage = pathname === "/pengaturan";
  const shouldLock = isExpired && !isSettingsPage;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans overflow-x-hidden print:bg-white print:overflow-visible print:min-h-0 print:block">
      <div className="print:hidden">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      </div>

      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-6 left-2 z-50 bg-white p-1 bg-primary text-white rounded-xl shadow-xl hover:bg-primary/90 transition-all duration-300 hidden lg:flex items-center justify-center w-12 h-12 group cursor-pointer print:hidden"
          title="Buka Sidebar"
        >
          {settings?.logo ? (
            <img
              src={settings.logo}
              alt={settings?.nama || "Logo Toko"}
              className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform bg-white p-1"
            />
          ) : (
            <Image
              src="/logo.webp"
              alt="Nootain Logo"
              width={50}
              height={50}
              className="rounded-lg text-xl group-hover:scale-110 transition-transform"
            />
          )}
        </button>
      )}
      
      <main className={`flex-1 flex flex-col transition-all duration-500 ease-in-out print:pl-0 print:block ${isSidebarOpen ? "lg:pl-64" : "lg:pl-0"}`}>
        <div className={`relative ${noPadding ? "h-screen flex flex-col overflow-hidden relative print:block print:h-auto print:overflow-visible" : "p-2 pt-28 lg:pt-8 pb-20 lg:pb-8 print:p-0 print:block print:h-auto print:overflow-visible"}`}>
          {!noPadding && (
            <div className={`
              fixed top-0 left-0 right-0 z-40 
              bg-primary 
              px-8 py-5 
              flex items-center gap-3 
              shadow-lg
              lg:static lg:bg-transparent lg:px-0 lg:py-0 lg:mb-8 lg:shadow-none
              transition-all duration-500 print:hidden
              ${!isSidebarOpen ? "lg:ml-10" : ""}
            `}>
              <div className="lg:hidden flex items-center">
                {settings?.logo ? (
                  <img
                    src={settings.logo}
                    alt={settings?.nama || "Logo Toko"}
                    className="w-[35px] h-[35px] object-cover rounded-xl bg-white p-1 shadow-sm"
                  />
                ) : (
                  <Image
                    src="/logo.webp"
                    alt="Nootain Logo"
                    width={35}
                    height={35}
                    className="rounded-xl bg-white p-1 shadow-sm"
                  />
                )}
              </div>
              <h1 className="text-xl lg:text-3xl font-bold text-white lg:text-zinc-800 ml-5">
                {title}
              </h1>
            </div>
          )}
          
          <div className={`${shouldLock ? "blur-md pointer-events-none select-none transition-all duration-700 h-full overflow-hidden" : "transition-all duration-700 h-full"}`}>
            {children}
          </div>

          {shouldLock && (
            <div className="fixed inset-0 lg:left-64 z-[60] flex items-center justify-center p-6 bg-white/10 backdrop-blur-sm animate-in fade-in duration-500">
              <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-zinc-100 p-8 md:p-10 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <i className="fa-solid fa-clock-rotate-left text-red-500 text-3xl"></i>
                </div>
                <h2 className="text-2xl font-black text-zinc-900 mb-3 tracking-tight uppercase">Masa Aktif Berakhir</h2>
                <p className="text-zinc-500 font-medium mb-8 leading-relaxed">
                  Mohon maaf, masa aktif paket Anda telah berakhir. Silakan hubungi admin untuk melakukan perpanjangan layanan.
                </p>
                <div className="space-y-4">
                  <a 
                    href="https://wa.me/6285853916304?text=Halo%20Nootain%20ID,%20saya%20ingin%20perpanjang%20masa%20aktif%20langganan%20pos"
                    target="_blank"
                    className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs tracking-widest uppercase"
                  >
                    <i className="fa-brands fa-whatsapp text-lg"></i>
                    Hubungi Admin Sekarang
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
