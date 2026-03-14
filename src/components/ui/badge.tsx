import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  variant?: "status" | "priority" | "default";
  value?: string;
  className?: string;
}

const statusClasses: Record<string, string> = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-amber-100 text-amber-700",
  done: "bg-teal-100 text-teal-700",
  blocked: "bg-rose-100 text-rose-700",
  not_started: "bg-gray-100 text-gray-700",
  review: "bg-purple-100 text-purple-700",
  active: "bg-teal-100 text-teal-700",
  on_hold: "bg-amber-100 text-amber-700",
  completed: "bg-teal-100 text-teal-700",
  archived: "bg-gray-100 text-gray-700",
};

const priorityClasses: Record<string, string> = {
  critical: "bg-rose-100 text-rose-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-700",
};

export default function Badge({ label, variant, value, className }: BadgeProps) {
  let colorClass = "bg-gray-100 text-gray-700";
  if (variant === "status" && value) colorClass = statusClasses[value] ?? colorClass;
  if (variant === "priority" && value) colorClass = priorityClasses[value] ?? colorClass;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
