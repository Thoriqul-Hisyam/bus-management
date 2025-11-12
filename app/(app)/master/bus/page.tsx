"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  listBus,
  createBus,
  updateBus,
  deleteBus,
  listBusTypes,
} from "@/actions/bus";

import { z } from "zod";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import Pagination from "@/components/shared/pagination";
import { ActionDropdown } from "@/components/shared/action-dropdown";
import { CrudModal } from "@/components/shared/crud-modal";
import { DeleteConfirm } from "@/components/shared/delete-confirm";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import RSelect, { type Option as ROption } from "@/components/shared/rselect";
import { Controller } from "react-hook-form";
import { useHasPerm } from "@/components/SessionProvider";

type SortKey =
  | "name_asc"
  | "name_desc"
  | "plate_asc"
  | "plate_desc"
  | "type_asc"
  | "type_desc"
  | "capacity_asc"
  | "capacity_desc";

type BusTypeOpt = { id: number; name: string };

type Row = {
  id: number;
  name: string;
  plateNo: string;
  capacity: number;
  busTypeId: number;
  busType: { id: number; name: string } | null;
};

const FormSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  plateNo: z.string().min(1, "Nomor polisi wajib diisi"),
  busTypeId: z.coerce.number().int().positive("Tipe armada wajib dipilih"),
  capacity: z.coerce.number().int().min(0, "Minimal 0"),
});
type FormValues = z.infer<typeof FormSchema>;

export default function BusPage() {
  // === Permission checks (UI)
  const canCreate = useHasPerm("master.bus.create");
  const canUpdate = useHasPerm("master.bus.update");
  const canDelete = useHasPerm("master.bus.delete");

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("name_asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filterType, setFilterType] = useState<"all" | number>("all");

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [types, setTypes] = useState<BusTypeOpt[]>([]);

  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const typeOptions: ROption[] = useMemo(
    () => types.map((t) => ({ value: t.id, label: t.name })),
    [types]
  );

  async function fetchData(opts?: {
    q?: string;
    sort?: SortKey;
    page?: number;
    perPage?: number;
    busTypeId?: number | "all";
  }) {
    const _q = opts?.q ?? q;
    const _sort = opts?.sort ?? sort;
    const _page = opts?.page ?? page;
    const _perPage = opts?.perPage ?? perPage;
    const _busTypeId = opts?.busTypeId ?? filterType;

    setIsLoading(true);
    try {
      const res = await listBus({
        q: _q,
        sort: _sort,
        page: _page,
        perPage: _perPage,
        busTypeId: _busTypeId === "all" ? undefined : _busTypeId,
      });
      if (res.ok) {
        setRows(res.data.rows as Row[]);
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
      const t = await listBusTypes();
      if (t.ok) setTypes(t.data);
      await fetchData({ page: 1 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startTransition(() => void fetchData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, page, perPage]);

  useEffect(() => {
    setPage(1);
    startTransition(() => void fetchData({ page: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      startTransition(() => void fetchData({ page: 1 }));
    }, 450);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const startIndex = (page - 1) * perPage;

  const columns: DataTableColumn<Row>[] = useMemo(() => {
    const cols: DataTableColumn<Row>[] = [
      {
        key: "no",
        label: "No.",
        className: "w-16 text-center",
        render: (_r, i) => i + 1,
      },
      {
        key: "name",
        label: "Nama Armada",
        sortable: true,
        render: (r) => <span className="font-medium">{r.name}</span>,
      },
      {
        key: "plateNo",
        label: "No. Polisi",
        sortable: true,
        render: (r) => r.plateNo,
      },
      {
        key: "busType",
        label: "Jenis Armada",
        sortable: true,
        render: (r) => r.busType?.name ?? "—",
      },
      {
        key: "capacity",
        label: "Kapasitas",
        sortable: true,
        className: "w-24 text-right",
        render: (r) => r.capacity,
      },
    ];

    // tampilkan kolom aksi hanya jika punya salah satu izin update/delete
    if (canUpdate || canDelete) {
      cols.push({
        key: "actions",
        label: "Aksi",
        className: "w-24 text-right",
        render: (r) => {
          const items: { key: string; label: string; destructive?: boolean }[] = [];
          if (canUpdate) items.push({ key: "edit", label: "Edit" });
          if (canDelete) items.push({ key: "delete", label: "Hapus", destructive: true });
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

    return cols;
  }, [canUpdate, canDelete, page, perPage]);

  const sortKey =
    sort.startsWith("name")
      ? "name"
      : sort.startsWith("plate")
      ? "plateNo"
      : sort.startsWith("type")
      ? "busType"
      : sort.startsWith("capacity")
      ? "capacity"
      : undefined;
  const sortDir = sort.endsWith("_asc") ? "asc" : "desc";
  if (!isClient) return null;
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Master Data Armada</h1>

      {/* Toolbar */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari nama / plat / tipe armada..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q ? (
            <Button variant="ghost" onClick={() => setQ("")}>
              Reset
            </Button>
          ) : null}
        </div>

        {/* Filter Tipe Armada */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter Tipe</span>
          <div className="min-w-48 w-48">
            <RSelect
              options={[{ value: "all", label: "Semua Tipe" }, ...typeOptions]}
              value={filterType}
              onChange={(v) =>
                setFilterType(v === "all" || v === null ? "all" : Number(v))
              }
            />
          </div>
        </div>

        <div className="flex items-center sm:justify-end">
          {/* tombol tambah hanya jika punya izin create */}
          {canCreate && <Button onClick={() => setCreateOpen(true)}>+ Tambah</Button>}
        </div>
      </div>

      {/* Table */}
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
            setSort((p) => (p === "name_asc" ? "name_desc" : "name_asc"));
          }
          if (col.key === "plateNo") {
            setPage(1);
            setSort((p) => (p === "plate_asc" ? "plate_desc" : "plate_asc"));
          }
          if (col.key === "busType") {
            setPage(1);
            setSort((p) => (p === "type_asc" ? "type_desc" : "type_asc"));
          }
          if (col.key === "capacity") {
            setPage(1);
            setSort((p) =>
              p === "capacity_asc" ? "capacity_desc" : "capacity_asc"
            );
          }
        }}
      />

      {/* Pagination */}
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

      {/* Create Modal */}
      <CrudModal<FormValues>
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Tambah Armada"
        schema={FormSchema}
        defaultValues={{
          name: "",
          plateNo: "",
          busTypeId: (typeOptions[0]?.value as number | undefined) ?? undefined,
          capacity: 0,
        }}
        onSubmit={async (values) => {
          const res = await createBus(values);
          if (res.ok) {
            setCreateOpen(false);
            await fetchData();
          } else {
            throw new Error(res.error);
          }
        }}
        renderFields={(f) => (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Armada</label>
              <Input
                {...f.register("name")}
                placeholder="Contoh: Bus Pariwisata 01"
                autoFocus
              />
              {f.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {String(f.formState.errors.name.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">No. Polisi</label>
              <Input
                {...f.register("plateNo")}
                placeholder="Misal: B 1234 XYZ"
              />
              {f.formState.errors.plateNo && (
                <p className="text-sm text-destructive">
                  {String(f.formState.errors.plateNo.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipe Armada</label>
              <Controller
                name="busTypeId"
                control={f.control}
                render={({ field }) => (
                  <RSelect
                    options={typeOptions}
                    value={field.value as number | undefined}
                    onChange={(v) =>
                      field.onChange(v == null ? undefined : Number(v))
                    }
                    placeholder="Pilih tipe"
                  />
                )}
              />
              {f.formState.errors.busTypeId && (
                <p className="text-sm text-destructive">
                  {String(f.formState.errors.busTypeId.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kapasitas</label>
              <Input
                type="number"
                {...f.register("capacity", { valueAsNumber: true })}
                placeholder="Misal: 45"
              />
              {f.formState.errors.capacity && (
                <p className="text-sm text-destructive">
                  {String(f.formState.errors.capacity.message)}
                </p>
              )}
            </div>
          </>
        )}
      />

      {/* Edit Modal */}
      <CrudModal<FormValues>
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        title="Ubah Armada"
        schema={FormSchema}
        defaultValues={
          editRow
            ? {
                name: editRow.name,
                plateNo: editRow.plateNo,
                busTypeId: editRow.busTypeId,
                capacity: editRow.capacity,
              }
            : undefined
        }
        onSubmit={async (values) => {
          if (!editRow) return;
          const res = await updateBus({ id: editRow.id, ...values });
          if (res.ok) {
            setEditRow(null);
            await fetchData();
          } else {
            throw new Error(res.error);
          }
        }}
        renderFields={(f) => (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Armada</label>
              <Input
                {...f.register("name")}
                placeholder="Contoh: Bus Pariwisata 01"
                autoFocus
              />
              {f.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {String(f.formState.errors.name.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">No. Polisi</label>
              <Input
                {...f.register("plateNo")}
                placeholder="Misal: B 1234 XYZ"
              />
              {f.formState.errors.plateNo && (
                <p className="text-sm text-destructive">
                  {String(f.formState.errors.plateNo.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipe Armada</label>
              <Controller
                name="busTypeId"
                control={f.control}
                render={({ field }) => (
                  <RSelect
                    options={typeOptions}
                    value={field.value as number | undefined}
                    onChange={(v) =>
                      field.onChange(v == null ? undefined : Number(v))
                    }
                    placeholder="Pilih tipe"
                  />
                )}
              />
              {f.formState.errors.busTypeId && (
                <p className="text-sm text-destructive">
                  {String(f.formState.errors.busTypeId.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kapasitas</label>
              <Input
                type="number"
                {...f.register("capacity", { valueAsNumber: true })}
                placeholder="Misal: 45"
              />
              {f.formState.errors.capacity && (
                <p className="text-sm text-destructive">
                  {String(f.formState.errors.capacity.message)}
                </p>
              )}
            </div>
          </>
        )}
      />

      {/* Delete Confirm */}
      <DeleteConfirm
        open={!!deleting}
        title="Yakin ingin menghapus?"
        description={`Data "${deleting?.name ?? ""}" akan dihapus permanen.`}
        onOpenChange={(v) => !v && setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          const res = await deleteBus(deleting.id);
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
