"use client";

import { Sparkles, ChevronLeft } from "lucide-react";
import { useTryOnJob } from "@/context/TryOnJobContext";

interface TryOnTriggerProps {
  productId: number;
  productTitle: string;
}

export default function TryOnTrigger({ productId, productTitle }: TryOnTriggerProps) {
  const { launchSingle } = useTryOnJob();

  return (
    <button
      onClick={() => launchSingle(productId, productTitle)}
      className="group relative w-full flex items-center justify-start rounded-2xl bg-gradient-to-l from-purple-50 to-fuchsia-50 dark:from-purple-950/40 dark:to-fuchsia-950/30 border border-purple-100 dark:border-purple-900/50 pl-10 pr-3 py-2.5 text-right shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-purple-200 dark:hover:border-purple-800"
    >
      <ChevronLeft
        size={18}
        className="absolute left-4 text-purple-300 dark:text-purple-600 shrink-0 transition-transform group-hover:-translate-x-0.5"
      />

      <div className="flex items-center justify-start gap-3 text-right">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-500 text-white shadow-md">
          <Sparkles size={18} />
        </span>

        <div>
          <p className="text-sm font-bold text-neutral-900 dark:text-white">
            این لباس رو روی خودت امتحان کن
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            فقط یک عکس آپلود کن و پرو مجازی رو تجربه کن ✨
          </p>
        </div>
      </div>
    </button>
  );
}