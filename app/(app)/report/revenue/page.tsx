"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { listSchedules } from "@/actions/schedule";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import Pagination from "@/components/shared/pagination";

type SortKey =
  | "bus_asc"
  | "bus_desc"
  | "customer_asc"
  | "customer_desc"
  | "date_asc"
  | "date_desc"
  | "revenue_asc"
  | "revenue_desc";

type Row = {
  id: number;
  bus: string;
  customer: string;
  date: string;
  totalRevenue: number;
  trips: number;
};

export default function ReportRevenuePage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);

  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const [busFilter, setBusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // 🔹 Fetch data
  async function fetchData(opts?: { page?: number }) {
    const _page = opts?.page ?? page;
    setIsLoading(true);
    try {
      const res = await listSchedules();
      if (res.ok) {
        let data: Row[] = res.data.map((r) => ({
          id: r.id,
          bus: r.bus,
          customer: r.customer,
          date: r.rentStartAt,
          totalRevenue: r.priceTotal,
          trips: 1,
        }));

        // Filter bus
        if (busFilter) data = data.filter((r) => r.bus.includes(busFilter));

        // Filter tanggal
        if (dateFrom && dateTo) {
          const from = new Date(dateFrom);
          const to = new Date(dateTo);
          data = data.filter((r) => {
            const d = new Date(r.date);
            return d >= from && d <= to;
          });
        }

        // Search query
        if (q) {
          const qLower = q.toLowerCase();
          data = data.filter(
            (r) =>
              r.bus.toLowerCase().includes(qLower) ||
              r.customer.toLowerCase().includes(qLower)
          );
        }

        // Sorting
        const sorted = [...data].sort((a, b) => {
          const dir = sort.endsWith("_asc") ? 1 : -1;
          if (sort.startsWith("bus")) return a.bus.localeCompare(b.bus) * dir;
          if (sort.startsWith("customer"))
            return a.customer.localeCompare(b.customer) * dir;
          if (sort.startsWith("date"))
            return (
              (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir
            );
          if (sort.startsWith("revenue"))
            return (a.totalRevenue - b.totalRevenue) * dir;
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
  }, [q, busFilter, dateFrom, dateTo, sort, perPage]);

  const startIndex = (page - 1) * perPage;

  const columns: DataTableColumn<Row>[] = useMemo(
    () => [
      {
        key: "no",
        label: "No.",
        className: "w-16 text-center",
        render: (_r, i) => i + 1 + startIndex,
      },
      { key: "bus", label: "Armada", sortable: true, render: (r) => r.bus },
      {
        key: "customer",
        label: "Customer",
        sortable: true,
        render: (r) => r.customer,
      },
      {
        key: "date",
        label: "Tanggal",
        sortable: true,
        render: (r) => new Date(r.date).toLocaleDateString("id-ID"),
      },
      {
        key: "revenue",
        label: "Total Pendapatan",
        sortable: true,
        className: "text-right",
        render: (r) => `Rp ${r.totalRevenue.toLocaleString("id-ID")}`,
      },
    ],
    [startIndex]
  );

  const totalRevenue = rows.reduce((sum, r) => sum + r.totalRevenue, 0);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Laporan Pendapatan</h1>

      {/* Toolbar */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder="Cari armada / Customer..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Filter Armada..."
          value={busFilter}
          onChange={(e) => setBusFilter(e.target.value)}
        />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {/* Table */}
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

      <div className="mt-3 font-semibold text-right text-green-600">
        Total Pendapatan: Rp {totalRevenue.toLocaleString("id-ID")}
      </div>
    </main>
  );
}
