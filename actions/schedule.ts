"use server";

import { prisma } from "@/lib/prisma";
import {
  ScheduleCreateSchema,
  ScheduleUpdateSchema,
} from "@/validators/schedule";
import { ok, err, type Result } from "@/lib/result";
import { revalidateMasterSchedules } from "./_utils";

export async function listSchedules(): Promise<Result<any[]>> {
  try {
    const rows = await prisma.booking.findMany({
      include: {
        customer: true,
        bus: true,
        driver: true,
        coDriver: true,
        sales: true,
        payments: true,
      },
      orderBy: { id: "desc" },
    });

    const safeRows = rows.map((r) => ({
      ...r,
      priceTotal: r.priceTotal ? Number(r.priceTotal) : 0,
      amount: Number(r.payments.find((p) => p.type === "DP")?.amount)
        ? Number(r.payments.find((p) => p.type === "DP")?.amount)
        : 0,
      paidAt:
        r.payments.find((p) => p.type === "DP")?.paidAt?.toISOString() ?? null,
      rentStartAt: r.rentStartAt?.toISOString() ?? null,
      rentEndAt: r.rentEndAt?.toISOString() ?? null,
      pickupAt: r.pickupAt?.toISOString() ?? null,
      createdAt: r.createdAt?.toISOString() ?? null,
      updatedAt: r.updatedAt?.toISOString() ?? null,
      customer: r.customer?.name ?? null,
      bus: r.bus?.name ?? null,
      driver: r.driver?.fullName ?? null,
      coDriver: r.coDriver?.fullName ?? null,
      sales: r.sales?.fullName ?? null,
      payments: undefined,
    }));

    return ok(safeRows);
  } catch (e: any) {
    return err(e.message ?? "Gagal mengambil data jadwal");
  }
}
export async function listSchedulesTripSheet(): Promise<Result<any[]>> {
  try {
    const rows = await prisma.booking.findMany({
      include: {
        customer: true,
        bus: true,
        driver: true,
        coDriver: true,
        sales: true,
        tripSheets: true,
      },
      orderBy: { id: "desc" },
    });

    const safeRows = rows.map((r) => ({
      ...r,
      tripId: r.tripSheets?.[0]?.id ?? null,
      sangu:
        r.tripSheets?.[0]?.sangu != null ? Number(r.tripSheets[0].sangu) : null,
      premiDriver:
        r.tripSheets?.[0]?.premiDriver != null
          ? Number(r.tripSheets[0].premiDriver)
          : null,
      premiCoDriver:
        r.tripSheets?.[0]?.premiCoDriver != null
          ? Number(r.tripSheets[0].premiCoDriver)
          : null,
      umDriver:
        r.tripSheets?.[0]?.umDriver != null
          ? Number(r.tripSheets[0].umDriver)
          : null,
      umCoDriver:
        r.tripSheets?.[0]?.umCoDriver != null
          ? Number(r.tripSheets[0].umCoDriver)
          : null,
      bbm: r.tripSheets?.[0]?.bbm != null ? Number(r.tripSheets[0].bbm) : null,
      total:
        r.tripSheets?.[0]?.total != null ? Number(r.tripSheets[0].total) : null,
      description: r.tripSheets?.[0]?.description ?? null,
      priceTotal: r.priceTotal != null ? Number(r.priceTotal) : 0,

      rentStartAt: r.rentStartAt?.toISOString() ?? null,
      rentEndAt: r.rentEndAt?.toISOString() ?? null,
      pickupAt: r.pickupAt?.toISOString() ?? null,
      createdAt: r.createdAt?.toISOString() ?? null,
      updatedAt: r.updatedAt?.toISOString() ?? null,
      customer: r.customer?.name ?? null,
      bus: r.bus?.name ?? null,
      plateNo: r.bus?.plateNo ?? null,
      driver: r.driver?.fullName ?? null,
      coDriver: r.coDriver?.fullName ?? null,
      sales: r.sales?.fullName ?? null,
      tripSheets: undefined,
    }));

    return ok(safeRows);
  } catch (e: any) {
    return err(e.message ?? "Gagal mengambil data jadwal");
  }
}

export async function getScheduleById(id: number): Promise<Result<any>> {
  try {
    const r = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        bus: true,
        driver: true,
        coDriver: true,
        sales: true,
      },
    });

    if (!r) return err("Data booking tidak ditemukan");

    const safeRow = {
      ...r,
      priceTotal: r.priceTotal ? Number(r.priceTotal) : 0,
      rentStartAt: r.rentStartAt?.toISOString() ?? null,
      rentEndAt: r.rentEndAt?.toISOString() ?? null,
      pickupAt: r.pickupAt?.toISOString() ?? null,
      createdAt: r.createdAt?.toISOString() ?? null,
      updatedAt: r.updatedAt?.toISOString() ?? null,
      customer: r.customer?.name ?? null,
      bus: r.bus?.name ?? null,
      plateNo: r.bus?.plateNo ?? null,
      driver: r.driver?.fullName ?? null,
      coDriver: r.coDriver?.fullName ?? null,
      sales: r.sales?.fullName ?? null,
    };

    return ok(safeRow);
  } catch (e: any) {
    return err(e.message ?? "Gagal mengambil data booking");
  }
}

// CREATE
export async function createSchedule(input: unknown): Promise<Result<any>> {
  try {
    const parsed = ScheduleCreateSchema.safeParse(input);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const data = parsed.data;

    const created = await prisma.booking.create({
      data: {
        code: `BK-${Date.now()}`, // generate kode unik sederhana
        customerId: data.customerId,
        busId: data.busId,
        pickupAddress: data.pickupAddress,
        destination: data.destination,
        seatsBooked: data.seatsBooked,
        priceTotal: data.priceTotal,
        legrest: data.legrest,
        driverId: data.driverId,
        coDriverId: data.coDriverId,
        salesId: data.salesId,
        rentStartAt: data.rentStartAt,
        rentEndAt: data.rentEndAt,
        pickupAt: data.pickupAt,
        status: data.status,
        notes: data.notes,
      },
      include: {
        customer: true,
        bus: true,
      },
    });

    if (data.dp && data.dp > 0 && data.tanggalDP) {
      await prisma.payment.create({
        data: {
          bookingId: created.id,
          type: "DP",
          amount: data.dp,
          paidAt: new Date(data.tanggalDP),
          notes: `Pembayaran DP untuk booking #${created.id}`,
        },
      });
    }

    if (typeof revalidateMasterSchedules === "function") {
      await revalidateMasterSchedules();
    }

    return ok(created);
  } catch (e: any) {
    return err(e.message ?? "Gagal menambahkan schedule");
  }
}

// UPDATE
export async function updateSchedule(input: unknown): Promise<Result<any>> {
  try {
    const parsed = ScheduleUpdateSchema.safeParse(input);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const data = parsed.data;

    const updated = await prisma.booking.update({
      where: { id: data.id },
      data: {
        customerId: data.customerId,
        busId: data.busId,
        pickupAddress: data.pickupAddress,
        destination: data.destination,
        seatsBooked: data.seatsBooked,
        priceTotal: data.priceTotal,
        legrest: data.legrest,
        driverId: data.driverId,
        coDriverId: data.coDriverId,
        salesId: data.salesId,
        rentStartAt: data.rentStartAt,
        rentEndAt: data.rentEndAt,
        pickupAt: data.pickupAt,
        status: data.status,
        notes: data.notes,
      },
      include: {
        customer: true,
        bus: true,
      },
    });

    if (typeof revalidateMasterSchedules === "function") {
      await revalidateMasterSchedules();
    }

    return ok(updated);
  } catch (e: any) {
    return err(e.message ?? "Gagal memperbarui schedule");
  }
}

export async function updateStatusSchedule(
  id: number,
  status: any
): Promise<Result<any>> {
  try {
    if (!id) return err("ID booking tidak valid");
    if (!status) return err("Status tidak boleh kosong");

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { payments: true, customer: true, bus: true },
    });
    if (!booking) return err("Booking tidak ditemukan");

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
      include: { customer: true, bus: true },
    });

    if (status === "COMPLETED") {
      const finalPaymentExists = booking.payments.some(
        (p) => p.type === "FULL"
      );
      if (!finalPaymentExists) {
        const dpPayment = booking.payments.find((p) => p.type === "DP");
        const dpAmount = dpPayment?.amount ?? 0;
        const finalAmount = booking.priceTotal - dpAmount;

        if (finalAmount > 0) {
          await prisma.payment.create({
            data: {
              bookingId: id,
              type: "FULL",
              amount: finalAmount,
              paidAt: new Date(), // dianggap dibayar penuh saat status LUNAS
              notes: `Pembayaran Final untuk booking #${id}`,
            },
          });
        }
      }
    }

    // Revalidate cache jika ada
    if (typeof revalidateMasterSchedules === "function") {
      await revalidateMasterSchedules();
    }

    return ok(updated);
  } catch (e: any) {
    return err(e.message ?? "Gagal memperbarui status schedule");
  }
}

// DELETE
export async function deleteSchedule(
  id: number
): Promise<Result<{ message: string }>> {
  try {
    await prisma.payment.deleteMany({
      where: { bookingId: id },
    });

    const deletedBooking = await prisma.booking.delete({ where: { id } });

    if (typeof revalidateMasterSchedules === "function") {
      await revalidateMasterSchedules();
    }

    return ok({ message: "Schedule & payment deleted" });
  } catch (e: any) {
    return err(e.message ?? "Gagal menghapus schedule");
  }
}
