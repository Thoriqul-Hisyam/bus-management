"use server";

import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { signSession, clearSession } from "@/lib/auth";

export async function login(input: unknown): Promise<{ redirect: string }> {
  const body = input as { username?: string; password?: string };
  if (!body?.username || !body?.password) throw new Error("Username dan password wajib diisi.");

  const account = await prisma.account.findFirst({
    where: { username: body.username },
    include: {
      employee: {
        include: {
          position: {
            include: { permissions: { include: { permission: true } } },
          },
        },
      },
    },
  });

  if (!account) throw new Error("Akun tidak ditemukan.");
  if (!account.isActive) throw new Error("Akun dinonaktifkan.");

  const valid = await compare(body.password, account.passwordHash);
  if (!valid) throw new Error("Username atau password salah.");

  const pos = account.employee?.position ?? null;
  const perms = new Set<string>();
  pos?.permissions.forEach(pp => perms.add(pp.permission.code));

  await prisma.account.update({
    where: { id: account.id },
    data: { lastLoginAt: new Date() },
  });

  await signSession({
    sub: account.id,
    empId: account.employeeId,
    name: account.employee?.fullName || account.username,
    positionName: pos?.name ?? null,
    perms: Array.from(perms),
  });

  return { redirect: "/" };
}

export async function logout(): Promise<void> {
  await clearSession();
}
