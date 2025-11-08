"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import { PositionCreateEditDialog } from "@/components/position/position-modals";
import { DeleteConfirm } from "@/components/shared/delete-confirm";
import { createPosition, updatePosition, deletePosition } from "@/actions/position";

type SortKey = "name_asc" | "name_desc" | "id_asc" | "id_desc";
type PositionRow = { id: number; name: string };

export default function PositionTable(props: {
  rows: PositionRow[];
  total: number;
  page: number;
  perPage: number;
  q: string;
  sort: SortKey;
  isLoading?: boolean;
  onSearchChange: (v: string) => void;
  onToggleSortName: () => void;
  onPageChange: (p: number) => void;
  onPerPageChange: (pp: number) => void;
  onRefresh: () => void;
}) {
  const {
    rows, total, page, perPage, q, sort, isLoading,
    onSearchChange, onToggleSortName, onPageChange, onPerPageChange, onRefresh,
  } = props;

  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<PositionRow | null>(null);
  const [deleting, setDeleting] = useState<PositionRow | null>(null);

  const [searchText, setSearchText] = useState(q);
  useEffect(() => setSearchText(q), [q]);

  const nameSortIcon = useMemo(() => {
    return sort === "name_asc" ? "▲" : sort === "name_desc" ? "▼" : "";
  }, [sort]);

  const startIndex = (page - 1) * perPage;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari nama jabatan..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              onSearchChange(e.target.value);
            }}
            className="w-64"
          />
          {q ? (
            <Button variant="ghost" onClick={() => onSearchChange("")}>
              Reset
            </Button>
          ) : null}
        </div>

        <div className="sm:ml-auto flex items-center gap-2">
          <Button onClick={() => setCreateOpen(true)}>+ Tambah</Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 select-none text-center">No.</TableHead>
              <TableHead
                role="button"
                onClick={onToggleSortName}
                className="select-none"
                title="Urutkan berdasarkan Nama"
              >
                Nama Jabatan <span className="text-xs">{nameSortIcon}</span>
              </TableHead>
              <TableHead className="w-32 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, idx) => (
                <TableRow key={r.id}>
                  <TableCell className="text-center">
                    {startIndex + idx + 1}
                  </TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditRow(r)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleting(r)}>
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={page}
        perPage={perPage}
        total={total}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />

      <PositionCreateEditDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={async (values) => {
          const res = await createPosition(values);
          if (res.ok) {
            setCreateOpen(false);
            onRefresh();
          } else {
            throw new Error(res.error);
          }
        }}
      />

      <PositionCreateEditDialog
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        defaultValues={editRow ?? undefined}
        onSubmit={async (values) => {
          const res = await updatePosition({ id: editRow?.id, ...values });
          if (res.ok) {
            setEditRow(null);
            onRefresh();
          } else {
            throw new Error(res.error);
          }
        }}
      />

      <DeleteConfirm
        open={!!deleting}
        title="Yakin ingin menghapus?"
        description={`Data "${deleting?.name ?? ""}" akan dihapus permanen.`}
        onOpenChange={(v) => !v && setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          const res = await deletePosition(deleting.id);
          if (res.ok) {
            setDeleting(null);
            onRefresh();
          } else {
            throw new Error(res.error);
          }
        }}
      />
    </div>
  );
}
