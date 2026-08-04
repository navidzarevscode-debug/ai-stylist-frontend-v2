"use client";

import { useRef, useState } from "react";
import { X, Upload, Download, Camera, Image as ImageIcon } from "lucide-react";
import { tryOnProduct, TryOnProgress } from "@/services/tryon";

interface TryOnModalProps {
  productId: number;
  productTitle: string;
  onClose: () => void;
}

export default function TryOnModal({
  productId,
  productTitle,
  onClose,
}: TryOnModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [progress, setProgress] = useState<TryOnProgress | null>(null);

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

    setLoading(true);
    setError(null);
    setProgress(null);

    try {
      const url = await tryOnProduct(productId, file, setProgress);
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
      setProgress(null);
    }
  }

  async function handleDownload() {
    if (!resultUrl) return;

    setDownloading(true);

    try {
      // ابتدا تلاش می‌کنیم فایل را مستقیم دانلود کنیم
      const response = await fetch(resultUrl, {
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error("دانلود تصویر ناموفق بود");
      }

      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "tryon-result.png";
      a.style.display = "none";

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (error) {
      console.error("Download error:", error);

      // اگر fetch به هر دلیل اجازه نداد،
      // فایل را مستقیماً در یک تب جدید باز می‌کنیم.
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
        
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="بستن"
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors z-10"
        >
          <X size={16} />
        </button>

        <div className="p-6 flex flex-col gap-4">
          
          {/* Header */}
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              امتحان روی تنت ✨
            </h2>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {productTitle}
            </p>
          </div>

          {!resultUrl && loading && (
            <div className="flex min-h-56 flex-col items-center justify-center gap-4">
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="پیش‌نمایش"
                  className="h-28 w-28 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700"
                />
              )}
              <div className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-800/60 dark:to-neutral-900/60 p-3 h-11 flex items-center justify-center">
                <p
                  key={progress ?? "preparing"}
                  className="text-[12px] leading-5 text-center truncate w-full font-semibold animate-pulse"
                  style={{ color: "#0F766E" }}
                >
                  {progress || "در حال آماده‌سازی..."}
                </p>
              </div>
            </div>
          )}

          {!resultUrl && !loading && (
            <>
              {/* Upload area */}
              <div
                onClick={() => {
                  if (!preview) {
                    setShowUploadOptions(true);
                  }
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
                      className="mb-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 text-xs font-semibold"
                    >
                      تغییر عکس
                    </button>
                  </>
                ) : (
                  <>
                    <Upload
                      size={22}
                      className="text-neutral-400"
                    />

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

              {/* Error */}
              {error && (
                <p className="text-xs text-red-500">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!file || loading}
                className="flex items-center justify-center gap-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                بزن بریم
              </button>
            </>
          )}

          {/* Result */}
          {resultUrl && (
            <>
              <div className="rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultUrl}
                  alt="نتیجه"
                  className="w-full h-auto object-contain"
                />
              </div>

              <div className="flex gap-2">
                {/* Download */}
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-700 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  <Download size={15} />

                  {downloading
                    ? "در حال آماده‌سازی..."
                    : "دانلود"}
                </button>

                {/* Try again */}
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