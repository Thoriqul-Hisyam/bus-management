"use client";

import { useEffect, useState, useTransition } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { listBus, createBus, updateBus, deleteBus, listBusTypes } from "@/actions/bus";

type Option = { value: number; label: string };

const selectStyle = {
  control: (provided: any) => ({
    ...provided,
    minHeight: "44px",
    borderColor: "#d1d5db",
    borderRadius: "0.5rem",
    boxShadow: "none",
    "&:hover": { borderColor: "#3b82f6" },
  }),
};

export default function BusPage() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [busTypeOptions, setBusTypeOptions] = useState<Option[]>([]);

  const [form, setForm] = useState({
    id: null as number | null,
    name: "",
    plateNo: "",
    busType: null as Option | null, // ← ganti dari enum ke option
    capacity: "",
  });

  async function refresh() {
    setLoading(true);
    const res = await listBus();
    if (res.ok) setBuses(res.data);
    else Swal.fire({ icon: "error", title: "Error", text: res.error });
    setLoading(false);
  }

  async function loadBusTypes() {
    const res = await listBusTypes();
    if (res.ok) {
      setBusTypeOptions(res.data.map((r) => ({ value: r.id, label: r.name })));
    } else {
      Swal.fire({ icon: "error", title: "Error", text: res.error });
    }
  }

  useEffect(() => {
    // load paralel
    (async () => {
      await Promise.all([loadBusTypes(), refresh()]);
    })();
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.plateNo || !form.busType) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Nama, Nomor Polisi, dan Jenis Armada wajib diisi!",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    startTransition(async () => {
      const payload = {
        id: form.id ?? undefined,
        name: form.name,
        plateNo: form.plateNo,
        busTypeId: form.busType!.value, // ← kirim id
        capacity: Number(form.capacity || 0),
      };

      const res = form.id ? await updateBus(payload) : await createBus(payload);

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: form.id ? "Data diperbarui" : "Data ditambahkan",
          showConfirmButton: false,
          timer: 1200,
        });
        setForm({ id: null, name: "", plateNo: "", busType: null, capacity: "" });
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
        const res = await deleteBus(id);
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

  const editBus = (b: any) => {
    // b sudah include busType
    const opt = b.busType ? busTypeOptions.find((t) => t.value === b.busType.id) ?? null : null;
    setForm({
      id: b.id,
      name: b.name,
      plateNo: b.plateNo,
      busType: opt,
      capacity: String(b.capacity ?? ""),
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-2xl font-bold mb-8">Master Data Armada</h1>

      <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-4 mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <label className="text-sm text-gray-600">Nama Armada</label>
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
          <label className="text-sm text-gray-600">Tipe Armada</label>
          <Select
            styles={selectStyle}
            options={busTypeOptions}
            value={form.busType}
            onChange={(selected) => setForm({ ...form, busType: selected as Option | null })}
            placeholder="Pilih jenis..."
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
              <th className="p-3 text-left">Nama Armada</th>
              <th className="p-3 text-left">No. Polisi</th>
              <th className="p-3 text-left">Jenis Armada</th>
              <th className="p-3 text-left">Kapasitas</th>
              <th className="p-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : buses.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500 italic">
                  Belum ada data
                </td>
              </tr>
            ) : (
              buses.map((b) => (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{b.name}</td>
                  <td className="p-3">{b.plateNo}</td>
                  <td className="p-3">{b.busType?.name ?? "-"}</td>
                  <td className="p-3">{b.capacity}</td>
                  <td className="p-3 text-center space-x-3">
                    <button
                      onClick={() => editBus(b)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(b.id)}
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
