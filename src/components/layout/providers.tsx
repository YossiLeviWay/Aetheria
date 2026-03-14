"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";

function DirectionProvider({ children }: { children: React.ReactNode }) {
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
  }, [language]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DirectionProvider>{children}</DirectionProvider>
    </SessionProvider>
  );
}
