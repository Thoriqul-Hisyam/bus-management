"use client";
import { useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function Bus() {
  const [buses, setBuses] = useState([
    { id: 1, name: "Bus Pariwisata 01", type: "Medium", capacity: 30, driver: "Budi", coDriver: "Rina" },
    { id: 2, name: "Bus Pariwisata 02", type: "Big Bus", capacity: 45, driver: "Tono", coDriver: "Santi" },
    { id: 3, name: "Bus Executive 03", type: "Executive", capacity: 20, driver: "Andi", coDriver: "Sari" },
  ]);

  const [form, setForm] = useState({
    name: "",
    type: null,
    capacity: "",
    driver: null,
    coDriver: null,
  });

  const busTypeOptions = [
    { value: "Medium", label: "Medium" },
    { value: "Big Bus", label: "Big Bus" },
    { value: "Executive", label: "Executive" },
  ];

  const driverOptions = [
    { value: "Budi", label: "Budi" },
    { value: "Tono", label: "Tono" },
    { value: "Rina", label: "Rina" },
    { value: "Santi", label: "Santi" },
    { value: "Andi", label: "Andi" },
    { value: "Sari", label: "Sari" },
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
    valueContainer: (provided) => ({
      ...provided,
      padding: "0 0.75rem",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      paddingRight: "0.5rem",
    }),
  };

  // ✅ Tambah data bus baru
  const addBus = () => {
    if (!form.name || !form.type) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Nama Bus dan Tipe wajib diisi!",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const newBus = {
      id: Date.now(),
      name: form.name,
      type: form.type.value,
      capacity: form.capacity || 0,
      driver: form.driver?.value || "-",
      coDriver: form.coDriver?.value || "-",
    };

    setBuses([...buses, newBus]);
    setForm({ name: "", type: null, capacity: "", driver: null, coDriver: null });

    Swal.fire({
      icon: "success",
      title: "Data berhasil ditambahkan",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  // ✅ Hapus data bus
  const deleteBus = (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setBuses(buses.filter((b) => b.id !== id));
        Swal.fire({
          icon: "success",
          title: "Data dihapus",
          showConfirmButton: false,
          timer: 1200,
        });
      }
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        Master Data Bus
      </h1>

      {/* Form Input */}
      <div className="grid lg:grid-cols-6 md:grid-cols-3 sm:grid-cols-2 gap-4 mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {/* Nama Bus */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Nama Bus</label>
          <input
            type="text"
            placeholder="Contoh: Bus Pariwisata 01"
            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all h-[44px]"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Tipe Bus */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Tipe Bus</label>
          <Select
            styles={selectStyle}
            options={busTypeOptions}
            value={form.type}
            onChange={(selected) => setForm({ ...form, type: selected })}
            placeholder="Pilih tipe bus..."
            isClearable
          />
        </div>

        {/* Kapasitas */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Kapasitas</label>
          <input
            type="number"
            placeholder="Misal: 45"
            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all h-[44px]"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          />
        </div>

        {/* Driver */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Driver</label>
          <Select
            styles={selectStyle}
            options={driverOptions}
            value={form.driver}
            onChange={(selected) => setForm({ ...form, driver: selected })}
            placeholder="Pilih driver..."
            isClearable
          />
        </div>

        {/* Co-Driver */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Co-Driver</label>
          <Select
            styles={selectStyle}
            options={driverOptions}
            value={form.coDriver}
            onChange={(selected) => setForm({ ...form, coDriver: selected })}
            placeholder="Pilih co-driver..."
            isClearable
          />
        </div>

        {/* Tombol Tambah */}
        <div className="flex items-end">
          <button
            onClick={addBus}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all h-[44px]"
          >
            + Tambah
          </button>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-blue-50 text-gray-700 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3 text-left">Nama Bus</th>
              <th className="p-3 text-left">Tipe</th>
              <th className="p-3 text-left">Kapasitas</th>
              <th className="p-3 text-left">Driver</th>
              <th className="p-3 text-left">Co-Driver</th>
              <th className="p-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-3">{b.name}</td>
                <td className="p-3">{b.type}</td>
                <td className="p-3">{b.capacity}</td>
                <td className="p-3">{b.driver || "-"}</td>
                <td className="p-3">{b.coDriver || "-"}</td>
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
                <td colSpan="6" className="text-center p-6 text-gray-500 italic">
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
