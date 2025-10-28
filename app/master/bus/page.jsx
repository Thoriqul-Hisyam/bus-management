"use client";
import { useState } from "react";

export default function Bus() {
  // ✅ Data dummy awal
  const [buses, setBuses] = useState([
    { id: 1, name: "Bus Pariwisata 01", type: "Medium", capacity: 30 },
    { id: 2, name: "Bus Pariwisata 02", type: "Big Bus", capacity: 45 },
    { id: 3, name: "Bus Executive 03", type: "Executive", capacity: 20 },
  ]);

  const [form, setForm] = useState({ name: "", type: "", capacity: "" });

  const addBus = () => {
    if (!form.name) return alert("Nama Bus wajib diisi!");
    const newBus = {
      id: Date.now(),
      name: form.name,
      type: form.type,
      capacity: form.capacity || 0,
    };
    setBuses([...buses, newBus]);
    setForm({ name: "", type: "", capacity: "" });
  };

  const deleteBus = (id) => {
    if (confirm("Yakin ingin menghapus data ini?")) {
      setBuses(buses.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        🚌 Master Data Bus
      </h1>

      {/* Form Input */}
      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Nama Bus"
          className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Tipe"
          className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        />
        <input
          type="number"
          placeholder="Kapasitas"
          className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all"
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
        />
        <button
          onClick={addBus}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all"
        >
          + Tambah
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-blue-50 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3 text-left">Nama Bus</th>
              <th className="p-3 text-left">Tipe</th>
              <th className="p-3 text-left">Kapasitas</th>
              <th className="p-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((b) => (
              <tr
                key={b.id}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">{b.name}</td>
                <td className="p-3">{b.type}</td>
                <td className="p-3">{b.capacity}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => deleteBus(b.id)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}

            {buses.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center p-6 text-gray-500 italic"
                >
                  Belum ada data bus
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
