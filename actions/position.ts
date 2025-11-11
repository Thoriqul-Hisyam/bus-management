"use server";

import { prisma } from "@/lib/prisma";
import { revalidateMasterPositions } from "./_utils";
import { ok, err, type Result } from "@/lib/result";
import { PositionCreateSchema, PositionUpdateSchema } from "@/validators/position";

const LOCKED_NAMES = new Set(["superadmin", "co-driver", "driver", "sales"]);

function toKeyName(s: string) {
  return s.trim().toLowerCase();
}

function isLockedName(name: string) {
  return LOCKED_NAMES.has(toKeyName(name));
}

function isSuperadmin(name: string) {
  return toKeyName(name) === "superadmin";
}

export async function listPositions(input?: {
  q?: string;
  page?: number;
  perPage?: number;
  sort?: "name_asc" | "name_desc" | "id_asc" | "id_desc";
}): Promise<{ rows: Array<{ id: number; name: string }>; total: number }> {
  const q = input?.q?.trim() ?? "";
  const page = Math.max(Number(input?.page ?? 1), 1);
  const perPage = Math.min(Math.max(Number(input?.perPage ?? 10), 1), 100);
  const sort = input?.sort ?? "name_asc";

  const orderBy =
    sort === "name_asc" ? [{ name: "asc" as const }] :
    sort === "name_desc" ? [{ name: "desc" as const }] :
    sort === "id_asc" ? [{ id: "asc" as const }] :
    [{ id: "desc" as const }];

  const where = q ? { name: { contains: q } } : {};

  const [rows, total] = await Promise.all([
    prisma.position.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      select: { id: true, name: true },
    }),
    prisma.position.count({ where }),
  ]);

  return { rows, total };
}

export async function listAllPositions(): Promise<Array<{ id: number; name: string }>> {
  return prisma.position.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getPositionDetail(
  id: number
): Promise<Result<{ id: number; name: string; permissionIds: number[] }>> {
  try {
    const pos = await prisma.position.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        permissions: { select: { permissionId: true } },
      },
    });
    if (!pos) return err("Data tidak ditemukan");
    return ok({
      id: pos.id,
      name: pos.name,
      permissionIds: pos.permissions.map((p) => p.permissionId),
    });
  } catch (e: any) {
    return err(e.message ?? "Gagal mengambil detail");
  }
}

export async function createPosition(input: unknown): Promise<Result<any>> {
  try {
    const { name, permissionIds } = PositionCreateSchema.parse(input);

    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.position.create({ data: { name } });
      if (permissionIds && permissionIds.length > 0) {
        await tx.positionPermission.createMany({
          data: permissionIds.map((pid) => ({
            positionId: created.id,
            permissionId: pid,
          })),
          skipDuplicates: true,
        });
      }
      return created;
    });

    await revalidateMasterPositions();
    return ok(result);
  } catch (e: any) {
    return err(e.message ?? "Gagal menambah posisi");
  }
}

export async function updatePosition(input: unknown): Promise<Result<any>> {
  try {
    const { id, name, permissionIds } = PositionUpdateSchema.parse(input);

    const current = await prisma.position.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!current) return err("Data tidak ditemukan");

    if (isSuperadmin(current.name)) {
      return err("Jabatan Superadmin tidak dapat diubah.");
    }

    if (isLockedName(current.name) && toKeyName(current.name) !== toKeyName(name)) {
      return err(`Nama jabatan "${current.name}" tidak boleh diubah.`);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.position.update({ where: { id }, data: { name } });

      await tx.positionPermission.deleteMany({ where: { positionId: id } });

      if (permissionIds && permissionIds.length > 0) {
        await tx.positionPermission.createMany({
          data: permissionIds.map((pid) => ({
            positionId: id,
            permissionId: pid,
          })),
          skipDuplicates: true,
        });
      }
      return updated;
    });

    await revalidateMasterPositions();
    return ok(result);
  } catch (e: any) {
    return err(e.message ?? "Gagal mengupdate posisi");
  }
}

export async function deletePosition(
  id: number
): Promise<Result<{ message: string }>> {
  try {
    const current = await prisma.position.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!current) return err("Data tidak ditemukan");

    if (isLockedName(current.name)) {
      return err(`Jabatan "${current.name}" tidak boleh dihapus.`);
    }

    const inUse = await prisma.employee.count({ where: { positionId: id } });
    if (inUse > 0) {
      return err(
        `Tidak bisa menghapus: posisi dipakai oleh ${inUse} karyawan. Reassign terlebih dahulu.`
      );
    }

    await prisma.position.delete({ where: { id } });
    await revalidateMasterPositions();
    return ok({ message: "Position deleted" });
  } catch (e: any) {
    return err(e.message ?? "Gagal menghapus posisi");
  }
}
