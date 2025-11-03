import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔹 GET — ambil semua karyawan + posisi
export async function GET() {
  const employees = await prisma.employee.findMany({
    include: { position: true },
    orderBy: { id: "desc" },
  });
  return NextResponse.json(employees);
}

// 🔹 POST — tambah karyawan baru
export async function POST(req: Request) {
  const data = await req.json();
  const newEmp = await prisma.employee.create({
    data: {
      fullName: data.fullName,
      phone: data.phone,
      //   username: data.username,
      //   password: data.password,
      positionId: Number(data.positionId),
    },
    include: { position: true },
  });
  return NextResponse.json(newEmp);
}

// 🔹 PUT — update data karyawan
export async function PUT(req: Request) {
  const data = await req.json();

  const updatedEmp = await prisma.employee.update({
    where: { id: Number(data.id) },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      //   username: data.username,
      //   password: data.password,
      positionId: Number(data.positionId),
    },
    include: { position: true },
  });

  return NextResponse.json(updatedEmp);
}

// 🔹 DELETE — hapus karyawan
export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.employee.delete({ where: { id: Number(id) } });
  return NextResponse.json({ message: "Employee deleted" });
}
