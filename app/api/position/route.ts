import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔹 GET — ambil semua posisi
export async function GET() {
  const positions = await prisma.position.findMany({
    orderBy: { id: "desc" },
  });
  return NextResponse.json(positions);
}

// 🔹 POST — tambah posisi baru
export async function POST(req: Request) {
  const data = await req.json();
  const newPos = await prisma.position.create({
    data: { name: data.name },
  });
  return NextResponse.json(newPos);
}

// 🔹 PUT — update posisi
export async function PUT(req: Request) {
  const data = await req.json();
  const updated = await prisma.position.update({
    where: { id: Number(data.id) },
    data: { name: data.name },
  });
  return NextResponse.json(updated);
}

// 🔹 DELETE — hapus posisi
export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.position.delete({ where: { id: Number(id) } });
  return NextResponse.json({ message: "Position deleted" });
}
