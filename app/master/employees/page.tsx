"use client";

import { useEffect, useState, useTransition } from "react";
import Select, { SingleValue } from "react-select";
import Swal from "sweetalert2";
import { listEmployees, createEmployee, updateEmployee, deleteEmployee } from "@/actions/employee";
import { listPositions } from "@/actions/position";

type Option = { value: number; label: string };

type Position = {
  id: number;
  name: string;
};

type EmployeeRow = {
  id: number;
  fullName: string;
  phone?: string | null;
  positionId: number;
  position?: Position | null;
  username?: string | null; // di-actions sudah dibentuk dari account?.username
};

type FormState = {
  id: number | null;
  fullName: string;
  position: Option | null;
  phone: string;
  username: string;
  password: string;
};

export default function EmployeePage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [positions, setPositions] = useState<Option[]>([]);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>({
    id: null,
    fullName: "",
    position: null,
    phone: "",
    username: "",
    password: "",
  });

  async function refresh() {
    const [pos, emp] = await Promise.all([listPositions(), listEmployees()]);
    setPositions(pos.map((p: Position) => ({ value: p.id, label: p.name })));
    if (emp.ok) setEmployees(emp.data as EmployeeRow[]);
    else Swal.fire("Gagal", emp.error, "error");
  }

  useEffect(() => {
    // initial load
    void refresh();
  }, []);

  const resetForm = () =>
    setForm({ id: null, fullName: "", position: null, phone: "", username: "", password: "" });

  const addOrUpdateEmployee = () => {
    if (!form.fullName || !form.position) {
      Swal.fire("Peringatan", "Nama & Jabatan wajib diisi!", "warning");
      return;
    }
    // username/password opsional namun harus berpasangan
    if ((form.username && !form.password) || (!form.username && form.password)) {
      Swal.fire("Peringatan", "Isi username dan password bersamaan untuk membuat/mengubah akun.", "warning");
      return;
    }

    startTransition(async () => {
      const payload = {
        id: form.id ?? undefined,
        fullName: form.fullName,
        phone: form.phone || undefined,
        positionId: form.position?.value as number,
        username: form.username || undefined,
        password: form.password || undefined,
      };

      const res = form.id ? await updateEmployee(payload) : await createEmployee(payload);

      if (res.ok) {
        Swal.fire("Berhasil", form.id ? "Data karyawan diperbarui" : "Karyawan ditambahkan", "success");
        resetForm();
        await refresh();
      } else {
        Swal.fire("Gagal", res.error, "error");
      }
    });
  };

  const editEmployee = (emp: EmployeeRow) => {
    setForm({
      id: emp.id,
      fullName: emp.fullName,
      phone: emp.phone ?? "",
      username: emp.username ?? "",
      password: "",
      position: positions.find((p) => p.value === emp.positionId) || null,
    });
  };

  const onDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data karyawan akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Batal",
      confirmButtonText: "Ya, hapus!",
    });
    if (!confirm.isConfirmed) return;

    startTransition(async () => {
      const res = await deleteEmployee(id);
      if (res.ok) {
        Swal.fire("Dihapus!", "Data karyawan telah dihapus.", "success");
        await refresh();
      } else {
        Swal.fire("Gagal", res.error, "error");
      }
    });
  };

  const onChangePosition = (selected: SingleValue<Option>) =>
    setForm((prev) => ({ ...prev, position: selected ?? null }));

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-2xl font-bold mb-8">Master Data Karyawan</h1>

      {/* Form */}
      <div className="grid md:grid-cols-6 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Nama lengkap"
            className="border p-3 rounded-lg"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Jabatan</label>
          <Select
            options={positions}
            value={form.position}
            onChange={onChangePosition}
            placeholder="Pilih jabatan..."
            isClearable
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Telepon</label>
          <input
            type="text"
            placeholder="Nomor Telepon"
            className="border p-3 rounded-lg"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Username (opsional)</label>
          <input
            type="text"
            placeholder="Username login"
            className="border p-3 rounded-lg"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Password (opsional)</label>
          <input
            type="password"
            placeholder="Password login"
            className="border p-3 rounded-lg"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={addOrUpdateEmployee}
            disabled={isPending}
            className={`${form.id ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} text-white px-6 py-3 rounded-lg font-medium w-full disabled:opacity-50`}
          >
            {form.id ? "Simpan" : "+ Tambah"}
          </button>
          {form.id && (
            <button
              onClick={resetForm}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 rounded-lg font-medium"
            >
              Batal
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-blue-50 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">Jabatan</th>
              <th className="p-3 text-left">Telepon</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((e) => (
                <tr key={e.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{e.fullName}</td>
                  <td className="p-3">{e.position?.name}</td>
                  <td className="p-3">{e.phone}</td>
                  <td className="p-3">{e.username ?? "-"}</td>
                  <td className="p-3 text-center space-x-3">
                    <button
                      onClick={() => editEmployee(e)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(e.id)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500 italic">
                  Belum ada data karyawan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
