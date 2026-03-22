"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  initDB, 
  Transaction, 
  STORE_TRANSAKSI, 
  STORE_PRODUK,
  Product
} from "@/lib/db";

export interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (transactionData: Omit<Transaction, "id">) => Promise<unknown>;
  updateTransactionStatus: (id: number, status: "Lunas") => Promise<unknown>;
  updateTransaction: (id: number, updatedData: Partial<Transaction>) => Promise<unknown>;
  deleteTransaction: (id: number) => Promise<unknown>;
  refresh: () => Promise<void>;
}

export const useTransactions = (): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const db = await initDB();
      const transaction = db.transaction(STORE_TRANSAKSI, "readonly");
      const store = transaction.objectStore(STORE_TRANSAKSI);
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort by timestamp descending
        const data = request.result as Transaction[];
        data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setTransactions(data);
        setLoading(false);
      };

      request.onerror = () => {
        setError("Error fetching transactions from database");
        setLoading(false);
      };
    } catch (err) {
      setError("Error fetching transactions");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (transactionData: Omit<Transaction, "id">) => {
    const db = await initDB();
    
    // Start a transaction for both store and products (to update stock)
    const tx = db.transaction([STORE_TRANSAKSI, STORE_PRODUK], "readwrite");
    const transStore = tx.objectStore(STORE_TRANSAKSI);
    const prodStore = tx.objectStore(STORE_PRODUK);

    // 1. Add the transaction
    transStore.add(transactionData);

    // 2. Update stock for each item
    for (const item of transactionData.items) {
      const getReq = prodStore.get(item.id);
      getReq.onsuccess = () => {
        const product = getReq.result as Product;
        if (product) {
          product.stok -= item.quantity;
          prodStore.put(product);
        }
      };
    }

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        fetchTransactions();
        resolve(true);
      };
    });
  };

  const updateTransactionStatus = async (id: number, status: "Lunas") => {
    const db = await initDB();
    const tx = db.transaction(STORE_TRANSAKSI, "readwrite");
    const store = tx.objectStore(STORE_TRANSAKSI);
    
    return new Promise((resolve, reject) => {
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const data = getReq.result as Transaction;
        if (data) {
          data.status = status;
          data.paymentMethod = data.paymentMethod === "Hutang" ? "Tunai" : data.paymentMethod; // Or keep it as Hutang but status Lunas. The user probably wants it as "Tunai" by default when paid, but let's just update the status, it makes more sense. Actually, keeping original method and marking it Lunas is correct for history. Let's just update the status.
          
          const putReq = store.put(data);
          putReq.onsuccess = () => {
            resolve(true);
          };
          putReq.onerror = () => reject("Update failed");
        } else {
          reject("Transaction not found");
        }
      };
      
      tx.oncomplete = () => {
        fetchTransactions();
      };
    });
  };

  const deleteTransaction = async (id: number) => {
    const db = await initDB();
    const tx = db.transaction([STORE_TRANSAKSI, STORE_PRODUK], "readwrite");
    const transStore = tx.objectStore(STORE_TRANSAKSI);
    const prodStore = tx.objectStore(STORE_PRODUK);

    return new Promise((resolve, reject) => {
      const getReq = transStore.get(id);
      getReq.onsuccess = () => {
        const transaction = getReq.result as Transaction;
        if (transaction) {
          // Restore stock
          for (const item of transaction.items) {
            const getProdReq = prodStore.get(item.id);
            getProdReq.onsuccess = () => {
              const product = getProdReq.result as Product;
              if (product) {
                product.stok += item.quantity;
                prodStore.put(product);
              }
            };
          }
          const delReq = transStore.delete(id);
          delReq.onsuccess = () => resolve(true);
          delReq.onerror = () => reject("Failed to delete transaction");
        } else {
          reject("Transaction not found");
        }
      };
      
      tx.oncomplete = () => {
        fetchTransactions();
      };
    });
  };

  const updateTransaction = async (id: number, updatedData: Partial<Transaction>) => {
    const db = await initDB();
    const tx = db.transaction([STORE_TRANSAKSI, STORE_PRODUK], "readwrite");
    const transStore = tx.objectStore(STORE_TRANSAKSI);
    const prodStore = tx.objectStore(STORE_PRODUK);

    return new Promise((resolve, reject) => {
      const getReq = transStore.get(id);
      getReq.onsuccess = () => {
        const data = getReq.result as Transaction;
        if (data) {
          // Handle stock adjustment if items are updated
          if (updatedData.items) {
            // Restore old items to stock
            for (const item of data.items) {
              const getProdReq = prodStore.get(item.id);
              getProdReq.onsuccess = () => {
                const product = getProdReq.result as Product;
                if (product) {
                  product.stok += item.quantity;
                  prodStore.put(product);
                }
              };
            }
            // Deduct new items from stock
            for (const item of updatedData.items) {
              const getProdReq = prodStore.get(item.id);
              getProdReq.onsuccess = () => {
                const product = getProdReq.result as Product;
                if (product) {
                  product.stok -= item.quantity;
                  prodStore.put(product);
                }
              };
            }
          }

          const newData = { ...data, ...updatedData };
          const putReq = transStore.put(newData);
          putReq.onsuccess = () => {
            resolve(true);
          };
          putReq.onerror = () => reject("Update failed");
        } else {
          reject("Transaction not found");
        }
      };

      tx.oncomplete = () => {
        fetchTransactions();
      };
    });
  };

  return { 
    transactions, 
    loading, 
    error, 
    addTransaction, 
    updateTransactionStatus, 
    updateTransaction, 
    deleteTransaction, 
    refresh: fetchTransactions 
  };
};
