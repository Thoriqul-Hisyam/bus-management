"use server";

import { prisma } from "@/lib/prisma";
import { ok, err, type Result } from "@/lib/result";
import { BusTypeCreateSchema, BusTypeUpdateSchema } from "@/validators/bus-type";
import { revalidateMasterBusTypes } from "./_utils";
import { Prisma } from "@prisma/client";

export async function listBusTypes(input?: {
  q?: string;
  page?: number;
  perPage?: number;
  sort?: "name_asc" | "name_desc" | "id_asc" | "id_desc";
}): Promise<Result<{ rows: Array<{ id: number; name: string }>; total: number }>> {
  try {
    const q = input?.q?.trim() ?? "";
    const page = Math.max(Number(input?.page ?? 1), 1);
    const perPage = Math.min(Math.max(Number(input?.perPage ?? 10), 1), 100);
    const sort = input?.sort ?? "name_asc";

    const orderBy =
      sort === "name_asc" ? [{ name: "asc" as const }] :
      sort === "name_desc" ? [{ name: "desc" as const }] :
      sort === "id_asc" ? [{ id: "asc" as const }] :
      [{ id: "desc" as const }];

    const where: Prisma.BusTypeWhereInput = q
      ? { name: { contains: q } }
      : {};

    const [rows, total] = await Promise.all([
      prisma.busType.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
        select: { id: true, name: true },
      }),
      prisma.busType.count({ where }),
    ]);

    return ok({ rows, total });
  } catch (e: any) {
    return err(`Gagal mengambil tipe armada: ${e.message ?? e}`);
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
        return err("Nama tipe armada sudah digunakan.");
      }
    }
    return err(`Gagal menambah tipe armada: ${e.message ?? e}`);
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
        return err("Nama tipe armada sudah digunakan.");
      }
    }
    return err(`Gagal mengupdate tipe armada: ${e.message ?? e}`);
  }
}

export async function deleteBusType(id: number): Promise<Result<{ message: string }>> {
  try {
    await prisma.busType.delete({ where: { id } });
    revalidateMasterBusTypes();
    return ok({ message: "Tipe armada dihapus" });
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return err("Tidak bisa menghapus: jenis ini masih dipakai oleh data Bus.");
    }
    return err(`Gagal menghapus tipe armada: ${e.message ?? e}`);
  }
}
