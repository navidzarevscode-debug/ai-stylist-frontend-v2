"use client";

import { useRef } from "react";
import {
  X,
  Upload,
  Download,
  Camera,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { useTryOnJob } from "@/context/TryOnJobContext";

/**
 * این کامپوننت یک‌بار در ریشه‌ی اپ (توی ConditionalChrome) رندر می‌شه، نه
 * داخل یک صفحه‌ی خاص. به همین خاطر با جابه‌جایی کاربر بین صفحه‌های مختلف
 * (مثلاً از چت به یک محصول)، این کامپوننت و state پشتش از بین نمی‌ره — پس
 * اگه یه پرو مجازی در حال پردازش باشه، همچنان ادامه پیدا می‌کنه و هر وقت
 * کاربر دوباره بازش کنه (یا حتی از صفحه‌ی دیگه‌ای برگرده)، دقیقاً همون
 * وضعیت (در حال پردازش / نتیجه‌ی آماده) رو می‌بینه.
 */
export default function GlobalTryOnModal() {
  const {
    job,
    isModalOpen,
    setFile,
    setShowUploadOptions,
    submit,
    retryUpload,
    setDownloading,
    hideModal,
    showModal,
    discardJob,
  } = useTryOnJob();

  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!job) return null;

  const { meta } = job;

  const title =
    meta.kind === "single" ? "امتحان روی تنت ✨" : "ست کامل رو روی تن خودت ببین";
  const subtitle =
    meta.kind === "single" ? meta.productTitle : meta.titles.join(" + ");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    e.target.value = "";
  }

  async function handleDownload() {
    if (!job?.resultUrl) return;
    setDownloading(true);

    try {
      const response = await fetch(job.resultUrl, { mode: "cors" });
      if (!response.ok) throw new Error("دانلود تصویر ناموفق بود");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download =
        meta.kind === "single" ? "tryon-result.png" : "outfit-tryon-result.png";
      a.style.display = "none";

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error("Download error:", error);
      window.open(job.resultUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }

  // --------- پیل شناور: وقتی job وجود داره ولی مودال کامل بسته‌ست ---------
  if (!isModalOpen) {
    return (
      <button
        onClick={showModal}
        className="fixed bottom-24 left-4 z-40 flex items-center gap-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg pl-3 pr-1.5 py-1.5 max-w-[220px] hover:shadow-xl transition-shadow"
      >
        {job.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.resultUrl ?? job.preview}
            alt=""
            className="h-8 w-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <span className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
            <Sparkles size={14} style={{ color: "#0F766E" }} />
          </span>
        )}
        <span className="text-[11px] font-semibold truncate text-neutral-700 dark:text-neutral-200">
          {job.resultUrl
            ? "نتیجه آماده‌ست"
            : job.error
              ? "مشکلی پیش اومد"
              : job.progress || "در حال ساخت عکس..."}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-neutral-700/50 max-h-[90vh] overflow-y-auto">
        <button
          onClick={hideModal}
          aria-label="بستن"
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors z-10"
        >
          <X size={16} />
        </button>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <h2 className="flex items-center gap-1.5 text-base font-bold text-neutral-900 dark:text-white">
              {title}
              {meta.kind === "outfit" && (
                <Sparkles size={16} className="text-amber-500" />
              )}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {subtitle}
            </p>
          </div>

          {!job.resultUrl && job.loading && (
            <div className="flex min-h-56 flex-col items-center justify-center gap-4">
              {job.preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.preview}
                  alt="پیش‌نمایش"
                  className="h-28 w-28 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700"
                />
              )}
              <div className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-800/60 dark:to-neutral-900/60 p-3 h-11 flex items-center justify-center">
                <p
                  key={job.progress ?? "preparing"}
                  className="text-[12px] leading-5 text-center truncate w-full font-semibold animate-pulse"
                  style={{ color: "#0F766E" }}
                >
                  {job.progress || "در حال آماده‌سازی..."}
                </p>
              </div>
              <p className="text-[11px] text-center text-neutral-400 dark:text-neutral-500">
                می‌تونی این پنجره رو ببندی و سر بزنی به بقیه‌ی سایت؛ وقتی
                آماده شد بهت خبر می‌دیم.
              </p>
            </div>
          )}

          {!job.resultUrl && !job.loading && (
            <>
              {/* Upload area */}
              <div
                onClick={() => {
                  if (!job.preview) setShowUploadOptions(true);
                }}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 ${
                  job.preview
                    ? ""
                    : "h-56 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500"
                } transition-colors overflow-hidden`}
              >
                {job.preview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={job.preview}
                      alt="پیش‌نمایش"
                      className="max-h-[60vh] w-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUploadOptions(true);
                      }}
                      className="mb-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 text-xs font-semibold shadow-sm hover:opacity-90 transition"
                    >
                      تغییر عکس
                    </button>
                  </>
                ) : (
                  <>
                    <Upload size={22} className="text-neutral-400" />
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      برای آپلود عکس تمام‌قدت کلیک کن
                    </p>
                  </>
                )}
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {job.showUploadOptions && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-gradient-to-b from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-100 py-4 text-white dark:text-neutral-900 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    <Camera size={22} />
                    <span className="text-xs font-bold">گرفتن عکس</span>
                    <span className="text-[10px] opacity-70">استفاده از دوربین</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-gradient-to-b from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-100 py-4 text-white dark:text-neutral-900 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    <ImageIcon size={22} />
                    <span className="text-xs font-bold">انتخاب عکس</span>
                    <span className="text-[10px] opacity-70">گالری / فایل‌ها</span>
                  </button>
                </div>
              )}

              {job.error && <p className="text-xs text-red-500">{job.error}</p>}

              <button
                onClick={submit}
                disabled={!job.file || job.loading}
                className="flex items-center justify-center gap-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                بزن بریم
              </button>
            </>
          )}

          {job.resultUrl && (
            <>
              <div className="rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={job.resultUrl}
                  alt="نتیجه"
                  className="w-full h-auto object-contain"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  disabled={job.downloading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-700 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  <Download size={15} />
                  {job.downloading ? "در حال آماده‌سازی..." : "دانلود"}
                </button>

                <button
                  onClick={retryUpload}
                  className="flex-1 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2.5 text-sm font-semibold"
                >
                  امتحان دوباره
                </button>
              </div>

              <button
                onClick={discardJob}
                className="text-[11px] text-neutral-400 dark:text-neutral-500 hover:underline"
              >
                بستن کامل
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
