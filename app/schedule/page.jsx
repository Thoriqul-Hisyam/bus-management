"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { id } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Select from "react-select";

const locales = { id };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function SchedulePage() {
  const [events, setEvents] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    end: "",
  });
  const [view, setView] = useState(Views.MONTH); // default tampilan bulan

  const busOptions = [
    { value: "bus01", label: "Bus Pariwisata 01" },
    { value: "bus02", label: "Bus Pariwisata 02" },
    { value: "bus03", label: "Bus Executive 03" },
  ];

  const handleAddEvent = () => {
    if (!selectedBus || !newEvent.start || !newEvent.end) {
      alert("Lengkapi semua field!");
      return;
    }

    const event = {
      title: `${selectedBus.label} - ${newEvent.title}`,
      start: new Date(newEvent.start),
      end: new Date(newEvent.end),
      bus: selectedBus.value,
    };

    setEvents([...events, event]);
    setNewEvent({ title: "", start: "", end: "" });
    setSelectedBus(null);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Tambah Jadwal */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Tambah Jadwal Bus
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Pilih Bus
              </label>
              <Select
                options={busOptions}
                value={selectedBus}
                onChange={setSelectedBus}
                placeholder="Cari dan pilih bus..."
                isClearable
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Judul Perjalanan
              </label>
              <input
                type="text"
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Contoh: Trip ke Bali"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tanggal Mulai
                </label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  value={newEvent.start}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, start: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tanggal Selesai
                </label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  value={newEvent.end}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, end: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              onClick={handleAddEvent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full transition duration-200"
            >
              Tambahkan Jadwal
            </button>
          </div>
        </div>

        {/* Kalender */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-xl shadow-md overflow-hidden">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Kalender Jadwal Bus
          </h2>

          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <div className="flex gap-2">
              <button
                className={`px-3 py-1 rounded-md ${
                  view === Views.MONTH
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => setView(Views.MONTH)}
              >
                Bulan
              </button>
              <button
                className={`px-3 py-1 rounded-md ${
                  view === Views.WEEK
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => setView(Views.WEEK)}
              >
                Minggu
              </button>
              <button
                className={`px-3 py-1 rounded-md ${
                  view === Views.DAY
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => setView(Views.DAY)}
              >
                Hari
              </button>
              <button
                className={`px-3 py-1 rounded-md ${
                  view === Views.AGENDA
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
                onClick={() => setView(Views.AGENDA)}
              >
                Agenda
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500, minWidth: "600px" }}
              view={view}
              onView={(newView) => setView(newView)}
              messages={{
                next: "Berikutnya",
                previous: "Sebelumnya",
                today: "Hari Ini",
                month: "Bulan",
                week: "Minggu",
                day: "Hari",
                agenda: "Agenda",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
