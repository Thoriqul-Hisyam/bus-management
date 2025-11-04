"use server";

import { prisma } from "@/lib/prisma";
import { ok, err, type Result } from "@/lib/result";
import { EmployeeCreateSchema, EmployeeUpdateSchema } from "@/validators/employee";
import { revalidateMasterEmployees } from "./_utils";
import { hash } from "bcryptjs";
import type { Prisma } from "@prisma/client"; 

export async function listEmployees(): Promise<Result<any[]>> {
  try {
    const rows = await prisma.employee.findMany({
      include: { position: true, account: true },
      orderBy: { id: "desc" },
    });

    type Row = typeof rows[number];
    const shaped = rows.map((r: Row) => ({
      ...r,
      username: r.account?.username ?? null,
      password: undefined, 
    }));

    return ok(shaped);
  } catch (e: any) {
    return err(e.message ?? "Gagal mengambil data karyawan");
  }
}

export async function createEmployee(input: unknown): Promise<Result<any>> {
  try {
    const parsed = EmployeeCreateSchema.safeParse(input);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const { fullName, phone, positionId, username, password } = parsed.data;

    const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => { // ✅ ketik tx
      const emp = await tx.employee.create({
        data: { fullName, phone, positionId },
      });

      if (username && password) {
        const exists = await tx.account.findFirst({ where: { username } });
        if (exists) throw new Error("Username sudah digunakan.");
        await tx.account.create({
          data: {
            employeeId: emp.id,
            username,
            passwordHash: await hash(password, 10),
            isActive: true,
          },
        });
      }

      return tx.employee.findUnique({
        where: { id: emp.id },
        include: { position: true, account: true },
      });
    });

    await revalidateMasterEmployees();
    return ok({ ...created, username: created?.account?.username ?? null });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return err("Data duplikat (cek username atau field unik lain).");
    }
    return err(e.message ?? "Gagal menambah karyawan");
  }
}

export async function updateEmployee(input: unknown): Promise<Result<any>> {
  try {
    const parsed = EmployeeUpdateSchema.safeParse(input);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const { id, fullName, phone, positionId, username, password } = parsed.data;

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => { // ✅ ketik tx
      await tx.employee.update({
        where: { id },
        data: { fullName, phone, positionId },
      });

      if (username || password) {
        const account = await tx.account.findUnique({ where: { employeeId: id } });

        if (username) {
          const clash = await tx.account.findFirst({
            where: { username, employeeId: { not: id } },
          });
          if (clash) throw new Error("Username sudah digunakan.");
        }

        if (!account) {
          if (username && password) {
            await tx.account.create({
              data: {
                employeeId: id,
                username,
                passwordHash: await hash(password, 10),
                isActive: true,
              },
            });
          }
        } else {
          await tx.account.update({
            where: { employeeId: id },
            data: {
              username: username ?? account.username,
              ...(password ? { passwordHash: await hash(password, 10) } : {}),
            },
          });
        }
      }

      return tx.employee.findUnique({
        where: { id },
        include: { position: true, account: true },
      });
    });

    await revalidateMasterEmployees();
    return ok({ ...updated, username: updated?.account?.username ?? null });
  } catch (e: any) {
    if (e?.code === "P2002") return err("Data duplikat (cek username).");
    return err(e.message ?? "Gagal mengupdate karyawan");
  }
}

export async function deleteEmployee(id: number): Promise<Result<{ message: string }>> {
  try {
    await prisma.employee.delete({ where: { id } });
    await revalidateMasterEmployees();
    return ok({ message: "Employee deleted" });
  } catch (e: any) {
    return err(e.message ?? "Gagal menghapus karyawan");
  }
}
