"use client";
import { useState } from "react";

export default function Customer() {
  // ✅ Data dummy awal
  const [customers, setCustomers] = useState([
    { id: 1, name: "Rina Kurniawati", travel: "Kantor", phone: "081234567890" },
    { id: 2, name: "Dedi Setiawan", travel: "Kantor B", phone: "082233445566" },
    { id: 3, name: "Sinta Nurhaliza", travel: "", phone: "083312345678" },
  ]);

  const [form, setForm] = useState({ name: "", travel: "", phone: "" });

  const addCustomer = () => {
    if (!form.name) return alert("Nama wajib diisi!");
    const newCustomer = { id: Date.now(), ...form };
    setCustomers([...customers, newCustomer]);
    setForm({ name: "", travel: "", phone: "" });
  };

  const deleteCustomer = (id) => {
    if (confirm("Yakin ingin menghapus data ini?")) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        Master Data Customer
      </h1>

      {/* Form Input */}
      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Nama Customer"
          className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Travel"
          className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all"
          value={form.travel}
          onChange={(e) => setForm({ ...form, travel: e.target.value })}
        />
        <input
          type="text"
          placeholder="Nomor Telepon"
          className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <button
          onClick={addCustomer}
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
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">Travel</th>
              <th className="p-3 text-left">Telepon</th>
              <th className="p-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="border-t hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.travel}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => deleteCustomer(c.id)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center p-6 text-gray-500 italic"
                >
                  Belum ada data customer
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
