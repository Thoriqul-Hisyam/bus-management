"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import Swal from "sweetalert2";
import {
  listSchedulesTripSheet,
} from "@/actions/schedule";

export default function ScheduleInputPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [scheduleList, setScheduleList] = useState([]);
 

  async function refreshSchedules() {
    setLoading(true);
    const res = await listSchedulesTripSheet();
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

  const handlePrint = (schedule) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Surat Jalan ${schedule.customer}</title>
          <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          td, th { border: 1px solid black; padding: 6px; font-size: 12px; vertical-align: top; }
          h2 { margin: 0; text-align: right; }
          .logo { width: 120px; }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            border-bottom: 2px solid black; 
            padding-bottom: 10px;
          }
          .header-left {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }
          .header-right {
            text-align: right;
          }
          .address {
            font-size: 12px; 
            margin: 0; 
            line-height: 1.4;
          }
          .note { 
            color: red; 
            font-weight: bold; 
            text-align: center; 
            margin-top: 10px; 
            font-size: 12px;
          }
          .footer { 
            text-align: center; 
            font-weight: bold; 
            margin-top: 15px; 
            font-size: 12px;
          }
        </style>
        </head>
        <body>
         <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
          <tr>
            <td style="width:120px; vertical-align:top;">
              <img id="logo" src="/img/logo.png" style="width:120px;" />
            </td>
            <td style="vertical-align:top;">
              <p style="font-size:16px; margin:0; line-height:1.4;">
                <strong>Alamat Garasi:</strong><br/>
                Jl. Merr Boulevard No. 22<br/>
                Kec. Rungkut, Penjaringan Sari<br/>
                Kota Surabaya
              </p>
            </td>
            <td style="text-align:right; font-size:16px;vertical-align:top;">
              <h2 style="margin:0;">SURAT JALAN</h2>
              <p style="margin:0;">No. ${schedule.id}</p>
            </td>
          </tr>
        </table>



          <table>
            <tr><td>Armada</td><td>${schedule.bus}</td><td>Tujuan / Rute</td><td>${schedule.destination}</td></tr>
            <tr><td>Nopol</td><td>${schedule.plateNo}</td><td>Sangu</td><td>Rp ${schedule.sangu.toLocaleString()}</td></tr>
            <tr><td>Driver</td><td>${schedule.driver || "-"}</td><td>Tagihan</td><td>Rp ${schedule.priceTotal.toLocaleString()}</td></tr>
            <tr><td>Co Driver</td><td>${schedule.coDriver || "-"}</td><td>Premi Driver</td><td>Rp ${schedule.premiDriver.toLocaleString()}</td></tr>
            <tr><td>Panitia</td><td>${schedule.customer}</td><td>Premi Co Driver</td><td>Rp ${schedule.premiCoDriver.toLocaleString()}</td></tr>
            <tr><td>Tgl. Berangkat</td><td>${new Date(schedule.rentStartAt).toLocaleDateString("id-ID")}</td><td>UM Driver</td><td>Rp ${schedule.umDriver.toLocaleString()}</td></tr>
            <tr><td>Tgl. Pulang</td><td>${new Date(schedule.rentEndAt).toLocaleDateString("id-ID")}</td><td>UM Co Driver</td><td>Rp ${schedule.umCoDriver.toLocaleString()}</td></tr>
            <tr><td>Penjemputan</td><td>${schedule.pickupAddress}</td><td>BBM</td><td>Rp ${schedule.bbm.toLocaleString()}</td></tr>
            <tr><td>Keterangan</td><td>${schedule.description}</td><td>Total</td><td>Rp ${schedule.total.toLocaleString()}</td></tr>
          </table>

          <p class="note">
            DRIVER / CO DRIVER YANG CUTI, NAMA PENGGANTINYA HARAP DI TULIS DI SURAT JALAN.<br/>
            MAU CUTI.....!!! KONFIRMASI KANTOR / HUBUNGI BPK. ALIM
          </p>

          <p class="footer">KAMI HARAP AGAR DI ISI</p>

          <script>
          const logo = document.getElementById('logo');
          if (logo.complete) {
            window.print();
          } else {
            logo.onload = () => window.print();
          }
        </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
                        {s.tripId && (
                          <button
                            onClick={() => handlePrint(s)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Cetak
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/trip_sheet/create/${s.id}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Create / Edit Surat Jalan
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
