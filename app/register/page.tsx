"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/hooks/useAuthContext";
import toast from "react-hot-toast";
import Link from "next/link";

export default function RegisterPage() {
  const [nama, setNama] = useState("");
  const [category, setCategory] = useState("Toko Kelontong / Sembako");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuthContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nama || !email || !password || !confirmPassword) {
      toast.error("Semua field harus diisi");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setIsSubmitting(true);
    
    // Calculate expired_at (1 year from now)
    const expiredAt = new Date();
    expiredAt.setFullYear(expiredAt.getFullYear() + 1);

    const success = await register({
      nama,
      category,
      email,
      password,
      plan: "Free",
      expired_at: expiredAt.toISOString(),
    });

    if (success) {
      toast.success("Registrasi Berhasil!");
      router.push("/");
    } else {
      toast.error("Registrasi gagal. Email mungkin sudah terdaftar.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-primary relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-black/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="w-full max-w-lg animate-in fade-in scale-in-95 duration-700">
        <div className="bg-white/95 backdrop-blur-xl border border-white shadow-2xl rounded-3xl p-8 md:p-10 relative z-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden">
              <img src="/logo.webp" alt="Nootain Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-black text-zinc-900 mb-1 tracking-tight">Daftar nootain.id</h1>
            <p className="text-zinc-500 font-medium text-sm">Mulai kelola bisnis pertamamu sekarang</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 ml-1">Nama Pengguna</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">
                  <i className="fa-solid fa-user"></i>
                </span>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border-2 border-transparent rounded-xl focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none text-zinc-900 font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 ml-1">Kategori Bisnis</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">
                  <i className="fa-solid fa-tags"></i>
                </span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border-2 border-transparent rounded-xl focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none text-zinc-900 font-medium text-sm appearance-none cursor-pointer"
                >
                  <option value="Toko Kelontong / Sembako">Toko Kelontong / Sembako</option>
                  <option value="Makanan & Minuman (FnB)">Makanan & Minuman (FnB)</option>
                  <option value="Toko Elektronik">Toko Elektronik</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 ml-1">Email</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">
                  <i className="fa-solid fa-envelope"></i>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border-2 border-transparent rounded-xl focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none text-zinc-900 font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 ml-1">Password</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border-2 border-transparent rounded-xl focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none text-zinc-900 font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 ml-1">Konfirmasi Password</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border-2 border-transparent rounded-xl focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none text-zinc-900 font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-black rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:active:scale-100 uppercase tracking-wider text-xs"
              >
                {isSubmitting ? (
                  <i className="fa-solid fa-circle-notch fa-spin text-lg"></i>
                ) : (
                  <>
                    Daftar
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-zinc-500 text-xs font-medium">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Masuk di sini
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
