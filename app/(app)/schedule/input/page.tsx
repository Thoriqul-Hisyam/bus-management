"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  listSchedules,
  deleteSchedule,
  listBusOptions,
} from "@/actions/schedule";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RSelect, { type Option } from "@/components/shared/rselect";
import Swal from "sweetalert2";
import { ActionDropdown } from "@/components/shared/action-dropdown";
import { useHasPerm } from "@/components/SessionProvider";

type SortKey =
  | "start_asc"
  | "start_desc"
  | "end_asc"
  | "end_desc"
  | "created_asc"
  | "created_desc";

type Row = {
  id: number;
  code: string | null;
  customer: string | null;
  bus: string | null;
  plateNo: string | null;
  pickupAddress: string | null;
  customerTravel: string | null;
  customerPhone: string | null;
  destination: string | null;
  seatsBooked: number | null;
  amount: number; // DP
  priceTotal: number;
  rentStartAt: string | null; // ISO
  rentEndAt: string | null; // ISO
  pickupAt: string | null; // ISO
  driver: string | null;
  coDriver: string | null;
  sales: string | null;
  legrest: boolean;
};

function fmtDate(dt: string | null) {
  if (!dt) return "—";
  try {
    const d = new Date(dt);
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dt;
  }
}

export default function ScheduleInputPage() {
  const router = useRouter();

  // permission checks
  const canRead = useHasPerm("schedule.input.read");
  const canCreate = useHasPerm("schedule.input.create");
  const canUpdate = useHasPerm("schedule.input.update");
  const canDelete = useHasPerm("schedule.input.delete");

  if (!canRead) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Input Jadwal Armada</h1>
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          Anda tidak memiliki izin untuk melihat jadwal.
        </div>
      </main>
    );
  }

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sort, setSort] = useState<SortKey>("created_desc");

  const [busOptions, setBusOptions] = useState<Option[]>([]);
  const [busId, setBusId] = useState<number | null>(null);
  const [startFrom, setStartFrom] = useState<string>(""); // YYYY-MM-DD or datetime-local
  const [endTo, setEndTo] = useState<string>("");

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);

  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    (async () => {
      const res = await listBusOptions();
      if (res.ok) {
        setBusOptions(res.data);
      } else {
        console.error(res.error);
      }
    })();
  }, []);

  async function fetchData(opts?: {
    q?: string;
    page?: number;
    perPage?: number;
    sort?: SortKey;
    busId?: number | null;
    startFrom?: string;
    endTo?: string;
  }) {
    const _q = opts?.q ?? q;
    const _page = opts?.page ?? page;
    const _perPage = opts?.perPage ?? perPage;
    const _sort = opts?.sort ?? sort;
    const _busId = opts?.busId ?? busId;
    const _startFrom = opts?.startFrom ?? startFrom;
    const _endTo = opts?.endTo ?? endTo;

    setIsLoading(true);
    try {
      const res = await listSchedules({
        q: _q,
        page: _page,
        perPage: _perPage,
        sort: _sort,
        busId: _busId ?? undefined,
        startFrom: _startFrom || undefined,
        endTo: _endTo || undefined,
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
    startTransition(() => void fetchData({ page: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startTransition(() => void fetchData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, page, perPage, busId, startFrom, endTo]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      startTransition(() => void fetchData({ page: 1 }));
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const startIndex = (page - 1) * perPage;

  const columns: DataTableColumn<Row>[] = useMemo(
    () => [
      {
        key: "no",
        label: "No.",
        className: "w-14 text-center",
        render: (_r, i) => i + 1,
      },
      {
        key: "customer",
        label: "Customer",
        render: (r) => (
          <div className="flex flex-col">
            <span className="font-medium">{r.customer ?? "—"}</span>
            <span className="text-xs text-muted-foreground">
              {r.customerTravel ?? "-"}
            </span>
          </div>
        ),
      },
      {
        key: "customerPhone",
        label: "No. Customer",
        render: (r) => r.customerPhone ?? "—",
      },
      {
        key: "bus",
        label: "Armada",
        render: (r) => (
          <div className="flex flex-col">
            <span className="font-medium">{r.bus ?? "—"}</span>
            <span className="text-xs text-muted-foreground">
              {r.plateNo ?? ""}
            </span>
          </div>
        ),
      },
      {
        key: "legrest",
        label: "Legrest",
        render: (r) => (r.legrest ? "Yes" : "No"),
      },
      {
        key: "pickupAddress",
        label: "Penjemputan",
        render: (r) => r.pickupAddress ?? "—",
      },
      {
        key: "pickupAt",
        label: "Tgl Penjemputan",
        render: (r) => {
          if (!r.pickupAt) return <span>—</span>;

          const date = new Date(r.pickupAt);
          const tanggal = date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const jam = `${String(date.getHours()).padStart(2, "0")}:${String(
            date.getMinutes()
          ).padStart(2, "0")}`;
          return (
            <div className="flex flex-col text-sm leading-tight text-center">
              <span>{tanggal}</span>
              <span className="text-muted-foreground text-center">{jam}</span>
            </div>
          );
        },
      },
      {
        key: "destination",
        label: "Tujuan",
        render: (r) => r.destination ?? "—",
      },
      {
        key: "amount",
        label: "DP / Total",
        render: (r) => (
          <div className="flex flex-col">
            <span className="text-xs">DP: Rp {r.amount.toLocaleString()}</span>
            <span className="font-medium">
              Rp {r.priceTotal.toLocaleString()}
            </span>
          </div>
        ),
      },
      {
        key: "rentStartAt",
        label: "Mulai",
        sortable: true,
        render: (r) => {
          if (!r.rentStartAt) return <span>—</span>;

          const date = new Date(r.rentStartAt);
          const tanggal = date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const jam = `${String(date.getHours()).padStart(2, "0")}:${String(
            date.getMinutes()
          ).padStart(2, "0")}`;
          return (
            <div className="flex flex-col text-sm leading-tight text-center">
              <span>{tanggal}</span>
              <span className="text-muted-foreground text-center">{jam}</span>
            </div>
          );
        },
      },
      {
        key: "rentEndAt",
        label: "Selesai",
        sortable: true,
        render: (r) => {
          if (!r.rentEndAt) return <span>—</span>;

          const date = new Date(r.rentEndAt);
          const tanggal = date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const jam = `${String(date.getHours()).padStart(2, "0")}:${String(
            date.getMinutes()
          ).padStart(2, "0")}`;
          return (
            <div className="flex flex-col text-sm leading-tight text-center">
              <span>{tanggal}</span>
              <span className="text-muted-foreground text-center">{jam}</span>
            </div>
          );
        },
      },

      {
        key: "crew",
        label: "Crew",
        render: (r) => (
          <div className="text-xs leading-tight">
            <div>Driver: {r.driver ?? "—"}</div>
            <div>Co: {r.coDriver ?? "—"}</div>
            <div>Sales: {r.sales ?? "—"}</div>
          </div>
        ),
      },
      {
        key: "actions",
        label: "Aksi",
        className: "w-28 text-right",
        render: (r) => {
          // siapkan item sesuai permission
          const items: { key: "edit" | "delete"; label: string; destructive?: boolean }[] = [];
          if (canUpdate) items.push({ key: "edit", label: "Edit" });
          if (canDelete) items.push({ key: "delete", label: "Hapus", destructive: true });

          if (items.length === 0) return <span className="text-muted-foreground">—</span>;

          return (
            <ActionDropdown
              items={items as any}
              onClickItem={async (key) => {
                if (key === "edit") {
                  router.push(`/schedule/input/${r.id}/edit`);
                  return;
                }
                if (key === "delete") {
                  const conf = await Swal.fire({
                    title: "Hapus jadwal ini?",
                    text: `Booking #${r.id} akan dihapus permanen.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Hapus",
                    cancelButtonText: "Batal",
                    confirmButtonColor: "#dc2626",
                  });
                  if (!conf.isConfirmed) return;
                  const res = await deleteSchedule(r.id);
                  if (res.ok) {
                    await fetchData();
                  } else {
                    Swal.fire("Gagal", res.error, "error");
                  }
                }
              }}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, perPage, canUpdate, canDelete]
  );

  const sortKey = sort.startsWith("start")
    ? "rentStartAt"
    : sort.startsWith("end")
    ? "rentEndAt"
    : undefined;
  const sortDir = sort.endsWith("_asc") ? "asc" : "desc";
  if (!isClient) return null;
  return (
    <main className="p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Input Jadwal Armada</h1>
        <div>
          {canCreate ? (
            <Link href="/schedule/input/new">
              <Button>+ Tambah Jadwal</Button>
            </Link>
          ) : null}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari customer/armada/tujuan..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q ? (
            <Button variant="ghost" onClick={() => setQ("")}>
              Reset
            </Button>
          ) : null}
        </div>

        <div className="min-w-48 w-full">
          <label className="block text-xs text-muted-foreground mb-1">
            Filter Armada
          </label>
          <RSelect
            instanceId="bus-filter"
            options={[{ value: "all", label: "Semua Armada" }, ...busOptions]}
            value={busId ?? "all"}
            onChange={(v) => {
              setPage(1);
              if (v === "all" || v === null) setBusId(null);
              else setBusId(Number(v));
            }}
            isClearable={false}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Mulai Dari
            </label>
            <Input
              type="datetime-local"
              value={startFrom}
              onChange={(e) => {
                setPage(1);
                setStartFrom(e.target.value);
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Selesai Hingga
            </label>
            <Input
              type="datetime-local"
              value={endTo}
              onChange={(e) => {
                setPage(1);
                setEndTo(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Urutkan
            </label>
            <RSelect
              instanceId="sort-schedule"
              options={[
                { value: "created_desc", label: "Terbaru dibuat" },
                { value: "created_asc", label: "Terlama dibuat" },
                { value: "start_desc", label: "Mulai terbaru" },
                { value: "start_asc", label: "Mulai terlama" },
                { value: "end_desc", label: "Selesai terbaru" },
                { value: "end_asc", label: "Selesai terlama" },
              ]}
              value={sort}
              onChange={(v) => {
                setPage(1);
                setSort((v as SortKey) ?? "created_desc");
              }}
              isClearable={false}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Per Halaman
            </label>
            <RSelect
              instanceId="perpage-schedule"
              options={[10, 20, 50, 100].map((n) => ({
                value: String(n),
                label: String(n),
              }))}
              value={String(perPage)}
              onChange={(v) => {
                const pp = Number(v ?? "10");
                setPage(1);
                setPerPage(pp);
              }}
              isClearable={false}
            />
          </div>
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
          if (col.key === "rentStartAt") {
            setPage(1);
            setSort((prev) =>
              prev === "start_asc" ? "start_desc" : "start_asc"
            );
          }
          if (col.key === "rentEndAt") {
            setPage(1);
            setSort((prev) =>
              prev === "end_asc" ? "end_desc" : "end_asc"
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
    </main>
  );
}
