"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";
import { z } from "zod";
import RSelect, { type Option as ROption } from "@/components/shared/rselect";

import {
  createSchedule,
  listCustomerOptions,
  listBusOptions,
  listDriverOptions,
  listCoDriverOptions,
  listSalesOptions,
} from "@/actions/schedule";

const FormSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  busId: z.coerce.number().int().positive(),
  pickupAddress: z.string().min(1, "Alamat penjemputan wajib diisi"),
  destination: z.string().min(1, "Tujuan wajib diisi"),
  seatsBooked: z.coerce.number().int().positive(),
  priceTotal: z.coerce.number().positive(),
  legrest: z.boolean().optional().default(false),
  driverId: z.coerce.number().int().positive(),
  coDriverId: z.coerce.number().int().positive(),
  salesId: z.coerce.number().int().positive(),
  rentStartAt: z.string().min(1),
  rentEndAt: z.string().min(1),
  pickupAt: z.string().optional(),
  status: z.string().min(1),
  notes: z.string().optional(),
  dp: z.coerce.number().optional(),
  tanggalDP: z.string().optional(),
});

export default function NewSchedulePage() {
  const [isPending, startTransition] = useTransition();

  const [customerOpts, setCustomerOpts] = useState<ROption[]>([]);
  const [busOpts, setBusOpts] = useState<ROption[]>([]);
  const [driverOpts, setDriverOpts] = useState<ROption[]>([]);
  const [coDriverOpts, setCoDriverOpts] = useState<ROption[]>([]);
  const [salesOpts, setSalesOpts] = useState<ROption[]>([]);
  const statusOpts: ROption[] = [
    { value: "CONFIRMED", label: "CONFIRMED" },
    { value: "COMPLETED", label: "COMPLETED" },
    { value: "CANCELLED", label: "CANCELLED" },
  ];

  const [form, setForm] = useState({
    customerId: null as number | string | null,
    busId: null as number | string | null,
    pickupAddress: "",
    destination: "",
    seatsBooked: "",
    priceTotal: "",
    legrest: false,
    driverId: null as number | string | null,
    coDriverId: null as number | string | null,
    salesId: null as number | string | null,
    rentStartAt: "",
    rentEndAt: "",
    pickupAt: "",
    status: "CONFIRMED",
    notes: "",
    dp: "",
    tanggalDP: "",
  });

  useEffect(() => {
    (async () => {
      const [cRes, bRes, dRes, cdRes, sRes] = await Promise.all([
        listCustomerOptions(),
        listBusOptions(),
        listDriverOptions(),
        listCoDriverOptions(),
        listSalesOptions(),
      ]);

      if (cRes.ok) setCustomerOpts(cRes.data);
      if (bRes.ok) setBusOpts(bRes.data);
      if (dRes.ok) setDriverOpts(dRes.data);
      if (cdRes.ok) setCoDriverOpts(cdRes.data);
      if (sRes.ok) setSalesOpts(sRes.data);
    })();
  }, []);

  const submit = async () => {
    const parsed = FormSchema.safeParse({
      ...form,
      customerId: form.customerId,
      busId: form.busId,
      seatsBooked: form.seatsBooked,
      priceTotal: form.priceTotal,
      driverId: form.driverId,
      coDriverId: form.coDriverId,
      salesId: form.salesId,
      rentStartAt: form.rentStartAt,
      rentEndAt: form.rentEndAt,
      pickupAt: form.pickupAt || undefined,
      dp: form.dp ? Number(form.dp) : undefined,
      tanggalDP: form.tanggalDP || undefined,
      legrest: !!form.legrest,
    });

    if (!parsed.success) {
      Swal.fire("Gagal", parsed.error.issues[0]?.message ?? "Input tidak valid", "error");
      return;
    }

    startTransition(async () => {
      const res = await createSchedule({
        ...parsed.data,
        rentStartAt: new Date(parsed.data.rentStartAt),
        rentEndAt: new Date(parsed.data.rentEndAt),
        pickupAt: parsed.data.pickupAt ? new Date(parsed.data.pickupAt) : undefined,
      });
      if (res.ok) {
        Swal.fire("Berhasil", "Jadwal berhasil ditambahkan", "success");
        history.back();
      } else {
        Swal.fire("Gagal", res.error, "error");
      }
    });
  };

  return (
    <main className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tambah Jadwal</h1>
        <Link href="/schedule/input">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4 space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Customer</label>
            <RSelect
              instanceId="new-customer"
              options={customerOpts}
              value={form.customerId}
              onChange={(v) => setForm((s) => ({ ...s, customerId: v }))}
              placeholder="Pilih customer"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Armada</label>
            <RSelect
              instanceId="new-bus"
              options={busOpts}
              value={form.busId}
              onChange={(v) => setForm((s) => ({ ...s, busId: v }))}
              placeholder="Pilih armada"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Mulai</label>
              <Input
                type="datetime-local"
                value={form.rentStartAt}
                onChange={(e) => setForm((s) => ({ ...s, rentStartAt: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Selesai</label>
              <Input
                type="datetime-local"
                value={form.rentEndAt}
                onChange={(e) => setForm((s) => ({ ...s, rentEndAt: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Waktu Penjemputan (opsional)</label>
            <Input
              type="datetime-local"
              value={form.pickupAt}
              onChange={(e) => setForm((s) => ({ ...s, pickupAt: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Alamat Penjemputan</label>
            <Input
              value={form.pickupAddress}
              onChange={(e) => setForm((s) => ({ ...s, pickupAddress: e.target.value }))}
              placeholder="Alamat penjemputan"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Tujuan</label>
            <Input
              value={form.destination}
              onChange={(e) => setForm((s) => ({ ...s, destination: e.target.value }))}
              placeholder="Tujuan"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Kursi Dipesan</label>
              <Input
                type="number"
                value={form.seatsBooked}
                onChange={(e) => setForm((s) => ({ ...s, seatsBooked: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Harga Total</label>
              <Input
                type="number"
                value={form.priceTotal}
                onChange={(e) => setForm((s) => ({ ...s, priceTotal: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Driver</label>
              <RSelect
                instanceId="new-driver"
                options={driverOpts}
                value={form.driverId}
                onChange={(v) => setForm((s) => ({ ...s, driverId: v }))}
                placeholder="Pilih driver"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Co Driver</label>
              <RSelect
                instanceId="new-codriver"
                options={coDriverOpts}
                value={form.coDriverId}
                onChange={(v) => setForm((s) => ({ ...s, coDriverId: v }))}
                placeholder="Pilih co driver"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Sales</label>
              <RSelect
                instanceId="new-sales"
                options={salesOpts}
                value={form.salesId}
                onChange={(v) => setForm((s) => ({ ...s, salesId: v }))}
                placeholder="Pilih sales"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Tanggal DP</label>
              <Input
                type="datetime-local"
                value={form.tanggalDP}
                onChange={(e) => setForm((s) => ({ ...s, tanggalDP: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Nominal DP</label>
              <Input
                type="number"
                value={form.dp}
                onChange={(e) => setForm((s) => ({ ...s, dp: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Status</label>
            <RSelect
              instanceId="new-status"
              options={statusOpts}
              value={form.status}
              onChange={(v) => setForm((s) => ({ ...s, status: (v as string) || "CONFIRMED" }))}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="legrest"
              type="checkbox"
              checked={form.legrest}
              onChange={(e) => setForm((s) => ({ ...s, legrest: e.target.checked }))}
            />
            <label htmlFor="legrest" className="text-sm">
              Legrest
            </label>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Catatan</label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Link href="/schedule/input">
              <Button variant="outline">Batal</Button>
            </Link>
            <Button disabled={isPending} onClick={submit}>
              Simpan
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
