// actions/position.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidateMasterPositions } from "./_utils";
import { ok, err, type Result } from "@/lib/result";
import {
  PositionCreateSchema,
  PositionUpdateSchema,
} from "@/validators/position";

export async function listPositions(input?: {
  q?: string;
  page?: number;
  perPage?: number;
  sort?: "name_asc" | "name_desc" | "id_asc" | "id_desc";
}): Promise<{ rows: { id: number; name: string }[]; total: number }> {
  const q = input?.q?.trim() ?? "";
  const page = Math.max(Number(input?.page ?? 1), 1);
  const perPage = Math.min(Math.max(Number(input?.perPage ?? 10), 1), 100);
  const sort = input?.sort ?? "id_desc";

  const orderBy =
    sort === "name_asc"
      ? { name: "asc" as const }
      : sort === "name_desc"
      ? { name: "desc" as const }
      : sort === "id_asc"
      ? { id: "asc" as const }
      : { id: "desc" as const };

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


export async function createPosition(input: unknown): Promise<Result<any>> {
  try {
    const { name } = PositionCreateSchema.parse(input);
    const row = await prisma.position.create({ data: { name } });
    await revalidateMasterPositions();
    return ok(row);
  } catch (e: any) {
    return err(e.message ?? "Gagal menambah posisi");
  }
}

export async function updatePosition(input: unknown): Promise<Result<any>> {
  try {
    const { id, name } = PositionUpdateSchema.parse(input);
    const row = await prisma.position.update({ where: { id }, data: { name } });
    await revalidateMasterPositions();
    return ok(row);
  } catch (e: any) {
    return err(e.message ?? "Gagal mengupdate posisi");
  }
}

export async function deletePosition(
  id: number
): Promise<Result<{ message: string }>> {
  try {
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
