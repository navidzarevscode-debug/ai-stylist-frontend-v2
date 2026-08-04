"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
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
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <AIAssistantBubble />
      {/* این کامپوننت یک‌بار اینجا (خارج از هر صفحه‌ی خاص) مانت می‌شه تا وضعیت
          پرو مجازی با جابه‌جایی بین صفحه‌ها از بین نره. */}
      <GlobalTryOnModal />
    </div>
  );
}