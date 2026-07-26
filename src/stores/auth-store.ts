"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthAccount {
  uid: number;
  username: string;
  firstName: string;
  lastName: string;
  lang: string;
}

interface AuthState {
  accessToken: string | null;
  account: AuthAccount | null;
  selectedClientId: string | null;
  selectedBranchId: string | null;

  isAuthenticated: () => boolean;
  login: (accessToken: string, account: AuthAccount) => void;
  logout: () => void;
  setSelectedClient: (clientId: string | null) => void;
  setSelectedBranch: (branchId: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      account: null,
      selectedClientId: null,
      selectedBranchId: null,

      isAuthenticated: () => !!get().accessToken,

      login: (accessToken, account) => {
        set({ accessToken, account });
      },

      logout: () => {
        set({
          accessToken: null,
          account: null,
          selectedClientId: null,
          selectedBranchId: null,
        });
      },

      setSelectedClient: (clientId) => {
        set({ selectedClientId: clientId });
      },

      setSelectedBranch: (branchId) => {
        set({ selectedBranchId: branchId });
      },
    }),
    {
      name: "kds-session",
    }
  )
);
