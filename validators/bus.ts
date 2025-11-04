import { z } from "zod";

export const BusTypeSchema = z.enum([
  "EKONOMI",
  "BISNIS",
  "VIP",
  "EKSEKUTIF",
  "SUPER_EKSEKUTIF",
]);

export const BusCreateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  plateNo: z.string().min(1, "Nomor polisi wajib diisi"),
  type: BusTypeSchema,
  capacity: z.coerce.number().int().min(0),
});

export const BusUpdateSchema = BusCreateSchema.extend({
  id: z.coerce.number().int().positive(),
});
