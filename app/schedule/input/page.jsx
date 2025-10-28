"use client";
import { useState } from "react";
import Select from "react-select";

export default function ScheduleInputPage() {
  const [selectedBus, setSelectedBus] = useState(null);
  const [form, setForm] = useState({
    customer: "",
    bus: "",
    pickup: "",
    destination: "",
    seats: "",
    dp: "",
    price: "",
    start: "",
    end: "",
  });
  const [scheduleList, setScheduleList] = useState([]);

  const busOptions = [
    { value: "bus01", label: "Bus Pariwisata 01" },
    { value: "bus02", label: "Bus Pariwisata 02" },
    { value: "bus03", label: "Bus Executive 03" },
  ];

  const addSchedule = () => {
    // Validasi semua field
    if (
      !form.customer ||
      !selectedBus ||
      !form.pickup ||
      !form.destination ||
      !form.seats ||
      !form.dp ||
      !form.price ||
      !form.start ||
      !form.end
    ) {
      alert("Lengkapi semua field sebelum menyimpan!");
      return;
    }

    const newSchedule = {
      id: Date.now(),
      customer: form.customer,
      bus: selectedBus.label,
      pickup: form.pickup,
      destination: form.destination,
      seats: form.seats,
      dp: form.dp,
      price: form.price,
      start: new Date(form.start),
      end: new Date(form.end),
    };

    setScheduleList((prev) => [...prev, newSchedule]);
    setForm({
      customer: "",
      bus: "",
      pickup: "",
      destination: "",
      seats: "",
      dp: "",
      price: "",
      start: "",
      end: "",
    });
    setSelectedBus(null);
  };

  const deleteSchedule = (id) => {
    if (confirm("Hapus jadwal ini?")) {
      setScheduleList(scheduleList.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
          Input Jadwal Bus
        </h2>

        {/* Form Input */}
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            placeholder="Nama Customer"
            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all"
            value={form.customer}
            onChange={(e) => setForm({ ...form, customer: e.target.value })}
          />
          <Select
            options={busOptions}
            value={selectedBus}
            onChange={setSelectedBus}
            placeholder="Pilih Bus..."
            isClearable
          />
          <input
            type="text"
            placeholder="Penjemputan"
            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all"
            value={form.pickup}
            onChange={(e) => setForm({ ...form, pickup: e.target.value })}
          />
          <input
            type="text"
            placeholder="Tujuan"
            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
          />

          <input
            type="number"
            placeholder="Jumlah Bangku"
            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all"
            value={form.seats}
            onChange={(e) => setForm({ ...form, seats: e.target.value })}
          />
          <input
            type="number"
            placeholder="DP"
            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all"
            value={form.dp}
            onChange={(e) => setForm({ ...form, dp: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <input
            type="datetime-local"
            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
          />
          <input
            type="datetime-local"
            className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 transition-all"
            value={form.end}
            onChange={(e) => setForm({ ...form, end: e.target.value })}
          />
        </div>

        <button
          onClick={addSchedule}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all mb-8"
        >
          + Tambah Jadwal
        </button>

        {/* Tabel Jadwal */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead className="bg-blue-50 text-gray-700 text-sm uppercase">
              <tr>
                <th className="p-3 text-left font-medium">Customer</th>
                <th className="p-3 text-left font-medium">Bus</th>
                <th className="p-3 text-left font-medium">Penjemputan</th>
                <th className="p-3 text-left font-medium">Tujuan</th>
                <th className="p-3 text-left font-medium">Bangku</th>
                <th className="p-3 text-left font-medium">DP</th>
                <th className="p-3 text-left font-medium">Price</th>
                <th className="p-3 text-left font-medium">Mulai</th>
                <th className="p-3 text-left font-medium">Selesai</th>
                <th className="p-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {scheduleList.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50 transition-all">
                  <td className="p-3">{s.customer}</td>
                  <td className="p-3">{s.bus}</td>
                  <td className="p-3">{s.pickup}</td>
                  <td className="p-3">{s.destination}</td>
                  <td className="p-3 text-center">{s.seats}</td>
                  <td className="p-3 text-center">{s.dp}</td>
                  <td className="p-3 text-center">{s.price}</td>
                  <td className="p-3">
                    {new Date(s.start).toLocaleString("id-ID")}
                  </td>
                  <td className="p-3">
                    {new Date(s.end).toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => deleteSchedule(s.id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}

              {scheduleList.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center p-6 text-gray-500 italic">
                    Belum ada jadwal
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
