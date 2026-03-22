"use client";

import { DEFAULT_DATA_MAP } from "./seeder";

import { 
  Product, 
  Category, 
  Transaction, 
  TransactionItem, 
  User, 
  StoreSettings 
} from "./types";

export type { Product, Category, Transaction, TransactionItem, User, StoreSettings };

export const DB_NAME = "NootainDB";
export const STORE_PRODUK = "produk";
export const STORE_KATEGORI = "kategori";
export const STORE_TRANSAKSI = "transaksi";
export const STORE_PENGATURAN = "pengaturan";
export const STORE_USERS = "users";
export const STORE_MEMBERSHIP = "membership";
export const DB_VERSION = 6;

let dbPromise: Promise<IDBDatabase> | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  if (typeof window === "undefined") return Promise.reject("Window is undefined");
  
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_PRODUK)) {
          db.createObjectStore(STORE_PRODUK, { keyPath: "id", autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains(STORE_KATEGORI)) {
          db.createObjectStore(STORE_KATEGORI, { keyPath: "id", autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains(STORE_TRANSAKSI)) {
          db.createObjectStore(STORE_TRANSAKSI, { keyPath: "id", autoIncrement: true });
        }

        if (!db.objectStoreNames.contains(STORE_PENGATURAN)) {
          db.createObjectStore(STORE_PENGATURAN, { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains(STORE_USERS)) {
          db.createObjectStore(STORE_USERS, { keyPath: "id", autoIncrement: true });
        }

        if (!db.objectStoreNames.contains(STORE_MEMBERSHIP)) {
          db.createObjectStore(STORE_MEMBERSHIP, { keyPath: "email" });
        }
      };


      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onblocked = () => {
        console.warn("IndexedDB open blocked. Please close other tabs.");
        // We can't do much here, but at least we log it.
      };

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error);
        dbPromise = null; 
        reject("Failed to open IndexedDB");
      };
    });
  }
  return dbPromise;
};


export const seedByCategory = async (category: string) => {
  const db = await initDB();
  const seedData = DEFAULT_DATA_MAP[category];
  
  if (!seedData) return false;

  return new Promise((resolve) => {
    const tx = db.transaction([STORE_KATEGORI, STORE_PRODUK], "readwrite");
    const catStore = tx.objectStore(STORE_KATEGORI);
    const prodStore = tx.objectStore(STORE_PRODUK);

    // Clear existing stores to ensure the correct data set is used
    catStore.clear();
    prodStore.clear();

    seedData.categories.forEach(c => catStore.add(c));
    seedData.products.forEach(p => prodStore.add(p));

    tx.oncomplete = () => {
      localStorage.setItem("nootain_db_seeded", "true");
      resolve(true);
    };
    tx.onerror = () => resolve(false);
  });
};

// Membership Helper Functions
export const saveMembership = async (data: any) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEMBERSHIP, "readwrite");
    const store = tx.objectStore(STORE_MEMBERSHIP);
    const request = store.put(data);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

export const getMembership = async (email: string): Promise<any | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEMBERSHIP, "readonly");
    const store = tx.objectStore(STORE_MEMBERSHIP);
    const request = store.get(email);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

