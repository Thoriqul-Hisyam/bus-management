// prisma/seeds/01-roles-accounts.ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

export async function main() {
  const roles = [
    { name: "superadmin", username: "superadmin", fullName: "Super Admin" },
    { name: "manager",    username: "manager",    fullName: "Manager" },
    { name: "finance",    username: "finance",    fullName: "Finance" },
    { name: "admin",      username: "admin",      fullName: "Admin Armada" },
  ];

  for (const r of roles) {
    const position = await prisma.position.upsert({
      where: { name: r.name },
      update: {},
      create: { name: r.name },
    });

    let employee = await prisma.employee.findFirst({
      where: { fullName: r.fullName, positionId: position.id },
    });

    if (!employee) {
      employee = await prisma.employee.create({
        data: { fullName: r.fullName, positionId: position.id, phone: "123" },
      });
    }

    const passwordHash = await hash("123456", 10);
    await prisma.account.upsert({
      where: { username: r.username },
      update: { employeeId: employee.id, passwordHash, isActive: true },
      create: { employeeId: employee.id, username: r.username, passwordHash, isActive: true },
    });
  }

  console.log("✅ Seeder akun & position selesai");
  console.log("   superadmin / 123456");
  console.log("   manager    / 123456");
  console.log("   finance    / 123456");
  console.log("   admin      / 123456");
}
