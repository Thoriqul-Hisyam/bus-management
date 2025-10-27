export default function BusDetail({ bus, onBack }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Detail Bus</h2>
      <div className="space-y-2">
        <p><strong>Nama:</strong> {bus.name}</p>
        <p><strong>No. Plat:</strong> {bus.plate}</p>
        <p><strong>Kapasitas:</strong> {bus.capacity}</p>
        <p><strong>Status:</strong> {bus.status}</p>
      </div>
      <button
        onClick={onBack}
        className="mt-4 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
      >
        ← Kembali
      </button>
    </div>
  );
}
