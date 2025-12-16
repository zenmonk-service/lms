import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PageToken = number | "ELLIPSIS";

interface AdminTablePaginationProps {
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showSummary?: boolean;
}

export function AdminTablePagination({
  total,
  currentPage,
  pageSize,
  onPageChange,
  siblingCount = 1,
  showSummary = true,
}: AdminTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const ELLIPSIS_TOKEN: PageToken = "ELLIPSIS";

  const buildCompactPageList = (): PageToken[] => {
    const minPagesToShowAll = siblingCount * 2 + 5;
    if (totalPages <= minPagesToShowAll) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const leftBoundary = Math.max(2, currentPage - siblingCount);
    const rightBoundary = Math.min(totalPages - 1, currentPage + siblingCount);

    const pages: PageToken[] = [];
    pages.push(1);

    if (leftBoundary > 2) {
      pages.push(ELLIPSIS_TOKEN);
    } else {
      for (let p = 2; p < leftBoundary; p++) pages.push(p);
    }

    for (let p = leftBoundary; p <= rightBoundary; p++) pages.push(p);

    if (rightBoundary < totalPages - 1) {
      pages.push(ELLIPSIS_TOKEN);
    } else {
      for (let p = rightBoundary + 1; p < totalPages; p++) pages.push(p);
    }

    pages.push(totalPages);
    return pages;
  };

  const compactPages = buildCompactPageList();
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <div className="flex flex-col items-center gap-2">
      <Pagination>
        <PaginationContent className="flex items-center gap-10">
          <PaginationItem
            aria-disabled={prevDisabled}
            tabIndex={prevDisabled ? -1 : undefined}
            className={prevDisabled ? "opacity-40 pointer-events-none" : ""}
          >
            <PaginationPrevious
              size="sm"
              href="#"
              aria-label="Go to previous page"
              onClick={(e) => {
                e.preventDefault();
                if (!prevDisabled) onPageChange(currentPage - 1);
              }}
              className="hover:scale-105 transition"
            />
          </PaginationItem>

          {compactPages.map((token, idx) =>
            token === ELLIPSIS_TOKEN ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={`page-${token}`}>
                <PaginationLink
                  size="sm"
                  href="#"
                  isActive={token === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    const pageNumber = token as number;
                    if (pageNumber !== currentPage) onPageChange(pageNumber);
                  }}
                  className="hover:scale-105 transition"
                >
                  {token}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem
            aria-disabled={nextDisabled}
            tabIndex={nextDisabled ? -1 : undefined}
            className={nextDisabled ? "opacity-40 pointer-events-none" : ""}
          >
            <PaginationNext
              size={"sm"}
              href="#"
              aria-label="Go to next page"
              onClick={(e) => {
                e.preventDefault();
                if (!nextDisabled) onPageChange(currentPage + 1);
              }}
              className="hover:scale-105 transition"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {showSummary && (
        <p className="text-sm text-muted-foreground">
          Page <span className="font-medium">{currentPage}</span> of{" "}
          <span className="font-medium">{totalPages}</span> ·{" "}
          <span className="font-medium">{total}</span> items
        </p>
      )}
    </div>
  );
}
