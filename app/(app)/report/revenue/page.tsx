"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { listSchedules, listBusOptions } from "@/actions/schedule";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import Pagination from "@/components/shared/pagination";
import RSelect, { type Option as ROption } from "@/components/shared/rselect";

type SortKey =
  | "bus_asc"
  | "bus_desc"
  | "customer_asc"
  | "customer_desc"
  | "date_asc"
  | "date_desc"
  | "revenue_asc"
  | "revenue_desc";

type HeaderKey = "bus" | "customer" | "date" | "revenue";

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
  const [isClient, setIsClient] = useState(false);

  // === Filter State ===
  const [filterBusId, setFilterBusId] = useState<number | "all">("all");
  const [busOptions, setBusOptions] = useState<ROption[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  useEffect(() => setIsClient(true), []);

  // --- Sort helpers (typed) ---
  const ascMap: Record<HeaderKey, SortKey> = {
    bus: "bus_asc",
    customer: "customer_asc",
    date: "date_asc",
    revenue: "revenue_asc",
  };
  const descMap: Record<HeaderKey, SortKey> = {
    bus: "bus_desc",
    customer: "customer_desc",
    date: "date_desc",
    revenue: "revenue_desc",
  };

  const isHeaderKey = (k: unknown): k is HeaderKey =>
    k === "bus" || k === "customer" || k === "date" || k === "revenue";

  const toggleSort = (key: HeaderKey) => {
    setPage(1);
    setSort((prev) => (prev === ascMap[key] ? descMap[key] : ascMap[key]));
  };

  const currentSortKey: HeaderKey | undefined = useMemo(() => {
    if (sort.startsWith("bus")) return "bus";
    if (sort.startsWith("customer")) return "customer";
    if (sort.startsWith("date")) return "date";
    if (sort.startsWith("revenue")) return "revenue";
    return undefined;
  }, [sort]);

  // 🔹 Fetch Data
  async function fetchData(opts?: { page?: number }) {
    const _page = opts?.page ?? page;
    setIsLoading(true);
    try {
      const res = await listSchedules();
      if (res.ok) {
        let data: Row[] = res.data.rows.map((r: any) => ({
          id: r.id,
          bus: r.bus,
          customer: r.customer,
          date: r.rentStartAt,
          totalRevenue: r.priceTotal,
          trips: 1,
        }));

        // Filter Bus (dropdown)
        if (filterBusId !== "all" && filterBusId != null) {
          const selected = busOptions.find((b) => b.value === filterBusId);
          if (selected?.label) data = data.filter((r) => r.bus === selected.label);
        }

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
              (r.bus ?? "").toLowerCase().includes(qLower) ||
              (r.customer ?? "").toLowerCase().includes(qLower)
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

  // 🔹 Load data + bus options
  useEffect(() => {
    startTransition(async () => {
      const busRes = await listBusOptions();
      if (busRes.ok) setBusOptions(busRes.data);
      await fetchData({ page: 1 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔹 Re-fetch saat filter berubah
  useEffect(() => {
    startTransition(() => void fetchData({ page: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, filterBusId, dateFrom, dateTo, sort, perPage]);

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
  if (!isClient) return null;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Laporan Pendapatan</h1>

      {/* Toolbar */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari armada / Customer..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q ? (
            <Button variant="ghost" onClick={() => setQ("")}>
              Reset
            </Button>
          ) : null}
        </div>

        {/* Filter Armada Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            Armada
          </span>
          <div className="min-w-48 w-48">
            <RSelect
              instanceId="revenue-bus-filter"
              options={[{ value: "all", label: "Semua Armada" }, ...busOptions]}
              value={filterBusId}
              onChange={(v) =>
                setFilterBusId(v === "all" || v == null ? "all" : Number(v))
              }
            />
          </div>
        </div>

        {/* Date Filters */}
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
        sortKey={currentSortKey}
        sortDir={sort.endsWith("_asc") ? "asc" : "desc"}
        onHeaderClick={(col) => {
          if (!col.sortable) return;
          const key = col.key;
          if (isHeaderKey(key)) toggleSort(key);
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
