import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: "superadmin", username: "superadmin", fullName: "Super Admin" },
    { name: "manager",    username: "manager",    fullName: "Manager" },
    { name: "finance",    username: "finance",    fullName: "Finance" },
    { name: "admin",      username: "admin",      fullName: "Admin Armada" },
  ];

  for (const r of roles) {
    // 1) Position (unik by name) → aman pakai upsert
    const position = await prisma.position.upsert({
      where: { name: r.name },
      update: {},
      create: { name: r.name },
    });

    // 2) Employee (TIDAK unik by fullName) → cari dulu, kalau tidak ada baru create
    let employee = await prisma.employee.findFirst({
      where: { fullName: r.fullName, positionId: position.id },
    });

    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          fullName: r.fullName,
          positionId: position.id,
          phone: null,
        },
      });
    }

    // 3) Account (unik by username) → aman pakai upsert
    const passwordHash = await hash("123456", 10);
    await prisma.account.upsert({
      where: { username: r.username },
      update: {
        employeeId: employee.id,
        passwordHash,
        isActive: true,
      },
      create: {
        employeeId: employee.id,
        username: r.username,
        passwordHash,
        isActive: true,
      },
    });
  }

  console.log("✅ Seeder selesai: akun per role sudah dibuat!");
  console.log("   Login credentials:");
  console.log("   superadmin / 123456");
  console.log("   manager    / 123456");
  console.log("   finance    / 123456");
  console.log("   admin      / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
