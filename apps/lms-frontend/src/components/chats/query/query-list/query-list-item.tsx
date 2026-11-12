import React, { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { QueryDetail } from "@/features/query/query.types";
import {
  formatRelativeShort,
  getInitials,
  getPriorityMeta,
  getStatusMeta,
} from "@/utils/query";

/** One row in the query list: creator avatar, subject, time, ticket, status and priority. */
export const QueryListItem = memo(
  ({
    query,
    isSelected,
    onSelect,
  }: {
    query: QueryDetail;
    isSelected: boolean;
    onSelect: (queryUuid: string) => void;
  }) => {
    const status = getStatusMeta(query.status);
    const priority = getPriorityMeta(query.priority);

    return (
      <button
        type="button"
        onClick={() => onSelect(query.uuid)}
        aria-current={isSelected ? "true" : undefined}
        className={cn(
          "group relative flex w-full items-start gap-2.5 rounded-none px-3 py-3 text-left transition-colors sm:gap-3 sm:px-4",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isSelected ? "bg-primary/[0.07]" : "hover:bg-muted/60",
        )}
      >
        {isSelected && (
          <span
            className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-primary"
            aria-hidden
          />
        )}

        <Avatar className="h-10 w-10 shrink-0 sm:h-11 sm:w-11">
          <AvatarImage
            src={query.creator?.image ?? undefined}
            className="object-cover"
          />
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {getInitials(query.creator?.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="truncate text-[15px] font-semibold leading-tight text-foreground">
              {query.subject}
            </h3>
            <time
              dateTime={query.created_at}
              className="shrink-0 text-[11px] font-medium text-muted-foreground"
            >
              {formatRelativeShort(query.created_at)}
            </time>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
            <span className="shrink-0 whitespace-nowrap font-mono font-medium tracking-tight text-muted-foreground">
              {query.ticket_number}
            </span>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 font-medium ring-1 ring-inset",
                status.className,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>
            <span
              className={cn(
                "ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-medium",
                priority.className,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
              {query.priority}
            </span>
          </div>
        </div>
      </button>
    );
  },
);

QueryListItem.displayName = "QueryListItem";
