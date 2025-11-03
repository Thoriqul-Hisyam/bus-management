import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET — ambil semua data bus
export async function GET() {
  const buses = await prisma.bus.findMany({
    orderBy: { id: "desc" },
  });
  return NextResponse.json(buses);
}

// POST — tambah data bus baru
export async function POST(req: Request) {
  const data = await req.json();
  const newBus = await prisma.bus.create({
    data: {
      name: data.name,
      plateNo: data.plateNo,
      type: data.type,
      capacity: Number(data.capacity),
    },
  });
  return NextResponse.json(newBus);
}

// DELETE — hapus data bus berdasarkan id
export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.bus.delete({ where: { id: Number(id) } });
  return NextResponse.json({ message: "Bus deleted" });
}

// PUT — update data bus
export async function PUT(req: Request) {
  const data = await req.json();
  const updatedBus = await prisma.bus.update({
    where: { id: Number(data.id) },
    data: {
      name: data.name,
      plateNo: data.plateNo,
      type: data.type,
      capacity: Number(data.capacity),
    },
  });
  return NextResponse.json(updatedBus);
}
