"use client";

import { useEffect, useState, useTransition } from "react";
import { listPositions, createPosition, updatePosition, deletePosition } from "@/actions/position";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import Pagination from "@/components/shared/pagination";
import { ActionDropdown } from "@/components/shared/action-dropdown";
import { CrudModal } from "@/components/shared/crud-modal";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeleteConfirm } from "@/components/shared/delete-confirm";

type SortKey = "name_asc" | "name_desc" | "id_asc" | "id_desc";
type PositionRow = { id: number; name: string };

const PositionSchema = z.object({
  name: z.string().min(1, "Nama jabatan wajib diisi"),
});

export default function PositionPage() {
  const [q, setQ] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("name_asc");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  const [rows, setRows] = useState<PositionRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<PositionRow | null>(null);
  const [deleting, setDeleting] = useState<PositionRow | null>(null);

  async function fetchData(opts?: { q?: string; sort?: SortKey; page?: number; perPage?: number }) {
    const _q = opts?.q ?? q;
    const _sort = opts?.sort ?? sort;
    const _page = opts?.page ?? page;
    const _perPage = opts?.perPage ?? perPage;

    setIsLoading(true);
    try {
      const res = await listPositions({ q: _q, sort: _sort, page: _page, perPage: _perPage });
      setRows(res.rows);
      setTotal(res.total);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    startTransition(() => void fetchData({ page: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startTransition(() => void fetchData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, page, perPage]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      startTransition(() => void fetchData({ page: 1 }));
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const startIndex = (page - 1) * perPage;
  const columns: DataTableColumn<PositionRow>[] = [
    {
      key: "no",
      label: "No.",
      className: "w-20 text-center",
      render: (_row, rowIndex) => rowIndex + 1,
    },
    {
      key: "name",
      label: "Nama Jabatan",
      sortable: true,
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "actions",
      label: "Aksi",
      className: "w-24 text-right",
      render: (row) => (
        <ActionDropdown
          items={[
            { key: "edit", label: "Edit" },
            { key: "delete", label: "Hapus", destructive: true },
          ]}
          onClickItem={(key) => {
            if (key === "edit") setEditRow(row);
            else if (key === "delete") setDeleting(row);
          }}
        />
      ),
    },
  ];

  const sortKey = sort.startsWith("name") ? "name" : undefined;
  const sortDir = sort === "name_asc" ? "asc" : sort === "name_desc" ? "desc" : undefined;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Master Data Jabatan</h1>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari nama jabatan..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
          {q ? (
            <Button variant="ghost" onClick={() => setQ("")}>
              Reset
            </Button>
          ) : null}
        </div>

        <div className="sm:ml-auto flex items-center gap-2">
          <Button onClick={() => setCreateOpen(true)}>+ Tambah</Button>
        </div>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        isLoading={isLoading || isPending}
        startIndex={startIndex}
        sortKey={sortKey}
        sortDir={sortDir}
        onHeaderClick={(col) => {
          if (col.key !== "name") return;
          setPage(1);
          setSort((prev) => (prev === "name_asc" ? "name_desc" : "name_asc"));
        }}
      />

      <div className="mt-3">
        <Pagination
          page={page}
          perPage={perPage}
          total={total}
          onPageChange={(p) => setPage(p)}
          onPerPageChange={(pp) => {
            setPage(1);
            setPerPage(pp);
          }}
        />
      </div>

      <CrudModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Tambah Jabatan"
        description="Isi nama jabatan untuk menambahkan data baru."
        schema={PositionSchema}
        onSubmit={async (values) => {
          const res = await createPosition(values);
          if (res.ok) {
            setCreateOpen(false);
            await fetchData();
          } else {
            throw new Error(res.error);
          }
        }}
        renderFields={(f) => (
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Jabatan</label>
            <Input placeholder="Contoh: Driver, Admin, Manager" {...f.register("name")} autoFocus />
            {f.formState.errors.name && (
              <p className="text-sm text-destructive">{f.formState.errors.name.message}</p>
            )}
          </div>
        )}
      />

      <CrudModal
        open={!!(editRow && editRow.id)}
        onOpenChange={(v) => !v && setEditRow(null)}
        title="Ubah Jabatan"
        description="Perbarui nama jabatan di bawah ini."
        schema={PositionSchema}
        defaultValues={editRow ? { name: editRow.name } : undefined}
        onSubmit={async (values) => {
          if (!editRow) return;
          const res = await updatePosition({ id: editRow.id, ...values });
          if (res.ok) {
            setEditRow(null);
            await fetchData();
          } else {
            throw new Error(res.error);
          }
        }}
        renderFields={(f) => (
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Jabatan</label>
            <Input placeholder="Nama jabatan" {...f.register("name")} autoFocus />
            {f.formState.errors.name && (
              <p className="text-sm text-destructive">{f.formState.errors.name.message}</p>
            )}
          </div>
        )}
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
            await fetchData();
          } else {
            throw new Error(res.error);
          }
        }}
      />
    </main>
  );
}
