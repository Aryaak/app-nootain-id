'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuthContext } from '@/hooks/useAuthContext'

export default function InstallPWA() {
  const { user } = useAuthContext()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [dontAskAgain, setDontAskAgain] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)

      const isDismissed = localStorage.getItem('nootain_pwa_dismissed') === 'true'
      if (user && !isDismissed) {
        setShowModal(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [user])

  useEffect(() => {
    if (user && deferredPrompt) {
      const isDismissed = localStorage.getItem('nootain_pwa_dismissed') === 'true'
      if (!isDismissed) {
        setShowModal(true)
      }
    }
  }, [user, deferredPrompt])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setShowModal(false)
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowModal(false)
    if (dontAskAgain) {
      localStorage.setItem('nootain_pwa_dismissed', 'true')
    }
  }

  if (!showModal) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
    >
      {/* Blurred full-screen backdrop, covers everything */}
      <div className="absolute inset-0 backdrop-blur-md" />

      {/* Modal card */}
      <div className="relative w-full sm:max-w-md mx-auto sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-400">
        {/* Header with primary gradient */}
        <div
          className="px-8 pt-10 pb-8 text-center text-white flex flex-col items-center gap-4"
          style={{ background: 'linear-gradient(135deg, #44ACFF 0%, #1a7fd4 100%)' }}
        >
          {/* Logo */}
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-black/20">
            <Image
              src="/logo.webp"
              alt="nootain.id"
              width={56}
              height={56}
              className="rounded-xl"
            />
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight">nootain.id</h2>
            <p className="text-white/80 text-sm font-medium mt-1">Kasir Sahabat UMKM</p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {['⚡ Cepat', '📴 Offline', '🔒 Aman'].map((feat) => (
              <span
                key={feat}
                className="px-3 py-1 bg-white/15 border border-white/20 rounded-full text-xs font-semibold"
              >
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="bg-white px-8 py-7 flex flex-col gap-5">
          <div className="text-center">
            <h3 className="text-lg font-bold text-zinc-900">
              Pasang di Perangkat Anda?
            </h3>
            <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed">
              Tambahkan nootain.id ke layar utama untuk akses instan tanpa perlu membuka browser, bahkan saat offline.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleInstall}
              className="cursor-pointer w-full py-3.5 px-5 text-white font-bold text-sm rounded-2xl transition-all active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #44ACFF 0%, #1a7fd4 100%)', boxShadow: '0 8px 24px rgba(68,172,255,0.35)' }}
            >
              <i className="fas fa-download mr-2"></i>
              Install Sekarang
            </button>

            <button
              onClick={handleDismiss}
              className="cursor-pointer w-full py-3.5 px-5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-sm rounded-2xl transition-all active:scale-95"
            >
              Nanti Saja
            </button>
          </div>

          {/* Don't ask again */}
          <div className="cursor-pointer flex items-center justify-center gap-2 pt-1">
            <input
              type="checkbox"
              id="dontAskAgain"
              className="w-4 h-4 rounded border-zinc-300 cursor-pointer accent-primary"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
            />
            <label htmlFor="dontAskAgain" className="cursor-pointer text-xs text-zinc-400 select-none">
              Jangan tanya lagi
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
