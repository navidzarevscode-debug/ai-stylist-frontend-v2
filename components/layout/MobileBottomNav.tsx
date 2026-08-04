"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, Sparkles, User } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useAuth } from "@/lib/useAuth";
import { useCart } from "@/context/CartContext";

// ترتیب راست‌به‌چپ (مطابق چیدمان rtl سایت): خانه، محصولات، سبد خرید، دستیار
// استایل، حساب من.
const tabs = [
  { href: "/", label: "خانه", icon: Home },
  { href: "/products", label: "محصولات", icon: LayoutGrid },
  { href: "/cart", label: "سبد خرید", icon: ShoppingBag },
  { href: "/chat", label: "دستیار استایل", icon: Sparkles },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const dark = theme === "dark";

  const { isLoggedIn } = useAuth();
  const { unseenCount } = useCart();

  function goToAccount() {
    if (isLoggedIn) {
      router.push("/profile");
    } else {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
    }
  }

  const accountActive = pathname === "/profile" || pathname === "/login";

  return (
    <nav
      className={`sm:hidden fixed bottom-0 inset-x-0 z-50 border-t pb-[env(safe-area-inset-bottom)] ${
        dark ? "bg-neutral-950 border-neutral-800" : "bg-white border-neutral-200"
      }`}
    >
      <div className="flex items-center justify-between px-2 py-2 gap-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          const showBadge = tab.href === "/cart" && unseenCount > 0;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-colors ${
                isActive
                  ? dark
                    ? "text-white font-bold"
                    : "text-neutral-900 font-bold"
                  : dark
                  ? "text-neutral-400"
                  : "text-neutral-500"
              }`}
            >
              <span className="relative">
                <Icon size={20} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unseenCount > 9 ? "9+" : unseenCount}
                  </span>
                )}
              </span>
              <span className="whitespace-nowrap">{tab.label}</span>
            </Link>
          );
        })}

        {/* حساب من: به‌جای Link ساده، بسته به وضعیت ورود به پروفایل یا لاگین می‌ره */}
        <button
          onClick={goToAccount}
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition-colors ${
            accountActive
              ? dark
                ? "text-white font-bold"
                : "text-neutral-900 font-bold"
              : dark
              ? "text-neutral-400"
              : "text-neutral-500"
          }`}
        >
          <User size={20} />
          <span className="whitespace-nowrap">حساب من</span>
        </button>
      </div>
    </nav>
  );
}
