"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBus, FaCalendarAlt, FaHome } from "react-icons/fa";

export default function Sidebar() {
  const pathname = usePathname();
  const linkClass = (path) =>
    `flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 hover:text-white ${
      pathname === path ? "bg-blue-600 text-white" : "text-gray-700"
    }`;

  return (
    <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Manajemen Bus</h1>
      <nav className="flex flex-col gap-2">
        <Link href="/" className={linkClass("/")}>
          <FaHome /> Dashboard
        </Link>
        <Link href="/buses" className={linkClass("/buses")}>
          <FaBus /> Bus Data
        </Link>
        <Link href="/schedule" className={linkClass("/schedule")}>
          <FaCalendarAlt /> Bus Schedule
        </Link>
      </nav>
      <div className="mt-auto text-sm text-gray-500 border-t pt-4">
        © 2025 Lefateach
      </div>
    </aside>
  );
}
