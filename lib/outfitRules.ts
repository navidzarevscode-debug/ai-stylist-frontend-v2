export type OutfitProduct = {
  id: number;
  name: string;
  category: string;
  gender?: string | null;
};

export type OutfitSlot =
  | "inner_top"
  | "shirt_layer"
  | "outer"
  | "bottom"
  | "full_body"
  | "accessory"
  | "other";

const normalize = (value?: string | null): string =>
  (value ?? "").trim().toLowerCase().replaceAll("‌", " ");

export function classifyProduct(
  product: Pick<OutfitProduct, "category" | "name">
): OutfitSlot {
  const text = `${normalize(product.category)} ${normalize(product.name)}`;

  if (["دامن", "شلوار", "شلوارک", "لگ"].some((x) => text.includes(x))) {
    return "bottom";
  }

  if (
    ["پیراهن دکمه", "لباس دکمه", "شومیز", "اورشرت"].some((x) =>
      text.includes(x)
    )
  ) {
    return "shirt_layer";
  }

  if (
    text.includes("پیراهن") &&
    !["پیراهن زنانه", "پیراهن مجلسی"].some((x) => text.includes(x))
  ) {
    return "shirt_layer";
  }

  if (
    ["کت", "کاپشن", "ژاکت", "مانتو", "پالتو", "بارانی", "بلیزر"].some(
      (x) => text.includes(x)
    )
  ) {
    return "outer";
  }

  if (
    [
      "تیشرت",
      "تی شرت",
      "تاپ",
      "بلوز",
      "پولوشرت",
      "زیرپوش",
      "هودی",
      "سویشرت",
    ].some((x) => text.includes(x))
  ) {
    return "inner_top";
  }

  if (
    [
      "پیراهن زنانه",
      "پیراهن مجلسی",
      "لباس مجلسی",
      "لباس زنانه",
      "سارافون",
      "سرهمی",
    ].some((x) => text.includes(x))
  ) {
    return "full_body";
  }

  if (
    ["کفش", "کتانی", "بوت", "صندل", "کیف", "کمربند", "کلاه"].some((x) =>
      text.includes(x)
    )
  ) {
    return "accessory";
  }

  return "other";
}

function genderGroup(
  product: Pick<OutfitProduct, "gender" | "category" | "name">
): "female" | "male" | "unisex" {
  const gender = normalize(product.gender);
  const text = `${normalize(product.category)} ${normalize(product.name)}`;

  if (
    text.includes("جین") &&
    ["کت", "ژاکت", "کاپشن"].some((x) => text.includes(x))
  ) {
    return "unisex";
  }

  if (["زن", "خانم", "دختر"].some((x) => gender.includes(x))) {
    return "female";
  }

  if (["مرد", "آقا", "پسر"].some((x) => gender.includes(x))) {
    return "male";
  }

  return "unisex";
}

export function validateOutfit(
  products: OutfitProduct[]
): { ok: boolean; reason?: string } {
  if (products.length < 2) {
    return { ok: false, reason: "حداقل دو لباس انتخاب کن." };
  }

  if (products.length > 3) {
    return {
      ok: false,
      reason: "برای نتیجه طبیعی حداکثر سه لباس انتخاب کن.",
    };
  }

  if (new Set(products.map((p) => p.id)).size !== products.length) {
    return {
      ok: false,
      reason: "یک محصول را دوبار نمی‌شود انتخاب کرد.",
    };
  }

  const slots = products.map(classifyProduct);

  if (slots.some((slot) => slot === "accessory" || slot === "other")) {
    return {
      ok: false,
      reason: "فعلاً فقط لباس‌های اصلی برای پرو مجازی پشتیبانی می‌شوند.",
    };
  }

  for (const slot of new Set(slots)) {
    if (slots.filter((item) => item === slot).length > 1) {
      const labels: Partial<Record<OutfitSlot, string>> = {
        bottom: "دو پایین‌تنه",
        inner_top: "دو بالاتنه هم‌نوع",
        shirt_layer: "دو لباس دکمه‌دار",
        outer: "دو لایه رویی",
        full_body: "دو لباس یک‌تکه",
      };

      return {
        ok: false,
        reason: `${labels[slot] ?? "دو محصول هم‌نوع"} را هم‌زمان نمی‌شود انتخاب کرد.`,
      };
    }
  }

  if (
    slots.includes("full_body") &&
    slots.some((slot) =>
      ["bottom", "inner_top", "shirt_layer"].includes(slot)
    )
  ) {
    return {
      ok: false,
      reason:
        "لباس یک‌تکه با شلوار، دامن یا بالاتنه جدا ترکیب طبیعی ندارد.",
    };
  }

  const genders = new Set(
    products.map(genderGroup).filter((gender) => gender !== "unisex")
  );

  if (genders.size > 1) {
    return {
      ok: false,
      reason:
        "محصولات زنانه و مردانه اختصاصی را در یک ست ترکیب نکن.",
    };
  }

  const hasThreeUpperBodyLayers =
    products.length === 3 &&
    new Set(slots).size === 3 &&
    (["inner_top", "shirt_layer", "outer"] as OutfitSlot[]).every((slot) =>
      slots.includes(slot)
    );

  if (hasThreeUpperBodyLayers) {
    return {
      ok: false,
      reason:
        "سه لایه بالاتنه بدون پایین‌تنه طبیعی نیست؛ یک شلوار یا دامن انتخاب کن.",
    };
  }

  return { ok: true };
}

export function canAddToOutfit(
  selected: OutfitProduct[],
  candidate: OutfitProduct
): { ok: boolean; reason?: string } {
  if (selected.some((product) => product.id === candidate.id)) {
    return {
      ok: false,
      reason: "این محصول انتخاب شده است.",
    };
  }

  return validateOutfit([...selected, candidate]);
}

export const slotLabel: Record<OutfitSlot, string> = {
  inner_top: "لایه زیرین",
  shirt_layer: "لباس دکمه‌دار",
  outer: "لایه رویی",
  bottom: "پایین‌تنه",
  full_body: "لباس یک‌تکه",
  accessory: "اکسسوری",
  other: "نامشخص",
};