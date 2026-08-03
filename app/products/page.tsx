"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/home/ProductCard";
import {
  getImageUrl,
  getProducts,
  type ApiProduct,
} from "@/services/api";
import { categories } from "@/lib/categories";

const SEASON_LABELS: Record<string, string> = {
  تابستان: "لباس‌های تابستانی",
  بهار: "لباس‌های بهاره",
  پاییز: "لباس‌های پاییزه",
  زمستان: "لباس‌های زمستانی",
};

function ProductsPageContent() {
  const searchParams = useSearchParams();

  const category =
    searchParams.get("category") ?? undefined;

  const occasion =
    searchParams.get("occasion") ?? undefined;

  const season =
    searchParams.get("season") ?? undefined;

  const search =
    searchParams.get("search") ?? undefined;

  const featured =
    searchParams.get("featured") === "true";

  const [products, setProducts] = useState<
    ApiProduct[]
  >([]);

  const [loading, setLoading] = useState(true);

  const activeCategory = categories.find(
    (item) =>
      (item.filterType === "category" &&
        item.value === category) ||
      (item.filterType === "occasion" &&
        item.value === occasion)
  );

  useEffect(() => {
    let isCancelled = false;

    setLoading(true);

    getProducts({
      category,
      occasion,
      season,
      search,
    })
      .then((data) => {
        if (isCancelled) {
          return;
        }

        const filteredProducts = featured
          ? data.filter(
              (product) => product.is_featured
            )
          : data;

        setProducts(filteredProducts);
      })
      .catch((error: unknown) => {
        console.error(
          "خطا در دریافت محصولات:",
          error
        );

        if (!isCancelled) {
          setProducts([]);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    category,
    occasion,
    season,
    search,
    featured,
  ]);

  const pageTitle = search
    ? `نتایج جستجو برای «${search}»`
    : featured
      ? "تخفیف‌های ویژه"
      : season
        ? (SEASON_LABELS[season] ??
          `محصولات: ${season}`)
        : category || occasion
          ? `محصولات: ${category || occasion}`
          : undefined;

  return (
    <main className="max-w-7xl mx-auto p-6 sm:p-10 min-h-screen bg-white dark:bg-neutral-950 transition-colors">
      {activeCategory?.icon ? (
        <div className="flex justify-center sm:justify-start mb-8 sm:mb-10">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-neutral-900 flex items-center justify-center shrink-0">
            <Image
              src={activeCategory.icon}
              alt={activeCategory.label}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      ) : pageTitle ? (
        <h1 className="text-2xl sm:text-4xl font-bold mb-8 sm:mb-10 text-neutral-900 dark:text-white">
          {pageTitle}
        </h1>
      ) : (
        <div className="flex justify-center mb-8 sm:mb-10">
          <Image
            src="/products-icon.png"
            alt="محصولات"
            width={128}
            height={128}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover"
          />
        </div>
      )}

      {loading ? (
        <p className="text-neutral-500 dark:text-neutral-400">
          در حال بارگذاری...
        </p>
      ) : products.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400">
          {search
            ? "محصولی با این مشخصات پیدا نشد."
            : "محصولی در این دسته پیدا نشد."}
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2 sm:gap-3">
          {products.map((product) => {
            const mainImage =
              product.images?.find(
                (image) => image.is_main
              ) ?? product.images?.[0];

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.name}
                brand={product.brand}
                price={`${product.price.toLocaleString()} تومان`}
                image={getImageUrl(
                  mainImage?.image_url
                )}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  );
}