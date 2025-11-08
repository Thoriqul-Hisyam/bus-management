"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { listSchedules, updateStatusSchedule } from "@/actions/schedule";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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
      <Card className="max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle>Tagihan Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Armada</TableHead>
                <TableHead>Tanggal DP</TableHead>
                <TableHead>DP</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleList.map((s) => (
                <TableRow key={s.id} className="hover:bg-gray-50">
                  <TableCell>{s.customer}</TableCell>
                  <TableCell>{s.bus}</TableCell>
                  <TableCell>{s.paidAt}</TableCell>
                  <TableCell className="text-center">
                    Rp {s.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    Rp {s.priceTotal.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkLunas(s)}
                    >
                      Lunas
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {scheduleList.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-gray-500 italic p-6"
                  >
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
