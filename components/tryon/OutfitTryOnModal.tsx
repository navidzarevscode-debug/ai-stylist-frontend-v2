"use client";

import { useRef, useState } from "react";
import { X, Upload, Download, Camera, Image as ImageIcon, Sparkles } from "lucide-react";
import { tryOnOutfit } from "@/services/tryon";

interface OutfitTryOnModalProps {
  productIds: number[];
  titles: string[];
  onClose: () => void;
}

export default function OutfitTryOnModal({
  productIds,
  titles,
  onClose,
}: OutfitTryOnModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError(null);
    setShowUploadOptions(false);

    // اجازه می‌دهیم دوباره همان فایل هم انتخاب شود
    e.target.value = "";
  }

  async function handleSubmit() {
    if (!file) return;

    const uniqueProductIds = Array.from(new Set(productIds));

    if (uniqueProductIds.length < 2) {
      setError("برای پرو ست کامل باید حداقل دو محصول متفاوت انتخاب شده باشد.");
      return;
    }

    if (uniqueProductIds.length > 3) {
      setError("در هر بار پرو مجازی حداکثر سه محصول پشتیبانی می‌شود.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await tryOnOutfit(uniqueProductIds, file);
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : "مشکلی پیش اومد. دوباره امتحان کن.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!resultUrl) return;
    setDownloading(true);

    try {
      const response = await fetch(resultUrl, { mode: "cors" });
      if (!response.ok) throw new Error("دانلود تصویر ناموفق بود");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "outfit-tryon-result.png";
      a.style.display = "none";

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error("Download error:", error);
      window.open(resultUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }

  function handleTryAgain() {
    setResultUrl(null);
    setFile(null);
    setPreview(null);
    setError(null);
    setShowUploadOptions(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-neutral-700/50 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="بستن"
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors z-10"
        >
          <X size={16} />
        </button>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <h2 className="flex items-center gap-1.5 text-base font-bold text-neutral-900 dark:text-white">
              ست کامل رو روی تن خودت ببین
              <Sparkles size={16} className="text-amber-500" />
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {titles.join(" + ")}
            </p>
          </div>

          {!resultUrl && (
            <>
              {/* Upload area */}
              <div
                onClick={() => {
                  if (!preview) setShowUploadOptions(true);
                }}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 ${
                  preview
                    ? ""
                    : "h-56 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500"
                } transition-colors overflow-hidden`}
              >
                {preview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
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

              {/* Camera input */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Gallery input */}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Upload options */}
              {showUploadOptions && (
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

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={!file || loading}
                className="flex items-center justify-center gap-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {loading ? "در حال ساخت تصویر..." : "بزن بریم"}
              </button>

              {loading && (
                <p className="text-xs text-center text-neutral-400 dark:text-neutral-500">
                  ممکنه چند ثانیه طول بکشه...
                </p>
              )}
            </>
          )}

          {resultUrl && (
            <>
              <div className="rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultUrl} alt="نتیجه" className="w-full h-auto object-contain" />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-700 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  <Download size={15} />
                  {downloading ? "در حال آماده‌سازی..." : "دانلود"}
                </button>

                <button
                  onClick={handleTryAgain}
                  className="flex-1 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2.5 text-sm font-semibold"
                >
                  امتحان دوباره
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}