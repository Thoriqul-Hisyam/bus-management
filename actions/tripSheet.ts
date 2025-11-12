"use server";

import { prisma } from "@/lib/prisma";
import { ok, err, type Result } from "@/lib/result";
import { revalidateTripSheet } from "./_utils";
import { requirePermission } from "@/lib/guard";

export async function createTripSheet(input: any): Promise<Result<any>> {
  try {
    await requirePermission("trip_sheet.write");

    if (!input.bookId) return err("Booking ID tidak valid");

    const tripSheet = await prisma.tripSheet.upsert({
      where: { bookingId: input.bookId },
      update: {
        description: input.note ?? "",
        sangu: input.sangu ?? 0,
        premiDriver: input.premiDriver ?? 0,
        premiCoDriver: input.premiCoDriver ?? 0,
        umDriver: input.umDriver ?? 0,
        umCoDriver: input.umCoDriver ?? 0,
        bbm: input.bbm ?? 0,
        total: input.total ?? 0,
      },
      create: {
        bookingId: input.bookId,
        description: input.note ?? "",
        sangu: input.sangu ?? 0,
        premiDriver: input.premiDriver ?? 0,
        premiCoDriver: input.premiCoDriver ?? 0,
        umDriver: input.umDriver ?? 0,
        umCoDriver: input.umCoDriver ?? 0,
        bbm: input.bbm ?? 0,
        total: input.total ?? 0,
      },
    });

    if (typeof revalidateTripSheet === "function") {
      await revalidateTripSheet();
    }

    return ok(tripSheet);
  } catch (e: any) {
    return err(e?.message ?? "Gagal membuat trip sheet");
  }
}
