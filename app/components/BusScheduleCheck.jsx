import { useState } from "react";

export default function BusScheduleCheck({ buses, schedules }) {
  const [busId, setBusId] = useState("");
  const [date, setDate] = useState("");
  const [result, setResult] = useState(null);

  const handleCheck = () => {
    const found = schedules.find(
      (s) => s.busId === Number(busId) && s.date === date
    );
    if (found) setResult({ status: "Dipakai", destination: found.destination });
    else setResult({ status: "Kosong" });
  };

  return (
    <div>
      <div className="space-y-4">
        <div>
          <label className="block font-medium">Pilih Bus</label>
          <select
            value={busId}
            onChange={(e) => setBusId(e.target.value)}
            className="border rounded-lg w-full p-2 mt-1"
          >
            <option value="">-- Pilih Bus --</option>
            {buses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.plate})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Tanggal</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-lg w-full p-2 mt-1"
          />
        </div>

        <button
          onClick={handleCheck}
          disabled={!busId || !date}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Cek Jadwal
        </button>

        {result && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
            {result.status === "Dipakai" ? (
              <p>
                🚍 Bus sedang <span className="text-red-600 font-semibold">dipakai</span> ke{" "}
                <strong>{result.destination}</strong> pada tanggal <strong>{date}</strong>.
              </p>
            ) : (
              <p>
                ✅ Bus <span className="text-green-600 font-semibold">kosong</span> pada tanggal{" "}
                <strong>{date}</strong>.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
