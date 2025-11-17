/**
 * Loading Skeleton Components
 * Provides skeleton loaders for different content types
 */

import { Skeleton } from '@/components/ui/skeleton';

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[200px] w-full rounded-[20px]" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-16 w-16 rounded-[12px]" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function TrackCardSkeleton() {
  return (
    <div className="w-[170px] space-y-2">
      <Skeleton className="h-[200px] w-full rounded-[20px]" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

export function ProgramCardSkeleton() {
  return (
    <div className="w-[170px] space-y-2">
      <Skeleton className="h-[220px] w-full rounded-[20px]" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="w-[70px] flex flex-col items-center gap-2">
      <Skeleton className="h-[70px] w-[70px] rounded-[20px]" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}
