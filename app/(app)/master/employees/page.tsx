"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeAccountStatus,
  changeEmployeePassword,
} from "@/actions/employee";
import { listAllPositions } from "@/actions/position";
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
import PasswordField from "@/components/shared/password-field";
import RSelect, { type Option } from "@/components/shared/rselect";
import { useHasPerm } from "@/components/SessionProvider";

import {
  CreateFormSchema,
  buildUpdateFormSchema,
  PasswordSchema,
  type CreateForm,
  type UpdateForm,
  type PasswordForm,
} from "@/validators/employee-form";

type SortKey = "name_asc" | "name_desc" | "position_asc" | "position_desc";
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

export default function EmployeesPage() {
  // === Permission checks (UI)
  const canCreate = useHasPerm("master.employees.create");
  const canUpdate = useHasPerm("master.employees.update");
  const canDelete = useHasPerm("master.employees.delete");


  // UI state
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("name_asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [status, setStatus] = useState<StatusFilter>("all");

  // data state
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);

  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  // modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<EmployeeRow | null>(null);
  const [deleting, setDeleting] = useState<EmployeeRow | null>(null);
  const [pwdRow, setPwdRow] = useState<EmployeeRow | null>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const positionOptions: Option[] = useMemo(
    () => positions.map((p) => ({ value: p.id, label: p.name })),
    [positions]
  );

  const statusOptions: Option[] = useMemo(
    () => [
      { value: "all", label: "Semua" },
      { value: "active", label: "Aktif" },
      { value: "inactive", label: "Nonaktif" },
    ],
    []
  );

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
      const res = await listEmployees({
        q: _q,
        sort: _sort,
        page: _page,
        perPage: _perPage,
        status: _status,
      });
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

  // === Columns with permission-based actions
  const columns: DataTableColumn<EmployeeRow>[] = useMemo(() => {
    const baseCols: DataTableColumn<EmployeeRow>[] = [
      {
        key: "no",
        label: "No.",
        className: "w-16 text-center",
        render: (_r, i) => i + 1,
      },
      {
        key: "fullName",
        label: "Nama",
        sortable: true,
        render: (r) => <span className="font-medium">{r.fullName}</span>,
      },
      {
        key: "position",
        label: "Jabatan",
        sortable: true,
        render: (r) => r.position?.name ?? "-",
      },
      {
        key: "phone",
        label: "Telepon",
        render: (r) => r.phone ?? "-",
      },
      {
        key: "username",
        label: "Username",
        render: (r) => r.username ?? "—",
      },
      {
        key: "status",
        label: "Status Akun",
        className: "w-36",
        render: (r) =>
          r.username ? (
            <span
              className={
                r.isActive
                  ? "inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700"
                  : "inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700"
              }
            >
              {r.isActive ? "Aktif" : "Nonaktif"}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
    ];

    // tampilkan kolom Aksi hanya jika user punya salah satu dari update/delete
    if (canUpdate || canDelete) {
      baseCols.push({
        key: "actions",
        label: "Aksi",
        className: "w-24 text-right",
        render: (r) => {
          const items: { key: string; label: string; destructive?: boolean }[] = [];

          if (canUpdate) {
            items.push({ key: "edit", label: "Edit" });
            if (r.username) {
              items.push({ key: "change-password", label: "Ubah Password" });
              items.push({
                key: "toggle-status",
                label: r.isActive ? "Nonaktifkan Akun" : "Aktifkan Akun",
              });
            }
          }

          if (canDelete) {
            items.push({ key: "delete", label: "Hapus", destructive: true });
          }

          if (items.length === 0) return null;

          return (
            <ActionDropdown
              items={items}
              onClickItem={(key) => {
                if (key === "edit" && canUpdate) setEditRow(r);
                else if (key === "delete" && canDelete) setDeleting(r);
                else if (key === "change-password" && canUpdate) setPwdRow(r);
                else if (key === "toggle-status" && canUpdate) {
                  startTransition(async () => {
                    const res = await toggleEmployeeAccountStatus(r.id);
                    if (res.ok) {
                      await fetchData();
                    } else {
                      console.error(res.error);
                    }
                  });
                }
              }}
            />
          );
        },
      });
    }

    return baseCols;
  }, [page, perPage, canUpdate, canDelete]);

  const sortKey = sort.startsWith("name")
    ? "fullName"
    : sort.startsWith("position")
    ? "position"
    : undefined;
  const sortDir = sort.endsWith("_asc") ? "asc" : "desc";

  // penentu schema update: apakah row yang diedit sudah punya akun?
  const hasAccount = !!editRow?.username;
  const UpdateFormSchema = useMemo(
    () => buildUpdateFormSchema(hasAccount),
    [hasAccount]
  );
  if (!isClient) return null;
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Master Data Karyawan</h1>

      {/* Toolbar */}
      <div className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Cari nama / username / jabatan..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full"
          />
          {q ? (
            <Button variant="ghost" onClick={() => setQ("")}>
              Reset
            </Button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status Akun</span>
          <div className="min-w-48 w-48">
            <RSelect
              instanceId="status-filter"
              options={statusOptions}
              value={status}
              onChange={(v) => {
                const val = (v as StatusFilter) ?? "all";
                setPage(1);
                setStatus(val);
              }}
              isClearable={false}
            />
          </div>
        </div>

        <div className="flex items-center sm:justify-end">
          {/* tombol tambah hanya tampil kalau punya izin create */}
          {canCreate && <Button onClick={() => setCreateOpen(true)}>+ Tambah</Button>}
        </div>
      </div>

      {/* Table */}
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
            setSort((prev) =>
              prev === "position_asc" ? "position_desc" : "position_asc"
            );
          }
        }}
      />

      {/* Pagination */}
      <div className="mt-3">
        <div className="mt-2">
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
      </div>

      {/* Create Modal */}
      <CrudModal<CreateForm>
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Tambah Karyawan"
        description="Isi data karyawan dan (opsional) buat akun login."
        schema={CreateFormSchema}
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
              <Input
                {...f.register("fullName")}
                placeholder="Nama lengkap"
                autoFocus
              />
              {f.formState.errors.fullName && (
                <p className="text-sm text-destructive">
                  {String(f.formState.errors.fullName.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jabatan</label>
              <RSelect
                instanceId="position-create"
                options={positionOptions}
                value={f.watch("positionId") ?? null}
                onChange={(v) =>
                  f.setValue("positionId", v ? Number(v) : (undefined as any))
                }
                isClearable={false}
              />
              {f.formState.errors.positionId && (
                <p className="text-sm text-destructive">
                  {String(f.formState.errors.positionId.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telepon</label>
              <Input {...f.register("phone")} placeholder="Nomor telepon" />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Username (opsional)
                </label>
                <Input {...f.register("username")} placeholder="Username" />
                {f.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {String(f.formState.errors.username.message)}
                  </p>
                )}
              </div>
              <PasswordField
                form={f}
                name="password"
                label="Password (opsional)"
              />
            </div>
          </>
        )}
      />

      {/* Edit Modal */}
      <CrudModal<UpdateForm>
        open={!!editRow}
        onOpenChange={(v) => !v && setEditRow(null)}
        title="Ubah Karyawan"
        description={
          hasAccount
            ? "Perbarui data karyawan. Password opsional; isi jika ingin mengganti."
            : "Perbarui data karyawan. Untuk membuat akun, isi username dan password bersamaan."
        }
        schema={UpdateFormSchema}
        defaultValues={
          editRow
            ? {
                fullName: editRow.fullName,
                positionId: editRow.positionId,
                phone: editRow.phone ?? "",
                username: editRow.username ?? "",
                password: "",
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
              <Input
                {...f.register("fullName")}
                placeholder="Nama lengkap"
                autoFocus
              />
              {f.formState.errors.fullName && (
                <p className="text-sm text-destructive">
                  {String(f.formState.errors.fullName.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jabatan</label>
              <RSelect
                instanceId="position-edit"
                options={positionOptions}
                value={f.watch("positionId") ?? null}
                onChange={(v) =>
                  f.setValue("positionId", v ? Number(v) : (undefined as any))
                }
                isClearable={false}
              />
              {f.formState.errors.positionId && (
                <p className="text-sm text-destructive">
                  {String(f.formState.errors.positionId.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telepon</label>
              <Input {...f.register("phone")} placeholder="Nomor telepon" />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Username{" "}
                  {hasAccount ? "(opsional)" : "(opsional, berpasangan)"}
                </label>
                <Input
                  {...f.register("username")}
                  placeholder={
                    hasAccount
                      ? "Kosongkan jika tidak diubah"
                      : "Isi jika ingin membuat akun"
                  }
                />
                {f.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {String(f.formState.errors.username.message)}
                  </p>
                )}
              </div>
              <PasswordField
                form={f}
                name="password"
                label={
                  hasAccount
                    ? "Password (opsional)"
                    : "Password (opsional, berpasangan)"
                }
                placeholder={
                  hasAccount
                    ? "Biarkan kosong jika tidak diubah"
                    : "Isi jika membuat akun baru"
                }
              />
            </div>
          </>
        )}
      />

      {/* Ubah Password Modal */}
      <CrudModal<PasswordForm>
        open={!!pwdRow}
        onOpenChange={(v) => !v && setPwdRow(null)}
        title="Ubah Password Akun"
        description={
          pwdRow?.username ? `Untuk pengguna: ${pwdRow.username}` : undefined
        }
        schema={PasswordSchema}
        defaultValues={{ password: "" }}
        onSubmit={async (values) => {
          if (!pwdRow) return;
          const res = await changeEmployeePassword({
            id: pwdRow.id,
            password: values.password,
          });
          if (res.ok) {
            setPwdRow(null);
            await fetchData();
          } else {
            throw new Error(res.error);
          }
        }}
        renderFields={(f) => (
          <PasswordField
            form={f}
            name="password"
            label="Password Baru"
            placeholder="Minimal 6 karakter"
          />
        )}
        submitText="Simpan Password"
      />

      {/* Delete Confirm */}
      <DeleteConfirm
        open={!!deleting}
        title="Yakin ingin menghapus?"
        description={`Data "${
          deleting?.fullName ?? ""
        }" akan dihapus permanen.`}
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
