"use client";

import { useAppStore } from "@/stores/app-store";
import en from "@/i18n/en.json";
import he from "@/i18n/he.json";

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const translations: Record<string, typeof en> = { en, he: he as typeof en };

export function useTranslation() {
  const language = useAppStore((s) => s.language);
  const t = translations[language] ?? en;

  function translate(key: string): string {
    const parts = key.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = t;
    for (const part of parts) {
      current = current?.[part];
    }
    return typeof current === "string" ? current : key;
  }

  return { t: translate, lang: language, isRTL: language === "he" };
}
