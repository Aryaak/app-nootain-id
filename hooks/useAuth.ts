"use client";

import { useAuthContext } from "./useAuthContext";

export function useAuth() {
  return useAuthContext();
}
