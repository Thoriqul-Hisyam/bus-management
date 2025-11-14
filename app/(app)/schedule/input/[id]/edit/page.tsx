"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Swal from "sweetalert2";
import RSelect, { type Option as ROption } from "@/components/shared/rselect";
import { formatRupiah, parseRupiah } from "@/utils/helpers/formatRupiah";

import {
  getScheduleById,
  updateSchedule,
  listCustomerOptions,
  listBusOptions,
  listDriverOptions,
  listCoDriverOptions,
  listSalesOptions,
} from "@/actions/schedule";

export default function EditSchedulePage() {
  const { id } = useParams<{ id: string }>();
  const [isPending, startTransition] = useTransition();

  const [customerOpts, setCustomerOpts] = useState<ROption[]>([]);
  const [busOpts, setBusOpts] = useState<ROption[]>([]);
  const [driverOpts, setDriverOpts] = useState<ROption[]>([]);
  const [coDriverOpts, setCoDriverOpts] = useState<ROption[]>([]);
  const [salesOpts, setSalesOpts] = useState<ROption[]>([]);
  // const statusOpts: ROption[] = [
  //   { value: "CONFIRMED", label: "CONFIRMED" },
  //   { value: "COMPLETED", label: "COMPLETED" },
  //   { value: "CANCELLED", label: "CANCELLED" },
  // ];

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
  });

  function toLocalInput(dtIso: string | null | undefined) {
    if (!dtIso) return "";
    try {
      return dtIso.slice(0, 16);
    } catch {
      return "";
    }
  }

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

      const r = await getScheduleById(Number(id));
      if (r.ok) {
        const d = r.data;
        setForm({
          customerId: d.customerId ?? null,
          busId: d.busId ?? null,
          pickupAddress: d.pickupAddress ?? "",
          destination: d.destination ?? "",
          seatsBooked: String(d.seatsBooked ?? ""),
          priceTotal: String(d.priceTotal ?? ""),
          legrest: !!d.legrest,
          driverId: d.driverId ?? null,
          coDriverId: d.coDriverId ?? null,
          salesId: d.salesId ?? null,
          rentStartAt: toLocalInput(d.rentStartAt),
          rentEndAt: toLocalInput(d.rentEndAt),
          pickupAt: toLocalInput(d.pickupAt),
          status: "CONFIRMED",
          notes: d.notes ?? "",
        });
      } else {
        Swal.fire("Gagal", r.error, "error");
      }
    })();
  }, [id]);

  const submit = async () => {
    startTransition(async () => {
      const res = await updateSchedule({
        id: Number(id),
        customerId: Number(form.customerId),
        busId: Number(form.busId),
        pickupAddress: form.pickupAddress,
        destination: form.destination,
        seatsBooked: Number(form.seatsBooked),
        priceTotal: Number(form.priceTotal),
        legrest: !!form.legrest,
        driverId: Number(form.driverId),
        coDriverId: Number(form.coDriverId),
        salesId: Number(form.salesId),
        rentStartAt: new Date(form.rentStartAt),
        rentEndAt: new Date(form.rentEndAt),
        pickupAt: form.pickupAt ? new Date(form.pickupAt) : undefined,
        status: form.status,
        notes: form.notes || undefined,
      });
      if (res.ok) {
        Swal.fire("Berhasil", "Jadwal diperbarui", "success");
        history.back();
      } else {
        Swal.fire("Gagal", res.error, "error");
      }
    });
  };

  return (
    <main className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Ubah Jadwal</h1>
        <Link href="/schedule/input">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4 space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Customer</label>
            <RSelect
              instanceId="edit-customer"
              options={customerOpts}
              value={form.customerId}
              onChange={(v) => setForm((s) => ({ ...s, customerId: v }))}
              placeholder="Pilih customer"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Armada</label>
            <RSelect
              instanceId="edit-bus"
              options={busOpts}
              value={form.busId}
              onChange={(v) =>
                setForm((s) => {
                  const selected = (busOpts as any[]).find(
                    (b) => b.value === v
                  );
                  return {
                    ...s,
                    busId: v,
                    driverId: selected?.driverId ?? null,
                    coDriverId: selected?.coDriverId ?? null,
                  };
                })
              }
              placeholder="Pilih armada"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Mulai</label>
              <Input
                type="datetime-local"
                value={form.rentStartAt}
                onChange={(e) =>
                  setForm((s) => ({ ...s, rentStartAt: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Selesai</label>
              <Input
                type="datetime-local"
                value={form.rentEndAt}
                onChange={(e) =>
                  setForm((s) => ({ ...s, rentEndAt: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              Waktu Penjemputan (opsional)
            </label>
            <Input
              type="datetime-local"
              value={form.pickupAt}
              onChange={(e) =>
                setForm((s) => ({ ...s, pickupAt: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              Alamat Penjemputan
            </label>
            <Input
              value={form.pickupAddress}
              onChange={(e) =>
                setForm((s) => ({ ...s, pickupAddress: e.target.value }))
              }
              placeholder="Alamat penjemputan"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Tujuan</label>
            <Input
              value={form.destination}
              onChange={(e) =>
                setForm((s) => ({ ...s, destination: e.target.value }))
              }
              placeholder="Tujuan"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">
                Kursi Dipesan
              </label>
              <Input
                type="number"
                value={form.seatsBooked}
                onChange={(e) =>
                  setForm((s) => ({ ...s, seatsBooked: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">
                Harga Total
              </label>
              <Input
                value={formatRupiah(Number(form.priceTotal) || 0)}
                onChange={(e) => {
                  const raw = parseRupiah(e.target.value);
                  setForm((s) => ({ ...s, priceTotal: raw.toString() }));
                }}
              />
            </div>
          </div>
        </div>

        {/* Kolom kanan */}
        <div className="rounded-2xl border bg-white p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Driver</label>
              <RSelect
                instanceId="edit-driver"
                options={driverOpts}
                value={form.driverId}
                onChange={(v) => setForm((s) => ({ ...s, driverId: v }))}
                placeholder="Pilih driver"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Co Driver</label>
              <RSelect
                instanceId="edit-codriver"
                options={coDriverOpts}
                value={form.coDriverId}
                onChange={(v) => setForm((s) => ({ ...s, coDriverId: v }))}
                placeholder="Pilih co driver"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Sales</label>
              <RSelect
                instanceId="edit-sales"
                options={salesOpts}
                value={form.salesId}
                onChange={(v) => setForm((s) => ({ ...s, salesId: v }))}
                placeholder="Pilih sales"
              />
            </div>
          </div>

          {/* <div>
            <label className="text-sm text-muted-foreground">Status</label>
            <RSelect
              instanceId="edit-status"
              options={statusOpts}
              value={form.status}
              onChange={(v) =>
                setForm((s) => ({ ...s, status: (v as string) || "CONFIRMED" }))
              }
            />
          </div> */}

          <div className="flex items-center gap-2">
            <input
              id="legrest"
              type="checkbox"
              checked={form.legrest}
              onChange={(e) =>
                setForm((s) => ({ ...s, legrest: e.target.checked }))
              }
            />
            <label htmlFor="legrest" className="text-sm">
              Legrest
            </label>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Catatan</label>
            <Textarea
              value={form.notes}
              onChange={(e) =>
                setForm((s) => ({ ...s, notes: e.target.value }))
              }
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Link href="/schedule/input">
              <Button variant="outline">Batal</Button>
            </Link>
            <Button disabled={isPending} onClick={submit}>
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
