import { z } from "zod";
import { BookingStatus } from "@prisma/client";

export const ScheduleCreateSchema = z.object({
  customerId: z.coerce.number().int().positive(),
  busId: z.coerce.number().int().positive(),
  pickupAddress: z.string().min(1, "Alamat penjemputan wajib diisi"),
  destination: z.string().min(1, "Tujuan wajib diisi"),
  seatsBooked: z.coerce.number().int().positive(),
  priceTotal: z.coerce.number().positive(),
  legrest: z.boolean(),
  driverId: z.coerce.number().int().positive(),
  coDriverId: z.coerce.number().int().positive(),
  salesId: z.coerce.number().int().positive(),
  rentStartAt: z.coerce.date(),
  rentEndAt: z.coerce.date(),
  pickupAt: z.coerce.date().optional(),
  status: z.nativeEnum(BookingStatus),
  notes: z.string().optional(),
  dp: z.number().optional(),
  tanggalDP: z.string().optional(),
});

export const ScheduleUpdateSchema = ScheduleCreateSchema.extend({
  id: z.coerce.number().int().positive(),
});
