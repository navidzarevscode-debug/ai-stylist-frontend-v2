"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  ReactNode,
} from "react";
import { tryOnProduct, tryOnOutfit, TryOnProgress } from "@/services/tryon";

// ---------------------------------------------------------------------------
// این context حالتِ «پرو مجازی» (چه تک‌محصولی، چه ست کامل) رو یک سطح بالاتر
// از صفحه‌ها نگه می‌داره (توی layout ریشه). به همین خاطر وقتی کاربر بین
// صفحه‌های مختلف سایت جابه‌جا می‌شه (مثلاً از /chat میره یه محصول دیگه رو
// ببینه)، این state از بین نمی‌ره — چون دیگه به‌عمر کامپوننتِ صفحه‌ی /chat
// وابسته نیست. حتی اگه کاربر با دکمه‌ی X مودال رو ببنده، خودِ job (و در
// صورت وجود، نتیجه‌ی نهایی) توی context باقی می‌مونه تا وقتی صراحتاً کنسل
// بشه (discardJob) یا یه job جدید شروع بشه.
// ---------------------------------------------------------------------------

type SingleMeta = {
  kind: "single";
  productId: number;
  productTitle: string;
};

type OutfitMeta = {
  kind: "outfit";
  productIds: number[];
  titles: string[];
};

type TryOnMeta = SingleMeta | OutfitMeta;

export interface TryOnJobState {
  meta: TryOnMeta;
  file: File | null;
  preview: string | null;
  loading: boolean;
  progress: TryOnProgress | null;
  resultUrl: string | null;
  error: string | null;
  showUploadOptions: boolean;
  downloading: boolean;
}

interface TryOnJobContextType {
  job: TryOnJobState | null;
  isModalOpen: boolean;
  launchSingle: (productId: number, productTitle: string) => void;
  launchOutfit: (productIds: number[], titles: string[]) => void;
  setFile: (file: File) => void;
  setShowUploadOptions: (show: boolean) => void;
  submit: () => void;
  retryUpload: () => void;
  setDownloading: (downloading: boolean) => void;
  hideModal: () => void;
  showModal: () => void;
  discardJob: () => void;
}

const TryOnJobContext = createContext<TryOnJobContextType | undefined>(
  undefined
);

export function TryOnJobProvider({ children }: { children: ReactNode }) {
  const [job, setJob] = useState<TryOnJobState | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // با هر job جدید یا discard، این عدد عوض می‌شه تا جواب poll های قدیمی و
  // دیرهنگام (که مال یه job قبلی هستن) نادیده گرفته بشن.
  const runIdRef = useRef(0);

  const launchSingle = useCallback(
    (productId: number, productTitle: string) => {
      runIdRef.current++;
      setJob((prev) => {
        if (prev?.preview) URL.revokeObjectURL(prev.preview);
        return {
          meta: { kind: "single", productId, productTitle },
          file: null,
          preview: null,
          loading: false,
          progress: null,
          resultUrl: null,
          error: null,
          showUploadOptions: false,
          downloading: false,
        };
      });
      setIsModalOpen(true);
    },
    []
  );

  const launchOutfit = useCallback(
    (productIds: number[], titles: string[]) => {
      runIdRef.current++;
      setJob((prev) => {
        if (prev?.preview) URL.revokeObjectURL(prev.preview);
        return {
          meta: { kind: "outfit", productIds, titles },
          file: null,
          preview: null,
          loading: false,
          progress: null,
          resultUrl: null,
          error: null,
          showUploadOptions: false,
          downloading: false,
        };
      });
      setIsModalOpen(true);
    },
    []
  );

  const setFile = useCallback((file: File) => {
    setJob((prev) => {
      if (!prev) return prev;
      if (prev.preview) URL.revokeObjectURL(prev.preview);
      return {
        ...prev,
        file,
        preview: URL.createObjectURL(file),
        error: null,
        showUploadOptions: false,
      };
    });
  }, []);

  const setShowUploadOptions = useCallback((show: boolean) => {
    setJob((prev) => (prev ? { ...prev, showUploadOptions: show } : prev));
  }, []);

  const setDownloading = useCallback((downloading: boolean) => {
    setJob((prev) => (prev ? { ...prev, downloading } : prev));
  }, []);

  const submit = useCallback(() => {
    setJob((currentJob) => {
      if (!currentJob || !currentJob.file) return currentJob;

      if (currentJob.meta.kind === "outfit") {
        const uniqueIds = Array.from(new Set(currentJob.meta.productIds));
        if (uniqueIds.length < 2) {
          return {
            ...currentJob,
            error: "برای پرو ست کامل باید حداقل دو محصول متفاوت انتخاب شده باشد.",
          };
        }
        if (uniqueIds.length > 3) {
          return {
            ...currentJob,
            error: "در هر بار پرو مجازی حداکثر سه محصول پشتیبانی می‌شود.",
          };
        }
      }

      const myRunId = ++runIdRef.current;
      const file = currentJob.file;
      const meta = currentJob.meta;

      const onProgress = (p: TryOnProgress) => {
        if (runIdRef.current !== myRunId) return;
        setJob((prev) => (prev ? { ...prev, progress: p } : prev));
      };

      const run =
        meta.kind === "single"
          ? tryOnProduct(meta.productId, file, onProgress)
          : tryOnOutfit(
              Array.from(new Set(meta.productIds)),
              file,
              onProgress
            );

      run
        .then((url) => {
          if (runIdRef.current !== myRunId) return;
          setJob((prev) =>
            prev ? { ...prev, loading: false, resultUrl: url } : prev
          );
        })
        .catch((err: unknown) => {
          if (runIdRef.current !== myRunId) return;
          const message =
            err instanceof Error && err.message
              ? err.message
              : "مشکلی پیش اومد. دوباره امتحان کن.";
          setJob((prev) =>
            prev ? { ...prev, loading: false, error: message } : prev
          );
        });

      return { ...currentJob, loading: true, error: null, progress: null };
    });
  }, []);

  const retryUpload = useCallback(() => {
    setJob((prev) => {
      if (!prev) return prev;
      if (prev.preview) URL.revokeObjectURL(prev.preview);
      return {
        ...prev,
        file: null,
        preview: null,
        resultUrl: null,
        error: null,
        showUploadOptions: false,
      };
    });
  }, []);

  const hideModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const showModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const discardJob = useCallback(() => {
    runIdRef.current++; // هر poll در حال اجرا رو بی‌اثر می‌کنیم
    setJob((prev) => {
      if (prev?.preview) URL.revokeObjectURL(prev.preview);
      return null;
    });
    setIsModalOpen(false);
  }, []);

  return (
    <TryOnJobContext.Provider
      value={{
        job,
        isModalOpen,
        launchSingle,
        launchOutfit,
        setFile,
        setShowUploadOptions,
        submit,
        retryUpload,
        setDownloading,
        hideModal,
        showModal,
        discardJob,
      }}
    >
      {children}
    </TryOnJobContext.Provider>
  );
}

export function useTryOnJob() {
  const ctx = useContext(TryOnJobContext);
  if (!ctx) {
    throw new Error("useTryOnJob باید داخل TryOnJobProvider استفاده بشه");
  }
  return ctx;
}
