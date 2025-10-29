"use client"
import { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { id } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { id };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function ScheduleCheckPage({ scheduleList = [] }) {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState(Views.MONTH);
  const [tanggalMerah, setTanggalMerah] = useState([]);
  const [keteranganLibur, setKeteranganLibur] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dateTime, setDateTime] = useState("");
  const getEventColor = (options) => {
    if (options && (options.legrest || options.bantalLeher)) {
      return { bg: "#3b82f6", text: "#ffffff" };
    } else {
      return { bg: "#6b7280", text: "#ffffff" };
    }
  };
  const dummyScheduleList = [
    {
      customer: "Ahmad",
      bus: "Bus Pariwisata 01",
      pickup: "Jakarta",
      destination: "Bali",
      seats: "3-2",
      dp: 500000,
      price: 2500000,
      start: "2025-10-01T08:00:00",
      end: "2025-10-03T20:00:00",
      options: { legrest: true },
      driver: "Budi",
      conductor: "Santi",
      sales: "Andi",
    },
    {
      customer: "Siti",
      bus: "Bus Pariwisata 02",
      pickup: "Jakarta",
      destination: "Bandung",
      seats: "3-2",
      dp: 300000,
      price: 1500000,
      start: "2025-10-02T09:00:00",
      end: "2025-10-02T18:00:00",
      options: null,
      driver: "Tono",
      conductor: "Rina",
      sales: "Bambang",
    },
  ];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setDateTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const mappedEvents = dummyScheduleList.map((s) => {
      const colors = getEventColor(s.options);
      return {
        ...s,
        title: `${s.bus} - ${s.destination}`,
        start: new Date(s.start),
        end: new Date(s.end),
        backgroundColor: colors.bg,
        textColor: colors.text,
      };
    });
    setEvents(mappedEvents);
  }, []);

  const fetchLibur = useCallback(async (date) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const res = await fetch(
        `https://api-harilibur.vercel.app/api?year=${year}&month=${month}`
      );
      const data = await res.json();

      const dates = data.map((item) => item.holiday_date);
      const mapLibur = {};
      data.forEach((item) => {
        mapLibur[item.holiday_date] = item.holiday_name;
      });

      setTanggalMerah(dates);
      setKeteranganLibur(mapLibur);
    } catch (err) {
      console.error("Gagal fetch hari libur:", err);
    }
  }, []);

  useEffect(() => {
    fetchLibur(currentDate);
  }, [fetchLibur, currentDate]);

  const dayPropGetter = (date) => {
    const day = getDay(date);
    const dateStr = format(date, "yyyy-MM-dd");
    const isLibur = tanggalMerah.includes(dateStr);

    if (isLibur || day === 0)
      return { style: { backgroundColor: "#ffe5e5", color: "#c70000" } };
    else if (day === 5)
      return { style: { backgroundColor: "#e6f9e6", color: "#0a7d00" } };
    return {};
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.backgroundColor,
        color: event.textColor,
        borderRadius: "5px",
        border: "none",
        display: "block",
        padding: "2px 5px",
      },
    };
  };

  const CustomDateCell = ({ children, value }) => {
    const dateStr = format(value, "yyyy-MM-dd");
    const libur = keteranganLibur[dateStr];
    const day = getDay(value);
    const isLibur = tanggalMerah.includes(dateStr);

    let bg = "",
      color = "";
    if (isLibur || day === 0) {
      bg = "#ffe5e5";
      color = "#c70000";
    } else if (day === 5) {
      bg = "#e6f9e6";
      color = "#0a7d00";
    }

    return (
      <div
        className="relative w-full h-full p-1 rounded-md"
        style={{ backgroundColor: bg, color }}
        title={libur || ""}
      >
        {children}
        {libur && (
          <div className="absolute bottom-1 left-1 right-1 text-[10px] text-red-700 bg-red-100 rounded px-1 truncate">
            {libur}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">
        Selamat Datang di Dashboard Navara
      </h1>
      <p className="text-gray-700 mb-6">
        Hari ini: <span className="font-semibold">{dateTime}</span>
      </p>

      <div className="mx-auto bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
          Cek Jadwal Bus
        </h2>

        <div className="flex gap-2 mb-4">
          {Object.entries({
            Bulan: Views.MONTH,
            Minggu: Views.WEEK,
            Hari: Views.DAY,
            Agenda: Views.AGENDA,
          }).map(([label, v]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-md ${
                view === v ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Keterangan Warna:
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded"
                style={{ backgroundColor: "#3b82f6" }}
              ></div>
              <span className="text-sm text-gray-600">
                Dengan Opsi (Legrest)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded"
                style={{ backgroundColor: "#6b7280" }}
              ></div>
              <span className="text-sm text-gray-600">Tanpa Opsi Tambahan</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600, minWidth: "700px" }}
            view={view}
            onView={setView}
            onNavigate={setCurrentDate}
            dayPropGetter={dayPropGetter}
            eventPropGetter={eventStyleGetter}
            components={{ dateCellWrapper: CustomDateCell }}
            onSelectEvent={(event) => setSelectedEvent(event)}
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

        {selectedEvent && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <h3 className="text-xl font-bold text-gray-800">
                  Detail Pesanan
                </h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-semibold text-gray-800">
                      {selectedEvent.customer}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sales</p>
                    <p className="font-semibold text-gray-800">
                      {selectedEvent.sales}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bus</p>
                    <p className="font-semibold text-gray-800">
                      {selectedEvent.bus}
                    </p>
                  </div>
                </div>
                {/* <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Supir</p>
                        <p className="font-semibold text-gray-800">{selectedEvent.driver}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Kernet</p>
                        <p className="font-semibold text-gray-800">{selectedEvent.conductor}</p>
                    </div>
                   
                </div> */}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Pickup</p>
                    <p className="font-semibold text-gray-800">
                      {selectedEvent.pickup}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tujuan</p>
                    <p className="font-semibold text-gray-800">
                      {selectedEvent.destination}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Konfigurasi Kursi</p>
                    <p className="font-semibold text-gray-800">
                      {selectedEvent.seats}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">DP</p>
                    <p className="font-semibold text-green-600">
                      Rp {selectedEvent.dp?.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                {selectedEvent.options && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      Opsi Tambahan:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {selectedEvent.options.legrest && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                          Legrest
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Total Harga</p>
                  <p className="text-xl font-bold text-blue-600">
                    Rp {selectedEvent.price?.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="pt-3 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Mulai</p>
                      <p className="font-medium text-gray-800">
                        {format(selectedEvent.start, "dd MMM yyyy HH:mm", {
                          locale: id,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Selesai</p>
                      <p className="font-medium text-gray-800">
                        {format(selectedEvent.end, "dd MMM yyyy HH:mm", {
                          locale: id,
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Sisa Pembayaran:</span>{" "}
                    <span className="text-red-600 font-bold">
                      Rp{" "}
                      {(selectedEvent.price - selectedEvent.dp)?.toLocaleString(
                        "id-ID"
                      )}
                    </span>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                >
                  Tutup
                </button>
                {/* <button
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Edit
                </button> */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
