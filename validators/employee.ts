import { z } from "zod";

export const EmployeeCreateSchema = z.object({
  fullName: z.string().min(1, "Nama wajib diisi"),
  phone: z.string().optional().or(z.literal("")).transform(v => v || undefined),
  positionId: z.coerce.number().int().positive(),
  // optional login (Account)
  username: z.string().min(3).optional().or(z.literal("")).transform(v => v || undefined),
  password: z.string().min(6).optional().or(z.literal("")).transform(v => v || undefined),
});

export const EmployeeUpdateSchema = EmployeeCreateSchema.extend({
  id: z.coerce.number().int().positive(),
});
