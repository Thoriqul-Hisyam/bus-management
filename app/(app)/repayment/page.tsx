"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Swal from "sweetalert2";
import { listSchedules, updateStatusSchedule } from "@/actions/schedule";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import Pagination from "@/components/shared/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ----- Sort types (explicit unions so TS can narrow safely)
type SortField = "customer" | "bus" | "date" | "dp" | "price";
type SortKey =
  | "customer_asc"
  | "customer_desc"
  | "bus_asc"
  | "bus_desc"
  | "date_asc"
  | "date_desc"
  | "dp_asc"
  | "dp_desc"
  | "price_asc"
  | "price_desc";

type Row = {
  id: number;
  customer: string;
  bus: string;
  paidAt: string; // ISO
  amount: number; // DP
  priceTotal: number;
};

// map DataTable column keys → our SortField union
const headerToSortField: Partial<Record<string, SortField>> = {
  customer: "customer",
  bus: "bus",
  paidAt: "date",
  amount: "dp",
  priceTotal: "price",
};

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("id-ID");
}

export default function RepaymentPage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fetch data (client-side filtering & sorting for this view)
  async function fetchData(opts?: { page?: number }) {
    const _page = opts?.page ?? page;
    setIsLoading(true);
    try {
      const res = await listSchedules();
      if (res.ok) {
        let data: Row[] = (res.data.rows as any[])
          .filter((s) => s.status === "CONFIRMED")
          .map((s) => ({
            id: s.id,
            customer: s.customer ?? "—",
            bus: s.bus ?? "—",
            paidAt: s.paidAt, // may be null in some rows
            amount: Number(s.amount ?? 0),
            priceTotal: Number(s.priceTotal ?? 0),
          }));

        // search filter
        if (q) {
          const qLower = q.toLowerCase();
          data = data.filter(
            (r) =>
              r.customer.toLowerCase().includes(qLower) ||
              r.bus.toLowerCase().includes(qLower)
          );
        }

        // sort
        const dir = sort.endsWith("_asc") ? 1 : -1;
        if (sort.startsWith("customer")) {
          data.sort((a, b) => a.customer.localeCompare(b.customer) * dir);
        } else if (sort.startsWith("bus")) {
          data.sort((a, b) => a.bus.localeCompare(b.bus) * dir);
        } else if (sort.startsWith("date")) {
          data.sort(
            (a, b) =>
              ((new Date(a.paidAt).getTime() || 0) -
                (new Date(b.paidAt).getTime() || 0)) * dir
          );
        } else if (sort.startsWith("dp")) {
          data.sort((a, b) => (a.amount - b.amount) * dir);
        } else if (sort.startsWith("price")) {
          data.sort((a, b) => (a.priceTotal - b.priceTotal) * dir);
        }

        setTotal(data.length);
        setRows(data.slice((_page - 1) * perPage, _page * perPage));
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    startTransition(() => void fetchData({ page: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sort, perPage]);

  // table paging
  useEffect(() => {
    startTransition(() => void fetchData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const startIndex = (page - 1) * perPage;

  const handleMarkLunas = async (schedule: Row) => {
    const confirm = await Swal.fire({
      title: `Tandai booking ${schedule.customer} sebagai LUNAS?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, LUNAS",
      cancelButtonText: "Batal",
    });

    if (confirm.isConfirmed) {
      const res = await updateStatusSchedule(schedule.id, "COMPLETED");
      if (res.ok) {
        Swal.fire("Berhasil!", "Status booking sudah LUNAS.", "success");
        fetchData();
      } else {
        Swal.fire("Gagal!", res.error, "error");
      }
    }
  };

  const columns: DataTableColumn<Row>[] = useMemo(
    () => [
      {
        key: "no",
        label: "No.",
        className: "w-16 text-center",
        render: (_r, i) => i + 1 + startIndex,
      },
      {
        key: "customer",
        label: "Customer",
        sortable: true,
        render: (r) => r.customer,
      },
      { key: "bus", label: "Armada", sortable: true, render: (r) => r.bus },
      {
        key: "paidAt",
        label: "Tanggal DP",
        sortable: true,
        render: (r) => fmtDate(r.paidAt),
      },
      {
        key: "amount",
        label: "DP",
        sortable: true,
        className: "text-right",
        render: (r) => `Rp ${r.amount.toLocaleString("id-ID")}`,
      },
      {
        key: "priceTotal",
        label: "Price",
        sortable: true,
        className: "text-right",
        render: (r) => `Rp ${r.priceTotal.toLocaleString("id-ID")}`,
      },
      {
        key: "actions",
        label: "Aksi",
        className: "text-center",
        render: (r) => (
          <Button variant="outline" size="sm" onClick={() => handleMarkLunas(r)}>
            Lunas
          </Button>
        ),
      },
    ],
    [startIndex]
  );

  // map SortKey -> DataTable's sortKey (for header indicator)
  const sortKeyForTable: keyof Row | undefined =
    sort.startsWith("customer")
      ? "customer"
      : sort.startsWith("bus")
      ? "bus"
      : sort.startsWith("date")
      ? "paidAt"
      : sort.startsWith("dp")
      ? "amount"
      : sort.startsWith("price")
      ? "priceTotal"
      : undefined;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Tagihan Pembayaran</h1>

      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          placeholder="Cari customer / armada..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <DataTable<Row>
        rows={rows}
        columns={columns}
        isLoading={isLoading || isPending}
        startIndex={startIndex}
        sortKey={sortKeyForTable}
        sortDir={sort.endsWith("_asc") ? "asc" : "desc"}
        onHeaderClick={(col) => {
          if (!col.sortable) return;

          const field = headerToSortField[col.key as string];
          if (!field) return; // not a mapped sortable field

          const asc = `${field}_asc` as SortKey;
          const desc = `${field}_desc` as SortKey;

          setSort((prev) => (prev === asc ? desc : asc));
          setPage(1);
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
    </main>
  );
}
