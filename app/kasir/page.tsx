"use client";

import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useProducts, Product, useCategories } from "@/hooks/useProducts";
import { useTransactions } from "@/hooks/useTransactions";
import { useSettings } from "@/hooks/useSettings";
import toast from "react-hot-toast";

interface CartItem extends Product {
  quantity: number;
}

const KasirPage = () => {
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const { addTransaction } = useTransactions();
  const { settings } = useSettings();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "Tunai" | "Transfer" | "Hutang">("Tunai");
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any | null>(null);

  // Efek untuk cetak otomatis jika isCheckoutModalOpen true dan settings.cetakBarcode true
  useEffect(() => {
    if (isCheckoutModalOpen && settings?.cetakBarcode) {
      const timer = setTimeout(() => {
        toast.success("Mencetak struk...");
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isCheckoutModalOpen, settings?.cetakBarcode]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.nama.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "Semua" || p.kategori === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const addToCart = (product: Product) => {
    if (product.stok <= 0) {
      toast.error("Stok habis!");
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem && existingItem.quantity >= product.stok) {
      toast.error("Stok tidak mencukupi!");
      return;
    }

    setCart((prevCart) => {
      const isAlreadyInCart = prevCart.find((item) => item.id === product.id);
      if (isAlreadyInCart) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) return;
    if (newQty > (item.stok || 0)) {
      toast.error("Stok tidak mencukupi!");
      return;
    }

    setCart((prevCart) => {
      return prevCart.map((it) => {
        if (it.id === productId) {
          return { ...it, quantity: newQty };
        }
        return it;
      });
    });
  };

  const subtotal = cart.reduce((acc, item) => acc + item.hargaJual * item.quantity, 0);
  const ppnPercentage = settings?.ppnDefault || 0;
  const ppnAmount = (subtotal * ppnPercentage) / 100;
  const grandTotal = subtotal + ppnAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const totalModal = cart.reduce((acc, item) => acc + (Number(item.modal) || 0) * item.quantity, 0);
    
    const transactionData = {
      timestamp: new Date().toISOString(),
      items: cart.map(item => ({
        id: item.id!,
        nama: item.nama,
        quantity: item.quantity,
        hargaJual: item.hargaJual,
        modal: item.modal
      })),
      subtotal: subtotal,
      ppn: ppnAmount,
      total: grandTotal,
      totalModal: totalModal,
      paymentMethod,
      status: paymentMethod === "Hutang" ? "Hutang" as const : "Lunas" as const
    };

    try {
      await addTransaction(transactionData);
      setLastTransaction(transactionData);
      setCart([]);
      setIsCheckoutModalOpen(true);
      setIsCartOpenMobile(false);
      toast.success("Transaksi Berhasil!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal memproses transaksi.");
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <DashboardLayout title="Kasir" noPadding>
      <div className="flex flex-col lg:flex-row h-full overflow-hidden relative print:hidden">
        {/* Left Side: Product Selection */}
        <div className={`flex-1 flex flex-col gap-4 overflow-hidden bg-zinc-50 p-4 lg:p-6 lg:ml-10 ${isCartOpenMobile ? "hidden lg:flex" : "flex"}`}>
          {/* Search and Category Filter */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>
              <input
                type="text"
                placeholder="Cari produk..."
                className="text-black w-full pl-11 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              <button
                onClick={() => setSelectedCategory("Semua")}
                className={`px-5 py-2.5 rounded-2xl text-[10px] lg:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === "Semua"
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.nama)}
                  className={`px-5 py-2.5 rounded-2xl text-[10px] lg:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.nama
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  }`}
                >
                  {cat.nama}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-32 lg:pb-4">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-4 text-primary"></i>
                <p>Memuat produk...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-zinc-300 p-8 text-center">
                <i className="fa-solid fa-box-open text-5xl mb-4 text-zinc-200"></i>
                <p className="text-zinc-500 font-medium">Produk tidak ditemukan</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="group bg-white rounded-2xl border border-zinc-200 p-3 hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col active:scale-95"
                  >
                    <div className="aspect-square rounded-xl bg-zinc-100 mb-3 overflow-hidden relative">
                      {product.gambar ? (
                        <img src={product.gambar} alt={product.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40 font-black text-2xl">
                          {getInitials(product.nama)}
                        </div>
                      )}
                      {product.stok <= 5 && product.stok > 0 && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-lg shadow-sm">
                          Sisa {product.stok}
                        </div>
                      )}
                      {product.stok <= 0 && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg shadow-lg">HABIS</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <h3 className="font-bold text-zinc-800 text-xs lg:text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors uppercase tracking-tight leading-tight">{product.nama}</h3>
                      <p className="text-primary font-black text-sm lg:text-base mt-auto">Rp {product.hargaJual.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Summary Button (Mobile) */}
        {!isCartOpenMobile && cart.length > 0 && (
          <div className="lg:hidden fixed bottom-28 left-4 right-4 z-40 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <button
              onClick={() => setIsCartOpenMobile(true)}
              className="w-full bg-primary text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between group active:scale-95 transition-all border-4 border-white/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white text-primary rounded-2xl flex items-center justify-center shadow-inner relative">
                  <i className="fa-solid fa-cart-shopping text-lg"></i>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-primary shadow-lg">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest leading-none mb-1 text-white/70">Total Bayar</p>
                  <p className="text-xl font-black tracking-tight">Rp {grandTotal.toLocaleString("id-ID")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider">
                Lanjut
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </div>
            </button>
          </div>
        )}

        {/* Right Side: Cart Section */}
        <div className={`
          ${isCartOpenMobile 
            ? "fixed inset-0 z-[60] flex flex-col bg-white animate-in slide-in-from-bottom duration-300" 
            : "hidden lg:flex lg:w-[440px] lg:flex-col lg:bg-white lg:border-l lg:border-zinc-100 lg:shadow-2xl lg:z-10"
          } transition-all duration-300 print:hidden
        `}>
          <header className="p-4 border-b border-zinc-50 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsCartOpenMobile(false)}
                className="lg:hidden w-10 h-10 flex items-center justify-center bg-zinc-100 text-zinc-500 rounded-xl hover:bg-zinc-200 transition-colors"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-cart-shopping text-sm"></i>
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-900 leading-none">Keranjang</h2>
                <p className="text-[10px] text-zinc-400 font-medium mt-1 uppercase tracking-wider">{cart.length} item dipilih</p>
              </div>
            </div>
            
            {isCartOpenMobile && (
              <button 
                onClick={() => setIsCartOpenMobile(false)}
                className="text-[10px] font-black text-primary bg-primary/5 px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-primary/10 transition-colors"
              >
                Tambah Lagi
              </button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-200 gap-4 opacity-80">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-basket-shopping text-3xl"></i>
                </div>
                <div className="text-center">
                  <p className="font-bold text-zinc-400 text-xs">Keranjang Kosong</p>
                </div>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-1.5 rounded-xl bg-zinc-50 border border-zinc-100/50 hover:bg-white transition-all group animate-in slide-in-from-right-4 duration-300">
                  <div className="w-11 h-11 rounded-lg bg-zinc-200 overflow-hidden flex-shrink-0 shadow-sm border border-zinc-100">
                    {item.gambar ? (
                      <img src={item.gambar} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold text-[10px]">
                        {getInitials(item.nama)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-zinc-800 truncate leading-none uppercase tracking-tight">{item.nama}</h4>
                  </div>

                  <div className="flex-shrink-0 text-right px-1">
                    <p className="text-primary font-black text-xs tracking-tighter">Rp {(item.hargaJual * item.quantity).toLocaleString("id-ID")}</p>
                  </div>

                  <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-0.5 gap-1.5 shadow-sm">
                    <button 
                      onClick={() => updateQuantity(item.id!, -1)}
                      className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-primary cursor-pointer"
                    >
                      <i className="fa-solid fa-minus text-[8px]"></i>
                    </button>
                    <span className="text-[10px] font-black text-zinc-700 w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id!, 1)}
                      className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-primary cursor-pointer"
                    >
                      <i className="fa-solid fa-plus text-[8px]"></i>
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id!)}
                    className="w-7 h-7 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer flex-shrink-0"
                    title="Hapus"
                  >
                    <i className="fa-solid fa-trash-can text-[11px]"></i>
                  </button>
                </div>
              ))
            )}
          </div>

          <footer className="p-4 bg-white border-t border-zinc-100 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] pb-24 lg:pb-4">
            <div className="space-y-2 text-center">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-3">Metode Pembayaran</p>
              <div className="flex gap-2">
                {["QRIS", "Tunai", "Transfer", "Hutang"].map((method: string) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method as any)}
                    className={`flex-1 py-3 rounded-xl text-[9px] font-black border transition-all cursor-pointer uppercase tracking-wider ${
                      paymentMethod === method
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 -translate-y-0.5"
                        : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-200"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center text-zinc-500 font-bold text-[10px] uppercase tracking-widest px-1">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              {ppnPercentage > 0 && (
                <div className="flex justify-between items-center text-zinc-500 font-bold text-[10px] uppercase tracking-widest px-1">
                  <span>PPN ({ppnPercentage}%)</span>
                  <span>Rp {ppnAmount.toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center bg-zinc-50 border border-zinc-100 p-3 rounded-2xl mb-4">
              <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Total Bayar</span>
              <span className="text-2xl font-black text-primary">Rp {grandTotal.toLocaleString("id-ID")}</span>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer ${
                cart.length === 0
                  ? "bg-zinc-100 text-zinc-300 shadow-none"
                  : "bg-primary text-white hover:bg-primary/90 shadow-primary/30"
              }`}
            >
              <span className="uppercase tracking-widest">PROSES PEMBAYARAN</span>
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </footer>
        </div>
      </div>

      {/* Checkout Success Modal and Thermal Receipt Wrapper */}
      {isCheckoutModalOpen && lastTransaction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:static print:block print:p-0 print:bg-white">
          
          {/* Backdrop (hidden during print) */}
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm print:hidden" onClick={() => setIsCheckoutModalOpen(false)}></div>
          
          {/* Visual UI Modal (hidden during print) */}
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 print:hidden">
            <header className="bg-emerald-500 text-white p-6 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/30">
                <i className="fa-solid fa-check text-3xl"></i>
              </div>
              <h2 className="text-2xl font-black mb-1">Transaksi Berhasil!</h2>
              <p className="text-emerald-50 text-sm font-medium">Pembayaran telah diterima</p>
            </header>

            <div className="p-6 flex flex-col gap-6">
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  <span>Produk</span>
                  <span>Total</span>
                </div>
                <div className="space-y-2 border-y border-zinc-100 py-3">
                  {lastTransaction.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-zinc-600 font-medium">{item.quantity}x {item.nama}</span>
                      <span className="text-zinc-800 font-bold">Rp {(item.hargaJual * item.quantity).toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                </div>
                {lastTransaction.ppn > 0 && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-zinc-500">PPN ({settings?.ppnDefault}%)</span>
                    <span className="text-sm font-bold text-zinc-800">Rp {lastTransaction.ppn.toLocaleString("id-ID")}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                  <span className="text-lg font-bold text-zinc-900">Total Bayar</span>
                  <span className="text-2xl font-black text-primary">Rp {lastTransaction.total.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-zinc-100">
                  <span className="text-sm font-bold text-zinc-500">Metode</span>
                  <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-lg uppercase tracking-wider">{lastTransaction.paymentMethod}</span>
                </div>
              </div>

                <button
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 cursor-pointer"
                >
                  TRANSAKSI BARU
                </button>
            </div>
          </div>

          {/* Thermal Receipt Print Out (ONLY visible on print) */}
          <div className="hidden print:block w-full max-w-[80mm] text-black font-mono text-xs leading-tight bg-white text-left p-2">
            <div className="text-center mb-4 uppercase">
              <img 
                src={settings?.logo || "/logo.webp"} 
                alt="Logo Toko" 
                className="w-16 h-16 object-contain mx-auto mb-2 grayscale"
              />
              <h2 className="font-bold text-lg leading-tight mb-1">{settings?.nama || "Toko Nootain"}</h2>
              {settings?.alamat && <p className="whitespace-pre-wrap">{settings.alamat}</p>}
              {settings?.noHp && <p>Telp: {settings.noHp}</p>}
            </div>

            <div className="mb-3 text-xs border-y border-dashed border-black py-2">
              <p>WAKTU : {new Date(lastTransaction.timestamp).toLocaleString("id-ID", { dateStyle: 'short', timeStyle: 'short' })}</p>
              <p>METODE: {lastTransaction.paymentMethod}</p>
            </div>

            <table className="w-full text-left mb-3 text-xs">
              <tbody>
                {lastTransaction.items.map((item: any) => (
                  <tr key={item.id} className="align-top">
                    <td className="py-1">
                      <div className="uppercase">{item.nama}</div>
                      <div>{item.quantity} x {item.hargaJual.toLocaleString("id-ID")}</div>
                    </td>
                    <td className="py-1 text-right align-bottom">
                      {(item.quantity * item.hargaJual).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-black pt-2 text-xs mb-6">
              <div className="flex justify-between items-center mb-1">
                <span>SUBTOTAL</span>
                <span>{lastTransaction.subtotal?.toLocaleString("id-ID") || lastTransaction.total.toLocaleString("id-ID")}</span>
              </div>
              {(lastTransaction.ppn || 0) > 0 && (
                <div className="flex justify-between items-center mb-1">
                  <span>PPN ({settings?.ppnDefault}%)</span>
                  <span>{lastTransaction.ppn.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-bold text-sm mt-2 pt-1 border-t border-dashed border-black">
                <span>TOTAL</span>
                <span>{lastTransaction.total.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="text-center mt-4 text-xs uppercase">
              <p>Terima Kasih</p>
              <p>Atas Kunjungan Anda</p>
            </div>
            
            <div className="text-center mt-6 text-[10px] text-zinc-500 uppercase opacity-50">
                <p>POWERED BY NOOTAIN.ID</p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default KasirPage;
