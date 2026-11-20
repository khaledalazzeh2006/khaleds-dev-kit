import { create } from "zustand";

/**
 * Secrets for this session only (never written to disk): the database password and a pasted
 * connection URL. Shared by "Connection string" and "Connect & query".
 */
export const useDbSecrets = create<{
  password: string;
  url: string;
  setPassword: (password: string) => void;
  setUrl: (url: string) => void;
}>()((set) => ({
  password: "",
  url: "",
  setPassword: (password) => set({ password }),
  setUrl: (url) => set({ url }),
}));
