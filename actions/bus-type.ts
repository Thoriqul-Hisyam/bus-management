"use server";

import { prisma } from "@/lib/prisma";
import { ok, err, type Result } from "@/lib/result";
import { BusTypeCreateSchema, BusTypeUpdateSchema } from "@/validators/bus-type";
import { revalidateMasterBusTypes } from "./_utils";
import { Prisma } from "@prisma/client";

export async function listBusTypes(): Promise<Result<Array<{ id: number; name: string; createdAt: Date; updatedAt: Date }>>> {
  try {
    const rows = await prisma.busType.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, createdAt: true, updatedAt: true },
    });
    return ok(rows);
  } catch (e: any) {
    return err(`Gagal mengambil jenis armada: ${e.message ?? e}`);
  }
}

export async function createBusType(input: unknown): Promise<Result<any>> {
  try {
    const parsed = BusTypeCreateSchema.safeParse(input);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const created = await prisma.busType.create({
      data: { name: parsed.data.name },
    });
    revalidateMasterBusTypes();
    return ok(created);
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      if ((e.meta?.target as string[])?.includes("name")) {
        return err("Nama jenis armada sudah digunakan.");
      }
    }
    return err(`Gagal menambah jenis armada: ${e.message ?? e}`);
  }
}

export async function updateBusType(input: unknown): Promise<Result<any>> {
  try {
    const parsed = BusTypeUpdateSchema.safeParse(input);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const updated = await prisma.busType.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name },
    });
    revalidateMasterBusTypes();
    return ok(updated);
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      if ((e.meta?.target as string[])?.includes("name")) {
        return err("Nama jenis armada sudah digunakan.");
      }
    }
    return err(`Gagal mengupdate jenis armada: ${e.message ?? e}`);
  }
}

export async function deleteBusType(id: number): Promise<Result<{ message: string }>> {
  try {
    await prisma.busType.delete({ where: { id } });
    revalidateMasterBusTypes();
    return ok({ message: "Jenis armada dihapus" });
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return err("Tidak bisa menghapus: jenis ini masih dipakai oleh data Bus.");
    }
    return err(`Gagal menghapus jenis armada: ${e.message ?? e}`);
  }
}
