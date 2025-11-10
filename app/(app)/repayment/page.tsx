"use client";

import { useEffect, useState, useMemo, useTransition } from "react";
import Swal from "sweetalert2";
import { listSchedules, updateStatusSchedule } from "@/actions/schedule";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import Pagination from "@/components/shared/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  paidAt: string;
  amount: number;
  priceTotal: number;
};

export default function ScheduleInputPage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 🔹 Fetch data
  async function fetchData(opts?: { page?: number }) {
    const _page = opts?.page ?? page;
    setIsLoading(true);
    try {
      const res = await listSchedules();
      if (res.ok) {
        let data: Row[] = res.data.rows
          .filter((s: any) => s.status === "CONFIRMED")
          .map((s: any) => ({
            id: s.id,
            customer: s.customer,
            bus: s.bus,
            paidAt: s.paidAt,
            amount: s.amount,
            priceTotal: s.priceTotal,
          }));

        // Filter search
        if (q) {
          const qLower = q.toLowerCase();
          data = data.filter(
            (r) =>
              r.customer.toLowerCase().includes(qLower) ||
              r.bus.toLowerCase().includes(qLower)
          );
        }

        // Sorting
        const sorted = [...data].sort((a, b) => {
          const dir = sort.endsWith("_asc") ? 1 : -1;
          if (sort.startsWith("customer"))
            return a.customer.localeCompare(b.customer) * dir;
          if (sort.startsWith("bus")) return a.bus.localeCompare(b.bus) * dir;
          if (sort.startsWith("date"))
            return (
              (new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime()) *
              dir
            );
          if (sort.startsWith("dp")) return (a.amount - b.amount) * dir;
          if (sort.startsWith("price"))
            return (a.priceTotal - b.priceTotal) * dir;
          return 0;
        });

        setTotal(sorted.length);
        setRows(sorted.slice((_page - 1) * perPage, _page * perPage));
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    startTransition(() => void fetchData({ page: 1 }));
  }, [q, sort, perPage]);

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
        render: (r) => new Date(r.paidAt).toLocaleDateString("id-ID"),
      },
      {
        key: "amount",
        label: "DP",
        sortable: true,
        className: "text-right",
        render: (r) => `Rp ${r.amount.toLocaleString()}`,
      },
      {
        key: "priceTotal",
        label: "Price",
        sortable: true,
        className: "text-right",
        render: (r) => `Rp ${r.priceTotal.toLocaleString()}`,
      },
      {
        key: "actions",
        label: "Aksi",
        className: "text-center",
        render: (r) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkLunas(r)}
          >
            Lunas
          </Button>
        ),
      },
    ],
    [startIndex]
  );

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
        sortKey={sort.split("_")[0]}
        sortDir={sort.endsWith("_asc") ? "asc" : "desc"}
        onHeaderClick={(col) => {
          if (!col.sortable) return;
          const key = col.key;
          setSort((prev) =>
            prev.startsWith(key) && prev.endsWith("_asc")
              ? `${key}_desc`
              : `${key}_asc`
          );
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
