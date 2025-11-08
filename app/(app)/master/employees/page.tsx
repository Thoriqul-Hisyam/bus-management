"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { listEmployees, createEmployee, updateEmployee, deleteEmployee, toggleEmployeeAccountStatus, changeEmployeePassword } from "@/actions/employee";
import { listAllPositions } from "@/actions/position";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import Pagination from "@/components/shared/pagination";
import { ActionDropdown } from "@/components/shared/action-dropdown";
import { CrudModal } from "@/components/shared/crud-modal";
import { DeleteConfirm } from "@/components/shared/delete-confirm";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortKey =
  | "name_asc"
  | "name_desc"
  | "position_asc"
  | "position_desc";

type StatusFilter = "all" | "active" | "inactive";

type Position = { id: number; name: string };
type EmployeeRow = {
  id: number;
  fullName: string;
  phone?: string | null;
  positionId: number;
  position?: Position | null;
  username?: string | null;
  isActive?: boolean | null;
};

const EmployeeFormSchema = z.object({
  fullName: z.string().min(1, "Nama wajib diisi"),
  positionId: z.coerce.number().int().positive({ message: "Jabatan wajib dipilih" }),
  phone: z.string().optional(),
  username: z.string().min(3, "Min 3 karakter").optional(),
  password: z.string().min(6, "Min 6 karakter").optional(),
}).refine(
  (data) => (!!data.username && !!data.password) || (!data.username && !data.password),
  { message: "Isi username dan password bersamaan untuk membuat/mengubah akun.", path: ["username"] }
);
type EmployeeForm = z.infer<typeof EmployeeFormSchema>;

const PasswordSchema = z.object({ password: z.string().min(6, "Min 6 karakter") });
type PasswordForm = z.infer<typeof PasswordSchema>;

export default function EmployeesPage() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("name_asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [status, setStatus] = useState<StatusFilter>("all");

  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);

  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<EmployeeRow | null>(null);
  const [deleting, setDeleting] = useState<EmployeeRow | null>(null);
  const [pwdRow, setPwdRow] = useState<EmployeeRow | null>(null);

  async function fetchData(opts?: {
    q?: string;
    sort?: SortKey;
    page?: number;
    perPage?: number;
    status?: StatusFilter;
  }) {
    const _q = opts?.q ?? q;
    const _sort = opts?.sort ?? sort;
    const _page = opts?.page ?? page;
    const _perPage = opts?.perPage ?? perPage;
    const _status = opts?.status ?? status;

    setIsLoading(true);
    try {
      const res = await listEmployees({ q: _q, sort: _sort, page: _page, perPage: _perPage, status: _status });
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
      const pos = await listAllPositions();
      setPositions(pos);
      await fetchData({ page: 1 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startTransition(() => void fetchData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, page, perPage, status]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      startTransition(() => void fetchData({ page: 1 }));
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const startIndex = (page - 1) * perPage;
  const columns: DataTableColumn<EmployeeRow>[] = useMemo(
    () => [
      { key: "no", label: "No.", className: "w-16 text-center", render: (_r, i) => i + 1 },
      { key: "fullName", label: "Nama", sortable: true, render: (r) => <span className="font-medium">{r.fullName}</span> },
      { key: "position", label: "Jabatan", sortable: true, render: (r) => r.position?.name ?? "-" },
      { key: "phone", label: "Telepon", render: (r) => r.phone ?? "-" },
      { key: "username", label: "Username", render: (r) => r.username ?? "—" },
      {
        key: "status", label: "Status Akun", className: "w-36",
        render: (r) =>
          r.username ? (
            <span className={r.isActive ? "inline-flex px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700"
                                        : "inline-flex px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700"}>
              {r.isActive ? "Aktif" : "Nonaktif"}
            </span>
          ) : <span className="text-xs text-muted-foreground">—</span>
      },
      {
        key: "actions", label: "Aksi", className: "w-24 text-right",
        render: (r) => {
          const items = [
            { key: "edit", label: "Edit" },
            ...(r.username ? [
              { key: "change-password", label: "Ubah Password" },
              { key: "toggle-status", label: r.isActive ? "Nonaktifkan Akun" : "Aktifkan Akun" },
            ] : []),
            { key: "delete", label: "Hapus", destructive: true },
          ] as const;

          return (
            <ActionDropdown
              items={items as any}
              onClickItem={(key) => {
                if (key === "edit") setEditRow(r);
                else if (key === "delete") setDeleting(r);
                else if (key === "change-password") setPwdRow(r);
                else if (key === "toggle-status") {
                  startTransition(async () => {
                    const res = await toggleEmployeeAccountStatus(r.id);
                    if (res.ok) await fetchData();
                    else console.error(res.error);
                  });
                }
              }}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, perPage]
  );

  const sortKey =
    sort.startsWith("name") ? "fullName" :
    sort.startsWith("position") ? "position" :
    undefined;
  const sortDir = sort.endsWith("_asc") ? "asc" : "desc";

  const EmployeeFormSchema = z.object({
    fullName: z.string().min(1, "Nama wajib diisi"),
    positionId: z.coerce.number().int().positive({ message: "Jabatan wajib dipilih" }),
    phone: z.string().optional(),
    username: z.string().min(3, "Min 3 karakter").optional(),
    password: z.string().min(6, "Min 6 karakter").optional(),
  }).refine(
    (data) => (!!data.username && !!data.password) || (!data.username && !data.password),
    { message: "Isi username dan password bersamaan untuk membuat/mengubah akun.", path: ["username"] }
  );

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Master Data Karyawan</h1>

      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-2">
          <Input placeholder="Cari nama / username / jabatan..." value={q} onChange={(e) => setQ(e.target.value)} />
          {q ? <Button variant="ghost" onClick={() => setQ("")}>Reset</Button> : null}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status Akun</span>
          <Select
            value={status}
            onValueChange={(v: StatusFilter) => { setPage(1); setStatus(v); }}
          >
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center sm:justify-end">
          <Button onClick={() => setCreateOpen(true)}>+ Tambah</Button>
        </div>
      </div>

      <DataTable<EmployeeRow>
        rows={rows}
        columns={columns}
        isLoading={isLoading || isPending}
        startIndex={startIndex}
        sortKey={sortKey}
        sortDir={sortDir as any}
        onHeaderClick={(col) => {
          if (col.key === "fullName") {
            setPage(1);
            setSort((prev) => (prev === "name_asc" ? "name_desc" : "name_asc"));
          }
          if (col.key === "position") {
            setPage(1);
            setSort((prev) => (prev === "position_asc" ? "position_desc" : "position_asc"));
          }
        }}
      />

      <div className="mt-3">
        <Pagination
          page={page}
          perPage={perPage}
          total={total}
          onPageChange={(p) => setPage(p)}
          onPerPageChange={(pp) => { setPage(1); setPerPage(pp); }}
        />
      </div>

      <CrudModal<EmployeeForm>
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Tambah Karyawan"
        description="Isi data karyawan dan (opsional) buat akun login."
        schema={EmployeeFormSchema}
        defaultValues={{
          fullName: "",
          positionId: positions[0]?.id ?? undefined,
          phone: "",
          username: undefined,
          password: undefined,
        }}
        onSubmit={async (values) => {
          const res = await createEmployee(values);
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
              <label className="text-sm font-medium">Nama Lengkap</label>
              <Input {...f.register("fullName")} placeholder="Nama lengkap" autoFocus />
              {f.formState.errors.fullName && <p className="text-sm text-destructive">{String(f.formState.errors.fullName.message)}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jabatan</label>
              <Select
                value={String(f.watch("positionId") ?? "")}
                onValueChange={(v) => f.setValue("positionId", Number(v))}
              >
                <SelectTrigger><SelectValue placeholder="Pilih jabatan" /></SelectTrigger>
                <SelectContent>
                  {positions.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {f.formState.errors.positionId && <p className="text-sm text-destructive">{String(f.formState.errors.positionId.message)}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telepon</label>
              <Input {...f.register("phone")} placeholder="Nomor telepon" />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username (opsional)</label>
                <Input {...f.register("username")} placeholder="Username" />
                {f.formState.errors.username && <p className="text-sm text-destructive">{String(f.formState.errors.username.message)}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password (opsional)</label>
                <Input type="password" {...f.register("password")} placeholder="Password" />
                {f.formState.errors.password && <p className="text-sm text-destructive">{String(f.formState.errors.password.message)}</p>}
              </div>
            </div>
          </>
        )}
      />

      <CrudModal<EmployeeForm>
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        title="Ubah Karyawan"
        description="Perbarui data karyawan. Untuk ubah password gunakan aksi 'Ubah Password'."
        schema={EmployeeFormSchema}
        defaultValues={
          editRow
            ? {
                fullName: editRow.fullName,
                positionId: editRow.positionId,
                phone: editRow.phone ?? "",
                username: undefined,
                password: undefined,
              }
            : undefined
        }
        onSubmit={async (values) => {
          if (!editRow) return;
          const res = await updateEmployee({ id: editRow.id, ...values });
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
              <label className="text-sm font-medium">Nama Lengkap</label>
              <Input {...f.register("fullName")} placeholder="Nama lengkap" autoFocus />
              {f.formState.errors.fullName && <p className="text-sm text-destructive">{String(f.formState.errors.fullName.message)}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jabatan</label>
              <Select
                value={String(f.watch("positionId") ?? "")}
                onValueChange={(v) => f.setValue("positionId", Number(v))}
              >
                <SelectTrigger><SelectValue placeholder="Pilih jabatan" /></SelectTrigger>
                <SelectContent>
                  {positions.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {f.formState.errors.positionId && <p className="text-sm text-destructive">{String(f.formState.errors.positionId.message)}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telepon</label>
              <Input {...f.register("phone")} placeholder="Nomor telepon" />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username (opsional)</label>
                <Input {...f.register("username")} placeholder="Username (isi bersama password untuk membuat akun)" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password (opsional)</label>
                <Input type="password" {...f.register("password")} placeholder="Password baru (opsional)" />
              </div>
            </div>
          </>
        )}
      />

      <CrudModal<PasswordForm>
        open={!!pwdRow}
        onOpenChange={(v) => !v && setPwdRow(null)}
        title="Ubah Password Akun"
        description={pwdRow?.username ? `Untuk pengguna: ${pwdRow.username}` : undefined}
        schema={PasswordSchema}
        defaultValues={{ password: "" }}
        onSubmit={async (values) => {
          if (!pwdRow) return;
          const res = await changeEmployeePassword({ id: pwdRow.id, password: values.password });
          if (res.ok) {
            setPwdRow(null);
            await fetchData();
          } else {
            throw new Error(res.error);
          }
        }}
        renderFields={(f) => (
          <div className="space-y-2">
            <label className="text-sm font-medium">Password Baru</label>
            <Input type="password" {...f.register("password")} autoFocus placeholder="Minimal 6 karakter" />
            {f.formState.errors.password && <p className="text-sm text-destructive">{String(f.formState.errors.password.message)}</p>}
          </div>
        )}
        submitText="Simpan Password"
      />

      <DeleteConfirm
        open={!!deleting}
        title="Yakin ingin menghapus?"
        description={`Data "${deleting?.fullName ?? ""}" akan dihapus permanen.`}
        onOpenChange={(v) => !v && setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          const res = await deleteEmployee(deleting.id);
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
