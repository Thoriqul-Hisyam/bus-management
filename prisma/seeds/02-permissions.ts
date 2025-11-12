// prisma/seeds/02-permissions.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Struktur MENU (hierarki)
 * - Gunakan top-level (flat) untuk: dashboard, schedule.input, trip_sheet, repayment, report.revenue
 * - Master memiliki children
 */
type MenuNode = {
  code: string;
  label: string;
  sort?: number;
  children?: MenuNode[];
};

const MENU_TREE: MenuNode[] = [
  { code: "menu.dashboard", label: "Dashboard", sort: 0 },

  { code: "menu.schedule.input", label: "Input Jadwal", sort: 10 },

  { code: "menu.trip_sheet", label: "Surat Jalan", sort: 20 },

  { code: "menu.repayment", label: "Tagihan Pembayaran", sort: 30 },

  { code: "menu.report.revenue", label: "Laporan Pendapatan", sort: 41 },

  {
    code: "menu.master",
    label: "Master Data",
    sort: 50,
    children: [
      { code: "menu.master.bus",       label: "Armada",      sort: 51 },
      { code: "menu.master.bus_type",  label: "Tipe Armada", sort: 52 },
      { code: "menu.master.employees", label: "Karyawan",    sort: 53 },
      { code: "menu.master.position",  label: "Jabatan",     sort: 54 },
      { code: "menu.master.customers", label: "Customer",    sort: 55 },
    ],
  },
];

/**
 * Daftar permission code (sinkron dengan middleware/guard)
 * - Dashboard: read
 * - schedule.input: CRUD
 * - trip_sheet: read, print, write (write = create+edit)
 * - repayment: read, update_status
 * - report.revenue: read
 * - master.*: CRUD
 */
const ALL_CODES = [
  // Dashboard
  "dashboard.read",

  // Schedule Input (CRUD)
  "schedule.input.read",
  "schedule.input.create",
  "schedule.input.update",
  "schedule.input.delete",

  // Trip Sheet (aksi spesifik)
  "trip_sheet.read",   // (baru) Lihat Surat Jalan
  "trip_sheet.print",  // Cetak Surat Jalan
  "trip_sheet.write",  // Buat/Ubah Surat Jalan (gabungan create + edit)

  // Repayment (flat; rename dari finance.repayment.* → repayment.*)
  "repayment.read",            // Lihat
  "repayment.update_status",   // Ubah Status Tagihan Pembayaran

  // Report Revenue
  "report.revenue.read",       // Lihat

  // Master Bus (CRUD)
  "master.bus.read",
  "master.bus.create",
  "master.bus.update",
  "master.bus.delete",

  // Master Bus Type (CRUD)
  "master.bus_type.read",
  "master.bus_type.create",
  "master.bus_type.update",
  "master.bus_type.delete",

  // Master Customers (CRUD)
  "master.customers.read",
  "master.customers.create",
  "master.customers.update",
  "master.customers.delete",

  // Master Employees (CRUD)
  "master.employees.read",
  "master.employees.create",
  "master.employees.update",
  "master.employees.delete",

  // Master Position (CRUD)
  "master.position.read",
  "master.position.create",
  "master.position.update",
  "master.position.delete",
];

/**
 * Label resource (Indonesia) untuk membentuk label permission
 */
const RESOURCE_LABEL: Record<string, string> = {
  dashboard: "Dashboard",

  "schedule.input": "Input Jadwal",
  trip_sheet: "Surat Jalan",

  // repayment & revenue flat
  repayment: "Tagihan Pembayaran",
  "report.revenue": "Laporan Pendapatan",

  "master.bus": "Armada",
  "master.bus_type": "Tipe Armada",
  "master.customers": "Customer",
  "master.employees": "Karyawan",
  "master.position": "Jabatan",
};

/**
 * Label kata kerja Indonesia per action (termasuk aksi khusus)
 */
const ACTION_LABEL: Record<string, string> = {
  read: "Lihat",
  create: "Tambah",
  update: "Ubah",
  delete: "Hapus",
  print: "Cetak",
  write: "Buat/Ubah",
  update_status: "Ubah Status",
};

/**
 * Pemetaan permission → menu code
 * - repayment.* → menu.repayment (flat)
 * - report.revenue.* → menu.report.revenue (flat)
 * - trip_sheet.* → menu.trip_sheet (flat)
 * - schedule.input.* → menu.schedule.input (flat)
 * - master.* → sesuai child di menu.master
 */
function menuCodeForPermission(code: string): string {
  // master.*
  if (code.startsWith("master.bus.")) return "menu.master.bus";
  if (code.startsWith("master.bus_type.")) return "menu.master.bus_type";
  if (code.startsWith("master.customers.")) return "menu.master.customers";
  if (code.startsWith("master.employees.")) return "menu.master.employees";
  if (code.startsWith("master.position.")) return "menu.master.position";

  // schedule / trip_sheet
  if (code.startsWith("schedule.input.")) return "menu.schedule.input";
  if (code.startsWith("trip_sheet.")) return "menu.trip_sheet";

  // repayment (flat) — sudah bukan finance.repayment.*
  if (code.startsWith("repayment.")) return "menu.repayment";

  // report.revenue (flat)
  if (code.startsWith("report.revenue.")) return "menu.report.revenue";

  // dashboard
  if (code === "dashboard.read") return "menu.dashboard";

  // fallback
  return "menu.dashboard";
}

/* ========================= Helpers ========================= */

function toTitle(s: string) {
  return s
    .replace(/[_\-\.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function labelIdFromCode(code: string): string {
  const parts = code.split(".");
  const action = parts.pop()!; // last segment = action
  const actionLabel = ACTION_LABEL[action] ?? toTitle(action);
  const resourceKey = parts.join(".");
  const resourceLabel = RESOURCE_LABEL[resourceKey] ?? toTitle(resourceKey);
  return `${actionLabel} ${resourceLabel}`.trim();
}

/** Buat/Update menu secara rekursif */
async function upsertMenuTree(nodes: MenuNode[], parentId?: number) {
  for (const node of nodes) {
    const menu = await prisma.permissionMenu.upsert({
      where: { code: node.code },
      update: { label: node.label, sort: node.sort ?? 0, parentId },
      create: { code: node.code, label: node.label, sort: node.sort ?? 0, parentId },
    });
    if (node.children?.length) {
      await upsertMenuTree(node.children, menu.id);
    }
  }
}

/** Upsert permission & link ke menu */
async function upsertPermissionWithMenu(code: string) {
  const label = labelIdFromCode(code);
  const menuCode = menuCodeForPermission(code);
  const menu = await prisma.permissionMenu.findUnique({ where: { code: menuCode } });

  return prisma.permission.upsert({
    where: { code },
    update: { label, menuId: menu?.id ?? null },
    create: { code, label, menuId: menu?.id ?? null },
  });
}

/** Cari Position by name secara "case-insensitive" (best-effort MySQL) */
async function findPositionByNameCI(name: string) {
  let pos = await prisma.position.findFirst({ where: { name: { equals: name } } });
  if (!pos) pos = await prisma.position.findFirst({ where: { name: { equals: name.toLowerCase() } } });
  if (!pos) pos = await prisma.position.findFirst({ where: { name: { equals: name.toUpperCase() } } });
  return pos;
}

/** Pastikan posisi baseline ada */
async function ensurePositions(names: string[]) {
  for (const name of names) {
    const existing = await findPositionByNameCI(name);
    if (!existing) {
      await prisma.position.create({ data: { name } });
      console.log(`➕ Created Position: ${name}`);
    } else {
      console.log(`✓ Position already exists: ${existing.name}`);
    }
  }
}

/** Bersihkan parent lama yang tidak terpakai (opsional & aman) */
async function cleanupObsoleteParents() {
  const codes = ["menu.finance", "menu.report", "menu.schedule"];
  for (const code of codes) {
    const node = await prisma.permissionMenu.findUnique({ where: { code } });
    if (!node) continue;
    const usedByPerm = await prisma.permission.count({ where: { menuId: node.id } });
    const hasChildren = await prisma.permissionMenu.count({ where: { parentId: node.id } });
    if (usedByPerm === 0 && hasChildren === 0) {
      await prisma.permissionMenu.delete({ where: { id: node.id } });
      console.log(`🧹 Removed dangling ${code}`);
    } else {
      console.log(`ℹ️ ${code} still referenced; not deleted.`);
    }
  }
}

/** Grant semua permission ke Superadmin SAJA */
async function grantAllToSuperadmin() {
  const superadmin = await findPositionByNameCI("Superadmin");

  if (!superadmin) {
    console.warn("⚠️  Position 'Superadmin' tidak ditemukan. Grant all di-skip.");
    return;
  }

  const allPerms = await prisma.permission.findMany();
  for (const p of allPerms) {
    await prisma.positionPermission.upsert({
      where: { positionId_permissionId: { positionId: superadmin.id, permissionId: p.id } },
      update: {},
      create: { positionId: superadmin.id, permissionId: p.id },
    });
  }
  console.log(`✅ Grant ALL permissions → ${superadmin.name}`);
}

/* ========================= Entry ========================= */
export async function main() {
  // 0) ensure baseline positions
  await ensurePositions(["Superadmin", "Driver", "Co-Driver", "Sales", "Finance", "Manager"]);

  // 1) build menu hierarchy (flat utk repayment & report.revenue)
  await upsertMenuTree(MENU_TREE);
  console.log("✅ Menu tree upserted.");

  // 1b) optional cleanup parent lama jika ada
  await cleanupObsoleteParents();

  // 2) upsert permissions + link ke menu
  for (const code of ALL_CODES) {
    await upsertPermissionWithMenu(code);
  }
  console.log(`✅ Upsert ${ALL_CODES.length} permissions + linked to menus.`);

  // 3) grant ALL only to Superadmin
  await grantAllToSuperadmin();

  console.log("✅ Seeder permissions + menus selesai.");
}

// allow direct run: npm run seed:permissions
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
