import { z } from "zod";

const EmployeeBaseSchema = z.object({
  fullName: z.string().min(1, "Nama wajib diisi"),
  phone: z.string().optional().or(z.literal("")).transform((v) => v || undefined),
  positionId: z.coerce.number().int().positive(),
  username: z.string().min(3).optional().or(z.literal("")).transform((v) => v || undefined),
  password: z.string().min(6).optional().or(z.literal("")).transform((v) => v || undefined),
});

const pairRefine = (d: z.infer<typeof EmployeeBaseSchema>, ctx: z.RefinementCtx) => {
  const bothEmpty = !d.username && !d.password;
  const bothFilled = !!d.username && !!d.password;
  if (!(bothEmpty || bothFilled)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["username"],
      message: "Isi username dan password bersamaan untuk membuat akun.",
    });
  }
};

export const EmployeeCreateSchema = EmployeeBaseSchema.superRefine(pairRefine);

export const EmployeeUpdateSchema = EmployeeBaseSchema
  .safeExtend({
    id: z.coerce.number().int().positive(),
  })
  .superRefine(pairRefine);

export const EmployeePasswordChangeSchema = z.object({
  id: z.coerce.number().int().positive(),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
