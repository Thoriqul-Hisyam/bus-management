"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import { listTripSheets, listBusOptions, type TripSheetSort } from "@/actions/schedule";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RSelect, { type Option as ROption } from "@/components/shared/rselect";

type Row = {
  id: number;
  status?: string | null;

  customer: string | null;
  bus: string | null;
  plateNo: string | null;
  pickupAddress: string | null;
  destination: string | null;

  priceTotal: number;

  rentStartAt: string | null;
  rentEndAt: string | null;

  driver: string | null;
  coDriver: string | null;

  tripId: number | null;

  // untuk print
  sangu: number | null;
  premiDriver: number | null;
  premiCoDriver: number | null;
  umDriver: number | null;
  umCoDriver: number | null;
  bbm: number | null;
  total: number | null;
  description: string | null;
};

type SortKey =
  | "customer"
  | "bus"
  | "pickup"
  | "destination"
  | "price"
  | "rentStartAt"
  | "rentEndAt";

export default function TripSheetPage() {
  const router = useRouter();

  // === UI State (mirip /master/bus) ===
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<TripSheetSort>("start_desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [filterBusId, setFilterBusId] = useState<number | "all">("all");
  const [filterStart, setFilterStart] = useState<string>(""); // YYYY-MM-DD
  const [filterEnd, setFilterEnd] = useState<string>("");     // YYYY-MM-DD

  // data state
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [busOptions, setBusOptions] = useState<ROption[]>([]);

  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  // === Fetchers ===
  async function fetchData(opts?: {
    q?: string;
    sort?: TripSheetSort;
    page?: number;
    perPage?: number;
    busId?: number | "all";
    start?: string;
    end?: string;
  }) {
    const _q = opts?.q ?? q;
    const _sort = opts?.sort ?? sort;
    const _page = opts?.page ?? page;
    const _perPage = opts?.perPage ?? perPage;
    const _busId = opts?.busId ?? filterBusId;
    const _start = opts?.start ?? filterStart;
    const _end = opts?.end ?? filterEnd;

    setIsLoading(true);
    try {
      const res = await listTripSheets({
        q: _q,
        sort: _sort,
        page: _page,
        perPage: _perPage,
        busId: _busId === "all" ? undefined : Number(_busId),
        start: _start || null,
        end: _end || null,
      });
      if (res.ok) {
        setRows(res.data.rows as Row[]);
        setTotal(res.data.total);
      } else {
        Swal.fire({ icon: "error", title: "Error", text: res.error });
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    startTransition(async () => {
      // load options bus
      const busRes = await listBusOptions();
      if (busRes.ok) setBusOptions(busRes.data);

      // first load
      await fetchData({ page: 1 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sort/page/perPage perubahan → fetch lagi
  useEffect(() => {
    startTransition(() => void fetchData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, page, perPage]);

  // filter bus / tanggal → reset page ke 1 + fetch
  useEffect(() => {
    setPage(1);
    startTransition(() => void fetchData({ page: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterBusId, filterStart, filterEnd]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      startTransition(() => void fetchData({ page: 1 }));
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const startIndex = (page - 1) * perPage;

  // === Kolom DataTable ===
  const columns: DataTableColumn<Row>[] = useMemo(
    () => [
      {
        key: "no",
        label: "No.",
        className: "w-16 text-center",
        render: (_r, i) => i + 1,
      },
      {
        key: "customer",
        label: "Customer",
        sortable: true,
        render: (r) => r.customer ?? "—",
      },
      {
        key: "bus",
        label: "Armada",
        sortable: true,
        render: (r) => r.bus ?? "—",
      },
      {
        key: "pickup",
        label: "Penjemputan",
        sortable: true,
        render: (r) => r.pickupAddress ?? "—",
      },
      {
        key: "destination",
        label: "Tujuan",
        sortable: true,
        render: (r) => r.destination ?? "—",
      },
      {
        key: "price",
        label: "Price",
        sortable: true,
        className: "whitespace-nowrap text-right",
        render: (r) => `Rp ${Number(r.priceTotal ?? 0).toLocaleString("id-ID")}`,
      },
      {
        key: "rentStartAt",
        label: "Mulai",
        sortable: true,
        render: (r) =>
          r.rentStartAt
            ? new Date(r.rentStartAt).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—",
      },
      {
        key: "rentEndAt",
        label: "Selesai",
        sortable: true,
        render: (r) =>
          r.rentEndAt
            ? new Date(r.rentEndAt).toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—",
      },
      {
        key: "actions",
        label: "Aksi",
        className: "w-40 text-right",
        render: (r) => (
          <div className="flex justify-end gap-2">
            {r.tripId ? (
              <Button variant="outline" size="sm" onClick={() => handlePrint(r)}>
                Cetak
              </Button>
            ) : null}
            <Button variant="default" size="sm" onClick={() => router.push(`/trip_sheet/create/${r.id}`)}>
              Create / Edit
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, perPage]
  );

  // === Mapping sort untuk DataTable header indicator ===
  const sortKey: SortKey | undefined =
    sort.startsWith("customer") ? "customer" :
    sort.startsWith("bus") ? "bus" :
    sort.startsWith("pickup") ? "pickup" :
    sort.startsWith("destination") ? "destination" :
    sort.startsWith("price") ? "price" :
    sort.startsWith("start") ? "rentStartAt" :
    sort.startsWith("end") ? "rentEndAt" :
    undefined;

  const sortDir = sort.endsWith("_asc") ? "asc" : "desc";

  // === Click header → toggle sort (server processed) ===
  function toggleSort(colKey: SortKey) {
    const mapPrefix: Record<SortKey, string> = {
      customer: "customer",
      bus: "bus",
      pickup: "pickup",
      destination: "destination",
      price: "price",
      rentStartAt: "start",
      rentEndAt: "end",
    };

    const prefix = mapPrefix[colKey];
    setPage(1);
    setSort((prev) => {
      const asc = `${prefix}_asc` as TripSheetSort;
      const desc = `${prefix}_desc` as TripSheetSort;
      return prev === asc ? desc : asc;
    });
  }

  // === Print handler ===
  function handlePrint(s: Row) {
    const w = window.open("", "_blank");
    if (!w) return;
    const rupiah = (n: number | null | undefined) => `Rp ${(Number(n ?? 0)).toLocaleString("id-ID")}`;
    const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("id-ID") : "-");

    w.document.write(`
      <html>
        <head>
          <title>Surat Jalan ${s.customer ?? ""}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            td, th { border: 1px solid black; padding: 6px; font-size: 12px; vertical-align: top; }
            h2 { margin: 0; text-align: right; }
            .logo { width: 120px; }
            .note { color: red; font-weight: bold; text-align: center; margin-top: 10px; font-size: 12px; }
            .footer { text-align: center; font-weight: bold; margin-top: 15px; font-size: 12px; }
          </style>
        </head>
        <body>
          <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
            <tr>
              <td style="width:120px;"><img id="logo" src="/img/logo.png" style="width:120px;" /></td>
              <td>
                <p style="font-size:16px; margin:0; line-height:1.4;">
                  <strong>Alamat Garasi:</strong><br/>
                  Jl. Merr Boulevard No. 22<br/>
                  Kec. Rungkut, Penjaringan Sari<br/>
                  Kota Surabaya
                </p>
              </td>
              <td style="text-align:right; font-size:16px;">
                <h2 style="margin:0;">SURAT JALAN</h2>
                <p style="margin:0;">No. ${s.id}</p>
              </td>
            </tr>
          </table>

          <table>
            <tr><td>Armada</td><td>${s.bus ?? "-"}</td><td>Tujuan / Rute</td><td>${s.destination ?? "-"}</td></tr>
            <tr><td>Nopol</td><td>${s.plateNo ?? "-"}</td><td>Sangu</td><td>${rupiah(s.sangu)}</td></tr>
            <tr><td>Driver</td><td>${s.driver ?? "-"}</td><td>Tagihan</td><td>${rupiah(s.priceTotal)}</td></tr>
            <tr><td>Co Driver</td><td>${s.coDriver ?? "-"}</td><td>Premi Driver</td><td>${rupiah(s.premiDriver)}</td></tr>
            <tr><td>Panitia</td><td>${s.customer ?? "-"}</td><td>Premi Co Driver</td><td>${rupiah(s.premiCoDriver)}</td></tr>
            <tr><td>Tgl. Berangkat</td><td>${fmtDate(s.rentStartAt)}</td><td>UM Driver</td><td>${rupiah(s.umDriver)}</td></tr>
            <tr><td>Tgl. Pulang</td><td>${fmtDate(s.rentEndAt)}</td><td>UM Co Driver</td><td>${rupiah(s.umCoDriver)}</td></tr>
            <tr><td>Penjemputan</td><td>${s.pickupAddress ?? "-"}</td><td>BBM</td><td>${rupiah(s.bbm)}</td></tr>
            <tr><td>Keterangan</td><td>${s.description ?? "-"}</td><td>Total</td><td>${rupiah(s.total)}</td></tr>
          </table>

          <p class="note">
            DRIVER / CO DRIVER YANG CUTI, NAMA PENGGANTINYA HARAP DI TULIS DI SURAT JALAN.<br/>
            MAU CUTI.....!!! KONFIRMASI KANTOR / HUBUNGI BPK. ALIM
          </p>

          <p class="footer">KAMI HARAP AGAR DI ISI</p>

          <script>
            const logo = document.getElementById('logo');
            if (logo && logo.complete) window.print();
            else if (logo) logo.onload = () => window.print();
            else window.print();
          </script>
        </body>
      </html>
    `);
    w.document.close();
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">List Surat Jalan</h1>

      {/* Toolbar */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari customer / armada / tujuan / penjemputan..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q ? (
            <Button variant="ghost" onClick={() => setQ("")}>
              Reset
            </Button>
          ) : null}
        </div>

        {/* Filter Armada */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Armada</span>
          <div className="min-w-48 w-48">
            <RSelect
              instanceId="trip-bus-filter"
              options={[{ value: "all", label: "Semua Armada" }, ...busOptions]}
              value={filterBusId}
              onChange={(v) => setFilterBusId(v === "all" || v == null ? "all" : Number(v))}
            />
          </div>
        </div>

        {/* Filter tanggal mulai */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Mulai</span>
          <Input
            type="date"
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
          />
        </div>

        {/* Filter tanggal selesai */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Selesai</span>
          <Input
            type="date"
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
          />
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
          if (col.key === "customer") toggleSort("customer");
          if (col.key === "bus") toggleSort("bus");
          if (col.key === "pickup") toggleSort("pickup");
          if (col.key === "destination") toggleSort("destination");
          if (col.key === "price") toggleSort("price");
          if (col.key === "rentStartAt") toggleSort("rentStartAt");
          if (col.key === "rentEndAt") toggleSort("rentEndAt");
        }}
        emptyText="Belum ada jadwal"
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
