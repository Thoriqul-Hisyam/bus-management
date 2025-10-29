"use client";
import { useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function Employee() {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Andi Pratama",
      position: "Driver",
      phone: "081234567890",
      username: "andi",
      password: "1234",
    },
    {
      id: 2,
      name: "Budi Santoso",
      position: "Kondektur",
      phone: "082233445566",
      username: "budi",
      password: "abcd",
    },
    {
      id: 3,
      name: "Citra Dewi",
      position: "Admin Operasional",
      phone: "083312345678",
      username: "citra",
      password: "admin",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    position: null,
    phone: "",
    username: "",
    password: "",
  });
  

  const positionOptions = [
    { value: "Driver", label: "Driver" },
    { value: "Kondektur", label: "Kondektur" },
    { value: "Admin Operasional", label: "Admin Operasional" },
    { value: "Manajer", label: "Manajer" },
    { value: "Teknisi", label: "Teknisi" },
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

  const addEmployee = () => {
    if (!form.name || !form.username || !form.password || !form.position) {
      Swal.fire({
        icon: "warning",
        title: "Data belum lengkap",
        text: "Nama, Jabatan, Username, dan Password wajib diisi!",
      });
      return;
    }

    const newEmployee = {
      id: Date.now(),
      name: form.name,
      position: form.position.value,
      phone: form.phone,
      username: form.username,
      password: form.password,
    };

    setEmployees([...employees, newEmployee]);
    setForm({
      name: "",
      position: null,
      phone: "",
      username: "",
      password: "",
    });

    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Karyawan berhasil ditambahkan 🎉",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const deleteEmployee = (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data karyawan akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        setEmployees(employees.filter((e) => e.id !== id));
        Swal.fire({
          icon: "success",
          title: "Dihapus!",
          text: "Data karyawan telah dihapus.",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-2xl font-bold mb-8">Master Data Karyawan</h1>

      {/* Form Input */}
      <div className="grid md:grid-cols-6 sm:grid-cols-2 gap-4 mb-6">
        {/* Nama */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Nama</label>
          <input
            type="text"
            placeholder="Nama lengkap"
            className="border border-gray-300 focus:border-blue-500 rounded-lg p-3 focus:ring focus:ring-blue-100 transition-all"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Jabatan */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Jabatan</label>
          <Select
            styles={selectStyle}
            options={positionOptions}
            value={form.position}
            onChange={(selected) => setForm({ ...form, position: selected })}
            placeholder="Pilih jabatan..."
            isClearable

          />
        </div>

        {/* Telepon */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Telepon</label>
          <input
            type="text"
            placeholder="Nomor Telepon"
            className="border border-gray-300 focus:border-blue-500 rounded-lg p-3 focus:ring focus:ring-blue-100 transition-all"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        {/* Username */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            placeholder="Username login"
            className="border border-gray-300 focus:border-blue-500 rounded-lg p-3 focus:ring focus:ring-blue-100 transition-all"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            placeholder="Password login"
            className="border border-gray-300 focus:border-blue-500 rounded-lg p-3 focus:ring focus:ring-blue-100 transition-all"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {/* Tombol Tambah */}
        <div className="flex items-end">
          <button
            onClick={addEmployee}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all w-full"
          >
            + Tambah
          </button>
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
              <th className="p-3 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-3">{e.name}</td>
                <td className="p-3">{e.position}</td>
                <td className="p-3">{e.phone}</td>
                <td className="p-3">{e.username}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => deleteEmployee(e.id)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
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
