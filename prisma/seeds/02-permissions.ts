// prisma/seeds/02-permissions.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * 1) Definisikan struktur MENU (hierarki)
 *    code = unik, label = tampil ke user (Indonesia), sort = urutan
 */
type MenuNode = {
  code: string;
  label: string;
  sort?: number;
  children?: MenuNode[];
};

const MENU_TREE: MenuNode[] = [
  { code: "menu.dashboard", label: "Dashboard", sort: 0 },

  {
    code: "menu.schedule",
    label: "Input Jadwal",
    sort: 10,
    children: [{ code: "menu.schedule.input", label: "Input Jadwal", sort: 11 }],
  },

  { code: "menu.trip_sheet", label: "Surat Jalan", sort: 20 },

  {
    code: "menu.finance",
    label: "Tagihan Pembayaran",
    sort: 30,
    children: [{ code: "menu.finance.repayment", label: "Tagihan Pembayaran", sort: 31 }],
  },

  {
    code: "menu.report",
    label: "Laporan",
    sort: 40,
    children: [{ code: "menu.report.revenue", label: "Laporan Pendapatan", sort: 41 }],
  },

  {
    code: "menu.master",
    label: "Master Data",
    sort: 50,
    children: [
      { code: "menu.master.bus",       label: "Armada",       sort: 51 },
      { code: "menu.master.bus_type",  label: "Tipe Armada",  sort: 52 },
      { code: "menu.master.employees", label: "Karyawan",     sort: 53 },
      { code: "menu.master.position",  label: "Jabatan",      sort: 54 },
      { code: "menu.master.customers", label: "Customer",     sort: 55 },
    ],
  },
];

/**
 * 2) Daftar permission code yang digunakan app (sinkron dengan middleware)
 */
const ALL_CODES = [
  // dashboard
  "dashboard.read",

  // master.bus
  "master.bus.read", "master.bus.create", "master.bus.update", "master.bus.delete",

  // master.bus_type
  "master.bus_type.read", "master.bus_type.create", "master.bus_type.update", "master.bus_type.delete",

  // master.customers
  "master.customers.read", "master.customers.create", "master.customers.update", "master.customers.delete",

  // master.employees
  "master.employees.read", "master.employees.create", "master.employees.update", "master.employees.delete",

  // master.position
  "master.position.read", "master.position.create", "master.position.update", "master.position.delete",

  // finance / report
  "finance.repayment.read",
  "report.revenue.read",

  // schedule input
  "schedule.input.read", "schedule.input.create", "schedule.input.update", "schedule.input.delete",

  // trip sheet
  "trip_sheet.read", "trip_sheet.create", "trip_sheet.update", "trip_sheet.delete",
];

/**
 * 3) Label Indonesia ramah user untuk resource (untuk merakit label permission)
 */
const RESOURCE_LABEL: Record<string, string> = {
  "dashboard": "Dashboard",

  "master.bus": "Armada",
  "master.bus_type": "Tipe Armada",
  "master.customers": "Customer",
  "master.employees": "Karyawan",
  "master.position": "Jabatan",

  "finance.repayment": "Tagihan Pembayaran",
  "report.revenue": "Laporan Pendapatan",

  "schedule.input": "Input Jadwal",
  "trip_sheet": "Surat Jalan",
};

/**
 * 4) Label kata kerja Indonesia per action
 */
const ACTION_LABEL: Record<string, string> = {
  read: "Lihat",
  create: "Tambah",
  update: "Ubah",
  delete: "Hapus",
};

/**
 * 5) Pemetaan permission → menu code
 */
function menuCodeForPermission(code: string): string {
  if (code.startsWith("master.bus.")) return "menu.master.bus";
  if (code.startsWith("master.bus_type.")) return "menu.master.bus_type";
  if (code.startsWith("master.customers.")) return "menu.master.customers";
  if (code.startsWith("master.employees.")) return "menu.master.employees";
  if (code.startsWith("master.position.")) return "menu.master.position";

  if (code.startsWith("schedule.input.")) return "menu.schedule.input";
  if (code.startsWith("trip_sheet.")) return "menu.trip_sheet";

  if (code.startsWith("finance.repayment.")) return "menu.finance.repayment";
  if (code.startsWith("report.revenue.")) return "menu.report.revenue";

  if (code === "dashboard.read") return "menu.dashboard";
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
  const action = parts.pop()!; // read/create/update/delete
  const actionLabel = ACTION_LABEL[action] ?? action.toUpperCase();
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

/** Helper: cari Position by name secara "case-insensitive" sebatas best-effort MySQL
 *  Catatan: pada MySQL dengan collation *_ci, equals sudah case-insensitive.
 *  Fallback bawah hanya untuk jaga-jaga bila collation case-sensitive.
 */
async function findPositionByNameCI(name: string) {
  let pos = await prisma.position.findFirst({ where: { name: { equals: name } } });
  if (!pos) {
    pos = await prisma.position.findFirst({ where: { name: { equals: name.toLowerCase() } } });
  }
  if (!pos) {
    pos = await prisma.position.findFirst({ where: { name: { equals: name.toUpperCase() } } });
  }
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

  // 1) build menu hierarchy
  await upsertMenuTree(MENU_TREE);
  console.log("✅ Menu tree upserted.");

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
