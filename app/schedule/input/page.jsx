"use client";
import { useEffect,useState } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import { listBus } from "@/actions/bus";
import { listEmployees } from "@/actions/employee";
import { listCustomers} from "@/actions/customer";
import { createSchedule, listSchedules, deleteSchedule } from "@/actions/schedule";


export default function ScheduleInputPage() {
  const [selectedBus, setSelectedBus] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    customer: null,
    bus: null,
    datePickup: "",
    pickup: "",
    destination: "",
    seats: "",
    tanggalDP: "",
    dp: "",
    price: "",
    start: "",
    end: "",
    driver: null,
    conductor: null,
    sales: null,
    legrest: false,
  });
  const [scheduleList, setScheduleList] = useState([
 
]);
  async function refreshBus() {
      setLoading(true);
      const res = await listBus();
      if (res.ok) {
        const mapped = res.data.map((bus) => ({
          value: bus.id,
          label: bus.name || `Bus ${bus.id}`,
        }));
        setBuses(mapped);
      } else {
        Swal.fire({ icon: "error", title: "Error", text: res.error });
      }
      setLoading(false);
  }
  async function refreshEmployee() {
      setLoading(true);
      const res = await listEmployees();
      if (res.ok) {
        const mapped = res.data.map((employee) => ({
          value: employee.id,
          label: employee.fullName || `employee ${employee.id}`,
        }));
        setEmployees(mapped);
      } else {
        Swal.fire({ icon: "error", title: "Error", text: res.error });
      }
      setLoading(false);
  }
  async function refreshCustomer() {
      setLoading(true);
      const res = await listCustomers();
      if (res.ok) {
        const mapped = res.data.map((customer) => ({
          value: customer.id,
          label: customer.name || `customer ${customer.id}`,
        }));
        setCustomers(mapped);
      } else {
        Swal.fire({ icon: "error", title: "Error", text: res.error });
      }
      setLoading(false);
  }

  async function refreshSchedules() {
    setLoading(true);
    const res = await listSchedules();
    if (res.ok) {
      setScheduleList(res.data);
    } else {
      Swal.fire({ icon: "error", title: "Error", text: res.error });
    }
    setLoading(false);
  }



  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        refreshBus();
        refreshEmployee();
        refreshCustomer();
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
            <tr><td>Nopol</td><td>${schedule.bus}</td><td>Sangu</td><td>Rp </td></tr>
            <tr><td>Driver</td><td>${schedule.driver || "-"}</td><td>Tagihan</td><td>Rp ${schedule.priceTotal.toLocaleString()}</td></tr>
            <tr><td>Co Driver</td><td>${schedule.coDriver || "-"}</td><td>Premi Driver</td><td></td></tr>
            <tr><td>Panitia</td><td>${schedule.customer}</td><td>Premi Co Driver</td><td></td></tr>
            <tr><td>Tgl. Berangkat</td><td>${new Date(schedule.rentStartAt).toLocaleDateString("id-ID")}</td><td>UM Driver</td><td></td></tr>
            <tr><td>Tgl. Pulang</td><td>${new Date(schedule.rentEndAt).toLocaleDateString("id-ID")}</td><td>UM Co Driver</td><td></td></tr>
            <tr><td>Penjemputan</td><td>${schedule.pickupAddress}</td><td>BBM</td><td></td></tr>
            <tr><td>Keterangan</td><td> - </td><td>Total</td><td></td></tr>
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


  const addSchedule = async () => {
  if (!form.customer || !selectedBus || !form.destination) {
    alert("Lengkapi semua field sebelum menyimpan!");
    return;
  }

  const payload = {
    customerId: form.customer.value,
    busId: selectedBus.value,
    pickupAddress: form.pickup,
    destination: form.destination,
    seatsBooked: form.seats,
    priceTotal: form.price,
    legrest: form.legrest,
    driverId: form.driver?.value,
    coDriverId: form.conductor?.value,
    salesId: form.sales?.value,
    rentStartAt: form.start,
    rentEndAt: form.end,
    pickupAt: form.datePickup || null,
    status: "CONFIRMED",
    notes: "",
    dp: form.dp ? Number(form.dp) : 0, 
    tanggalDP: form.tanggalDP || null,
  };

  

  const res = await createSchedule(payload);
    if (res.ok) {
      Swal.fire("Berhasil", "Jadwal berhasil disimpan", "success");
      refreshSchedules();
      setForm({
        customer: null,
        bus: null,
        datePickup: "",
        pickup: "",
        destination: "",
        seats: "",
        tanggalDP: "",
        dp: "",
        price: "",
        start: "",
        end: "",
        driver: null,
        conductor: null,
        sales: null,
        legrest: false,
      });
      setSelectedBus(null);
    } else {
      Swal.fire("Gagal", res.error, "error");
    }
};


  const handleDeleteSchedule = async (id) => {
  if (!confirm("Hapus jadwal ini?")) return;
  const res = await deleteSchedule(id);
  if (res.ok) {
    Swal.fire("Berhasil", "Jadwal berhasil dihapus", "success");
    refreshSchedules(); 
  } else {
    Swal.fire("Gagal", res.error, "error");
  }
};


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
          Input Jadwal Armada
        </h2>

        {/* Form Input */}
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nama Customer</label>
            <Select
              options={customers}
              value={form.customer}
              onChange={(selected) => setForm({ ...form, customer: selected })}
              placeholder={loading ? "Memuat Customer..." : "Pilih Customer..."}
              isLoading={loading}
              isClearable
              />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Armada</label>
            <Select
              options={buses}
              value={selectedBus}
              onChange={setSelectedBus}
              placeholder={loading ? "Memuat Armada..." : "Pilih Armada..."}
              isLoading={loading}
              isClearable
              />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Waktu Penjemputan</label>
            <input
              type="datetime-local"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.datePickup}
              onChange={(e) => setForm({ ...form, datePickup: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Penjemputan</label>
            <input
              type="text"
              placeholder="Penjemputan"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.pickup}
              onChange={(e) => setForm({ ...form, pickup: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Tujuan</label>
            <input
              type="text"
              placeholder="Tujuan"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Bangku (Jumlah Kursi)</label>
            <input
              type="text"
              placeholder="Bangku"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.seats}
              onChange={(e) => setForm({ ...form, seats: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Tanggal DP</label>
            <input
              type="datetime-local"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.tanggalDP}
              onChange={(e) => setForm({ ...form, tanggalDP: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">DP</label>
            <input
              type="number"
              placeholder="DP"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.dp}
              onChange={(e) => setForm({ ...form, dp: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Price</label>
            <input
              type="number"
              placeholder="Price"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Mulai</label>
            <input
              type="datetime-local"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Selesai</label>
            <input
              type="datetime-local"
              className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 rounded-lg p-3 w-full transition-all"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Driver</label>
            <Select
            options={employees}
            value={form.driver}
            onChange={(selected) => setForm({ ...form, driver: selected })}
            placeholder={loading ? "Memuat Driver..." : "Pilih Driver..."}
            isLoading={loading}
            isClearable
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Co Driver</label>
            <Select
            options={employees}
            value={form.conductor}
            onChange={(selected) => setForm({ ...form, conductor: selected })}
            placeholder={loading ? "Memuat Co Driver..." : "Pilih Co Driver..."}
            isLoading={loading}
            isClearable
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Sales</label>
            <Select
            options={employees}
            value={form.sales}
            onChange={(selected) => setForm({ ...form, sales: selected })}
            placeholder={loading ? "Memuat Sales..." : "Pilih Sales..."}
            isLoading={loading}
            isClearable
            />
          </div>

          <div className="flex items-center mt-6 md:mt-0">
            <input
              type="checkbox"
              checked={form.legrest}
              onChange={(e) => setForm({ ...form, legrest: e.target.checked })}
              className="mr-2"
            />
            <label className="text-gray-700 text-sm font-medium">Legrest</label>
          </div>
        </div>

        <button
          onClick={addSchedule}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all mb-8"
        >
          + Tambah Jadwal
        </button>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse">
            <thead className="bg-blue-50 text-gray-700 text-sm uppercase">
              <tr>
                <th className="p-3 text-left font-medium">Customer</th>
                <th className="p-3 text-left font-medium">Armada</th>
                <th className="p-3 text-left font-medium">Legrest</th>
                <th className="p-3 text-left font-medium">Penjemputan</th>
                <th className="p-3 text-left font-medium">Tujuan</th>
                <th className="p-3 text-left font-medium">Bangku</th>
                <th className="p-3 text-left font-medium">Tanggal DP</th>
                <th className="p-3 text-left font-medium">DP</th>
                <th className="p-3 text-left font-medium">Price</th>
                <th className="p-3 text-left font-medium">Mulai</th>
                <th className="p-3 text-left font-medium">Selesai</th>
                <th className="p-3 text-left font-medium">Driver</th>
                <th className="p-3 text-left font-medium">Co Driver</th>
                <th className="p-3 text-left font-medium">Sales</th>
                <th className="p-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
             <tbody>
              {scheduleList.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50 transition-all">
                  <td className="p-3">{s.customer}</td>
                  <td className="p-3">{s.bus}</td>
                  <td className="p-3">{s.legrest ? "Yes" : "No"}</td>
                  <td className="p-3">{s.pickupAddress}</td>
                  <td className="p-3">{s.destination}</td>
                  <td className="p-3 text-center">{s.seatsBooked}</td>
                  <td className="p-3">{s.paidAt}</td>
                  <td className="p-3 text-center">Rp {s.amount.toLocaleString()}</td>
                  <td className="p-3 text-center">Rp {s.priceTotal.toLocaleString()}</td>
                  <td className="p-3">{s.rentStartAt}</td>
                  <td className="p-3">{s.rentEndAt}</td>
                  <td className="p-3">{s.driver}</td>
                  <td className="p-3">{s.coDriver}</td>
                  <td className="p-3">{s.sales}</td>
                  <td className="p-3 text-center flex gap-2 justify-center">
                    <button
                      onClick={() => handleDeleteSchedule(s.id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Hapus
                    </button>

                    <button
                      onClick={() => handlePrint(s)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Cetak
                    </button>
                  </td>
                </tr>
              ))}
              {scheduleList.length === 0 && (
                <tr>
                  <td colSpan="11" className="text-center p-6 text-gray-500 italic">
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
