"use client";

import { useEffect, useState, useTransition } from "react";
import Swal from "sweetalert2";
import { listPositions, createPosition, updatePosition, deletePosition } from "@/actions/position";

type PositionRow = { id: number; name: string };
type FormState = { id: number | null; name: string };

export default function PositionPage() {
  const [positions, setPositions] = useState<PositionRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>({ id: null, name: "" });

  async function refresh() {
    setLoading(true);
    try {
      const data = await listPositions();
      setPositions(data as PositionRow[]);
    } catch (err) {
      console.error("Gagal memuat posisi:", err);
      Swal.fire({ icon: "error", title: "Gagal memuat posisi" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const handleSave = () => {
    if (!form.name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nama jabatan wajib diisi!",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    startTransition(async () => {
      const payload = { id: form.id ?? undefined, name: form.name.trim() };
      const res = form.id ? await updatePosition(payload) : await createPosition(payload);

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
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan data!",
          text: res.error,
        });
      }
    });
  };

  const editPosition = (p: PositionRow) => setForm({ id: p.id, name: p.name });

  const onDelete = (id: number) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      startTransition(async () => {
        const res = await deletePosition(id);
        if (res.ok) {
          Swal.fire({
            icon: "success",
            title: "Data dihapus",
            showConfirmButton: false,
            timer: 1000,
          });
          await refresh();
        } else {
          Swal.fire({ icon: "error", title: "Gagal menghapus", text: res.error });
        }
      });
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-2xl font-bold mb-8">Master Data Jabatan</h1>

      {/* Form Input */}
      <div className="flex gap-4 mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="flex-1 border rounded-lg p-2 focus:border-blue-500 focus:ring focus:ring-blue-100 transition"
          placeholder="Contoh: Driver, Admin, Manager..."
        />
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {form.id ? "Update" : "+ Tambah"}
        </button>
        {form.id && (
          <button
            onClick={() => setForm({ id: null, name: "" })}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg"
          >
            Batal
          </button>
        )}
      </div>

      {/* Tabel Data */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-blue-50 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3 text-left">Nama Jabatan</th>
              <th className="p-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
        <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="text-center p-4 text-gray-500">Loading...</td>
              </tr>
            ) : positions.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center p-4 text-gray-500 italic">Belum ada data</td>
              </tr>
            ) : (
              positions.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-center space-x-3">
                    <button onClick={() => editPosition(p)} className="text-blue-600 hover:text-blue-700">
                      Edit
                    </button>
                    <button onClick={() => onDelete(p.id)} className="text-red-600 hover:text-red-700">
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
