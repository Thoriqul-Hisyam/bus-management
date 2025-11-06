"use client";

import { useEffect, useState, useTransition } from "react";
import Swal from "sweetalert2";
import { listCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/actions/customer";

type CustomerRow = {
  id: number;
  name: string;
  travel?: string | null;
  phone?: string | null;
};

type FormState = {
  id: number | null;
  name: string;
  travel: string;
  phone: string;
};

export default function CustomerPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>({ id: null, name: "", travel: "", phone: "" });

  async function refresh() {
    const res = await listCustomers();
    if (res.ok) setCustomers(res.data as CustomerRow[]);
    else Swal.fire("Gagal", res.error, "error");
  }

  useEffect(() => {
    void refresh();
  }, []);

  const resetForm = () => setForm({ id: null, name: "", travel: "", phone: "" });

  const addOrUpdateCustomer = () => {
    if (!form.name.trim()) {
      Swal.fire("Peringatan", "Nama wajib diisi!", "warning");
      return;
    }

    startTransition(async () => {
      const payload = {
        id: form.id ?? undefined,
        name: form.name.trim(),
        travel: form.travel.trim() || undefined,
        phone: form.phone.trim() || undefined,
      };

      const res = form.id ? await updateCustomer(payload) : await createCustomer(payload);

      if (res.ok) {
        Swal.fire("Berhasil", form.id ? "Customer diperbarui" : "Customer ditambahkan", "success");
        resetForm();
        await refresh();
      } else {
        Swal.fire("Gagal", res.error, "error");
      }
    });
  };

  const onDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Batal",
      confirmButtonText: "Ya, hapus!",
    });
    if (!confirm.isConfirmed) return;

    startTransition(async () => {
      const res = await deleteCustomer(id);
      if (res.ok) {
        Swal.fire("Dihapus!", "Data customer telah dihapus.", "success");
        await refresh();
      } else {
        Swal.fire("Gagal", res.error, "error");
      }
    });
  };

  const editCustomer = (c: CustomerRow) => {
    setForm({
      id: c.id,
      name: c.name ?? "",
      travel: c.travel ?? "",
      phone: c.phone ?? "",
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">Master Data Customer</h1>

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
        <div className="flex gap-2">
          <button
            onClick={addOrUpdateCustomer}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all w-full"
          >
            {form.id ? "Simpan" : "+ Tambah"}
          </button>
          {form.id && (
            <button
              onClick={resetForm}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-medium shadow-sm transition-all"
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
              <th className="p-3 text-left">Travel</th>
              <th className="p-3 text-left">Telepon</th>
              <th className="p-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.travel}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3 text-center space-x-3">
                    <button onClick={() => editCustomer(c)} className="text-blue-600 hover:text-blue-700 font-medium">
                      Edit
                    </button>
                    <button onClick={() => onDelete(c.id)} className="text-red-600 hover:text-red-700 font-medium">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center p-6 text-gray-500 italic">
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