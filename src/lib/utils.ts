import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date, locale = "en"): string {
  const d = new Date(date);
  if (locale === "he") {
    return d.toLocaleDateString("he-IL");
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    todo: "badge-todo",
    in_progress: "badge-in-progress",
    done: "badge-done",
    blocked: "badge-blocked",
    not_started: "badge-todo",
    review: "badge-in-progress",
  };
  return map[status] ?? "badge-todo";
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    critical: "badge-critical",
    high: "badge-high",
    medium: "badge-medium",
    low: "badge-low",
  };
  return map[priority] ?? "badge-medium";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, len = 50): string {
  return str.length > len ? str.slice(0, len) + "…" : str;
}
