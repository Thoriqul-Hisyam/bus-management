"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function PositionPage() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: "",
  });

  // 🔄 Fetch data posisi dari database
  const fetchPositions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/position");
      const data = await res.json();
      setPositions(data);
    } catch (err) {
      console.error("Gagal memuat posisi:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  // ✅ Simpan (Tambah/Update)
  const handleSave = async () => {
    if (!form.name) {
      Swal.fire({
        icon: "warning",
        title: "Nama jabatan wajib diisi!",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const method = form.id ? "PUT" : "POST";
    const res = await fetch("/api/position", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: form.id, name: form.name }),
    });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: form.id ? "Data diperbarui" : "Data ditambahkan",
        showConfirmButton: false,
        timer: 1500,
      });
      setForm({ id: null, name: "" });
      fetchPositions();
    } else {
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan data!",
        text: "Periksa koneksi atau validasi server.",
      });
    }
  };

  // ✏️ Edit posisi
  const editPosition = (p) => {
    setForm({ id: p.id, name: p.name });
  };

  // ❌ Hapus posisi
  const deletePosition = async (id) => {
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
      if (result.isConfirmed) {
        await fetch("/api/position", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        Swal.fire({
          icon: "success",
          title: "Data dihapus",
          showConfirmButton: false,
          timer: 1200,
        });
        fetchPositions();
      }
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {form.id ? "Update" : "+ Tambah"}
        </button>
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
                <td colSpan="2" className="text-center p-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : positions.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center p-4 text-gray-500 italic">
                  Belum ada data
                </td>
              </tr>
            ) : (
              positions.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-center space-x-3">
                    <button
                      onClick={() => editPosition(p)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePosition(p.id)}
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
