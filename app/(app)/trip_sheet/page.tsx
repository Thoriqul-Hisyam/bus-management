"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { listSchedulesTripSheet } from "@/actions/schedule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ScheduleInputPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [scheduleList, setScheduleList] = useState([]);

  async function refreshSchedules() {
    setLoading(true);
    const res = await listSchedulesTripSheet();
    if (res.ok) {
      const confirmedSchedules = res.data.filter((s) => s.status === "COMPLETED");
      setScheduleList(confirmedSchedules);
    } else {
      Swal.fire({ icon: "error", title: "Error", text: res.error });
    }
    setLoading(false);
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(refreshSchedules, 0);
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
            .note { color: red; font-weight: bold; text-align: center; margin-top: 10px; font-size: 12px; }
            .footer { text-align: center; font-weight: bold; margin-top: 15px; font-size: 12px; }
          </style>
        </head>
        <body>
          <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
            <tr>
              <td style="width:120px;"><img id="logo" src="/img/logo.png" style="width:120px;" /></td>
              <td>
                <p style="font-size:16px; margin:0; line-height:1.4;">
                  <strong>Alamat Garasi:</strong><br/>
                  Jl. Merr Boulevard No. 22<br/>
                  Kec. Rungkut, Penjaringan Sari<br/>
                  Kota Surabaya
                </p>
              </td>
              <td style="text-align:right; font-size:16px;">
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
            if (logo.complete) window.print();
            else logo.onload = () => window.print();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle>List Surat Jalan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Armada</TableHead>
                <TableHead>Penjemputan</TableHead>
                <TableHead>Tujuan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Mulai</TableHead>
                <TableHead>Selesai</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleList.map((s) => (
                <TableRow key={s.id} className="hover:bg-gray-50">
                  <TableCell>{s.customer}</TableCell>
                  <TableCell>{s.bus}</TableCell>
                  <TableCell>{s.pickupAddress}</TableCell>
                  <TableCell>{s.destination}</TableCell>
                  <TableCell className="text-center">Rp {s.priceTotal.toLocaleString()}</TableCell>
                  <TableCell>{new Date(s.rentStartAt).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}</TableCell>
                  <TableCell>{new Date(s.rentEndAt).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}</TableCell>
                  <TableCell className="text-center flex gap-2 justify-center">
                    {s.tripId && (
                      <Button variant="outline" size="sm" onClick={() => handlePrint(s)}>
                        Cetak
                      </Button>
                    )}
                    <Button variant="default" size="sm" onClick={() => router.push(`/trip_sheet/create/${s.id}`)}>
                      Create / Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {scheduleList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 italic p-6">
                    Belum ada jadwal
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
