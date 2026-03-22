"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  initDB, 
  StoreSettings, 
  STORE_PENGATURAN 
} from "@/lib/db";

const DEFAULT_SETTINGS: StoreSettings = {
  id: 1,
  nama: "",
  alamat: "",
  noHp: "",
  ppnDefault: 0,
  cetakBarcode: false,
};

// --- GLOBAL STATE UNTUK REAKTIVITAS ANTAR KOMPONEN ---
let cachedSettings: StoreSettings | null = null;
let isFetching = false;
let globalError: string | null = null;
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

const fetchSettingsGlobal = async () => {
  if (isFetching) return;
  isFetching = true;
  try {
    const db = await initDB();
    const transaction = db.transaction(STORE_PENGATURAN, "readonly");
    const store = transaction.objectStore(STORE_PENGATURAN);
    const request = store.get(1);

    request.onsuccess = () => {
      cachedSettings = request.result || DEFAULT_SETTINGS;
      globalError = null;
      isFetching = false;
      notifyListeners();
    };

    request.onerror = () => {
      globalError = "Error fetching settings from database";
      isFetching = false;
      notifyListeners();
    };
  } catch (err) {
    globalError = "Error initializing database";
    isFetching = false;
    notifyListeners();
  }
};

// Eksekusi pengambilan data (fetch) pertama kali saat dimuat di browser
if (typeof window !== "undefined") {
  fetchSettingsGlobal();
}

export const useSettings = () => {
  const [settings, setSettings] = useState<StoreSettings>(cachedSettings || DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(!cachedSettings);
  const [error, setError] = useState<string | null>(globalError);

  useEffect(() => {
    // Jika data belum ada dan belum proses fetch, jalankan ulang
    if (!cachedSettings && !isFetching && typeof window !== "undefined") {
      fetchSettingsGlobal();
    }

    const listener = () => {
      setSettings(cachedSettings || DEFAULT_SETTINGS);
      setLoading(false);
      setError(globalError);
    };

    listeners.add(listener);
    // Jalankan listener sekali untuk sinkronisasi state yang mungkin terupdate saat initial render
    listener();

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const updateSettings = async (newSettings: Omit<StoreSettings, "id">) => {
    const db = await initDB();
    const transaction = db.transaction(STORE_PENGATURAN, "readwrite");
    const store = transaction.objectStore(STORE_PENGATURAN);
    
    const settingsToSave = { ...newSettings, id: 1 };
    store.put(settingsToSave);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        // Update cache global dan beritahu seluruh komponen
        cachedSettings = settingsToSave as StoreSettings;
        notifyListeners();
        resolve(true);
      };
      transaction.onerror = () => {
        reject("Error saving settings");
      };
    });
  };

  const refresh = useCallback(() => {
    fetchSettingsGlobal();
  }, []);

  return { settings, loading, error, updateSettings, refresh };
};
