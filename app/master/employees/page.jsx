"use client";
import { useEffect, useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";

export default function Employee() {
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [form, setForm] = useState({
    id: null,
    fullName: "",
    position: null,
    phone: "",
    username: "",
    password: "",
  });

  // Fetch positions dan employees
  useEffect(() => {
    fetchPositions();
    fetchEmployees();
  }, []);

  const fetchPositions = async () => {
    const res = await fetch("/api/position");
    const data = await res.json();
    setPositions(data.map((p) => ({ value: p.id, label: p.name })));
  };

  const fetchEmployees = async () => {
    const res = await fetch("/api/employee");
    const data = await res.json();
    setEmployees(data);
  };

  const resetForm = () =>
    setForm({
      id: null,
      fullName: "",
      position: null,
      phone: "",
      username: "",
      password: "",
    });

  const addOrUpdateEmployee = async () => {
    if (!form.fullName || !form.username || !form.password || !form.position) {
      Swal.fire("Peringatan", "Lengkapi semua kolom wajib!", "warning");
      return;
    }

    const method = form.id ? "PUT" : "POST";

    const res = await fetch("/api/employee", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: form.id,
        fullName: form.fullName,
        phone: form.phone,
        username: form.username,
        password: form.password,
        positionId: form.position.value,
      }),
    });

    if (res.ok) {
      await fetchEmployees();
      resetForm();
      Swal.fire(
        "Berhasil",
        form.id ? "Data karyawan diperbarui" : "Karyawan ditambahkan",
        "success"
      );
    } else {
      Swal.fire("Gagal", "Tidak dapat menyimpan karyawan", "error");
    }
  };

  const editEmployee = (emp) => {
    setForm({
      id: emp.id,
      fullName: emp.fullName,
      phone: emp.phone,
      username: emp.username,
      password: emp.password,
      position: positions.find((p) => p.value === emp.positionId) || null,
    });
  };

  const deleteEmployee = async (id) => {
    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data karyawan akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonText: "Batal",
      confirmButtonText: "Ya, hapus!",
    });

    if (confirm.isConfirmed) {
      await fetch("/api/employee", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await fetchEmployees();
      Swal.fire("Dihapus!", "Data karyawan telah dihapus.", "success");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      <h1 className="text-2xl font-bold mb-8">Master Data Karyawan</h1>

      {/* Form Input */}
      <div className="grid md:grid-cols-6 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Nama lengkap"
            className="border p-3 rounded-lg"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Jabatan</label>
          <Select
            options={positions}
            value={form.position}
            onChange={(selected) => setForm({ ...form, position: selected })}
            placeholder="Pilih jabatan..."
            isClearable
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Telepon</label>
          <input
            type="text"
            placeholder="Nomor Telepon"
            className="border p-3 rounded-lg"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            placeholder="Username login"
            className="border p-3 rounded-lg"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            placeholder="Password login"
            className="border p-3 rounded-lg"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={addOrUpdateEmployee}
            className={`${
              form.id
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white px-6 py-3 rounded-lg font-medium w-full`}
          >
            {form.id ? "Simpan" : "+ Tambah"}
          </button>
          {form.id && (
            <button
              onClick={resetForm}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-3 rounded-lg font-medium"
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
              <th className="p-3 text-left">Jabatan</th>
              <th className="p-3 text-left">Telepon</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{e.fullName}</td>
                <td className="p-3">{e.position?.name}</td>
                <td className="p-3">{e.phone}</td>
                <td className="p-3">{e.username}</td>
                <td className="p-3 text-center space-x-3">
                  <button
                    onClick={() => editEmployee(e)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
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
                <td
                  colSpan={5}
                  className="text-center p-6 text-gray-500 italic"
                >
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
