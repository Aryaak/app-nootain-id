"use client";

import { useState, useEffect, useCallback } from "react";

import { 
  initDB, 
  STORE_PRODUK, 
  STORE_KATEGORI 
} from "@/lib/db";
import { Product, Category } from "@/lib/types";

export type { Product, Category };

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const db = await initDB();
      const transaction = db.transaction(STORE_PRODUK, "readonly");
      const store = transaction.objectStore(STORE_PRODUK);
      const request = store.getAll();

      request.onsuccess = () => {
        setProducts(request.result);
        setLoading(false);
      };

      request.onerror = () => {
        setError("Error fetching products from database");
        setLoading(false);
      };
    } catch (err) {
      setError("Error fetching products");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (product: Omit<Product, "id">) => {
    const db = await initDB();
    const transaction = db.transaction(STORE_PRODUK, "readwrite");
    const store = transaction.objectStore(STORE_PRODUK);
    store.add(product);
    return new Promise((resolve) => {
      transaction.oncomplete = () => {
        fetchProducts();
        resolve(true);
      };
    });
  };

  const updateProduct = async (product: Product) => {
    const db = await initDB();
    const transaction = db.transaction(STORE_PRODUK, "readwrite");
    const store = transaction.objectStore(STORE_PRODUK);
    store.put(product);
    return new Promise((resolve) => {
      transaction.oncomplete = () => {
        fetchProducts();
        resolve(true);
      };
    });
  };

  const deleteProduct = async (id: number) => {
    const db = await initDB();
    const transaction = db.transaction(STORE_PRODUK, "readwrite");
    const store = transaction.objectStore(STORE_PRODUK);
    store.delete(id);
    return new Promise((resolve) => {
      transaction.oncomplete = () => {
        fetchProducts();
        resolve(true);
      };
    });
  };

  return { products, loading, error, addProduct, updateProduct, deleteProduct, refresh: fetchProducts };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const db = await initDB();
      const transaction = db.transaction(STORE_KATEGORI, "readonly");
      const store = transaction.objectStore(STORE_KATEGORI);
      const request = store.getAll();

      request.onsuccess = () => {
        setCategories(request.result);
        setLoading(false);
      };

      request.onerror = () => {
        setError("Error fetching categories from database");
        setLoading(false);
      };
    } catch (err) {
      setError("Error fetching categories");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (category: Omit<Category, "id">) => {
    const db = await initDB();
    const transaction = db.transaction(STORE_KATEGORI, "readwrite");
    const store = transaction.objectStore(STORE_KATEGORI);
    store.add(category);
    return new Promise((resolve) => {
      transaction.oncomplete = () => {
        fetchCategories();
        resolve(true);
      };
    });
  };

  const updateCategory = async (category: Category) => {
    const db = await initDB();
    const transaction = db.transaction(STORE_KATEGORI, "readwrite");
    const store = transaction.objectStore(STORE_KATEGORI);
    store.put(category);
    return new Promise((resolve) => {
      transaction.oncomplete = () => {
        fetchCategories();
        resolve(true);
      };
    });
  };

  const deleteCategory = async (id: number) => {
    const db = await initDB();
    const transaction = db.transaction(STORE_KATEGORI, "readwrite");
    const store = transaction.objectStore(STORE_KATEGORI);
    store.delete(id);
    return new Promise((resolve) => {
      transaction.oncomplete = () => {
        fetchCategories();
        resolve(true);
      };
    });
  };

  return { categories, loading, error, addCategory, updateCategory, deleteCategory, refresh: fetchCategories };
};
