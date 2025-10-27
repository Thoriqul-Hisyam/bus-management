export default function BusList({ buses, onSelect }) {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2">Nama Bus</th>
          <th className="p-2">No. Plat</th>
          <th className="p-2">Kapasitas</th>
          <th className="p-2">Status</th>
          <th className="p-2 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody>
        {buses.map((bus) => (
          <tr key={bus.id} className="border-b hover:bg-gray-50">
            <td className="p-2">{bus.name}</td>
            <td className="p-2">{bus.plate}</td>
            <td className="p-2">{bus.capacity}</td>
            <td className="p-2">
              <span
                className={`px-2 py-1 rounded text-sm ${
                  bus.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {bus.status}
              </span>
            </td>
            <td className="p-2 text-center">
              <button
                onClick={() => onSelect(bus)}
                className="text-blue-600 hover:underline"
              >
                Detail
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
