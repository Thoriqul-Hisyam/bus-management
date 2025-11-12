"use server";

import { prisma } from "@/lib/prisma";
import { ok, err, type Result } from "@/lib/result";
import {
  EmployeeCreateSchema,
  EmployeeUpdateSchema,
  EmployeePasswordChangeSchema,
} from "@/validators/employee";
import { revalidateMasterEmployees } from "./_utils";
import { hash } from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { requirePermission } from "@/lib/guard";

export async function listEmployees(input?: {
  q?: string;
  page?: number;
  perPage?: number;
  sort?: "name_asc" | "name_desc" | "position_asc" | "position_desc";
  status?: "all" | "active" | "inactive";
}): Promise<Result<{ rows: any[]; total: number }>> {
  try {
    const q = input?.q?.trim() ?? "";
    const page = Math.max(Number(input?.page ?? 1), 1);
    const perPage = Math.min(Math.max(Number(input?.perPage ?? 10), 1), 100);
    const sort = input?.sort ?? "name_asc";
    const status = input?.status ?? "all";

    const orderBy =
      sort === "name_asc"
        ? [{ fullName: "asc" as const }]
        : sort === "name_desc"
        ? [{ fullName: "desc" as const }]
        : sort === "position_asc"
        ? [{ position: { name: "asc" as const } }]
        : [{ position: { name: "desc" as const } }];

    const where: Prisma.EmployeeWhereInput = {
      AND: [
        q
          ? {
              OR: [
                { fullName: { contains: q } },
                { phone: { contains: q } },
                { position: { name: { contains: q } } },
                { account: { is: { username: { contains: q } } } },
              ],
            }
          : {},
        status === "active"
          ? { account: { is: { isActive: true } } }
          : status === "inactive"
          ? { account: { is: { isActive: false } } }
          : {},
      ],
    };

    const [rows, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: { position: true, account: true },
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.employee.count({ where }),
    ]);

    const shaped = rows.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      phone: r.phone,
      positionId: r.positionId,
      position: r.position,
      username: r.account?.username ?? null,
      isActive: r.account?.isActive ?? null,
    }));

    return ok({ rows: shaped, total });
  } catch (e: any) {
    return err(e.message ?? "Gagal mengambil data karyawan");
  }
}

export async function createEmployee(input: unknown): Promise<Result<any>> {
  try {
    await requirePermission("master.employees.create");

    const parsed = EmployeeCreateSchema.safeParse(input);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const { fullName, phone, positionId, username, password } = parsed.data;

    const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
    return ok({
      id: created?.id,
      fullName: created?.fullName,
      phone: created?.phone,
      positionId: created?.positionId as number,
      position: created?.position,
      username: created?.account?.username ?? null,
      isActive: created?.account?.isActive ?? null,
    });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return err("Data duplikat (cek username atau field unik lain).");
    }
    return err(e.message ?? "Gagal menambah karyawan");
  }
}

export async function updateEmployee(input: unknown): Promise<Result<any>> {
  try {
    await requirePermission("master.employees.update");

    const parsed = EmployeeUpdateSchema.safeParse(input);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const { id, fullName, phone, positionId, username, password } = parsed.data;

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
    return ok({
      id: updated?.id,
      fullName: updated?.fullName,
      phone: updated?.phone,
      positionId: updated?.positionId as number,
      position: updated?.position,
      username: updated?.account?.username ?? null,
      isActive: updated?.account?.isActive ?? null,
    });
  } catch (e: any) {
    if (e?.code === "P2002") return err("Data duplikat (cek username).");
    return err(e.message ?? "Gagal mengupdate karyawan");
  }
}

export async function deleteEmployee(id: number): Promise<Result<{ message: string }>> {
  try {
    await requirePermission("master.employees.delete");

    const usedCount = await prisma.booking.count({
      where: {
        OR: [{ driverId: id }, { coDriverId: id }, { salesId: id }],
      },
    });
    if (usedCount > 0) {
      return err(
        `Tidak bisa menghapus: karyawan masih dipakai di ${usedCount} booking sebagai driver/co-driver/sales. ` +
          `Re-assign booking terlebih dahulu.`
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.account.deleteMany({ where: { employeeId: id } });
      await tx.employee.delete({ where: { id } });
    });

    await revalidateMasterEmployees();
    return ok({ message: "Employee deleted" });
  } catch (e: any) {
    if (e?.code === "P2003") {
      return err(
        "Gagal menghapus karena masih ada data terkait (foreign key). " +
          "Pastikan tidak ada relasi lain yang masih menunjuk ke karyawan ini."
      );
    }
    return err(e.message ?? "Gagal menghapus karyawan");
  }
}

export async function toggleEmployeeAccountStatus(
  employeeId: number
): Promise<Result<{ isActive: boolean }>> {
  try {
    await requirePermission("master.employees.update");

    const account = await prisma.account.findUnique({ where: { employeeId } });
    if (!account) return err("Karyawan belum memiliki akun.");

    const updated = await prisma.account.update({
      where: { employeeId },
      data: { isActive: !account.isActive },
      select: { isActive: true },
    });

    await revalidateMasterEmployees();
    return ok({ isActive: updated.isActive });
  } catch (e: any) {
    return err(e.message ?? "Gagal mengubah status akun");
  }
}

export async function changeEmployeePassword(
  input: unknown
): Promise<Result<{ message: string }>> {
  try {
    await requirePermission("master.employees.update");

    const parsed = EmployeePasswordChangeSchema.safeParse(input);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const { id, password } = parsed.data;

    const account = await prisma.account.findUnique({ where: { employeeId: id } });
    if (!account) return err("Karyawan belum memiliki akun.");

    await prisma.account.update({
      where: { employeeId: id },
      data: { passwordHash: await hash(password, 10) },
    });

    await revalidateMasterEmployees();
    return ok({ message: "Password diperbarui" });
  } catch (e: any) {
    return err(e.message ?? "Gagal mengubah password akun");
  }
}
