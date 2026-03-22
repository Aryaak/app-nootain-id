"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password harus diisi");
      return;
    }

    setIsSubmitting(true);
    const success = await login(email, password);
    
    if (success) {
      toast.success("Login Berhasil!");
      router.push("/");
    } else {
      toast.error("Email atau password salah");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-primary relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-black/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="w-full max-w-md animate-in fade-in scale-in-95 duration-700">
        <div className="bg-white/95 backdrop-blur-xl border border-white shadow-2xl rounded-3xl p-8 md:p-10 relative z-10">
          <div className="text-center mb-10">
            <div className="w-24 h-24  rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm rotate-3 hover:rotate-0 transition-transform duration-300 overflow-hidden ">
              <img src="/logo.webp" alt="Nootain Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight">nootain.id</h1>
            <p className="text-zinc-500 font-medium">Masuk untuk mengelola tokomu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 ml-1">Email</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">
                  <i className="fa-solid fa-envelope"></i>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@nootain.id"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-transparent rounded-2xl focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none text-zinc-900 font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-zinc-700">Password</label>
              </div>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors">
                  <i className="fa-solid fa-lock"></i>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border-2 border-transparent rounded-2xl focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none text-zinc-900 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer w-full py-4 bg-primary hover:bg-primary-hover text-white font-black rounded-2xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:active:scale-100"
            >
              {isSubmitting ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : (
                <>
                  MASUK
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </>
              )}
            </button>

            <p className="text-center text-zinc-500 text-sm font-medium">
              Belum punya akun?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline">
                Daftar di sini
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
