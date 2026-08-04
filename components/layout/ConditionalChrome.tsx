"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import MobileCloseToHome from "@/components/layout/MobileCloseToHome";
import AIAssistantBubble from "@/components/AIAssistantBubble";
import GlobalTryOnModal from "@/components/tryon/GlobalTryOnModal";

const HIDDEN_CHROME_ROUTES = ["/login"];

export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideChrome = HIDDEN_CHROME_ROUTES.includes(pathname);

  // توی صفحه‌ی محصولات و چتِ دستیار استایل، نوار پایینِ موبایل نشون داده
  // نمی‌شه؛ به‌جاش یه دکمه‌ی ضربدر برای برگشت سریع به خونه می‌آد.
  const hideBottomNav =
    pathname === "/chat" || (pathname?.startsWith("/products") ?? false);

  if (hideChrome) {
    return (
      <>
        {children}
        <GlobalTryOnModal />
      </>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-y-auto">
      <Navbar />
      {/* flex-1 + min-h-0: صفحه‌هایی مثل چت که خودشون ارتفاع رو مدیریت می‌کنن
          دقیقاً فضای باقی‌مونده‌ی زیر نوبار رو می‌گیرن (نه بیشتر، نه کمتر).
          صفحه‌های عادی (خانه، محصولات و...) که محتواشون بلندتره، عادی همینجا
          روی همین اسکرول‌بار اسکرول می‌شن. */}
      <div className={`flex min-h-0 flex-1 flex-col ${hideBottomNav ? "" : "pb-16 sm:pb-0"}`}>
        {children}
      </div>
      {/* نوار پایینِ موبایل - فقط زیر sm دیده می‌شه؛ پدینگ بالا همون فضایی
          که این نوار اشغال می‌کنه رو از محتوا جبران می‌کنه. توی صفحه‌ی
          محصولات و چت به‌جاش دکمه‌ی ضربدر می‌آد. */}
      {hideBottomNav ? <MobileCloseToHome /> : <MobileBottomNav />}
      <AIAssistantBubble />
      {/* این کامپوننت یک‌بار اینجا (خارج از هر صفحه‌ی خاص) مانت می‌شه تا وضعیت
          پرو مجازی با جابه‌جایی بین صفحه‌ها از بین نره. */}
      <GlobalTryOnModal />
    </div>
  );
}