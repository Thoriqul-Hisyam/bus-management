"use client";

import { useEffect, useState, useTransition } from "react";
import PositionTable from "@/components/position/position-table";
import { listPositions } from "@/actions/position";

type SortKey = "name_asc" | "name_desc" | "id_asc" | "id_desc";
type PositionRow = { id: number; name: string };

export default function PositionPage() {
  const [q, setQ] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("name_asc");
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  const [rows, setRows] = useState<PositionRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
    startTransition(() => {
      void fetchData({ page: 1 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startTransition(() => {
      void fetchData();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, page, perPage]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      startTransition(() => {
        void fetchData({ page: 1 });
      });
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const api = {
    setSearch: (val: string) => setQ(val),
    toggleSortName: () => {
      setPage(1);
      setSort((prev) => (prev === "name_asc" ? "name_desc" : "name_asc"));
    },
    changePage: (p: number) => setPage(p),
    changePerPage: (pp: number) => {
      setPage(1);
      setPerPage(pp);
    },
    refresh: () => {
      startTransition(() => {
        void fetchData();
      });
    },
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Master Data Jabatan</h1>

      <PositionTable
        rows={rows}
        total={total}
        page={page}
        perPage={perPage}
        q={q}
        sort={sort}
        isLoading={isLoading || isPending}
        onSearchChange={api.setSearch}
        onToggleSortName={api.toggleSortName}
        onPageChange={api.changePage}
        onPerPageChange={api.changePerPage}
        onRefresh={api.refresh}
      />
    </main>
  );
}
