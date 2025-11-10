import { z } from "zod";

export const BaseFormSchema = z.object({
  fullName: z.string().min(1, "Nama wajib diisi"),
  positionId: z.coerce.number().int().positive({ message: "Jabatan wajib dipilih" }),
  phone: z.string().optional().or(z.literal("")).transform((v) => v || undefined),
  username: z
    .string()
    .min(3, "Min 3 karakter")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  password: z
    .string()
    .min(6, "Min 6 karakter")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
});

export const CreateFormSchema = BaseFormSchema.superRefine((d, ctx) => {
  const bothEmpty = !d.username && !d.password;
  const bothFilled = !!d.username && !!d.password;
  if (!(bothEmpty || bothFilled)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["username"],
      message: "Isi username dan password bersamaan untuk membuat akun.",
    });
  }
});

export function buildUpdateFormSchema(hasAccount: boolean) {
  if (!hasAccount) return CreateFormSchema;
  return BaseFormSchema;
}

export const PasswordSchema = z.object({
  password: z.string().min(6, "Min 6 karakter"),
});

export type CreateForm = z.infer<typeof CreateFormSchema>;
export type UpdateForm = z.infer<ReturnType<typeof buildUpdateFormSchema>>;
export type PasswordForm = z.infer<typeof PasswordSchema>;
