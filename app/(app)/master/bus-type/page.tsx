"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { z } from "zod";
import {
  listBusTypes,
  createBusType,
  updateBusType,
  deleteBusType,
} from "@/actions/bus-type";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { CrudModal } from "@/components/shared/crud-modal";
import { DeleteConfirm } from "@/components/shared/delete-confirm";
import { ActionDropdown } from "@/components/shared/action-dropdown";
import Pagination from "@/components/shared/pagination";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useHasPerm } from "@/components/SessionProvider";

type Row = { id: number; name: string };
type SortKey = "name_asc" | "name_desc" | "id_asc" | "id_desc";

const PERM_CREATE = "master.bus_type.create";
const PERM_UPDATE = "master.bus_type.update";
const PERM_DELETE = "master.bus_type.delete";

const FormSchema = z.object({
  name: z.string().min(1, "Nama tipe armada wajib diisi"),
});
type FormValues = z.infer<typeof FormSchema>;

export default function BusTypePage() {
  // === Permission checks (UI)
  const canCreate = useHasPerm(PERM_CREATE);
  const canUpdate = useHasPerm(PERM_UPDATE);
  const canDelete = useHasPerm(PERM_DELETE);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("name_asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);

  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);

  async function fetchData(opts?: {
    q?: string;
    sort?: SortKey;
    page?: number;
    perPage?: number;
  }) {
    const _q = opts?.q ?? q;
    const _sort = opts?.sort ?? sort;
    const _page = opts?.page ?? page;
    const _perPage = opts?.perPage ?? perPage;

    setIsLoading(true);
    try {
      const res = await listBusTypes({
        q: _q,
        sort: _sort,
        page: _page,
        perPage: _perPage,
      });
      if (res.ok) {
        setRows(res.data.rows);
        setTotal(res.data.total);
      } else {
        console.error(res.error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    startTransition(async () => {
      await fetchData({ page: 1 });
    });
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

  const columns: DataTableColumn<Row>[] = useMemo(() => {
    const base: DataTableColumn<Row>[] = [
      {
        key: "no",
        label: "No.",
        className: "w-16 text-center",
        render: (_r, i) => i + 1,
      },
      {
        key: "name",
        label: "Nama",
        sortable: true,
        render: (r) => <span className="font-medium">{r.name}</span>,
      },
    ];

    // tampilkan kolom Aksi hanya jika punya salah satu izin update/delete
    if (canUpdate || canDelete) {
      base.push({
        key: "actions",
        label: "Aksi",
        className: "w-24 text-right",
        render: (r) => {
          const items: { key: string; label: string; destructive?: boolean }[] =
            [];
          if (canUpdate) items.push({ key: "edit", label: "Edit" });
          if (canDelete)
            items.push({ key: "delete", label: "Hapus", destructive: true });
          if (items.length === 0) return null;

          return (
            <ActionDropdown
              items={items}
              onClickItem={(key) => {
                if (key === "edit" && canUpdate) setEditRow(r);
                else if (key === "delete" && canDelete) setDeleting(r);
              }}
            />
          );
        },
      });
    }

    return base;
  }, [canUpdate, canDelete, page, perPage]);

  const sortKey =
    sort.startsWith("name") ? "name" : sort.startsWith("id") ? "id" : undefined;
  const sortDir = sort.endsWith("_asc") ? "asc" : "desc";

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Master Tipe Armada</h1>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 w-full sm:max-w-sm">
          <Input
            placeholder="Cari nama tipe armada..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q ? (
            <Button variant="ghost" onClick={() => setQ("")}>
              Reset
            </Button>
          ) : null}
        </div>

        <div className="flex items-center sm:ml-auto">
          {/* tombol tambah hanya jika punya izin create */}
          {canCreate && <Button onClick={() => setCreateOpen(true)}>+ Tambah</Button>}
        </div>
      </div>

      <DataTable<Row>
        rows={rows}
        columns={columns}
        isLoading={isLoading || isPending}
        startIndex={startIndex}
        sortKey={sortKey}
        sortDir={sortDir as any}
        onHeaderClick={(col) => {
          if (col.key === "name") {
            setPage(1);
            setSort((prev) =>
              prev === "name_asc" ? "name_desc" : "name_asc"
            );
          }
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

      {/* Create */}
      <CrudModal<FormValues>
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Tambah Tipe Armada"
        schema={FormSchema}
        defaultValues={{ name: "" }}
        onSubmit={async (values) => {
          const res = await createBusType(values);
          if (res.ok) {
            setCreateOpen(false);
            await fetchData();
          } else {
            throw new Error(res.error);
          }
        }}
        renderFields={(f) => (
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama</label>
            <Input
              {...f.register("name")}
              placeholder="Misal: EKONOMI / VIP / EKSEKUTIF"
              autoFocus
            />
            {f.formState.errors.name && (
              <p className="text-sm text-destructive">
                {String(f.formState.errors.name.message)}
              </p>
            )}
          </div>
        )}
      />

      {/* Edit */}
      <CrudModal<FormValues>
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        title="Ubah Tipe Armada"
        schema={FormSchema}
        defaultValues={editRow ? { name: editRow.name } : undefined}
        onSubmit={async (values) => {
          if (!editRow) return;
          const res = await updateBusType({ id: editRow.id, ...values });
          if (res.ok) {
            setEditRow(null);
            await fetchData();
          } else {
            throw new Error(res.error);
          }
        }}
        renderFields={(f) => (
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama</label>
            <Input
              {...f.register("name")}
              placeholder="Misal: EKONOMI / VIP / EKSEKUTIF"
              autoFocus
            />
            {f.formState.errors.name && (
              <p className="text-sm text-destructive">
                {String(f.formState.errors.name.message)}
              </p>
            )}
          </div>
        )}
      />

      {/* Delete */}
      <DeleteConfirm
        open={!!deleting}
        title="Yakin ingin menghapus?"
        description={`Data "${deleting?.name ?? ""}" akan dihapus permanen.`}
        onOpenChange={(v) => !v && setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          const res = await deleteBusType(deleting.id);
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
