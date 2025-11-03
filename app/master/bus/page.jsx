"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function BusPage() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: "",
    plateNo: "",
    type: null,
    capacity: "",
  });

  const busTypeOptions = [
    { value: "EKONOMI", label: "Ekonomi" },
    { value: "BISNIS", label: "Bisnis" },
    { value: "VIP", label: "VIP" },
    { value: "EKSEKUTIF", label: "Eksekutif" },
    { value: "SUPER_EKSEKUTIF", label: "Super Eksekutif" },
  ];

  const selectStyle = {
    control: (provided) => ({
      ...provided,
      minHeight: "44px",
      borderColor: "#d1d5db",
      borderRadius: "0.5rem",
      boxShadow: "none",
      "&:hover": { borderColor: "#3b82f6" },
    }),
  };

  // 🔄 Fetch data dari DB
  const fetchBuses = async () => {
    setLoading(true);
    const res = await fetch("/api/bus");
    const data = await res.json();
    setBuses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  // ✅ Tambah / Update
  const handleSave = async () => {
    if (!form.name || !form.plateNo || !form.type) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Nama, Nomor Polisi, dan Tipe wajib diisi!",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const method = form.id ? "PUT" : "POST";
    const res = await fetch("/api/bus", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: form.id,
        name: form.name,
        plateNo: form.plateNo,
        type: form.type.value,
        capacity: form.capacity || 0,
      }),
    });

    if (res.ok) {
      Swal.fire({
        icon: "success",
        title: form.id ? "Data diperbarui" : "Data ditambahkan",
        showConfirmButton: false,
        timer: 1500,
      });
      setForm({ id: null, name: "", plateNo: "", type: null, capacity: "" });
      fetchBuses();
    }
  };

  // ❌ Hapus
  const deleteBus = async (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await fetch("/api/bus", {
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
        fetchBuses();
      }
    });
  };

  const editBus = (bus) => {
    setForm({
      id: bus.id,
      name: bus.name,
      plateNo: bus.plateNo,
      type: busTypeOptions.find((t) => t.value === bus.type),
      capacity: bus.capacity,
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-2xl font-bold mb-8">Master Data Bus</h1>

      {/* Form Input */}
      <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-4 mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <label className="text-sm text-gray-600">Nama Bus</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg p-2"
            placeholder="Contoh: Bus Pariwisata 01"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">No. Polisi</label>
          <input
            type="text"
            value={form.plateNo}
            onChange={(e) => setForm({ ...form, plateNo: e.target.value })}
            className="w-full border rounded-lg p-2"
            placeholder="Misal: B 1234 XYZ"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Tipe Bus</label>
          <Select
            styles={selectStyle}
            options={busTypeOptions}
            value={form.type}
            onChange={(selected) => setForm({ ...form, type: selected })}
            placeholder="Pilih tipe..."
            isClearable
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Kapasitas</label>
          <input
            type="number"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            className="w-full border rounded-lg p-2"
            placeholder="Misal: 45"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
          >
            {form.id ? "Update" : "+ Tambah"}
          </button>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-blue-50 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3 text-left">Nama Bus</th>
              <th className="p-3 text-left">No. Polisi</th>
              <th className="p-3 text-left">Tipe</th>
              <th className="p-3 text-left">Kapasitas</th>
              <th className="p-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : buses.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500 italic">
                  Belum ada data
                </td>
              </tr>
            ) : (
              buses.map((b) => (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{b.name}</td>
                  <td className="p-3">{b.plateNo}</td>
                  <td className="p-3">{b.type}</td>
                  <td className="p-3">{b.capacity}</td>
                  <td className="p-3 text-center space-x-3">
                    <button
                      onClick={() => editBus(b)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBus(b.id)}
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
