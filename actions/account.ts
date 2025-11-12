"use server";

import { prisma } from "@/lib/prisma";
import { ok, err, type Result } from "@/lib/result";
import { readSession } from "@/lib/auth";
import { hash } from "bcryptjs";
import { z } from "zod";

const ChangeMyPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Konfirmasi password wajib diisi"),
}).refine((v) => v.newPassword === v.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

export async function changeMyPassword(
  input: unknown
): Promise<Result<{ message: string }>> {
  try {
    const session = await readSession();
    if (!session) return err("Unauthorized");

    const parsed = ChangeMyPasswordSchema.safeParse(input);
    if (!parsed.success) {
      return err(parsed.error.issues[0]?.message ?? "Input tidak valid");
    }

    const { newPassword } = parsed.data;

    const account = await prisma.account.findUnique({ where: { id: session.sub } });
    if (!account) return err("Akun tidak ditemukan");

    await prisma.account.update({
      where: { id: account.id },
      data: { passwordHash: await hash(newPassword, 10) },
    });

    return ok({ message: "Password berhasil diperbarui" });
  } catch (e: any) {
    return err(e?.message ?? "Gagal mengubah password");
  }
}
