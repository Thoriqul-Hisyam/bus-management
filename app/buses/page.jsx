"use client";
import { useState } from "react";
import BusList from "../components/BusList";
import BusForm from "../components/BusForm";

export default function BusesPage() {
  const [buses, setBuses] = useState([
    { id: 1, name: "Bus A", plate: "B 1234 CD", capacity: 45, status: "Aktif" },
    { id: 2, name: "Bus B", plate: "L 5678 EF", capacity: 32, status: "Nonaktif" },
  ]);
  const [showForm, setShowForm] = useState(false);

  const handleAddBus = (bus) => {
    setBuses([...buses, { ...bus, id: Date.now() }]);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Master Data Bus</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Tambah Bus
        </button>
      </div>

      {showForm ? (
        <BusForm onSave={handleAddBus} onCancel={() => setShowForm(false)} />
      ) : (
        <BusList buses={buses} />
      )}
    </div>
  );
}
