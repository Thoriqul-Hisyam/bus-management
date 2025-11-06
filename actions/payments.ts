"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePayments } from "./_utils";
import { ok, err, type Result } from "@/lib/result";

export async function listPayments(): Promise<Result<any[]>> {
  try {
    const rows = await prisma.payment.findMany({
      orderBy: { id: "desc" },
    });
    return ok(rows);
  } catch (e: any) {
    return err(e.message ?? "Gagal mengambil data pelanggan");
  }
}
