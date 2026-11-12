import React, { useRef } from "react";
import { QueryListItem } from "./query-list-item";
import { useAutoFillScroll } from "@/shared/hooks/use-auto-fill-scroll";
import InfiniteScroll from "react-infinite-scroll-component";
import { Inbox, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { QueryDetail } from "@/features/query/query.types";
import { QUERY_LIMITS } from "@/features/query/query.constants";
import { getStatusMeta } from "@/utils/query";

interface QueryListProps {
  queries: QueryDetail[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  selectedQueryId: string | null;
  onSelect: (queryUuid: string) => void;
  fetchMore: () => void;
  statusOptions: string[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onCreateClick: () => void;
}

export function QueryList({
  queries,
  total,
  loading,
  loadingMore,
  selectedQueryId,
  onSelect,
  fetchMore,
  statusOptions,
  statusFilter,
  onStatusFilterChange,
  search,
  onSearchChange,
  onCreateClick,
}: QueryListProps) {
  const hasMore = queries.length < total;
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Zoomed out / tall screens: the first page may not overflow, so scroll never fires.
  useAutoFillScroll(scrollContainerRef, {
    enabled: hasMore && !loading && !loadingMore,
    onLoadMore: fetchMore,
    contentKey: queries.length,
    resetKey: `${statusFilter}|${search}`,
  });

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-none border-0 bg-card sm:rounded-2xl sm:border sm:border-border">
      <header className="min-w-0 shrink-0 space-y-3 border-b border-border px-3 pb-3 pt-3 sm:px-4 sm:pt-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Queries
            </h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {total}
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-9 gap-1.5 rounded-full px-3.5 max-[379px]:w-9 max-[379px]:px-0"
            onClick={onCreateClick}
          >
            <Plus className="h-4 w-4" />
            <span className="max-[379px]:sr-only">New query</span>
          </Button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search ticket, subject or description"
            maxLength={QUERY_LIMITS.SEARCH_MAX}
            className="h-10 rounded-full border-transparent bg-muted pl-10 pr-9 text-sm shadow-none focus-visible:border-ring focus-visible:bg-background"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="-mx-3 flex snap-x snap-mandatory scroll-px-3 gap-1.5 overflow-x-auto overscroll-x-contain pb-0.5 pl-3 pr-6 [-webkit-overflow-scrolling:touch] [mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)] [scrollbar-width:none] sm:-mx-4 sm:scroll-px-4 sm:pl-4 sm:pr-8 xl:pr-4 xl:[mask-image:none] [&::-webkit-scrollbar]:hidden">
          {statusOptions.map((option) => {
            const active = statusFilter === option;
            return (
              <button
                key={option}
                type="button"
                onClick={(event) => {
                  onStatusFilterChange(option);
                  event.currentTarget.scrollIntoView({
                    behavior: "smooth",
                    inline: "nearest",
                    block: "nearest",
                  });
                }}
                aria-pressed={active}
                className={cn(
                  "shrink-0 snap-start whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                {option === "ALL" ? "All" : getStatusMeta(option).label}
              </button>
            );
          })}
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto"
        id="query-list-scroll-container"
      >
        {loading ? (
          <div className="space-y-1 p-1">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-start gap-3 px-2 py-3">
                <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : queries.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Inbox className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No queries found
            </p>
            <p className="text-xs text-muted-foreground">
              Try another status or search term.
            </p>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={queries.length}
            next={fetchMore}
            hasMore={hasMore}
            loader={
              loadingMore ? (
                <div className="py-3 text-center text-xs text-muted-foreground">
                  Loading more…
                </div>
              ) : null
            }
            scrollableTarget="query-list-scroll-container"
          >
            <div className="divide-y divide-border">
              {queries.map((query) => (
                <QueryListItem
                  key={query.uuid}
                  query={query}
                  isSelected={selectedQueryId === query.uuid}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>
    </section>
  );
}
