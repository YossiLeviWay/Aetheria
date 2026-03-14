import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function TaskSkeleton() {
  return (
    <div className="card flex items-center gap-3 animate-pulse">
      <Skeleton className="w-4 h-4 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="w-16 h-5 rounded-full" />
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-8 h-8 rounded-xl" />
        <Skeleton className="h-5 w-32" />
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
