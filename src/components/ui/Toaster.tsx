"use client";

import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useToast } from "@/lib/store/toast-store";

const TONES = {
  success: { icon: CheckCircle2, className: "text-success" },
  error: { icon: XCircle, className: "text-error" },
  info: { icon: Info, className: "text-info" },
};

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2" aria-live="polite">
      {toasts.map((t) => {
        const { icon: Icon, className } = TONES[t.tone];
        return (
          <div key={t.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-lg">
            <Icon size={16} className={className} />
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
