"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

export default function MobileCloseToHome() {
  const router = useRouter();
  const { theme } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      onClick={() => router.push("/")}
      aria-label="بازگشت به خانه"
      className={`sm:hidden fixed top-[70px] left-3 z-40 flex h-9 w-9 items-center justify-center rounded-full border shadow-md backdrop-blur transition-colors ${
        dark
          ? "bg-neutral-900/90 border-neutral-700 text-neutral-200"
          : "bg-white/90 border-neutral-200 text-neutral-700"
      }`}
    >
      <X size={18} />
    </button>
  );
}
