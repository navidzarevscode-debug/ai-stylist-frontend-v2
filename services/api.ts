export const API_URL =
  "https://app-python-xvxv0.apps.frk1.abrhapaas.com";

export type ProductImage = {
  id: number;
  image_url: string;
  is_main: boolean;
  sort_order: number;
};

export type ApiProduct = {
  id: number;
  name: string;
  brand: string;
  category: string;

  color: string;
  size: string;
  material: string;

  gender?: string | null;
  season?: string | null;
  occasion?: string | null;

  price: number;
  stock: number;

  is_active: boolean;
  is_featured: boolean;

  images: ProductImage[];
};

export type ProductFilters = {
  category?: string;
  occasion?: string;
  season?: string;
  search?: string;
};

function buildInternalUrl(path: string): string {
  const normalizedBaseUrl = API_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

export async function getProducts(
  filters?: ProductFilters
): Promise<ApiProduct[]> {
  if (filters?.search?.trim()) {
    const params = new URLSearchParams();

    params.set("query", filters.search.trim());

    const url = `${buildInternalUrl(
      "/products/search"
    )}?${params.toString()}`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `خطا در جستجوی محصولات؛ کد پاسخ: ${response.status}`
      );
    }

    return (await response.json()) as ApiProduct[];
  }

  const params = new URLSearchParams();

  if (filters?.category) {
    params.set("category", filters.category);
  }

  if (filters?.occasion) {
    params.set("occasion", filters.occasion);
  }

  if (filters?.season) {
    params.set("season", filters.season);
  }

  const query = params.toString();

  const url = query
    ? `${buildInternalUrl("/products/")}?${query}`
    : buildInternalUrl("/products/");

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `خطا در دریافت محصولات؛ کد پاسخ: ${response.status}`
    );
  }

  return (await response.json()) as ApiProduct[];
}

export async function getProduct(
  id: string | number
): Promise<ApiProduct | null> {
  const safeId = encodeURIComponent(String(id));
  const url = buildInternalUrl(`/products/${safeId}`);

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error(
      `خطا در دریافت محصول؛ کد پاسخ: ${response.status}`
    );
  }

  return (await response.json()) as ApiProduct;
}

export function getImageUrl(
  path?: string | null
): string | undefined {
  if (!path) {
    return undefined;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedBaseUrl = API_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}