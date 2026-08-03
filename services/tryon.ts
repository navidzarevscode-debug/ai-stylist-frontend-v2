const BASE_URL = "https://app-python-xvxv0.apps.frk1.abrhapaas.com";

const API_URL = `${BASE_URL}/tryon/`;
const OUTFIT_API_URL = `${BASE_URL}/tryon/outfit`;
const OUTFIT_STATUS_URL = (jobId: string) =>
  `${BASE_URL}/tryon/outfit/status/${jobId}`;

// فاصله‌ی بین هر بار چک کردن وضعیت job (میلی‌ثانیه)
const OUTFIT_POLL_INTERVAL_MS = 3000;
// حداکثر مدت زمانی که فرانت منتظر می‌مونه تا job تموم بشه (میلی‌ثانیه)
const OUTFIT_POLL_TIMEOUT_MS = 6 * 60 * 1000; // 6 دقیقه

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data?.detail === "string") {
      return data.detail;
    }
  } catch {
    // پاسخ JSON نبود
  }

  return "خطا در ساخت تصویر";
}

function normalizeImageUrl(url: string): string {
  if (!url) {
    throw new Error("آدرس تصویر از بک‌اند دریافت نشد");
  }

  // اگر بک‌اند URL کامل برگرداند
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // اگر بک‌اند مسیر نسبی برگرداند
  if (url.startsWith("/")) {
    return `${BASE_URL}${url}`;
  }

  // اگر فقط path بدون / برگرداند
  return `${BASE_URL}/${url}`;
}

export async function tryOnProduct(
  productId: number,
  personImage: File
): Promise<string> {
  const formData = new FormData();

  formData.append("product_id", String(productId));
  formData.append("person_image", personImage);

  const response = await fetch(API_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  const data = await response.json();

  console.log("Try-on response:", data);

  return normalizeImageUrl(data.result_image_url);
}

export interface TryOnOutfitProgress {
  step: number;
  totalSteps: number;
  logs: string[];
}

/**
 * امتحان ست چندلباسی (۲ یا ۳ محصول با هم).
 *
 * چون این پردازش می‌تونه چند دقیقه طول بکشه، دیگه منتظر یک درخواست HTTP
 * طولانی نمی‌مونیم (که باعث قطع‌شدن کانکشن توسط گیت‌وی سرور می‌شد). به‌جاش:
 * ۱) یه درخواست POST می‌زنیم و فوری یه job_id می‌گیریم.
 * ۲) هر چند ثانیه وضعیتش رو چک (poll) می‌کنیم تا آماده بشه.
 *
 * onProgress اختیاریه و برای نشون‌دادن پیشرفت («لباس ۲ از ۳») استفاده می‌شه.
 */
export async function tryOnOutfit(
  productIds: number[],
  personImage: File,
  onProgress?: (progress: TryOnOutfitProgress) => void
): Promise<string> {
  const formData = new FormData();

  productIds.forEach((id) => {
    formData.append("product_ids", String(id));
  });

  formData.append("person_image", personImage);

  const startResponse = await fetch(OUTFIT_API_URL, {
    method: "POST",
    body: formData,
  });

  if (!startResponse.ok) {
    throw new Error(await extractErrorMessage(startResponse));
  }

  const startData = await startResponse.json();
  const jobId: string | undefined = startData.job_id;

  if (!jobId) {
    throw new Error("سرور شناسه‌ی پردازش (job_id) برنگرداند");
  }

  const deadline = Date.now() + OUTFIT_POLL_TIMEOUT_MS;

  while (true) {
    if (Date.now() > deadline) {
      throw new Error(
        "پردازش تصویر بیش از حد انتظار طول کشید. لطفاً دوباره امتحان کنید."
      );
    }

    await sleep(OUTFIT_POLL_INTERVAL_MS);

    const statusResponse = await fetch(OUTFIT_STATUS_URL(jobId));

    if (!statusResponse.ok) {
      // اگه job پیدا نشد یا خطای واقعی توی پردازش رخ داد، پیام خطا رو بگیر
      throw new Error(await extractErrorMessage(statusResponse));
    }

    const statusData = await statusResponse.json();
    console.log("Outfit job status:", statusData);

    if (onProgress && typeof statusData.step === "number") {
      onProgress({
        step: statusData.step,
        totalSteps: statusData.total_steps,
        logs: Array.isArray(statusData.logs) ? statusData.logs : [],
      });
    }

    if (statusData.status === "done") {
      return normalizeImageUrl(statusData.result_image_url);
    }
    // status "pending" یا "processing" → همچنان صبر کن و دوباره چک کن
  }
}