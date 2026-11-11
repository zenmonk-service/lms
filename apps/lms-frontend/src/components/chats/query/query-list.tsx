import React, { memo } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Clock3, MessageSquareText, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { QueryDetail } from "@/features/query/query.types";
import { formatPriority, formatQueryDate, formatStatus } from "@/utils/query";

interface QueryListProps {
  queries: QueryDetail[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  selectedQueryId: string | null;
  onSelect: (queryUuid: string) => void;
  fetchMore: () => void;
}

const priorityClasses: Record<string, string> = {
  Low: "bg-sky-500/10 text-sky-700 border-sky-200 dark:text-sky-300",
  Medium: "bg-amber-500/10 text-amber-700 border-amber-200 dark:text-amber-300",
  High: "bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-300",
  Urgent: "bg-rose-500/10 text-rose-700 border-rose-200 dark:text-rose-300",
};

const statusClasses: Record<string, string> = {
  OPEN: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200",
  PENDING_EMP: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200",
  RESOLVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200",
};

const QueryListItem = memo(
  ({
    query,
    isSelected,
    onSelect,
  }: {
    query: QueryDetail;
    isSelected: boolean;
    onSelect: (queryUuid: string) => void;
  }) => {
    const status = formatStatus(query.status);
    const priority = formatPriority(query.priority);
    const lastMessage = query.messages?.[0]?.content ?? "No messages yet";

    return (
      <button
        type="button"
        className={cn(
          "w-full rounded-xl border p-3 text-left transition-colors",
          isSelected
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
        )}
        onClick={() => onSelect(query.uuid)}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {query.ticket_number}
          </span>
          <Badge variant="outline" className={cn("capitalize", statusClasses[status] ?? "")}>{status}</Badge>
        </div>

        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{query.subject}</h3>

        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="outline" className={cn("capitalize", priorityClasses[priority] ?? "")}>{priority}</Badge>
          <Badge variant="outline" className="uppercase tracking-wide text-muted-foreground">
            {query.module}
          </Badge>
        </div>

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5" />
            <span>{formatQueryDate(query.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquareText className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{lastMessage}</span>
          </div>
          {query.assigned_team ? (
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{query.assigned_team}</span>
            </div>
          ) : null}
        </div>
      </button>
    );
  },
);

QueryListItem.displayName = "QueryListItem";

export function QueryList({
  queries,
  total,
  loading,
  loadingMore,
  selectedQueryId,
  onSelect,
  fetchMore,
}: QueryListProps) {
  const hasMore = queries.length < total;

  return (
    <div className="h-full rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Queries</h2>
        <span className="text-xs text-muted-foreground">{total} total</span>
      </div>

      <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-3" id="query-list-scroll-container">
        {loading ? (
          <div className="space-y-3 p-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="h-28 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : (
          <InfiniteScroll
            dataLength={queries.length}
            next={fetchMore}
            hasMore={hasMore}
            loader={
              loadingMore ? (
                <div className="px-2 py-3 text-center text-xs text-muted-foreground">Loading more...</div>
              ) : null
            }
            endMessage={
              !hasMore && queries.length > 0 ? (
                <div className="px-2 py-3 text-center text-xs text-muted-foreground">You’ve reached the end.</div>
              ) : null
            }
            scrollableTarget="query-list-scroll-container"
          >
            <div className="space-y-3">
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
    </div>
  );
}
