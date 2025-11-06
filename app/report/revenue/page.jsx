"use client";
import { useState, useEffect, useRef } from "react";
import { listSchedules } from "@/actions/schedule";
import Swal from "sweetalert2";

export default function ReportRevenueTablePage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBus, setSelectedBus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const printRef = useRef(null);

  // 🔹 Ambil data dari server action
  async function refreshSchedules() {
    try {
      setLoading(true);
      const res = await listSchedules();
      if (res.ok) {
        const rows = res.data.map((r) => ({
          id: r.id,
          bus: r.bus,
          driver: r.driver,
          destination: r.destination,
          date: r.rentStartAt,
          totalRevenue: r.priceTotal,
          trips: 1, // sementara 1 trip per booking
        }));
        setData(rows);
        setFilteredData(rows);
      } else {
        Swal.fire({ icon: "error", title: "Error", text: res.error });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal Ambil Data", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshSchedules();
  }, []);

  // 🔹 Filter data
  useEffect(() => {
    let filtered = [...data];

    if (selectedBus) filtered = filtered.filter((item) => item.bus === selectedBus);

    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to = new Date(dateTo);
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= from && itemDate <= to;
      });
    }

    setFilteredData(filtered);
  }, [selectedBus, dateFrom, dateTo, data]);

  const totalRevenue = filteredData.reduce(
    (sum, item) => sum + Number(item.totalRevenue || 0),
    0
  );

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  // 🔹 UI
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-2">Laporan Pendapatan Navara</h1>

      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-wrap gap-3 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Pilih Bus</label>
            <select
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Semua Bus</option>
              {[...new Set(data.map((item) => item.bus))].map((bus) => (
                <option key={bus} value={bus}>
                  {bus}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => {
                setSelectedBus("");
                setDateFrom("");
                setDateTo("");
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm text-gray-700"
            >
              Reset
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              Print
            </button>
          </div>
        </div>

        <div ref={printRef} className="overflow-x-auto mt-4 print:p-0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-50 text-gray-700 uppercase text-xs print:bg-gray-200">
                <th className="p-3 text-left border-b">Armada</th>
                <th className="p-3 text-left border-b">Supir</th>
                <th className="p-3 text-left border-b">Tanggal</th>
                <th className="p-3 text-right border-b">Total Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{item.bus}</td>
                    <td className="p-3">{item.driver}</td>
                    <td className="p-3">
                      {item.date
                        ? new Date(item.date).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                    <td className="p-3 text-right text-green-600">
                      Rp {Number(item.totalRevenue || 0).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500 italic">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="font-semibold bg-gray-100 print:bg-gray-200">
                <td className="p-3" colSpan="3">
                  Total Pendapatan
                </td>
                <td className="p-3 text-right text-green-600">
                  Rp {totalRevenue.toLocaleString("id-ID")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
