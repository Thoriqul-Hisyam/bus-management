import { readSession } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

async function logoutAction() {
  "use server";
  await logout();
  redirect("/login");
}

export default async function Navbar() {
  noStore();
  const session = await readSession();

  return (
    <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-700"></h2>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        {session ? (
          <>
            <span className="hidden sm:inline">
              {session.name} {session.positionName ? `• ${session.positionName}` : ""}
            </span>
            <form action={logoutAction}>
              <button
                className="px-3 py-1 rounded-md text-white font-medium
             bg-gradient-to-r from-[#B57A36] to-[#5C3B18] 
             border border-transparent
             hover:brightness-110 transition"
              >
                Logout
              </button>
            </form>
          </>
        ) : (
          <span>Guest</span>
        )}
      </div>
    </header>
  );
}
