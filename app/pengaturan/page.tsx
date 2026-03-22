"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import toast from "react-hot-toast";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

const PengaturanPage = () => {
  const { settings, loading, updateSettings } = useSettings();
  const { logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    noHp: "",
    logo: "",
    ppnDefault: 0,
    cetakBarcode: false,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        nama: settings.nama || "",
        alamat: settings.alamat || "",
        noHp: settings.noHp || "",
        logo: settings.logo || "",
        ppnDefault: settings.ppnDefault || 0,
        cetakBarcode: settings.cetakBarcode || false,
      });
    }
  }, [settings]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNumberChange = (field: "ppnDefault", value: string) => {
    const rawValue = value.replace(/\D/g, "");
    setFormData({ ...formData, [field]: rawValue === "" ? 0 : Number(rawValue) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success("Pengaturan berhasil disimpan!");
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Pengaturan">
        <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-400">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-4 text-primary"></i>
          <p>Memuat pengaturan...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pengaturan">
      <div className="mx-5">
        <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
          <header className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <i className="fa-solid fa-store text-xl"></i>
                </div>
                <div>
                    <h2 className="text-xl font-black text-zinc-900 leading-none">Informasi Toko</h2>
                    <p className="text-xs text-zinc-400 font-bold mt-1.5 uppercase tracking-widest">Detail identitas bisnis Anda</p>
                </div>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="p-6 lg:p-10 space-y-10">
            {/* Logo Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-zinc-50 rounded-3xl border border-zinc-200/50">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2rem] bg-white shadow-inner border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-primary/50 group-hover:scale-105">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo Toko" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-300">
                        <i className="fa-solid fa-image text-3xl"></i>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">No Logo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <i className="fa-solid fa-camera text-white text-2xl"></i>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-3">
                <h3 className="font-bold text-zinc-800">Logo Toko</h3>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
                  Logo akan ditampilkan pada struk belanja dan halaman dashboard. Gunakan gambar transparan format PNG atau WEBP untuk hasil terbaik.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-1">
                    <button type="button" className="relative px-5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-all active:scale-95 shadow-sm">
                        Unggah Logo
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleImageChange}
                        />
                    </button>
                    {formData.logo && (
                        <button 
                            type="button" 
                            onClick={() => setFormData({ ...formData, logo: "" })}
                            className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-all active:scale-95"
                        >
                            Hapus
                        </button>
                    )}
                </div>
              </div>
            </div>

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest px-1">
                    <i className="fa-solid fa-tag text-[10px]"></i>
                    Nama Toko
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Toko Berkah Jaya"
                  className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-zinc-800 placeholder:text-zinc-300"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest px-1">
                    <i className="fa-solid fa-phone text-[10px]"></i>
                    Nomor Handphone
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-zinc-800 placeholder:text-zinc-300"
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest px-1">
                    <i className="fa-solid fa-location-dot text-[10px]"></i>
                    Alamat Lengkap
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan alamat lengkap toko di sini..."
                  className="w-full px-6 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-bold text-zinc-800 placeholder:text-zinc-300 resize-none"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                ></textarea>
              </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Preferences Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-500">
                        <i className="fa-solid fa-sliders text-sm"></i>
                    </div>
                    <h3 className="font-black text-zinc-800 uppercase tracking-tight">Preferensi Kasir</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 rounded-3xl border border-zinc-100 bg-white shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="space-y-1">
                            <h4 className="font-bold text-zinc-800">Cetak Barcode</h4>
                            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Aktifkan pencetakan barcode otomatis</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, cetakBarcode: !formData.cetakBarcode })}
                            className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 cursor-pointer ${
                                formData.cetakBarcode ? "bg-primary" : "bg-zinc-200"
                            }`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                                formData.cetakBarcode ? "translate-x-6" : "translate-x-0"
                            }`}></div>
                        </button>
                    </div>

                    <div className="p-6 rounded-3xl border border-zinc-100 bg-white shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="space-y-1">
                            <h4 className="font-bold text-zinc-800">Pajak PPN (%)</h4>
                            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Nilai default PPN transaksi</p>
                        </div>
                        <div className="relative w-24">
                            <input
                                type="text"
                                inputMode="numeric"
                                className="w-full pl-4 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-right font-black text-primary"
                                value={formData.ppnDefault}
                                onChange={(e) => handleNumberChange("ppnDefault", e.target.value)}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">%</span>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-zinc-100" />

            {/* Subscription Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-500">
                        <i className="fa-solid fa-crown text-sm"></i>
                    </div>
                    <h3 className="font-black text-zinc-800 uppercase tracking-tight">Informasi Langganan</h3>
                </div>

                <div className="bg-primary p-6 lg:p-8 rounded-3xl shadow-xl shadow-primary/20 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 w-full flex flex-col gap-4">
                        <div className="px-5 py-4 bg-white/10 border border-white/20 rounded-2xl flex flex-col gap-1.5 shadow-inner">
                            <div className="flex items-center gap-2 text-white/70">
                                <i className="fa-solid fa-calendar-day text-sm"></i>
                                <span className="text-xs font-bold uppercase tracking-wider">Masa Aktif</span>
                            </div>
                            <p className="text-white font-bold text-lg">20 Des 2026</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full bg-white rounded-2xl p-6 flex flex-col items-center text-center gap-4 shadow-xl">
                        <div>
                            <h4 className="font-bold text-zinc-900 text-base">Tingkatkan Pro</h4>
                            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                                Kelola bisnis tanpa batas sekarang juga.
                            </p>
                        </div>
                        <div className="w-full space-y-3">
                            <p className="text-primary font-black text-base">Rp 10Rb<span className="text-xs font-medium text-primary/70">/Bulan</span></p>
                            <Link
                                href="https://wa.me/6285853916304?text=saya%20ingin%20upgrade%20ke%20pro"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center bg-primary text-white text-xs font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-sm active:scale-95 duration-200"
                            >
                                Upgrade Sekarang
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex flex-col gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="cursor-pointer w-full py-5 bg-primary text-white rounded-[1.5rem] font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3 group"
              >
                <span className="uppercase tracking-widest">Simpan Perubahan</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="cursor-pointer w-full py-5 bg-red-50 text-red-500 rounded-[1.5rem] font-black hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                <span className="uppercase tracking-widest">Keluar </span>
              </button>
            </div>
          </form>
        </div>
        
        <p className="text-center text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-5">
            Pengaturan Terakhir Diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </DashboardLayout>
  );
};

export default PengaturanPage;
