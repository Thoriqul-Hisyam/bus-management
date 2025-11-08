import "../globals.css";
import Sidebar from "@/components/SidebarWrapper";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";
import { readSession } from "@/lib/auth";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata = { title: "Navara Dashboard" };

export default async function AppLayout({ children }: { children: ReactNode }) {
  const s = await readSession(); // server
  const sessionForClient = s ? { name: s.name, role: s.role } : null;

  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning className="flex bg-gray-100 min-h-screen">
        <SessionProvider value={sessionForClient}>
          <Sidebar />
          <div className="flex-1 flex flex-col md:ml-64">
            <Navbar />
            <main className="p-6">{children}</main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
