import { useState } from "react";

export default function BusForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    plate: "",
    capacity: "",
    status: "Aktif",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Nama Bus</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border rounded-lg w-full p-2 mt-1"
          required
        />
      </div>
      <div>
        <label className="block font-medium">No. Plat</label>
        <input
          name="plate"
          value={form.plate}
          onChange={handleChange}
          className="border rounded-lg w-full p-2 mt-1"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Kapasitas</label>
        <input
          type="number"
          name="capacity"
          value={form.capacity}
          onChange={handleChange}
          className="border rounded-lg w-full p-2 mt-1"
          required
        />
      </div>
      <div>
        <label className="block font-medium">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border rounded-lg w-full p-2 mt-1"
        >
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
        >
          Batal
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Simpan
        </button>
      </div>
    </form>
  );
}
