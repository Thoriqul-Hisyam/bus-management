"use server";

import { prisma } from "@/lib/prisma";
import { CustomerCreateSchema, CustomerUpdateSchema } from "@/validators/customer";
import { revalidateMasterCustomers } from "./_utils";
import { ok, err, type Result } from "@/lib/result";

export async function listCustomers(): Promise<Result<any[]>> {
  try {
    const rows = await prisma.customer.findMany({
      orderBy: { id: "desc" },
    });
    return ok(rows);
  } catch (e: any) {
    return err(e.message ?? "Gagal mengambil data pelanggan");
  }
}

// CREATE
export async function createCustomer(input: unknown): Promise<Result<any>> {
  try {
    const parsed = CustomerCreateSchema.safeParse(input);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

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
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Input tidak valid");

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
export async function deleteCustomer(id: number): Promise<Result<{ message: string }>> {
  try {
    await prisma.customer.delete({ where: { id } });
    await revalidateMasterCustomers();
    return ok({ message: "Customer deleted" });
  } catch (e: any) {
    return err(e.message ?? "Gagal menghapus customer");
  }
}
