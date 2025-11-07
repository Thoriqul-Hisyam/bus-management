"use client";

import { useEffect, useState, FormEvent, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { getScheduleById } from "@/actions/schedule";
import { createTripSheet } from "@/actions/tripSheet";
import { formatRupiah, parseRupiah } from "@/utils/helpers/formatRupiah";

type Schedule = {
  id: number;
  bus: string;
  busId: number;
  plateNo: string;
  driver: string;
  driverId: number;
  coDriver: string;
  coDriverId: number;
  pickupAddress: string;
  destination: string;
  rentStartAt: string;
  rentEndAt: string;
  priceTotal: number;
  customer: string;
};

export default function CreateTripSheetPage() {
  const { bookId } = useParams();
  const id = Number(bookId);
  const router = useRouter();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [form, setForm] = useState({
    bookId: Number(bookId),
    description: "",
    sangu: 0,
    premiDriver: 0,
    premiCoDriver: 0,
    umDriver: 0,
    umCoDriver: 0,
    bbm: 0,
    total: 0,
    note: "",
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      if (!id) return Swal.fire("Error", "Schedule ID invalid", "error");

      const res = await getScheduleById(id);
      if (res.ok) setSchedule(res.data);
      else Swal.fire("Error", res.error, "error");
    }
    load();
  }, [bookId]);

  useEffect(() => {
    const total =
      (schedule?.priceTotal || 0) +
      (form.sangu || 0) +
      (form.premiDriver || 0) +
      (form.premiCoDriver || 0) +
      (form.umDriver || 0) +
      (form.umCoDriver || 0) +
      (form.bbm || 0);
    setForm((prev) => ({ ...prev, total }));
  }, [
    schedule?.priceTotal,
    form.sangu,
    form.premiDriver,
    form.premiCoDriver,
    form.umDriver,
    form.umCoDriver,
    form.bbm,
  ]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await createTripSheet(form);
        setForm({
          bookId: Number(bookId),
          description: "",
          sangu: 0,
          premiDriver: 0,
          premiCoDriver: 0,
          umDriver: 0,
          umCoDriver: 0,
          bbm: 0,
          total: 0,
          note: "",
        });
        Swal.fire("Success", "Trip sheet created", "success");
      } catch (error: any) {
        Swal.fire("Error", error.message || "Something went wrong", "error");
      }
    });
  };

  if (!schedule) return <div className="p-6">Loading...</div>;

  return (
    <div className="mx-auto bg-white p-6 rounded-2xl shadow">
      {" "}
      <h2 className="text-xl font-bold mb-4">
        Create Surat Jalan {schedule.customer}{" "}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium">Armada</label>
            <input
              value={schedule.bus}
              disabled
              className="border rounded p-2 w-full bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">No. Polisi</label>
            <input
              value={schedule.plateNo}
              disabled
              className="border rounded p-2 w-full bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Driver</label>
            <input
              value={schedule.driver}
              disabled
              className="border rounded p-2 w-full bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Co-Driver</label>
            <input
              value={schedule.coDriver}
              disabled
              className="border rounded p-2 w-full bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Panitia</label>
            <input
              disabled
              value={schedule.customer ?? ""}
              className="border rounded p-2 w-full  bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Tujuan / Rute</label>
            <input
              disabled
              value={schedule.destination ?? ""}
              className="border rounded p-2 w-full  bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Tgl Berangkat</label>
            <input
              type="date"
              value={schedule.rentStartAt.split("T")[0]}
              disabled
              className="border rounded p-2 w-full bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Tgl Pulang</label>
            <input
              type="date"
              value={schedule.rentEndAt.split("T")[0]}
              disabled
              className="border rounded p-2 w-full bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Tagihan</label>
            <input
              value={formatRupiah(schedule.priceTotal)}
              disabled
              className="border rounded p-2 w-full bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Sangu</label>
            <input
              type="text"
              value={formatRupiah(form.sangu) ?? ""}
              onChange={(e) =>
                setForm({ ...form, sangu: parseRupiah(e.target.value) || 0 })
              }
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block font-medium">Premi Driver</label>
            <input
              type="text"
              value={formatRupiah(form.premiDriver) ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  premiDriver: parseRupiah(e.target.value) || 0,
                })
              }
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block font-medium">Premi Co Driver</label>
            <input
              type="text"
              value={formatRupiah(form.premiCoDriver) ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  premiCoDriver: parseRupiah(e.target.value) || 0,
                })
              }
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block font-medium">UM Driver</label>
            <input
              type="text"
              value={formatRupiah(form.umDriver) ?? ""}
              onChange={(e) =>
                setForm({ ...form, umDriver: parseRupiah(e.target.value) || 0 })
              }
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block font-medium">UM Co Driver</label>
            <input
              type="text"
              value={formatRupiah(form.umCoDriver) ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  umCoDriver: parseRupiah(e.target.value) || 0,
                })
              }
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block font-medium">BBM</label>
            <input
              type="text"
              value={formatRupiah(form.bbm) ?? ""}
              onChange={(e) =>
                setForm({ ...form, bbm: parseRupiah(e.target.value) || 0 })
              }
              className="border rounded p-2 w-full"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium">Total</label>{" "}
          <input
            type="text"
            value={formatRupiah(form.total) ?? 0}
            readOnly
            className="border rounded p-2 w-full bg-gray-100"
          />
        </div>
        <div>
          <label className="block font-medium">Keterangan</label>
          <textarea
            value={form.note ?? ""}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="border rounded p-2 w-full"
            rows={3}
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Simpan Surat Jalan
        </button>
      </form>
    </div>
  );
}
