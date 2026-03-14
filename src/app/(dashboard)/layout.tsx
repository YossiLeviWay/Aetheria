"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import Providers from "@/components/layout/providers";
import { useAppStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { sidebarOpen, language } = useAppStore();
  const isRTL = language === "he";

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-lg">
            Æ
          </div>
          <p className="text-text-secondary text-sm">Loading Aetheria...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Sidebar />
      <main
        className={cn(
          "pt-[60px] min-h-screen transition-all duration-300",
          isRTL
            ? sidebarOpen ? "mr-60" : "mr-16"
            : sidebarOpen ? "ml-60" : "ml-16"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <DashboardContent>{children}</DashboardContent>
    </Providers>
  );
}
