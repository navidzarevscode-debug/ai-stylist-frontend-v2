"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

const SHOWN_FLAG_KEY = "ai-assistant-bubble-shown";
const REVEAL_DELAY_MS = 2000; // چند ثانیه بعد از ورود، دکمه به حالت کپسولی در بیاد
const EXPANDED_DURATION_MS = 8000; // چند ثانیه به حالت کپسولی (با متن) بمونه

export default function AIAssistantBubble() {
  const pathname = usePathname();
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);

  // مسیرهایی که کامپوننت اصلاً نباید توشون دیده بشه: صفحه‌ی چت و صفحات محصولات
  const isHiddenRoute = pathname === "/chat" || pathname.startsWith("/products");

  // فقط یک‌بار در کل سشن، بعد از چند ثانیه از اولین ورود به سایت (به‌جز مسیرهای مخفی) دکمه کپسولی می‌شه
  useEffect(() => {
    if (isHiddenRoute) return;

    const alreadyShown =
      typeof window !== "undefined" &&
      sessionStorage.getItem(SHOWN_FLAG_KEY) === "true";

    if (alreadyShown) return;

    const revealTimer = setTimeout(() => {
      setExpanded(true);
      sessionStorage.setItem(SHOWN_FLAG_KEY, "true");
    }, REVEAL_DELAY_MS);

    return () => clearTimeout(revealTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // فقط یک‌بار موقع mount شدن کامپوننت اجرا می‌شه، نه با هر تغییر مسیر

  // بعد از چند ثانیه، دوباره به حالت گرد (بدون متن) برمی‌گرده
  useEffect(() => {
    if (!expanded) return;

    const collapseTimer = setTimeout(() => {
      setExpanded(false);
    }, EXPANDED_DURATION_MS);

    return () => clearTimeout(collapseTimer);
  }, [expanded]);

  if (isHiddenRoute) return null;

  return (
    <button
      onClick={() => router.push("/chat")}
      aria-label="دستیار استایل"
      className={`fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-50 flex h-10 sm:h-11 items-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl transition-all duration-500 ease-out hover:scale-105 ${
        expanded
          ? "gap-2 pl-4 pr-2.5 sm:pl-5 sm:pr-3"
          : "w-10 sm:w-11 justify-center px-0"
      }`}
    >
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        {!expanded && (
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-40" />
        )}
        <Sparkles className="relative z-10 h-4 w-4 sm:h-[18px] sm:w-[18px] text-white" />
      </span>

      {expanded && (
        <span className="whitespace-nowrap text-xs sm:text-sm font-bold text-white animate-in fade-in slide-in-from-left-1 duration-300">
          دستیار استایل
        </span>
      )}
    </button>
  );
}
