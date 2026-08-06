"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShopboxBranch } from "@/types/branch";
import type { ShopboxClient } from "@/types/client";

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
  selectedClientName: string | null;
  selectedClientIcon: string | null;
  selectedBranchId: string | null;
  selectedBranchName: string | null;

  isAuthenticated: () => boolean;
  login: (accessToken: string, account: AuthAccount) => void;
  logout: () => void;
  selectClient: (client: ShopboxClient) => void;
  selectBranch: (branch: ShopboxBranch) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      account: null,
      selectedClientId: null,
      selectedClientName: null,
      selectedClientIcon: null,
      selectedBranchId: null,
      selectedBranchName: null,

      isAuthenticated: () => !!get().accessToken,

      login: (accessToken, account) => {
        set({ accessToken, account });
      },

      logout: () => {
        set({
          accessToken: null,
          account: null,
          selectedClientId: null,
          selectedClientName: null,
          selectedClientIcon: null,
          selectedBranchId: null,
          selectedBranchName: null,
        });
      },

      selectClient: (client) => {
        set({
          selectedClientId: client.id,
          selectedClientName: client.name,
          selectedClientIcon: client.icon?.trim() || null,
          selectedBranchId: null,
          selectedBranchName: null,
        });
      },

      selectBranch: (branch) => {
        set({
          selectedBranchId: branch.id,
          selectedBranchName: branch.name,
        });
      },
    }),
    {
      name: "kds-session",
    }
  )
);
