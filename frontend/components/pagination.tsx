"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate range of page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Adjust visible page counts on desktop

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include 1st page
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = 3;
      } else if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
      }

      if (start > 2) {
        pages.push("ellipsis-1");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("ellipsis-2");
      }

      // Always include last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn(
        "flex flex-wrap items-center justify-center gap-1.5 md:gap-2 mt-12 py-4",
        className,
      )}
    >
      {/* First Page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="hidden sm:flex h-9 w-9 md:h-10 md:w-10 rounded border border-border items-center justify-center text-foreground hover:bg-champagne/20 hover:border-gold disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-border transition-colors cursor-pointer disabled:cursor-not-allowed"
        aria-label="Go to first page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </button>

      {/* Previous Page */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9 md:h-10 md:w-10 rounded border border-border flex items-center justify-center text-foreground hover:bg-champagne/20 hover:border-gold disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-border transition-colors cursor-pointer disabled:cursor-not-allowed"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Mobile Page Indicator */}
      <span className="inline-flex sm:hidden text-xs font-semibold px-2 py-1 bg-muted/30 border border-border/60 rounded">
        Page {currentPage} of {totalPages}
      </span>

      {/* Page Numbers */}
      {pages.map((p, i) => {
        if (typeof p === "string") {
          return (
            <span
              key={`ellipsis-${i}`}
              className="hidden sm:flex h-9 w-6 md:h-10 md:w-8 items-center justify-center text-muted-foreground text-sm"
            >
              &hellip;
            </span>
          );
        }

        const active = p === currentPage;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "hidden sm:flex h-9 w-9 md:h-10 md:w-10 rounded items-center justify-center text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer",
              active
                ? "bg-gold text-gold-foreground shadow"
                : "border border-border text-foreground hover:bg-champagne/20 hover:border-gold",
            )}
            aria-current={active ? "page" : undefined}
            aria-label={`Go to page ${p}`}
          >
            {p}
          </button>
        );
      })}

      {/* Next Page */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9 md:h-10 md:w-10 rounded border border-border flex items-center justify-center text-foreground hover:bg-champagne/20 hover:border-gold disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-border transition-colors cursor-pointer disabled:cursor-not-allowed"
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Last Page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="hidden sm:flex h-9 w-9 md:h-10 md:w-10 rounded border border-border items-center justify-center text-foreground hover:bg-champagne/20 hover:border-gold disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-border transition-colors cursor-pointer disabled:cursor-not-allowed"
        aria-label="Go to last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
