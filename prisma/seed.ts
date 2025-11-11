import { PrismaClient } from "@prisma/client";

async function run() {
  const { main: seedAccounts } = await import("./seeds/01-roles-accounts");
  const { main: seedPermissions } = await import("./seeds/02-permissions");

  await seedAccounts();
  await seedPermissions();

  console.log("✅ All seed finished.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
