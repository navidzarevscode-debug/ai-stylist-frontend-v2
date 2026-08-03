import Link from "next/link";
import {
  ArrowLeft,
  Dumbbell,
  PartyPopper,
  Sun,
  type LucideIcon,
} from "lucide-react";
import ProductCard from "./ProductCard";
import {
  getImageUrl,
  getProducts,
  type ApiProduct,
} from "@/services/api";

type FeaturedSectionProps = {
  title: string;
  subtitle: string;
  products: ApiProduct[];
  href: string;
};

function FeaturedSection({
  title,
  subtitle,
  products,
  href,
}: FeaturedSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-5 transition-colors bg-gradient-to-b from-slate-700 to-slate-800 dark:from-amber-50 dark:to-orange-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="w-1 h-6 rounded-full bg-red-500 block" />

            <div>
              <h2 className="text-lg font-extrabold text-white dark:text-neutral-900">
                {title}
              </h2>

              <p className="text-xs mt-0.5 text-slate-400 dark:text-neutral-500">
                {subtitle}
              </p>
            </div>
          </div>

          <Link
            href={href}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors border-slate-500 text-slate-300 hover:bg-slate-600 dark:border-neutral-300 dark:text-neutral-600 dark:hover:bg-neutral-100"
          >
            مشاهده همه
            <ArrowLeft size={13} />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-3 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/40">
          {products.map((product) => {
            const mainImage =
              product.images?.find(
                (image) => image.is_main
              ) ?? product.images?.[0];

            return (
              <div
                key={product.id}
                className="shrink-0 w-24 sm:w-40"
              >
                <ProductCard
                  id={product.id}
                  title={product.name}
                  brand={product.brand}
                  price={`${product.price.toLocaleString()} تومان`}
                  image={getImageUrl(
                    mainImage?.image_url
                  )}
                  dark
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

type CategoryVariant =
  | "summer"
  | "party"
  | "sport";

type CategoryStyle = {
  icon: LucideIcon;
  ring: string;
  chip: string;
};

const CATEGORY_STYLES: Record<
  CategoryVariant,
  CategoryStyle
> = {
  summer: {
    icon: Sun,
    ring: "from-amber-400/20 via-orange-300/10 to-transparent border-amber-200 dark:border-amber-900/40",
    chip: "bg-amber-500 text-white",
  },
  party: {
    icon: PartyPopper,
    ring: "from-fuchsia-400/20 via-purple-300/10 to-transparent border-fuchsia-200 dark:border-fuchsia-900/40",
    chip: "bg-fuchsia-500 text-white",
  },
  sport: {
    icon: Dumbbell,
    ring: "from-emerald-400/20 via-teal-300/10 to-transparent border-emerald-200 dark:border-emerald-900/40",
    chip: "bg-emerald-500 text-white",
  },
};

type CategoryBoxSectionProps = {
  variant: CategoryVariant;
  title: string;
  subtitle: string;
  products: ApiProduct[];
  href: string;
};

function CategoryBoxSection({
  variant,
  title,
  subtitle,
  products,
  href,
}: CategoryBoxSectionProps) {
  if (products.length === 0) {
    return null;
  }

  const style = CATEGORY_STYLES[variant];
  const Icon = style.icon;

  return (
    <section className="py-3 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <div
        className={`max-w-7xl mx-auto rounded-3xl border bg-gradient-to-br ${style.ring} bg-white dark:bg-neutral-900 p-4 sm:p-6 transition-colors`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${style.chip}`}
            >
              <Icon size={18} />
            </span>

            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white">
                {title}
              </h2>

              <p className="text-xs mt-0.5 text-neutral-400 dark:text-neutral-500">
                {subtitle}
              </p>
            </div>
          </div>

          <Link
            href={href}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors shrink-0"
          >
            بیشتر ببین
            <ArrowLeft size={13} />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700">
          {products.map((product) => {
            const mainImage =
              product.images?.find(
                (image) => image.is_main
              ) ?? product.images?.[0];

            return (
              <div
                key={product.id}
                className="shrink-0 w-24 sm:w-40"
              >
                <ProductCard
                  id={product.id}
                  title={product.name}
                  brand={product.brand}
                  price={`${product.price.toLocaleString()} تومان`}
                  image={getImageUrl(
                    mainImage?.image_url
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default async function ProductGrid() {
  let products: ApiProduct[] = [];

  try {
    products = await getProducts();
  } catch (error: unknown) {
    console.error(
      "خطا در دریافت محصولات صفحه اصلی:",
      error
    );
  }

  if (products.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 text-center text-neutral-400 dark:text-neutral-600 dark:bg-neutral-950 transition-colors">
        محصولی برای نمایش وجود ندارد.
      </section>
    );
  }

  const discountedProducts = products.filter(
    (product) => product.is_featured
  );

  const summerProducts = products
    .filter((product) =>
      (product.season ?? "").includes("تابستان")
    )
    .slice(0, 10);

  const partyProducts = products
    .filter((product) =>
      (product.occasion ?? "").includes("مهمانی")
    )
    .slice(0, 10);

  const sportProducts = products
    .filter((product) =>
      (product.occasion ?? "").includes("اسپرت")
    )
    .slice(0, 10);

  return (
    <div className="space-y-3 pb-6">
      <FeaturedSection
        title="تخفیف‌های ویژه"
        subtitle="فقط برای مدت محدود"
        products={discountedProducts}
        href="/products?featured=true"
      />

      <CategoryBoxSection
        variant="summer"
        title="لباس‌های تابستانی"
        subtitle="خنک، سبک و مناسب گرما"
        products={summerProducts}
        href="/products?season=تابستان"
      />

      <CategoryBoxSection
        variant="party"
        title="لباس‌های مخصوص مجالس"
        subtitle="برای مهمونی و مناسبت‌های خاص"
        products={partyProducts}
        href="/products?occasion=مهمانی"
      />

      <CategoryBoxSection
        variant="sport"
        title="لباس اسپرت"
        subtitle="راحت و متناسب با فعالیت روزانه"
        products={sportProducts}
        href="/products?occasion=اسپرت"
      />
    </div>
  );
}