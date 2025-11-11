import { z } from "zod";

export const PositionCreateSchema = z.object({
  name: z.string().min(1, "Nama posisi wajib diisi"),
  permissionIds: z.array(z.number().int().positive()).optional().default([]),
});

export const PositionUpdateSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().min(1, "Nama posisi wajib diisi"),
  permissionIds: z.array(z.number().int().positive()).optional().default([]),
});
