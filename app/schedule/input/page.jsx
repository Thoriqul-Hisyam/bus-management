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
    driver: "",
    conductor: "",
    sales: "",
    legrest: false,
  });
  const [scheduleList, setScheduleList] = useState([]);

  const busOptions = [
    { value: "bus01", label: "Bus Pariwisata 01" },
    { value: "bus02", label: "Bus Pariwisata 02" },
    { value: "bus03", label: "Bus Executive 03" },
  ];

  const addSchedule = () => {
    if (
      !form.customer ||
      !selectedBus ||
      !form.pickup ||
      !form.destination ||
      !form.seats ||
      !form.dp ||
      !form.price ||
      !form.start ||
      !form.end ||
      !form.sales
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
      dp: parseInt(form.dp),
      price: parseInt(form.price),
      start: new Date(form.start),
      end: new Date(form.end),
      driver: form.driver,
      conductor: form.conductor,
      sales: form.sales,
      options: { legrest: form.legrest ? true : null },
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
      driver: "",
      conductor: "",
      sales: "",
      legrest: false,
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
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nama Customer</label>
            <input
              type="text"
              placeholder="Nama Customer"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Bus</label>
            <Select
              options={busOptions}
              value={selectedBus}
              onChange={setSelectedBus}
              placeholder="Pilih Bus..."
              isClearable
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Penjemputan</label>
            <input
              type="text"
              placeholder="Penjemputan"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.pickup}
              onChange={(e) => setForm({ ...form, pickup: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Tujuan</label>
            <input
              type="text"
              placeholder="Tujuan"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Bangku (contoh: 3-2)</label>
            <input
              type="text"
              placeholder="Bangku"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.seats}
              onChange={(e) => setForm({ ...form, seats: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">DP</label>
            <input
              type="number"
              placeholder="DP"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.dp}
              onChange={(e) => setForm({ ...form, dp: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Price</label>
            <input
              type="number"
              placeholder="Price"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Mulai</label>
            <input
              type="datetime-local"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Selesai</label>
            <input
              type="datetime-local"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />
          </div>

          {/* <div>
            <label className="block text-gray-700 font-medium mb-1">Supir</label>
            <input
              type="text"
              placeholder="Supir"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.driver}
              onChange={(e) => setForm({ ...form, driver: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Kernet</label>
            <input
              type="text"
              placeholder="Kernet"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.conductor}
              onChange={(e) => setForm({ ...form, conductor: e.target.value })}
            />
          </div> */}

          <div>
            <label className="block text-gray-700 font-medium mb-1">Sales</label>
            <input
              type="text"
              placeholder="Sales"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.sales}
              onChange={(e) => setForm({ ...form, sales: e.target.value })}
            />
          </div>

          <div className="flex items-center mt-6 md:mt-0">
            <input
              type="checkbox"
              checked={form.legrest}
              onChange={(e) => setForm({ ...form, legrest: e.target.checked })}
              className="mr-2"
            />
            <label className="text-gray-700 text-sm font-medium">Legrest</label>
          </div>
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
                {/* <th className="p-3 text-left font-medium">Supir</th>
                <th className="p-3 text-left font-medium">Kernet</th> */}
                <th className="p-3 text-left font-medium">Sales</th>
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
                  <td className="p-3">{new Date(s.start).toLocaleString("id-ID")}</td>
                  <td className="p-3">{new Date(s.end).toLocaleString("id-ID")}</td>
                  {/* <td className="p-3">{s.driver}</td>
                  <td className="p-3">{s.conductor}</td> */}
                  <td className="p-3">{s.sales}</td>
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
                  <td colSpan="13" className="text-center p-6 text-gray-500 italic">
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
