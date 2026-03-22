export interface Product {
  id?: number;
  nama: string;
  gambar: string; // base64 or path
  stok: number;
  modal: number;
  hargaJual: number;
  kategori?: string;
}

export interface Category {
  id?: number;
  nama: string;
}

export interface TransactionItem {
  id: number;
  nama: string;
  quantity: number;
  hargaJual: number;
  modal: number;
}

export interface Transaction {
  id?: number;
  timestamp: string;
  items: TransactionItem[];
  subtotal?: number;
  ppn?: number;
  total: number;
  totalModal: number;
  paymentMethod: "QRIS" | "Tunai" | "Transfer" | "Hutang";
  status?: "Lunas" | "Hutang";
}

export interface User {
  id?: number;
  email: string;
  password: string;
  nama: string;
}

export interface StoreSettings {
  id: number;
  logo?: string;
  nama: string;
  alamat: string;
  noHp: string;
  ppnDefault: number;
  cetakBarcode: boolean;
}
