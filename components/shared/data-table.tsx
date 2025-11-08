"use client";

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type DataTableColumn<T> = {
  key: string;               // accessor
  label: string;             // header label
  className?: string;        // optional th/td class
  render?: (row: T, rowIndex: number) => ReactNode; // custom cell renderer
  sortable?: boolean;        // show sort affordance (handled by parent)
};

export function DataTable<T>({
  rows,
  columns,
  isLoading,
  emptyText = "Tidak ada data.",
  startIndex = 0, // for sequential numbering calculation if needed in render
  onHeaderClick,
  sortKey,
  sortDir, // "asc" | "desc" | undefined
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  isLoading?: boolean;
  emptyText?: string;
  startIndex?: number;
  onHeaderClick?: (col: DataTableColumn<T>) => void;
  sortKey?: string;
  sortDir?: "asc" | "desc";
}) {
  const sortIcon = (col: DataTableColumn<T>) => {
    if (!col.sortable) return null;
    if (col.key !== sortKey) return <span className="text-xs opacity-50">↕</span>;
    return (
      <span className="text-xs">
        {sortDir === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  return (
    <div className="rounded-2xl border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={col.className}
                {...(col.sortable
                  ? {
                      role: "button",
                      onClick: () => onHeaderClick?.(col),
                      title: `Urutkan berdasarkan ${col.label}`,
                    }
                  : {})}
              >
                <div className="flex items-center gap-2 select-none">
                  <span>{col.label}</span>
                  {sortIcon(col)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, idx) => (
              <TableRow key={startIndex + idx}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render ? col.render(row, startIndex + idx) : (row as any)[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
