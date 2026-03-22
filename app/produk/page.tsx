"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import toast from "react-hot-toast";
import { useProducts, Product, useCategories, Category } from "@/hooks/useProducts";

const ProdukPage = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories, loading: loadingCategories, addCategory, updateCategory, deleteCategory } = useCategories();
  
  const [activeTab, setActiveTab] = useState<"produk" | "kategori">("produk");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [searchCategoryQuery, setSearchCategoryQuery] = useState("");

  const [formData, setFormData] = useState<Omit<Product, "id">>({
    nama: "",
    gambar: "",
    stok: "" as unknown as number,
    modal: "" as unknown as number,
    hargaJual: "" as unknown as number,
    kategori: "",
  });

  const handleOpenCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.nama);
    } else {
      setEditingCategory(null);
      setCategoryName("");
    }
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      await updateCategory({ id: editingCategory.id, nama: categoryName });
      toast.success("Kategori berhasil diperbarui!");
    } else {
      await addCategory({ nama: categoryName });
      toast.success("Kategori baru ditambahkan!");
    }
    handleCloseCategoryModal();
  };

  const formatNumber = (val: number | string) => {
    if (val === "" || val === null || val === undefined) return "";
    return Number(val).toLocaleString("id-ID");
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const handleNumberChange = (field: "stok" | "modal" | "hargaJual", value: string) => {
    const rawValue = value.replace(/\D/g, "");
    setFormData({ ...formData, [field]: rawValue === "" ? ("" as unknown as number) : Number(rawValue) });
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product, kategori: product.kategori || "" });
    } else {
      setEditingProduct(null);
      setFormData({
        nama: "",
        gambar: "",
        stok: "" as unknown as number,
        modal: "" as unknown as number,
        hargaJual: "" as unknown as number,
        kategori: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, gambar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sanitizedData = {
      ...formData,
      stok: (formData.stok as unknown as string) === "" ? 0 : Number(formData.stok),
      modal: (formData.modal as unknown as string) === "" ? 0 : Number(formData.modal),
      hargaJual: (formData.hargaJual as unknown as string) === "" ? 0 : Number(formData.hargaJual),
    };

    if (editingProduct) {
      await updateProduct({ ...sanitizedData, id: editingProduct.id });
      toast.success("Produk berhasil diperbarui!");
    } else {
      await addProduct(sanitizedData);
      toast.success("Produk baru berhasil ditambahkan!");
    }
    handleCloseModal();
  };

  const filteredProducts = products.filter((p) =>
    p.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories.filter((c) =>
    c.nama.toLowerCase().includes(searchCategoryQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Produk">
      <div className="flex flex-col gap-6 mx-5">
        {/* Tabs */}
        <div className="flex bg-white rounded-2xl p-1 border border-zinc-200 shadow-sm w-full">
          <button
            onClick={() => setActiveTab("produk")}
            className={`cursor-pointer flex-1 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === "produk"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Daftar Produk
          </button>
          <button
            onClick={() => setActiveTab("kategori")}
            className={`cursor-pointer flex-1 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === "kategori"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Daftar Kategori
          </button>
        </div>

        {activeTab === "produk" ? (
          <>
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm transition-all duration-300">
          <div className="relative flex-1 max-w-md">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>
            <input
              type="text"
              placeholder="Cari produk..."
              className="text-black w-full pl-11 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <i className="fa-solid fa-plus"></i>
            Tambah Produk
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {loading ? (
            <div className="col-span-full py-20 text-center text-zinc-400">
               <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-4 text-primary"></i>
               <p>Memuat data produk...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-zinc-300">
               <i className="fa-solid fa-box-open text-5xl mb-4 text-zinc-200"></i>
               <p className="text-zinc-500 font-medium">Belum ada produk atau hasil tidak ditemukan.</p>
               <button 
                  onClick={() => handleOpenModal()}
                  className="mt-4 text-primary font-bold hover:underline cursor-pointer"
                >
                  Tambah produk baru sekarang
               </button>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group bg-white rounded-2xl border border-zinc-200 p-3 sm:p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden relative flex flex-col"
              >
                <div className="aspect-square rounded-xl bg-zinc-100 mb-4 overflow-hidden relative">
                  {product.gambar ? (
                    <img src={product.gambar} alt={product.nama} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-4xl tracking-widest">
                      {getInitials(product.nama)}
                    </div>
                  )}
                  <div className="hidden lg:flex absolute top-2 right-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenModal(product)}
                      className="w-8 h-8 rounded-lg text-white/90 backdrop-blur shadow-sm bg-primary flex items-center justify-center hover:bg-white hover:text-primary transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button 
                      onClick={() => setProductToDelete(product)}
                      className="w-8 h-8 rounded-lg bg-red-500/90 backdrop-blur shadow-sm text-white flex items-center justify-center hover:bg-white hover:text-red-500  transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1 h-4">
                    {product.kategori && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-md">
                        {product.kategori}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-zinc-900 mb-2 truncate">{product.nama}</h3>
                  <div className="flex flex-col gap-1 mt-auto">
                    <div>
                      <p className="text-[10px] text-zinc-400 font-medium">Harga Jual</p>
                      <p className="text-base sm:text-lg font-black text-primary truncate">Rp {product.hargaJual.toLocaleString("id-ID")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 font-medium">Harga Modal</p>
                      <p className="text-xs font-bold text-zinc-600 truncate">Rp {product.modal.toLocaleString("id-ID")}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-zinc-400 font-medium">Stok</p>
                       <p className={`text-sm font-bold ${product.stok < 10 ? 'text-orange-500' : 'text-zinc-600'}`}>{product.stok.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                  
                  {/* Mobile Footer Actions */}
                  <div className="flex flex-col sm:flex-row lg:hidden gap-1.5 sm:gap-2 w-full pt-3 border-t border-zinc-100 mt-auto">
                    <button 
                      onClick={() => handleOpenModal(product)}
                      className="flex-1 py-1.5 rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-pen"></i> Edit
                    </button>
                    <button 
                      onClick={() => setProductToDelete(product)}
                      className="flex-1 py-1.5 rounded-md text-red-500 bg-red-50 hover:bg-red-100 transition-colors text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-trash"></i> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
          </>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm transition-all duration-300">
              <div className="relative flex-1 max-w-md">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                <input
                  type="text"
                  placeholder="Cari kategori..."
                  className="text-black w-full pl-11 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  value={searchCategoryQuery}
                  onChange={(e) => setSearchCategoryQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() => handleOpenCategoryModal()}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <i className="fa-solid fa-plus"></i>
                Tambah Kategori
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {loadingCategories ? (
                <div className="col-span-full py-20 text-center text-zinc-400">
                  <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-4 text-primary"></i>
                  <p>Memuat kategori...</p>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-zinc-300">
                  <i className="fa-solid fa-layer-group text-5xl mb-4 text-zinc-200"></i>
                  <p className="text-zinc-500 font-medium">Belum ada kategori atau hasil tidak ditemukan.</p>
                  <button 
                    onClick={() => handleOpenCategoryModal()}
                    className="mt-4 text-primary font-bold hover:underline cursor-pointer"
                  >
                    Tambah kategori baru sekarang
                  </button>
                </div>
              ) : (
                filteredCategories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="group bg-white rounded-2xl border border-zinc-200 p-2 sm:p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between min-h-[90px] sm:min-h-[120px]"
                  >
                    <div className="hidden lg:flex absolute top-3 right-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="w-8 h-8 rounded-lg bg-zinc-100 text-primary flex items-center justify-center hover:bg-zinc-200 transition-colors cursor-pointer"
                      >
                        <i className="fa-solid fa-pen text-xs"></i>
                      </button>
                      <button 
                        onClick={() => setCategoryToDelete(cat)}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center mb-2 lg:mb-0">
                      <h3 className="font-bold text-sm sm:text-xl text-zinc-900 text-center line-clamp-2">{cat.nama}</h3>
                    </div>
                    
                    {/* Mobile Footer Actions */}
                    <div className="flex flex-col sm:flex-row lg:hidden gap-1.5 sm:gap-2 w-full pt-3 border-t border-zinc-100 mt-auto">
                      <button 
                        onClick={() => handleOpenCategoryModal(cat)}
                        className="w-full sm:flex-1 py-1.5 rounded-md text-primary bg-primary/10 hover:bg-primary/20 transition-colors text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-pen"></i> Edit
                      </button>
                      <button 
                        onClick={() => setCategoryToDelete(cat)}
                        className="w-full sm:flex-1 py-1.5 rounded-md text-red-500 bg-red-50 hover:bg-red-100 transition-colors text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-trash"></i> Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Category Delete Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setCategoryToDelete(null)}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">Hapus Kategori?</h2>
              <p className="text-zinc-500 text-sm">
                Apakah Anda yakin ingin menghapus <strong>{categoryToDelete.nama}</strong>? Produk dengan kategori ini tidak akan ikut terhapus namun nilainya akan menjadi kosong (opsional).
              </p>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 py-3 bg-zinc-100 text-zinc-700 rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteCategory(categoryToDelete.id!);
                  toast.success("Kategori berhasil dihapus!");
                  setCategoryToDelete(null);
                }}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setProductToDelete(null)}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">Hapus Produk?</h2>
              <p className="text-zinc-500 text-sm">
                Apakah Anda yakin ingin menghapus <strong>{productToDelete.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-3 bg-zinc-100 text-zinc-700 rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteProduct(productToDelete.id!);
                  toast.success("Produk berhasil dihapus!");
                  setProductToDelete(null);
                }}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal Form */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={handleCloseCategoryModal}></div>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
            <header className="p-6 border-b border-zinc-100 flex items-center justify-between bg-primary text-white">
              <h2 className="text-xl font-bold">{editingCategory ? "Edit Kategori" : "Tambah Kategori"}</h2>
              <button onClick={handleCloseCategoryModal} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </header>
            
            <form onSubmit={handleCategorySubmit} className="p-6 flex flex-col gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-zinc-700">Nama Kategori</label>
                <input
                  required
                  type="text"
                  className="text-black w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Contoh: Mie"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCloseCategoryModal}
                  className="flex-1 py-3 border border-zinc-200 text-zinc-600 rounded-xl font-bold hover:bg-zinc-50 transition-all active:scale-95 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
                >
                  {editingCategory ? "Simpan Perubahan" : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300">
            <header className="p-6 border-b border-zinc-100 flex items-center justify-between bg-primary text-white">
              <h2 className="text-xl font-bold">{editingProduct ? "Edit Produk" : "Tambah Produk"}</h2>
              <button onClick={handleCloseModal} className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </header>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Foto Produk</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-2xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden relative group">
                      {formData.gambar ? (
                        <img src={formData.gambar} className="w-full h-full object-cover" />
                      ) : (
                        <i className="fa-solid fa-camera text-2xl text-zinc-300"></i>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleImageChange}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-zinc-500 mb-2">Gunakan gambar yang jelas dengan format JPG, PNG, atau WEBP.</p>
                      <button type="button" className="text-xs font-bold text-primary hover:underline relative cursor-pointer">
                        Pilih Gambar
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleImageChange}
                        />
                      </button>
                    </div>
                  </div>
                </div>


                <div className="space-y-2">
                  <label className="block text-sm font-bold text-zinc-700">Nama Produk</label>
                  <input
                    required
                    type="text"
                    className="text-black w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Contoh: Indomie Goreng"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-zinc-700">Kategori (Opsional)</label>
                  <select
                    className="text-black w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={formData.kategori || ""}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  >
                    <option value="">Pilih Kategori...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.nama}>{cat.nama}</option>
                    ))}
                  </select>
                </div>

                {/* Stok, Modal, Harga Jual in 1 row */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-zinc-700">Stok</label>
                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      className="text-black w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      value={formatNumber(formData.stok)}
                      onChange={(e) => handleNumberChange("stok", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-zinc-700">Harga Modal</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">Rp</span>
                      <input
                        required
                        type="text"
                        inputMode="numeric"
                        className="text-black w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={formatNumber(formData.modal)}
                        onChange={(e) => handleNumberChange("modal", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-zinc-700">Harga Jual</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">Rp</span>
                      <input
                        required
                        type="text"
                        inputMode="numeric"
                        className="text-black w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={formatNumber(formData.hargaJual)}
                        onChange={(e) => handleNumberChange("hargaJual", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 border border-zinc-200 text-zinc-600 rounded-xl font-bold hover:bg-zinc-50 transition-all active:scale-95 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
                >
                  {editingProduct ? "Simpan" : "Simpan Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProdukPage;
