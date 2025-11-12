"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { listPositions, deletePosition } from "@/actions/position";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import Pagination from "@/components/shared/pagination";
import { ActionDropdown } from "@/components/shared/action-dropdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeleteConfirm } from "@/components/shared/delete-confirm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHasPerm } from "@/components/SessionProvider";

type SortKey = "name_asc" | "name_desc" | "id_asc" | "id_desc";
type PositionRow = { id: number; name: string };

export default function PositionPage() {
  // === Permission checks (UI)
  const canCreate = useHasPerm("master.position.create");
  const canUpdate = useHasPerm("master.position.update");
  const canDelete = useHasPerm("master.position.delete");

  const [q, setQ] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("name_asc");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  const [rows, setRows] = useState<PositionRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [deleting, setDeleting] = useState<PositionRow | null>(null);
  const router = useRouter();

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
      const res = await listPositions({
        q: _q,
        sort: _sort,
        page: _page,
        perPage: _perPage,
      });
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

  // === Columns (aksi kondisional sesuai permission)
  const columns: DataTableColumn<PositionRow>[] = useMemo(() => {
    const base: DataTableColumn<PositionRow>[] = [
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
    ];

    if (canUpdate || canDelete) {
      base.push({
        key: "actions",
        label: "Aksi",
        className: "w-24 text-right",
        render: (row) => {
          const items: { key: string; label: string; destructive?: boolean }[] = [];
          if (canUpdate) items.push({ key: "edit", label: "Edit" });
          if (canDelete) items.push({ key: "delete", label: "Hapus", destructive: true });
          if (items.length === 0) return null;

          return (
            <ActionDropdown
              items={items}
              onClickItem={(key) => {
                if (key === "edit" && canUpdate) router.push(`/master/position/${row.id}/edit`);
                else if (key === "delete" && canDelete) setDeleting(row);
              }}
            />
          );
        },
      });
    }

    return base;
  }, [canUpdate, canDelete, router]);

  const sortKey = sort.startsWith("name") ? "name" : undefined;
  const sortDir =
    sort === "name_asc" ? "asc" : sort === "name_desc" ? "desc" : undefined;

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
          {/* Tambah hanya jika punya izin create */}
          {canCreate && (
            <Button asChild>
              <Link href="/master/position/new">+ Tambah</Link>
            </Button>
          )}
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
