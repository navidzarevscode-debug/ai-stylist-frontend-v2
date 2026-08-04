"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import {
  ensureFavoritesLoaded,
  isFavorite,
  subscribeToFavoritesChanges,
  toggleFavorite,
} from "@/lib/favorites";

type ProductFavoriteButtonProps = {
  id: number;
  title: string;
  price: string;
  image?: string;
  brand?: string;
  className?: string;
};

export default function ProductFavoriteButton({
  id,
  title,
  price,
  image,
  brand,
  className = "",
}: ProductFavoriteButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    ensureFavoritesLoaded().then(() => setFavorite(isFavorite(id)));
    const unsubscribe = subscribeToFavoritesChanges(() => {
      setFavorite(isFavorite(id));
    });
    return unsubscribe;
  }, [id]);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    await toggleFavorite({ id, title, price, image, brand });
  }

  return (
    <button
      onClick={handleClick}
      aria-label="افزودن به علاقه‌مندی‌ها"
      className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-md backdrop-blur transition-colors ${
        favorite
          ? "text-red-500 bg-white/90 border-neutral-200 dark:bg-neutral-900/90 dark:border-neutral-700"
          : "text-neutral-700 hover:text-red-500 bg-white/90 border-neutral-200 dark:text-neutral-200 dark:bg-neutral-900/90 dark:border-neutral-700"
      } ${className}`}
    >
      <Heart size={16} fill={favorite ? "currentColor" : "none"} />
    </button>
  );
}
