"use server";

import { prisma } from "@/lib/prisma";
import { ok, err, type Result } from "@/lib/result";
import { BusCreateSchema, BusUpdateSchema } from "@/validators/bus";
import { revalidateMasterBus } from "./_utils";
import { Prisma } from "@prisma/client";

export async function listBus(input?: {
  q?: string;
  page?: number;
  perPage?: number;
  sort?:
    | "name_asc"
    | "name_desc"
    | "plate_asc"
    | "plate_desc"
    | "type_asc"
    | "type_desc"
    | "capacity_asc"
    | "capacity_desc";
  busTypeId?: number;
}): Promise<
  Result<{
    rows: Array<{
      id: number;
      name: string;
      plateNo: string;
      capacity: number;
      busTypeId: number;
      busType: { id: number; name: string } | null;
    }>;
    total: number;
  }>
> {
  try {
    const q = input?.q?.trim() ?? "";
    const page = Math.max(Number(input?.page ?? 1), 1);
    const perPage = Math.min(Math.max(Number(input?.perPage ?? 10), 1), 100);
    const sort =
      input?.sort ??
      ("name_asc" as NonNullable<typeof input>["sort"]);
    const busTypeId = input?.busTypeId;

    const orderBy:
      | Prisma.Enumerable<Prisma.BusOrderByWithRelationInput>
      | undefined =
      sort === "name_asc"
        ? [{ name: "asc" }]
        : sort === "name_desc"
        ? [{ name: "desc" }]
        : sort === "plate_asc"
        ? [{ plateNo: "asc" }]
        : sort === "plate_desc"
        ? [{ plateNo: "desc" }]
        : sort === "type_asc"
        ? [{ busType: { name: "asc" } }]
        : sort === "type_desc"
        ? [{ busType: { name: "desc" } }]
        : sort === "capacity_asc"
        ? [{ capacity: "asc" }]
        : [{ capacity: "desc" }];

    const whereAnd: Prisma.BusWhereInput[] = [];

    if (q) {
      whereAnd.push({
        OR: [
          { name: { contains: q } },
          { plateNo: { contains: q } },
          { busType: { name: { contains: q } } },
        ],
      });
    }

    if (typeof busTypeId === "number" && Number.isFinite(busTypeId)) {
      whereAnd.push({ busTypeId });
    }

    const where: Prisma.BusWhereInput =
      whereAnd.length > 0 ? { AND: whereAnd } : {};

    const [rows, total] = await Promise.all([
      prisma.bus.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
        include: { busType: { select: { id: true, name: true } } },
      }),
      prisma.bus.count({ where }),
    ]);

    const shaped = rows.map((r) => ({
      id: r.id,
      name: r.name,
      plateNo: r.plateNo,
      capacity: r.capacity,
      busTypeId: r.busTypeId,
      busType: r.busType,
    }));

    return ok({ rows: shaped, total });
  } catch (e: any) {
    return err(`Gagal mengambil data bus: ${e.message ?? e}`);
  }
}

export async function createBus(input: unknown): Promise<Result<any>> {
  try {
    const parsed = BusCreateSchema.safeParse(input);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const { name, plateNo, capacity, busTypeId } = parsed.data;

    const created = await prisma.bus.create({
      data: { name, plateNo, capacity, busTypeId },
      include: { busType: true },
    });

    revalidateMasterBus();
    return ok(created);
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
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
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const { id, name, plateNo, capacity, busTypeId } = parsed.data;

    const updated = await prisma.bus.update({
      where: { id },
      data: { name, plateNo, capacity, busTypeId },
      include: { busType: true },
    });

    revalidateMasterBus();
    return ok(updated);
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      if ((e.meta?.target as string[])?.includes("plateNo")) {
        return err("Nomor polisi sudah digunakan.");
      }
    }
    return err(`Gagal mengupdate bus: ${e.message ?? e}`);
  }
}

export async function deleteBus(
  id: number
): Promise<Result<{ message: string }>> {
  try {
    await prisma.bus.delete({ where: { id } });
    revalidateMasterBus();
    return ok({ message: "Bus deleted" });
  } catch (e: any) {
    return err(`Gagal menghapus bus: ${e.message ?? e}`);
  }
}

export async function listBusTypes(): Promise<Result<Array<{ id: number; name: string }>>> {
  try {
    const rows = await prisma.busType.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return ok(rows);
  } catch (e: any) {
    return err(`Gagal mengambil jenis armada: ${e.message ?? e}`);
  }
}
