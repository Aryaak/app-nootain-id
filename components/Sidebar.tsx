"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ isOpen = true, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const { settings } = useSettings();
  const { user } = useAuth();

  const isExpired = user?.expired_at ? new Date(user.expired_at) < new Date() : true;
  const expiredDateFormatted = user?.expired_at 
    ? format(new Date(user.expired_at), "dd MMM yyyy", { locale: id }) 
    : "-";

  const navItems = [
    { name: "Dasbor", icon: "fa-solid fa-chart-line", href: "/" },
    { name: "Produk", icon: "fa-solid fa-box", href: "/produk" },
    { name: "Kasir", icon: "fa-solid fa-cash-register", href: "/kasir" },
    { name: "Laporan", icon: "fa-solid fa-file-invoice", href: "/laporan" },
    { name: "Pengaturan", icon: "fa-solid fa-cog", href: "/pengaturan" },
  ];

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-64 transform bg-primary transition-all duration-500 ease-in-out hidden lg:flex lg:flex-col overflow-y-auto shadow-2xl ${
          isOpen ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full w-full px-4 py-6">
          <div className="flex items-center justify-between mb-5 px-2">
            <div className="flex items-center gap-2 text-white font-bold text-xl">
              {settings?.logo ? (
                <img
                  src={settings.logo}
                  alt={settings?.nama || "Logo Toko"}
                  className="w-[50px] h-[50px] rounded-lg bg-white p-1 object-cover"
                />
              ) : (
                <Image
                  src="/logo.webp"
                  alt="Nootain Logo"
                  width={50}
                  height={50}
                  className="rounded-lg bg-white p-1"
                />
              )}
              <span className="truncate max-w-[140px]">{settings?.nama || "nootain.id"}</span>
            </div>
            
            <button
              onClick={onToggle}
              className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer"
              title="Sembunyikan Sidebar"
            >
              <i className="fa-solid fa-chevron-left text-sm"></i>
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const isSettings = item.name === "Pengaturan";
              const isDisabled = isExpired && !isSettings;

              return (
                <Link
                  key={item.name}
                  href={isDisabled ? "#" : item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-white text-primary shadow-lg"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  } ${isDisabled ? "opacity-30 blur-[2px] cursor-not-allowed grayscale pointer-events-none" : ""}`}
                >
                  <i className={`${item.icon} text-lg w-6 flex justify-center ${!isActive && !isDisabled && "group-hover:scale-110"} transition-transform`}></i>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 space-y-4">
            {(settings?.noHp || settings?.alamat || (settings?.ppnDefault !== undefined && settings.ppnDefault > 0)) && (
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-2">
                {settings?.noHp && (
                  <div className="flex gap-2 text-white/80 items-start">
                    <i className="fa-solid fa-phone text-xs mt-0.5 w-4 flex justify-center"></i>
                    <span className="text-xs font-medium">{settings.noHp}</span>
                  </div>
                )}
                {settings?.alamat && (
                  <div className="flex gap-2 text-white/80 items-start">
                    <i className="fa-solid fa-location-dot text-xs mt-0.5 w-4 flex justify-center"></i>
                    <span className="text-xs font-medium line-clamp-2">{settings.alamat}</span>
                  </div>
                )}
                {(settings?.ppnDefault !== undefined && settings.ppnDefault > 0) && (
                  <div className="flex gap-2 text-white/80 items-center mt-1">
                    <i className="fa-solid fa-percent text-xs w-4 flex justify-center"></i>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md text-white">
                      PPN {settings.ppnDefault}%
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-2 text-white/70">
                <i className="fa-solid fa-calendar-day text-xs"></i>
                <span className="text-[10px] font-bold uppercase tracking-wider">Masa Aktif</span>
              </div>
              <p className="text-white font-bold text-sm">{expiredDateFormatted}</p>
            </div>

            <div className="p-3 bg-white rounded-2xl flex flex-col items-center text-center gap-4 shadow-lg">
              <div>
                <h4 className="font-bold text-zinc-900 text-sm">
                  {isExpired ? "Tingkatkan Pro" : "Customer Service"}
                </h4>
              </div>
              <div className="w-full space-y-2">
                <p className="text-primary font-bold text-sm">
                  {isExpired ? "Rp 10Rb/Bulan" : "Bantuan & Dukungan"}
                </p>
                <Link
                  href="https://wa.me/6285853916304?text=saya%20ingin%20tanya%20tentang%20nootain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block bg-primary text-white text-xs font-bold py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                >
                  {isExpired ? "Upgrade Sekarang" : "Hubungi Kami"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-[70] bg-primary px-6 lg:hidden flex justify-between items-center h-16 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] rounded-t-3xl border-t border-white/5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const isKasir = item.name === "Kasir";
          const isSettings = item.name === "Pengaturan";
          const isDisabled = isExpired && !isSettings;

          if (isKasir) {
            return (
              <div key={item.name} className={`relative -top-5 flex flex-col items-center ${isDisabled ? "opacity-30 blur-[1px] pointer-events-none grayscale" : ""}`}>
                <Link
                  href={isDisabled ? "#" : item.href}
                  className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 shadow-xl active:scale-95 ${
                    isActive
                      ? "bg-white text-primary ring-4 ring-zinc- border border-primary"
                      : "bg-primary text-white ring-4 ring-zinc-50 hover:bg-white/90"
                  } border-2 border-white/10`}
                >
                  <i className={`${item.icon} text-lg`}></i>
                </Link>
                <span className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 ${isActive ? "text-white" : "text-white/60"}`}>
                  {item.name}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={isDisabled ? "#" : item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 transition-all duration-300 w-12 ${
                isActive
                  ? "text-white scale-105"
                  : "text-white/40 hover:text-white"
              } ${isDisabled ? "opacity-30 blur-[2px] pointer-events-none grayscale" : ""}`}
            >
              <i className={`${item.icon} text-lg`}></i>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? "opacity-100" : "opacity-70"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
