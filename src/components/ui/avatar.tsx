import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
};

export default function Avatar({ name, avatarUrl, size = "md", className }: AvatarProps) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={cn("rounded-full object-cover", sizeClasses[size], className)}
      />
    );
  }

  const initials = getInitials(name);
  const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-teal-100 text-teal-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-purple-100 text-purple-700",
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold",
        sizeClasses[size],
        colors[colorIndex],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
}
