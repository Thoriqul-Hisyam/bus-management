export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Selamat Datang di Dashboard Manajemen Schedule Bus
      </h1>
      <p className="text-gray-700 mb-6">
        Ini adalah panel admin untuk mengelola data bus dan jadwal perjalanan.
      </p>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Total Bus</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Bus Aktif</h3>
          <p className="text-3xl font-bold text-green-600">9</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-2">Perjalanan Hari Ini</h3>
          <p className="text-3xl font-bold text-orange-600">4</p>
        </div>
      </div>
    </div>
  );
}
