"use client";

import { Product, Category } from "./types";

export const CATEGORY_LITERALS = {
  FNB: "Makanan & Minuman (FnB)",
  RETAIL: "Toko Kelontong / Sembako",
};

export const DEFAULT_DATA_MAP: Record<string, { categories: Omit<Category, "id">[]; products: Omit<Product, "id">[] }> = {
  [CATEGORY_LITERALS.FNB]: {
    categories: [
      { nama: "Nasi" },
      { nama: "Kopi" },
      { nama: "Camilan" }
    ],
    products: [
      { nama: "Nasi Kari", gambar: "/makanan-minuman-fnb/1.webp", stok: 50, modal: 15000, hargaJual: 25000, kategori: "Nasi" },
      { nama: "Nasi Ayam Kecap", gambar: "/makanan-minuman-fnb/2.webp", stok: 50, modal: 12000, hargaJual: 22000, kategori: "Nasi" },
      { nama: "Nasi Goreng Seafood", gambar: "/makanan-minuman-fnb/3.webp", stok: 50, modal: 18000, hargaJual: 30000, kategori: "Nasi" },
      { nama: "Cappucino", gambar: "/makanan-minuman-fnb/4.webp", stok: 100, modal: 10000, hargaJual: 18000, kategori: "Kopi" },
      { nama: "Espresso", gambar: "/makanan-minuman-fnb/5.webp", stok: 100, modal: 8000, hargaJual: 15000, kategori: "Kopi" },
      { nama: "Americano", gambar: "/makanan-minuman-fnb/6.webp", stok: 100, modal: 7000, hargaJual: 12000, kategori: "Kopi" },
      { nama: "Cookies", gambar: "/makanan-minuman-fnb/7.webp", stok: 40, modal: 5000, hargaJual: 10000, kategori: "Camilan" },
      { nama: "Kentang Goreng", gambar: "/makanan-minuman-fnb/8.webp", stok: 30, modal: 8000, hargaJual: 15000, kategori: "Camilan" },
      { nama: "Toast", gambar: "/makanan-minuman-fnb/9.webp", stok: 20, modal: 10000, hargaJual: 20000, kategori: "Camilan" }
    ]
  },
  [CATEGORY_LITERALS.RETAIL]: {
    categories: [
      { nama: "Mie" },
      { nama: "Kopi" },
      { nama: "Beras" }
    ],
    products: [
      { nama: "Indomie Goreng", gambar: "/toko-kelontong-sembako/1.webp", stok: 100, modal: 2500, hargaJual: 3100, kategori: "Mie" },
      { nama: "Indomie Kari Ayam", gambar: "/toko-kelontong-sembako/2.webp", stok: 100, modal: 2500, hargaJual: 3100, kategori: "Mie" },
      { nama: "Indomie Goreng Rendang", gambar: "/toko-kelontong-sembako/3.webp", stok: 100, modal: 2600, hargaJual: 3200, kategori: "Mie" },
      { nama: "Kopi ABC Susu Sachet", gambar: "/toko-kelontong-sembako/4.webp", stok: 100, modal: 1200, hargaJual: 1500, kategori: "Kopi" },
      { nama: "Kopi Luwak White Koffie Sachet", gambar: "/toko-kelontong-sembako/5.webp", stok: 100, modal: 1300, hargaJual: 1500, kategori: "Kopi" },
      { nama: "Kopi Kapal APi Schet", gambar: "/toko-kelontong-sembako/6.webp", stok: 100, modal: 1200, hargaJual: 1500, kategori: "Kopi" },
      { nama: "Beras Sania 2.5kg", gambar: "/toko-kelontong-sembako/7.webp", stok: 50, modal: 35000, hargaJual: 38000, kategori: "Beras" },
      { nama: "Beras Sumo 3kg", gambar: "/toko-kelontong-sembako/8.webp", stok: 50, modal: 42000, hargaJual: 46000, kategori: "Beras" },
      { nama: "Beras Sunmi 5kg", gambar: "/toko-kelontong-sembako/9.webp", stok: 50, modal: 70000, hargaJual: 75000, kategori: "Beras" }
    ]
  }
};
