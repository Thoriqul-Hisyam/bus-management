"use client";
import { useState, useEffect, useRef } from "react";

export default function ReportRevenueTablePage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const [selectedBus, setSelectedBus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const printRef = useRef(null);

  const dummyRevenueData = [
    { id: 1, bus: "Bus Pariwisata 01", driver: "Budi", totalRevenue: 12500000, trips: 3, date: "2025-10-01" },
    { id: 2, bus: "Bus Pariwisata 02", driver: "Tono", totalRevenue: 9700000, trips: 2, date: "2025-10-02" },
    { id: 3, bus: "Bus Pariwisata 03", driver: "Roni", totalRevenue: 16400000, trips: 4, date: "2025-10-03" },
    { id: 4, bus: "Bus Pariwisata 01", driver: "Budi", totalRevenue: 8700000, trips: 2, date: "2025-10-04" },
    { id: 5, bus: "Bus Pariwisata 02", driver: "Tono", totalRevenue: 11400000, trips: 3, date: "2025-10-05" },
  ];

  

  // Set data awal
  useEffect(() => {
    setData(dummyRevenueData);
    setFilteredData(dummyRevenueData);
  }, []);

  // Filter data
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
    } else if (dateFrom) {
      const from = new Date(dateFrom);
      filtered = filtered.filter((item) => new Date(item.date) >= from);
    } else if (dateTo) {
      const to = new Date(dateTo);
      filtered = filtered.filter((item) => new Date(item.date) <= to);
    }

    setFilteredData(filtered);
  }, [selectedBus, dateFrom, dateTo, data]);

    const totalRevenue = filteredData.reduce(
    (sum, item) => sum + Number(item.totalRevenue),
    0
    );



  // Fungsi untuk print
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // reload biar balik ke mode normal
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-2">Laporan Pendapatan Navara</h1>


      <div className="bg-white p-6 rounded-2xl shadow-md">
        {/* Tombol & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-4 gap-3">
          {/* <h2 className="text-xl font-semibold">Filter Laporan</h2> */}
          <div className="flex flex-wrap gap-3">
            {/* Filter Bus */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Pilih Bus</label>
              <select
                value={selectedBus}
                onChange={(e) => setSelectedBus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Bus</option>
                {[...new Set(data.map((item) => item.bus))].map((bus) => (
                  <option key={bus} value={bus}>
                    {bus}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Tanggal */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Dari Tanggal</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tombol Reset */}
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

              {/* Tombol Print */}
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div ref={printRef} className="overflow-x-auto mt-4 print:p-0">
          <div className="text-center mb-4 hidden print:block">
            <h2 className="text-lg font-bold">Laporan Pendapatan Bus</h2>
            {dateFrom && dateTo && (
              <p className="text-sm text-gray-700">
                Periode: {new Date(dateFrom).toLocaleDateString("id-ID")} -{" "}
                {new Date(dateTo).toLocaleDateString("id-ID")}
              </p>
            )}
          </div>

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-blue-50 text-gray-700 uppercase text-xs print:bg-gray-200">
                <th className="p-3 text-left border-b">Bus</th>
                <th className="p-3 text-left border-b">Supir</th>
                <th className="p-3 text-left border-b">Tanggal</th>
                <th className="p-3 text-center border-b">Jumlah Trip</th>
                <th className="p-3 text-right border-b">Total Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 transition-all">
                    <td className="p-3">{item.bus}</td>
                    <td className="p-3">{item.driver}</td>
                    <td className="p-3">{new Date(item.date).toLocaleDateString("id-ID")}</td>
                    <td className="p-3 text-center">{item.trips}</td>
                    <td className="p-3 text-right text-green-600">
                      Rp {item.totalRevenue.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500 italic">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="font-semibold bg-gray-100 print:bg-gray-200">
                <td className="p-3" colSpan="4">
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

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          button,
          select,
          input,
          h1,
          .shadow-md {
            display: none !important;
          }
          table {
            font-size: 12px !important;
          }
          th,
          td {
            border: 1px solid #999 !important;
          }
        }
      `}</style>
    </div>
  );
}
