"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, differenceInCalendarDays  } from "date-fns";
import { id } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Swal from "sweetalert2";
import { listAllSchedules } from "@/actions/schedule";
import Pusher from "pusher-js";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const locales = { id };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function ScheduleCheckPage() {
  const [loading, setLoading] = useState(true);
  const [scheduleList, setScheduleList] = useState([]);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState(Views.MONTH);
  const [tanggalMerah, setTanggalMerah] = useState([]);
  const [keteranganLibur, setKeteranganLibur] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dateTime, setDateTime] = useState("");
  const [summaryText, setSummaryText] = useState("");

  const getEventColor = (s) => {
    if (s.legrest || s.bantalLeher) {
      return { bg: "#3b82f6", text: "#ffffff" }; // warna utama Navara
    } else {
      return { bg: "#6b7280", text: "#ffffff" }; // warna coklat tua
    }
  };

  const refreshSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await listAllSchedules();
      if (res.ok) {
        setScheduleList(res.data);
      } else {
        Swal.fire({ icon: "error", title: "Error", text: res.error });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Ambil Data",
        text: err?.message ?? "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSchedules();
  }, [refreshSchedules]);

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const channel = pusher.subscribe("navara-travel");

    const handler = (data) => {
      console.log("schedule.updated received:", data);
      refreshSchedules();
    };

    channel.bind("schedule.updated", handler);

    return () => {
      channel.unbind("schedule.updated", handler);
      pusher.unsubscribe("navara-travel");
      pusher.disconnect();
    };
  }, [refreshSchedules]);


  useEffect(() => {
    if (!scheduleList || scheduleList.length === 0) return;
    const mapped = scheduleList.map((s) => {
      const colors = getEventColor(s);
      return {
        ...s,
        title: `${s.bus} - ${s.destination}`,
        start: new Date(s.rentStartAt),
        end: new Date(s.rentEndAt),
        backgroundColor: colors.bg,
        textColor: colors.text,
      };
    });
    setEvents(mapped);
  }, [scheduleList]);

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

  const fetchLibur = useCallback(async (date) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const res = await fetch(
        `https://api-harilibur.vercel.app/api?year=${year}&month=${month}`
      );
      const data = await res.json();
      const filtered = data.filter((item) => item.is_national_holiday === true);

      const dates = filtered.map((item) => item.holiday_date);
      const mapLibur = {};
      filtered.forEach((item) => {
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

  useEffect(() => {
    if (scheduleList.length === 0) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const usageMap = {};

    scheduleList.forEach((s) => {
      const start = new Date(s.rentStartAt);
      const end = new Date(s.rentEndAt);

      const startMonth = new Date(year, month, 1);
      const endMonth = new Date(year, month + 1, 0);

      const effectiveStart = start < startMonth ? startMonth : start;
      const effectiveEnd = end > endMonth ? endMonth : end;

      if (effectiveEnd >= startMonth && effectiveStart <= endMonth) {
        const usedDays = differenceInCalendarDays(effectiveEnd, effectiveStart) + 1;
        usageMap[s.bus] = (usageMap[s.bus] || 0) + usedDays;
      }
    });

    const text =
      Object.entries(usageMap)
        .map(([bus, days]) => `${bus} : ${days} hari`)
        .join("  •  ") || "Belum ada jadwal di bulan ini";

    setSummaryText(text);
  }, [scheduleList, currentDate]);

  const dayPropGetter = (date) => {
    const day = getDay(date);
    const dateStr = format(date, "yyyy-MM-dd");
    const isLibur = tanggalMerah.includes(dateStr);
    if (isLibur || day === 0)
      return { style: { backgroundColor: "#FEE2E2", color: "#B91C1C" } };
    else if (day === 5)
      return { style: { backgroundColor: "#DCFCE7", color: "#166534" } };
    return {};
  };

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.backgroundColor,
      color: event.textColor,
      borderRadius: "6px",
      border: "none",
      display: "block",
      padding: "2px 5px",
    },
  });

  const CustomDateCell = ({ children, value }) => {
    const dateStr = format(value, "yyyy-MM-dd");
    const libur = keteranganLibur[dateStr];
    const day = getDay(value);
    const isLibur = tanggalMerah.includes(dateStr);
    let bg = "",
      color = "";
    if (isLibur || day === 0) {
      bg = "#FEE2E2";
      color = "#B91C1C";
    } else if (day === 5) {
      bg = "#DCFCE7";
      color = "#166534";
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
    <div className="min-h-screen bg-muted/40 p-6">
      <Card className="max-w-6xl mx-auto border-amber-900/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#8B5E3C] to-[#A97449] bg-clip-text text-transparent">
            Jadwal Armada Navara
          </CardTitle>
          <CardDescription>
            Hari ini: <span className="font-medium">{dateTime}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* tombol view */}

          <div className="overflow-hidden whitespace-nowrap border rounded bg-amber-50 p-2 text-sm font-medium text-amber-800 animate-marquee">
            <span>{summaryText}</span>
          </div>

          <style jsx>{`
            @keyframes marquee {
              0% {
                transform: translateX(100%);
              }
              100% {
                transform: translateX(-100%);
              }
            }
            .animate-marquee span {
              display: inline-block;
              padding-left: 100%;
              animation: marquee 60s linear infinite;
            }
          `}</style>

          <div className="flex gap-2">
            {Object.entries({
              Bulan: Views.MONTH,
              Minggu: Views.WEEK,
              Hari: Views.DAY,
              Agenda: Views.AGENDA,
            }).map(([label, v]) => (
              <Button
                key={v}
                size="sm"
                className={`transition-colors ${
                  view === v
                    ? "bg-gradient-to-r from-[#B57A36] to-[#5C3B18] text-white shadow"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setView(v)}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* legenda */}
          <div className="flex gap-4 items-center flex-wrap border rounded-md p-3 bg-muted/30">
            <span className="text-sm font-semibold text-muted-foreground">
              Keterangan Warna:
            </span>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded"
                style={{ backgroundColor: "#3b82f6" }}
              ></div>
              <span className="text-sm">Dengan Opsi (Legrest)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded"
                style={{ backgroundColor: "#6b7280" }}
              ></div>
              <span className="text-sm">Tanpa Opsi Tambahan</span>
            </div>
          </div>

          {/* kalender */}
          <div className="rounded-lg border bg-background overflow-hidden">
            <Calendar
              key={`${view}-${format(currentDate, "yyyy-MM-dd")}`}
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600, minWidth: "700px" }}
              view={view}
              date={currentDate}        
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
        </CardContent>
      </Card>

      {/* modal detail */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>Detail Pesanan</DialogTitle>
                <DialogDescription>
                  Informasi lengkap jadwal armada
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-semibold">{selectedEvent.customer}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sales</p>
                    <p className="font-semibold">{selectedEvent.sales}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Armada</p>
                    <p className="font-semibold">{selectedEvent.bus}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pickup</p>
                    <p className="font-semibold">
                      {selectedEvent.pickupAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tujuan</p>
                    <p className="font-semibold">{selectedEvent.destination}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Legrest</p>
                    <Badge
                      className={
                        selectedEvent.legrest
                          ? "bg-gradient-to-r from-[#8B5E3C] to-[#A97449] text-white"
                          : "border-gray-300 text-gray-600"
                      }
                    >
                      {selectedEvent.legrest ? "Ya" : "Tidak"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                  <div>
                    <p className="text-muted-foreground">Mulai</p>
                    <p>
                      {format(selectedEvent.start, "dd MMM yyyy HH:mm", {
                        locale: id,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Selesai</p>
                    <p>
                      {format(selectedEvent.end, "dd MMM yyyy HH:mm", {
                        locale: id,
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-md p-3 border border-amber-200/40">
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    <span className="font-semibold">DP:</span>{" "}
                    Rp {selectedEvent.amount?.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    <span className="font-semibold">Total Harga:</span>{" "}
                    Rp {selectedEvent.priceTotal?.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm font-bold text-red-600">
                    Sisa Pembayaran: Rp{" "}
                    {(selectedEvent.priceTotal - selectedEvent.amount)?.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setSelectedEvent(null)}
                >
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
