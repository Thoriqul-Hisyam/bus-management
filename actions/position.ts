"use server";

import { prisma } from "@/lib/prisma";
import { revalidateMasterPositions } from "./_utils";
import { ok, err, type Result } from "@/lib/result";
import { PositionCreateSchema, PositionUpdateSchema } from "@/validators/position";

// LIST
export async function listPositions(): Promise<any[]> {
  return prisma.position.findMany({ orderBy: { id: "desc" } });
}

// CREATE
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

// UPDATE
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

// DELETE
export async function deletePosition(id: number): Promise<Result<{ message: string }>> {
  try {
    const inUse = await prisma.employee.count({ where: { positionId: id } });
    if (inUse > 0) {
      return err(`Tidak bisa menghapus: posisi dipakai oleh ${inUse} karyawan. Reassign terlebih dahulu.`);
    }

    await prisma.position.delete({ where: { id } });
    await revalidateMasterPositions();
    return ok({ message: "Position deleted" });
  } catch (e: any) {
    return err(e.message ?? "Gagal menghapus posisi");
  }
}
