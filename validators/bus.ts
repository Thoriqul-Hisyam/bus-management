import { z } from "zod";

export const BusCreateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  plateNo: z.string().min(1, "Nomor polisi wajib diisi"),
  busTypeId: z.coerce.number().int().positive("Tipe armada wajib dipilih"),
  capacity: z.coerce.number().int().min(0),
});

export const BusUpdateSchema = BusCreateSchema.extend({
  id: z.coerce.number().int().positive(),
});
