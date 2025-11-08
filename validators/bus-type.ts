import { z } from "zod";

export const BusTypeCreateSchema = z.object({
  name: z.string().min(1, "Nama tipe armada wajib diisi"),
});

export const BusTypeUpdateSchema = BusTypeCreateSchema.extend({
  id: z.coerce.number().int().positive(),
});
