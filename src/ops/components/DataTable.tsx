import { Fragment, ReactNode, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STATUS_TOKEN } from "../lib/statuses";
import type { MenuItem, Status } from "../lib/types";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "right" | "center";
  render?: (row: T) => ReactNode;
  /** value extractor for sorting */
  sortValue?: (row: T) => string | number;
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (r: T) => string;
  rowStatus?: (r: T) => Status | undefined;
  rowActions?: (r: T) => MenuItem[];
  expandable?: (r: T) => ReactNode;
  pageSize?: number;
  filters?: ReactNode;
  emptyState?: ReactNode;
  onRowClick?: (r: T) => void;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  rowStatus,
  rowActions,
  expandable,
  pageSize = 25,
  filters,
  emptyState,
  onRowClick,
}: Props<T>) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const get = col.sortValue ?? ((r: T) => (r as Record<string, unknown>)[sort.key] as string | number);
    return [...rows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize);

  function toggleSort(key: string) {
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: "asc" };
      if (s.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  function toggleExpand(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="flex flex-col">
      {filters}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead className="bg-[hsl(var(--ops-panel-2))] text-[hsl(var(--ops-muted-fg))]">
            <tr>
              {expandable && <th className="w-8" />}
              {rowStatus && <th className="w-1" />}
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  className={cn(
                    "h-8 border-b border-[hsl(var(--ops-border))] px-3 text-[11px] font-semibold uppercase tracking-wide",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    !c.align && "text-left",
                  )}
                >
                  {c.sortable ? (
                    <button
                      onClick={() => toggleSort(c.key)}
                      className="inline-flex items-center gap-1 hover:text-[hsl(var(--ops-fg))]"
                    >
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-50" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
              {rowActions && <th className="w-8" />}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (expandable ? 1 : 0) + (rowStatus ? 1 : 0) + (rowActions ? 1 : 0)}
                  className="p-0"
                >
                  {emptyState ?? <EmptyState title="No records" hint="Nothing to show yet." />}
                </td>
              </tr>
            )}
            {pageRows.map((row) => {
              const k = rowKey(row);
              const status = rowStatus?.(row);
              const stripeColor = status ? STATUS_TOKEN[status].dot : "";
              const isExp = expanded.has(k);
              const actions = rowActions?.(row);
              return (
                <Fragment key={k}>
                  <tr
                    className={cn(
                      "border-b border-[hsl(var(--ops-border))] transition-colors hover:bg-[hsl(var(--ops-panel-2))]",
                      onRowClick && "cursor-pointer",
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {expandable && (
                      <td className="w-8 px-2 align-middle" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => toggleExpand(k)} className="text-[hsl(var(--ops-muted-fg))] hover:text-[hsl(var(--ops-fg))]">
                          {isExp ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    )}
                    {rowStatus && <td className={cn("w-1 p-0", stripeColor)} />}
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={cn(
                          "h-9 px-3 align-middle text-[hsl(var(--ops-fg))]",
                          c.align === "right" && "text-right",
                          c.align === "center" && "text-center",
                        )}
                      >
                        {c.render ? c.render(row) : ((row as Record<string, unknown>)[c.key] as ReactNode)}
                      </td>
                    ))}
                    {rowActions && (
                      <td className="w-8 px-2 align-middle" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="text-[hsl(var(--ops-muted-fg))] hover:text-[hsl(var(--ops-fg))]">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[hsl(var(--ops-panel))] border-[hsl(var(--ops-border))]">
                            {actions?.map((a) => (
                              <DropdownMenuItem
                                key={a.label}
                                onClick={a.onClick}
                                className={cn(
                                  "text-[12px]",
                                  a.destructive && "text-[hsl(var(--ops-critical))]",
                                )}
                              >
                                {a.icon && <a.icon className="mr-2 h-3.5 w-3.5" />}
                                {a.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                  {expandable && isExp && (
                    <tr className="border-b border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel-2))]">
                      <td colSpan={columns.length + 1 + (rowStatus ? 1 : 0) + (rowActions ? 1 : 0)} className="px-6 py-4">
                        {expandable(row)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {sorted.length > pageSize && (
        <div className="flex items-center justify-between border-t border-[hsl(var(--ops-border))] bg-[hsl(var(--ops-panel))] px-3 py-2 text-[11px] text-[hsl(var(--ops-muted-fg))]">
          <span>
            {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={safePage === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-[hsl(var(--ops-border))] px-2 py-0.5 disabled:opacity-40 hover:bg-[hsl(var(--ops-panel-2))]"
            >
              Prev
            </button>
            <span className="px-2">
              {safePage + 1} / {totalPages}
            </span>
            <button
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-[hsl(var(--ops-border))] px-2 py-0.5 disabled:opacity-40 hover:bg-[hsl(var(--ops-panel-2))]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
