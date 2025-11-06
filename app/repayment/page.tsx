"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { listSchedules, updateStatusSchedule } from "@/actions/schedule";

export default function ScheduleInputPage() {
  const [loading, setLoading] = useState(true);
  const [scheduleList, setScheduleList] = useState([]);

  async function refreshSchedules() {
    setLoading(true);
    const res = await listSchedules();
    if (res.ok) {
      const confirmedSchedules = res.data.filter(
        (s) => s.status === "CONFIRMED"
      );
      setScheduleList(confirmedSchedules);
    } else {
      Swal.fire({ icon: "error", title: "Error", text: res.error });
    }
    setLoading(false);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        refreshSchedules();
      }, 0);
    }
  }, []);

  const handleMarkLunas = async (schedule: any) => {
    const confirm = await Swal.fire({
      title: `Tandai booking ${schedule.customer} sebagai LUNAS?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, LUNAS",
      cancelButtonText: "Batal",
    });

    if (confirm.isConfirmed) {
      const res = await updateStatusSchedule(schedule.id, "COMPLETED");

      if (res.ok) {
        Swal.fire("Berhasil!", "Status booking sudah LUNAS.", "success");
        refreshSchedules();
      } else {
        Swal.fire("Gagal!", res.error, "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
          Tagihan Pembayaran
        </h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead className="bg-blue-50 text-gray-700 text-sm uppercase">
              <tr>
                <th className="p-3 text-left font-medium">Customer</th>
                <th className="p-3 text-left font-medium">Armada</th>
                <th className="p-3 text-left font-medium">Tanggal DP</th>
                <th className="p-3 text-left font-medium">DP</th>
                <th className="p-3 text-left font-medium">Price</th>
                <th className="p-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {scheduleList.map((s) => (
                <tr
                  key={s.id}
                  className="border-t hover:bg-gray-50 transition-all"
                >
                  <td className="p-3">{s.customer}</td>
                  <td className="p-3">{s.bus}</td>
                  <td className="p-3">{s.paidAt}</td>
                  <td className="p-3 text-center">
                    Rp {s.amount.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    Rp {s.priceTotal.toLocaleString()}
                  </td>
                  <td className="p-3 text-center flex gap-2 justify-center">
                    <button
                      onClick={() => handleMarkLunas(s)}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      Lunas
                    </button>
                  </td>
                </tr>
              ))}
              {scheduleList.length === 0 && (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center p-6 text-gray-500 italic"
                  >
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
