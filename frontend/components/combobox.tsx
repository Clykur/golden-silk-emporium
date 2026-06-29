"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  isLoading?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  isLoading = false,
  error,
  disabled = false,
  className,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update positioning
  const updatePosition = () => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999, // Ensure it's above everything
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true); // true to catch all scroll events
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Also check if the click is inside the portal dropdown
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !(target as Element).closest("[data-combobox-dropdown]")
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
      setQuery("");
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions =
    query === ""
      ? options
      : options.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between border bg-background px-3 py-2.5 text-xs tracking-widest uppercase transition-colors focus:outline-none",
          error
            ? "border-destructive text-destructive"
            : "border-border hover:border-foreground/50 focus:border-foreground",
          disabled && "opacity-50 cursor-not-allowed hover:border-border",
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {isLoading ? (
          <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
        ) : (
          <ChevronDown
            className={cn(
              "ml-2 h-4 w-4 shrink-0 transition-transform duration-200 opacity-50",
              isOpen && "rotate-180",
            )}
          />
        )}
      </button>

      {/* Dropdown Menu (Portal) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={dropdownStyle}
                data-combobox-dropdown="true"
                className="border border-border bg-background shadow-lg outline-none overflow-hidden"
              >
                {/* Search Input */}
                <div className="flex items-center border-b border-border px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <input
                    ref={inputRef}
                    className="flex h-10 w-full bg-transparent py-3 text-xs outline-none placeholder:text-muted-foreground uppercase tracking-widest"
                    placeholder={searchPlaceholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                {/* Options List */}
                <ul
                  className="max-h-60 overflow-y-auto overscroll-contain py-1 hide-scrollbar"
                  role="listbox"
                  tabIndex={-1}
                  data-lenis-prevent="true"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {filteredOptions.length === 0 ? (
                    <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                      {emptyText}
                    </li>
                  ) : (
                    filteredOptions.map((option) => {
                      const isSelected = value === option.value;
                      return (
                        <li
                          key={option.value}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            onChange(option.value);
                            setIsOpen(false);
                            setQuery("");
                          }}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center px-3 py-2.5 text-xs uppercase tracking-widest transition-colors hover:bg-muted hover:text-foreground",
                            isSelected
                              ? "bg-muted font-medium text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              isSelected ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="truncate">{option.label}</span>
                        </li>
                      );
                    })
                  )}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
