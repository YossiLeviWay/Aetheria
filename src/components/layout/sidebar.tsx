"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  FolderOpen,
  Calendar,
  Users,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { useAppStore } from "@/stores/app-store";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "nav.myDay", href: "/my-day", icon: Sun },
  { key: "nav.projects", href: "/projects", icon: FolderOpen },
  { key: "nav.calendar", href: "/calendar", icon: Calendar },
  { key: "nav.team", href: "/team", icon: Users },
  { key: "nav.settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, projects } = useAppStore();
  const { t, isRTL } = useTranslation();

  return (
    <aside
      className={cn(
        "fixed top-0 h-full bg-surface border-r border-border flex flex-col z-20 transition-all duration-300",
        isRTL ? "right-0 border-r-0 border-l" : "left-0",
        sidebarOpen ? "w-60" : "w-16"
      )}
      style={{ top: "60px" }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={cn(
          "absolute -right-3 top-6 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 z-10",
          isRTL && "-left-3 -right-auto"
        )}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? (
          isRTL ? <ChevronRight size={12} /> : <ChevronLeft size={12} />
        ) : (
          isRTL ? <ChevronLeft size={12} /> : <ChevronRight size={12} />
        )}
      </button>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ key, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
              )}
            >
              <Icon size={18} className={cn("shrink-0", active ? "text-primary" : "")} />
              {sidebarOpen && <span className="truncate">{t(key)}</span>}
            </Link>
          );
        })}

        {/* Projects section */}
        {sidebarOpen && (
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t("nav.projects")}
              </span>
              <Link
                href="/projects/new"
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 text-text-secondary hover:text-primary transition-colors"
                aria-label={t("project.new")}
              >
                <Plus size={14} />
              </Link>
            </div>
            <div className="space-y-1">
              {projects.slice(0, 10).map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200",
                    pathname.includes(project.id)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                  )}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate">{project.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom: New Project button */}
      {sidebarOpen && (
        <div className="p-3 border-t border-border">
          <Link
            href="/projects/new"
            className="flex items-center gap-2 px-3 py-2 text-sm text-primary font-medium hover:bg-primary/5 rounded-xl transition-colors"
          >
            <Plus size={16} />
            <span>{t("nav.newProject")}</span>
          </Link>
        </div>
      )}
    </aside>
  );
}
