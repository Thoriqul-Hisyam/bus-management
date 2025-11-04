import { z } from "zod";

export const PositionCreateSchema = z.object({
  name: z.string().min(1, "Nama posisi wajib diisi"),
});

export const PositionUpdateSchema = PositionCreateSchema.extend({
  id: z.coerce.number().int().positive(),
});
