"use client";

import { useEffect, useState, useTransition } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { listBusTypes, createBusType, updateBusType, deleteBusType } from "@/actions/bus-type";

type Row = { id: number; name: string; createdAt: string | Date; updatedAt: string | Date };

export default function BusTypePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    id: null as number | null,
    name: "",
  });

  async function refresh() {
    setLoading(true);
    const res = await listBusTypes();
    if (res.ok) setRows(res.data);
    else Swal.fire({ icon: "error", title: "Error", text: res.error });
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const handleSave = async () => {
    if (!form.name) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Nama jenis armada wajib diisi!",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    startTransition(async () => {
      const payload = {
        id: form.id ?? undefined,
        name: form.name.trim(),
      };

      const res = form.id ? await updateBusType(payload) : await createBusType(payload);

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: form.id ? "Data diperbarui" : "Data ditambahkan",
          showConfirmButton: false,
          timer: 1200,
        });
        setForm({ id: null, name: "" });
        await refresh();
      } else {
        Swal.fire({ icon: "error", title: "Gagal", text: res.error });
      }
    });
  };

  const onDelete = (id: number) => {
    Swal.fire({
      title: "Yakin ingin menghapus data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then((r) => {
      if (!r.isConfirmed) return;
      startTransition(async () => {
        const res = await deleteBusType(id);
        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: "Data dihapus",
            timer: 1000,
            showConfirmButton: false,
          });
          await refresh();
        } else {
          Swal.fire({ icon: "error", title: "Gagal", text: res.error });
        }
      });
    });
  };

  const editRow = (r: Row) => {
    setForm({ id: r.id, name: r.name });
  };

  const formatDate = (d: string | Date) => {
    try {
      const dt = new Date(d);
      // tampilkan ringkas: dd/mm/yyyy hh:mm
      return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return "-";
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-2xl font-bold mb-8">Master Jenis Armada</h1>

      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <label className="text-sm text-gray-600">Nama Jenis Armada</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg p-2"
            placeholder="Misal: EKONOMI / VIP / EKSEKUTIF"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg w-full"
          >
            {form.id ? "Update" : "+ Tambah"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-blue-50 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">Dibuat</th>
              <th className="p-3 text-left">Diubah</th>
              <th className="p-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4 text-gray-500 italic">
                  Belum ada data
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{formatDate(r.createdAt)}</td>
                  <td className="p-3">{formatDate(r.updatedAt)}</td>
                  <td className="p-3 text-center space-x-3">
                    <button
                      onClick={() => editRow(r)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(r.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
