import { z } from "zod";

export const CustomerCreateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.trim().length ? v : undefined)),
  travel: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.trim().length ? v : undefined)),
});

export const CustomerUpdateSchema = CustomerCreateSchema.extend({
  id: z.coerce.number().int().positive(),
});
