"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Pagination({
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
}: {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}) {
  const pageCount = Math.max(Math.ceil(total / perPage), 1);

  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">
        Menampilkan {start}–{end} dari {total} data
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">Per halaman</span>
        <Select
          value={String(perPage)}
          onValueChange={(v) => onPerPageChange(Number(v))}
        >
          <SelectTrigger className="w-[96px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50, 100].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.max(page - 1, 1))}
            disabled={page <= 1}
          >
            Prev
          </Button>
          <span className="text-sm">
            Page {Math.min(page, pageCount)} / {pageCount}
          </span>
          <Button
            variant="outline"
            onClick={() => onPageChange(Math.min(page + 1, pageCount))}
            disabled={page >= pageCount}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
