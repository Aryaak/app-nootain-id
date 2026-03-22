"use client";

import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useProducts } from "@/hooks/useProducts";
import { useTransactions } from "@/hooks/useTransactions";
import { Transaction, TransactionItem } from "@/lib/db";
import toast from "react-hot-toast";

export default function LaporanPage() {
  const { products, loading: loadingProducts } = useProducts();
  const { transactions, loading: loadingTransactions, updateTransactionStatus, updateTransaction, deleteTransaction } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState<{ 
    paymentMethod: string; 
    status: string; 
    items: TransactionItem[] 
  }>({ 
    paymentMethod: "Tunai", 
    status: "Lunas", 
    items: [] 
  });
  const [isSaving, setIsSaving] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const formatNumberAbbreviated = (value: number, isCurrency = true) => {
    let formatted = "";
    if (value >= 1e12) formatted = (value / 1e12).toFixed(2).replace(/\.00$/, "") + " T";
    else if (value >= 1e9) formatted = (value / 1e9).toFixed(2).replace(/\.00$/, "") + " M";
    else if (value >= 1e6) formatted = (value / 1e6).toFixed(2).replace(/\.00$/, "") + " Jt";
    else if (value >= 1e3) formatted = (value / 1e3).toFixed(2).replace(/\.00$/, "") + " Rb";
    else formatted = value.toString();

    return isCurrency ? `Rp ${formatted}` : formatted;
  };

  const handleLunasi = async (id: number) => {
    try {
      await updateTransactionStatus(id, "Lunas");
      toast.success("Hutang berhasil dilunasi!");
    } catch (error) {
      toast.error("Gagal melunasi hutang.");
    }
  };

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setEditForm({ 
      paymentMethod: t.paymentMethod, 
      status: t.status || "Lunas",
      items: JSON.parse(JSON.stringify(t.items)) // Deep clone items
    });
  };

  const handleUpdateItemQuantity = (idx: number, val: number) => {
    setEditForm(prev => {
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], quantity: Math.max(1, val) };
      return { ...prev, items: newItems };
    });
  };

  const currentEditTotal = useMemo(() => {
    return editForm.items.reduce((acc, item) => acc + (item.hargaJual * item.quantity), 0);
  }, [editForm.items]);

  const currentEditTotalModal = useMemo(() => {
    return editForm.items.reduce((acc, item) => acc + (item.modal * item.quantity), 0);
  }, [editForm.items]);

  const handleSaveEdit = async () => {
    if (!editingTransaction?.id) return;
    try {
      setIsSaving(true);
      await updateTransaction(editingTransaction.id, {
        paymentMethod: editForm.paymentMethod as any,
        status: editForm.status as any,
        items: editForm.items,
        total: currentEditTotal,
        totalModal: currentEditTotalModal
      });
      toast.success("Transaksi berhasil diperbarui!");
      setEditingTransaction(null);
    } catch (error) {
      toast.error("Gagal memperbarui transaksi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (t: Transaction) => {
    setTransactionToDelete(t);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete?.id) return;
    try {
      await deleteTransaction(transactionToDelete.id);
      toast.success("Transaksi berhasil dihapus.");
      setTransactionToDelete(null);
    } catch (error) {
      toast.error("Gagal menghapus transaksi.");
    }
  };

  const settledTransactions = useMemo(() => transactions.filter(t => t.status !== "Hutang"), [transactions]);
  const unpaidTransactions = useMemo(() => transactions.filter(t => t.status === "Hutang"), [transactions]);

  const totalPenjualan = useMemo(() => {
    const omset = settledTransactions.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
    return formatNumberAbbreviated(omset);
  }, [settledTransactions]);

  const totalPiutang = useMemo(() => {
    const piutang = unpaidTransactions.reduce((acc, t) => acc + (Number(t.total) || 0), 0);
    return formatNumberAbbreviated(piutang);
  }, [unpaidTransactions]);

  const riwayatTransaksi = useMemo(() => formatNumberAbbreviated(transactions.length, false), [transactions, formatNumberAbbreviated]);

  const totalStok = useMemo(() => {
    const total = products.reduce((acc, p) => acc + (Number(p.stok) || 0), 0);
    return formatNumberAbbreviated(total, false);
  }, [products, formatNumberAbbreviated]);

  const getTimeAgo = (dateString: string) => {
    const past = new Date(dateString);
    return past.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loadingProducts || loadingTransactions) {
    return (
      <DashboardLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center text-zinc-400">
          <i className="fa-solid fa-circle-notch fa-spin text-4xl mb-4 text-primary"></i>
          <p className="font-bold">Memuat Laporan...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Laporan">
      <div className="space-y-6 md:space-y-8 mx-5 pb-10">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-zinc-100 flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 relative z-10">
              <i className="fa-solid fa-chart-line text-lg md:text-xl"></i>
            </div>
            <div className="relative z-10 flex flex-col min-h-0">
              <h3 className="font-bold text-zinc-500 mb-1 text-[10px] md:text-xs uppercase tracking-widest">Total Penjualan</h3>
              <p className="text-lg md:text-2xl font-black text-zinc-900 leading-tight truncate tracking-tight">{totalPenjualan}</p>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-zinc-100 flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
             <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 relative z-10">
              <i className="fa-solid fa-hand-holding-dollar text-lg md:text-xl"></i>
            </div>
            <div className="relative z-10 flex flex-col min-h-0">
              <h3 className="font-bold text-zinc-500 mb-1 text-[10px] md:text-xs uppercase tracking-widest">Total Piutang</h3>
              <p className="text-lg md:text-2xl font-black text-zinc-900 leading-tight truncate tracking-tight">{totalPiutang}</p>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-zinc-100 flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
             <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 relative z-10">
              <i className="fa-solid fa-receipt text-lg md:text-xl"></i>
            </div>
            <div className="relative z-10 flex flex-col min-h-0">
              <h3 className="font-bold text-zinc-500 mb-1 text-[10px] md:text-xs uppercase tracking-widest">Riwayat Nota</h3>
              <p className="text-lg md:text-2xl font-black text-zinc-900 leading-tight truncate tracking-tight">{riwayatTransaksi}</p>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-zinc-100 flex flex-col gap-3 md:gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
             <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 relative z-10">
              <i className="fa-solid fa-box-open text-lg md:text-xl"></i>
            </div>
            <div className="relative z-10 flex flex-col min-h-0">
              <h3 className="font-bold text-zinc-500 mb-1 text-[10px] md:text-xs uppercase tracking-widest">Stok Gudang</h3>
              <p className="text-lg md:text-2xl font-black text-zinc-900 leading-tight truncate tracking-tight">{totalStok}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 animate-in fade-in slide-in-from-bottom-8 duration-700 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-zinc-100 flex items-center justify-between gap-4 bg-zinc-50/30">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                <i className="fa-solid fa-list-ul text-sm"></i>
              </div>
              Daftar Transaksi
            </h2>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-zinc-400 uppercase tracking-widest bg-zinc-50/50 border-b border-zinc-100">
                <tr>
                  <th scope="col" className="px-6 py-5 font-black">ID / Waktu</th>
                  <th scope="col" className="px-6 py-5 font-black">Detail Item</th>
                  <th scope="col" className="px-6 py-5 font-black">Total</th>
                  <th scope="col" className="px-6 py-5 font-black">Metode</th>
                  <th scope="col" className="px-6 py-5 font-black">Status</th>
                  <th scope="col" className="px-6 py-5 font-black text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 italic">
                      Belum ada transaksi.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                        <p className="font-bold text-zinc-900 group-hover:text-primary transition-colors">Transaksi #{t.id}</p>
                        <p className="text-xs text-zinc-500 mt-1">{getTimeAgo(t.timestamp)}</p>
                      </td>
                      <td className="px-6 py-4 min-w-[200px]">
                        <div className="flex flex-col gap-1">
                          {t.items && t.items.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium text-zinc-800">{item.nama}</span>
                              <span className="text-zinc-500 text-xs ml-1">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-bold text-zinc-900">Rp {t.total.toLocaleString("id-ID")}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-zinc-100 text-zinc-700 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider">
                          {t.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {t.status === "Hutang" ? (
                          <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                            Hutang
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                            <i className="fa-solid fa-check text-emerald-600"></i> Lunas
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {t.status === "Hutang" && (
                            <button
                              onClick={() => handleLunasi(t.id!)}
                              className="bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                              title="Lunasi"
                            >
                              <i className="fa-solid fa-money-bill-wave"></i>
                              Lunasi
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(t)}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                            title="Edit"
                          >
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(t)}
                            className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                            title="Hapus"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden divide-y divide-zinc-100">
            {transactions.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-zinc-300 gap-4">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-receipt text-3xl"></i>
                </div>
                <p className="font-bold text-xs uppercase tracking-widest text-zinc-400 italic">Belum ada transaksi</p>
              </div>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="p-5 space-y-4 active:bg-zinc-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-zinc-900 text-base">Nota #{t.id}</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">{getTimeAgo(t.timestamp)}</p>
                    </div>
                    {t.status === "Hutang" ? (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-orange-200">
                        <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse"></span>
                        Hutang
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-emerald-200">
                        <i className="fa-solid fa-check text-[8px]"></i> Lunas
                      </span>
                    )}
                  </div>

                  <div className="bg-zinc-50 rounded-2xl p-3 border border-zinc-100/50 space-y-2">
                    {t.items && t.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-zinc-700">{item.nama}</span>
                        <span className="text-zinc-400 font-medium">x{item.quantity}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-zinc-200/50 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Bayar</span>
                      <span className="font-black text-primary text-sm">Rp {t.total.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="bg-zinc-100 text-zinc-500 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-zinc-200">
                      {t.paymentMethod}
                    </span>
                    <div className="flex gap-2">
                      {t.status === "Hutang" && (
                        <button
                          onClick={() => handleLunasi(t.id!)}
                          className="w-10 h-10 flex items-center justify-center bg-orange-50 text-orange-600 rounded-xl active:scale-90 transition-all border border-orange-100"
                        >
                          <i className="fa-solid fa-money-bill-wave"></i>
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(t)}
                        className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all border border-blue-100"
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl active:scale-90 transition-all border border-red-100"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
              <div>
                <h2 className="text-xl font-black text-zinc-900">Edit Transaksi</h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Nota #{editingTransaction.id}</p>
              </div>
              <button 
                onClick={() => setEditingTransaction(null)}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm border border-zinc-100"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto no-scrollbar flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Metode Bayar</label>
                  <select
                    value={editForm.paymentMethod}
                    onChange={(e) => setEditForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary block p-4 transition-all appearance-none"
                  >
                    <option value="Tunai">Tunai</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Hutang">Hutang</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm font-bold rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary block p-4 transition-all appearance-none"
                  >
                    <option value="Lunas">Lunas</option>
                    <option value="Hutang">Hutang</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 block">Rincian Barang</label>
                <div className="space-y-3 bg-zinc-50/50 p-4 rounded-3xl border border-zinc-100">
                  {editForm.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-zinc-800 uppercase tracking-tight">{item.nama}</span>
                        <span className="text-[10px] text-zinc-400 font-bold">@ Rp {item.hargaJual.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex items-center bg-zinc-50 rounded-xl p-1 gap-3 border border-zinc-100">
                        <button 
                          onClick={() => handleUpdateItemQuantity(idx, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-zinc-400 hover:text-primary transition-all shadow-sm active:scale-90"
                        >
                          <i className="fa-solid fa-minus text-[10px]"></i>
                        </button>
                        <span className="w-6 text-center text-xs font-black text-zinc-900">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateItemQuantity(idx, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-zinc-400 hover:text-primary transition-all shadow-sm active:scale-90"
                        >
                          <i className="fa-solid fa-plus text-[10px]"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 p-5 rounded-[2rem] border border-primary/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest leading-none mb-1">Total Baru</p>
                  <p className="text-2xl font-black text-primary tracking-tighter italic">Rp {currentEditTotal.toLocaleString("id-ID")}</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-primary/10">
                  <i className="fa-solid fa-tags"></i>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 pt-0 flex gap-3">
              <button
                onClick={() => setEditingTransaction(null)}
                className="flex-1 py-4 text-xs font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-all active:scale-95"
                disabled={isSaving}
              >
                Batal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-[2] py-4 text-xs font-black text-white bg-primary rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
              >
                {isSaving ? (
                  <>Menyimpan...</>
                ) : (
                  <>Simpan Perubahan</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {transactionToDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setTransactionToDelete(null)}></div>
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 rounded-3xl bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-200">
                <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
              </div>
              <h2 className="text-2xl font-black text-zinc-900 mb-3 tracking-tight">Hapus Transaksi?</h2>
              <p className="text-zinc-500 text-sm leading-relaxed px-2">
                Apakah Anda yakin ingin menghapus <strong className="text-zinc-900">Nota #{transactionToDelete.id}</strong>? Stok barang akan dikembalikan dan tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="p-8 pt-0 flex gap-3">
              <button
                onClick={() => setTransactionToDelete(null)}
                className="flex-1 py-4 bg-zinc-50 text-zinc-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-100 transition-all active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-trash text-[10px]"></i>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
