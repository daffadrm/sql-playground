"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: Toast[];
  show: (message: string, tone?: ToastTone) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, tone = "info") => {
    const id = nextId++;
    set({ toasts: [...get().toasts, { id, message, tone }] });
    setTimeout(() => get().dismiss(id), 2500);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export function toast(message: string, tone?: ToastTone) {
  useToast.getState().show(message, tone);
}

export async function copyText(text: string, label = "Disalin ke clipboard") {
  try {
    await navigator.clipboard.writeText(text);
    toast(label, "success");
  } catch {
    toast("Gagal menyalin ke clipboard", "error");
  }
}
