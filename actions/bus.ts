"use server";

import { prisma } from "@/lib/prisma";
import { ok, err, type Result } from "@/lib/result";
import { BusCreateSchema, BusUpdateSchema } from "@/validators/bus";
import { revalidateMasterBus } from "./_utils";

export async function listBus(): Promise<Result<any[]>> {
  try {
    const data = await prisma.bus.findMany({ orderBy: { id: "desc" } });
    return ok(data);
  } catch (e: any) {
    return err(`Gagal mengambil data bus: ${e.message ?? e}`);
  }
}

export async function createBus(input: unknown): Promise<Result<any>> {
  try {
    const parsed = BusCreateSchema.safeParse(input);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const { name, plateNo, type, capacity } = parsed.data;

    const created = await prisma.bus.create({
      data: { name, plateNo, type, capacity },
    });

    revalidateMasterBus();
    return ok(created);
  } catch (e: any) {
    if (e instanceof prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      if ((e.meta?.target as string[])?.includes("plateNo")) {
        return err("Nomor polisi sudah digunakan.");
      }
    }
    return err(`Gagal menambah bus: ${e.message ?? e}`);
  }
}

export async function updateBus(input: unknown): Promise<Result<any>> {
  try {
    const parsed = BusUpdateSchema.safeParse(input);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const { id, name, plateNo, type, capacity } = parsed.data;

    const updated = await prisma.bus.update({
      where: { id },
      data: { name, plateNo, type, capacity },
    });

    revalidateMasterBus();
    return ok(updated);
  } catch (e: any) {
    if (e instanceof prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      if ((e.meta?.target as string[])?.includes("plateNo")) {
        return err("Nomor polisi sudah digunakan.");
      }
    }
    return err(`Gagal mengupdate bus: ${e.message ?? e}`);
  }
}

export async function deleteBus(id: number): Promise<Result<{ message: string }>> {
  try {
    await prisma.bus.delete({ where: { id } });
    revalidateMasterBus();
    return ok({ message: "Bus deleted" });
  } catch (e: any) {
    return err(`Gagal menghapus bus: ${e.message ?? e}`);
  }
}
