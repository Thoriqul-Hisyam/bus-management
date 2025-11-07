"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import Swal from "sweetalert2";
import {
  listSchedules,
} from "@/actions/schedule";

export default function ScheduleInputPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [scheduleList, setScheduleList] = useState([]);
 

  async function refreshSchedules() {
    setLoading(true);
    const res = await listSchedules();
    if (res.ok) {
      const confirmedSchedules = res.data.filter(
        (s) => s.status === "COMPLETED"
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

 

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
          Input Jadwal Armada
        </h2>


        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead className="bg-blue-50 text-gray-700 text-sm uppercase">
              <tr>
                <th className="p-3 text-left font-medium">Customer</th>
                <th className="p-3 text-left font-medium">Armada</th>
                <th className="p-3 text-left font-medium">Penjemputan</th>
                <th className="p-3 text-left font-medium">Tujuan</th>
                <th className="p-3 text-left font-medium">Price</th>
                <th className="p-3 text-left font-medium">Mulai</th>
                <th className="p-3 text-left font-medium">Selesai</th>
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
                  <td className="p-3">{s.pickupAddress}</td>
                  <td className="p-3">{s.destination}</td>
                  <td className="p-3 text-center">
                    Rp {s.priceTotal.toLocaleString()}
                  </td>
                  <td className="p-3">{new Date(s.rentStartAt).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}</td>
                  <td className="p-3">{new Date(s.rentEndAt).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</td>
                  <td className="p-3 text-center flex gap-2 justify-center">
                      {!s.tripSheetExists ? (
                        <button
                          onClick={() => router.push(`/trip_sheet/create/${s.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Create Surat Jalan
                        </button>
                      ) : (
                        <button
                          onClick={() => router.push(`/trip_sheet/print/${s.id}`)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Cetak
                        </button>
                      )}
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
