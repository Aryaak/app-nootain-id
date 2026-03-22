"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { saveMembership, getMembership, seedByCategory } from "@/lib/db";
import { CATEGORY_LITERALS } from "@/lib/seeder";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    nama: string;
    category: string;
    email: string;
    password: string;
    plan: string;
    expired_at: string;
  }) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const storedUser = localStorage.getItem("nootain_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Sync to IndexedDB for offline resilience
        saveMembership(parsedUser).catch(console.error);
      } catch (e) {
        localStorage.removeItem("nootain_user");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("memberships")
        .select("uuid, email, name, category, plan, expired_at")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (error || !data) {
        return false;
      }

      const userData = { ...data };
      localStorage.setItem("nootain_user", JSON.stringify(userData));
      await saveMembership(userData);
      
      // Seed if category is FnB or Retail
      if (userData.category === CATEGORY_LITERALS.FNB || userData.category === CATEGORY_LITERALS.RETAIL) {
        await seedByCategory(userData.category);
      }

      setUser(userData);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (data: {
    nama: string;
    category: string;
    email: string;
    password: string;
    plan: string;
    expired_at: string;
  }): Promise<boolean> => {
    try {
      const { data: result, error } = await supabase
        .from("memberships")
        .insert([
          {
            name: data.nama,
            category: data.category,
            email: data.email,
            password: data.password,
            plan: data.plan,
            expired_at: data.expired_at,
          },
        ])
        .select()
        .single();

      if (error || !result) {
        console.error("Register error:", error);
        return false;
      }

      const userData = { ...result };
      localStorage.setItem("nootain_user", JSON.stringify(userData));
      await saveMembership(userData);

      // Seed if category is FnB or Retail
      if (userData.category === CATEGORY_LITERALS.FNB || userData.category === CATEGORY_LITERALS.RETAIL) {
        await seedByCategory(userData.category);
      }

      setUser(userData);
      return true;
    } catch (error) {
      console.error("Register catch error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("nootain_user");
    setUser(null);
    window.location.href = "/login";
  };

  const refreshUser = async () => {
    if (!user?.email) return;
    
    try {
      const { data, error } = await supabase
        .from("memberships")
        .select("uuid, email, name, category, plan, expired_at")
        .eq("email", user.email)
        .single();

      if (!error && data) {
        localStorage.setItem("nootain_user", JSON.stringify(data));
        await saveMembership(data);
        setUser(data);
      } else if (error) {
        // If offline or error, try to load from IndexedDB
        const localData = await getMembership(user.email);
        if (localData) {
          setUser(localData);
        }
      }
    } catch (error) {
      console.error("Refresh user error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
