"use server";

import { prisma } from "@/lib/prisma";
import {
  CustomerCreateSchema,
  CustomerUpdateSchema,
} from "@/validators/customer";
import { revalidateMasterCustomers } from "./_utils";
import { ok, err, type Result } from "@/lib/result";

export async function listCustomers(input?: {
  q?: string;
  page?: number;
  perPage?: number;
  sort?:
    | "name_asc"
    | "name_desc"
    | "phone_asc"
    | "phone_desc"
    | "travel_asc"
    | "travel_desc";
}): Promise<
  Result<{
    rows: Array<{
      id: number;
      name: string;
      phone: string | null;
      travel: string | null;
    }>;
    total: number;
  }>
> {
  try {
    const q = input?.q?.trim() ?? "";
    const page = Math.max(Number(input?.page ?? 1), 1);
    const perPage = Math.min(Math.max(Number(input?.perPage ?? 10), 1), 100);
    const sort = input?.sort ?? "name_asc";

    // Urutan hasil
    const orderBy:
      | Prisma.Enumerable<Prisma.CustomerOrderByWithRelationInput>
      | undefined =
      sort === "name_asc"
        ? [{ name: "asc" }]
        : sort === "name_desc"
        ? [{ name: "desc" }]
        : sort === "phone_asc"
        ? [{ phone: "asc" }]
        : sort === "phone_desc"
        ? [{ phone: "desc" }]
        : sort === "travel_asc"
        ? [{ travel: "asc" }]
        : [{ travel: "desc" }];

    // Filter pencarian
    const whereAnd: Prisma.CustomerWhereInput[] = [];

    if (q) {
      whereAnd.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { travel: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    const where: Prisma.CustomerWhereInput =
      whereAnd.length > 0 ? { AND: whereAnd } : {};

    // Ambil data dan total
    const [rows, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.customer.count({ where }),
    ]);

    const shaped = rows.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      travel: r.travel,
    }));

    return ok({ rows: shaped, total });
  } catch (e: any) {
    return err(`Gagal mengambil data pelanggan: ${e.message ?? e}`);
  }
}

// CREATE
export async function createCustomer(input: unknown): Promise<Result<any>> {
  try {
    const parsed = CustomerCreateSchema.safeParse(input);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const { name, phone, travel } = parsed.data;
    const created = await prisma.customer.create({
      data: { name, phone, travel },
    });

    await revalidateMasterCustomers();
    return ok(created);
  } catch (e: any) {
    return err(e.message ?? "Gagal menambahkan customer");
  }
}

// UPDATE
export async function updateCustomer(input: unknown): Promise<Result<any>> {
  try {
    const parsed = CustomerUpdateSchema.safeParse(input);
    if (!parsed.success)
      return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

    const { id, name, phone, travel } = parsed.data;
    const updated = await prisma.customer.update({
      where: { id },
      data: { name, phone, travel },
    });

    await revalidateMasterCustomers();
    return ok(updated);
  } catch (e: any) {
    return err(e.message ?? "Gagal memperbarui customer");
  }
}

// DELETE
export async function deleteCustomer(
  id: number
): Promise<Result<{ message: string }>> {
  try {
    await prisma.customer.delete({ where: { id } });
    await revalidateMasterCustomers();
    return ok({ message: "Customer deleted" });
  } catch (e: any) {
    return err(e.message ?? "Gagal menghapus customer");
  }
}
