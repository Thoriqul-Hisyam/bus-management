"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBus, FaCalendarAlt, FaHome, FaBars, FaTimes } from "react-icons/fa";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (path) =>
    `flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 hover:text-white transition ${
      pathname === path ? "bg-blue-600 text-white" : "text-gray-700"
    }`;

  return (
    <>
      {/* Tombol toggle sidebar (selalu di atas segalanya) */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-[60] md:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg"
      >
        {open ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Overlay hitam semi-transparan di mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar utama */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-white shadow-lg p-4 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <h1 className="text-2xl font-bold mb-6 text-blue-700 text-center md:text-left">
          Manajemen Bus
        </h1>

        {/* Navigasi */}
        <nav className="flex flex-col gap-2">
          <Link href="/" className={linkClass("/")} onClick={() => setOpen(false)}>
            <FaHome /> Dashboard
          </Link>
          <Link href="/buses" className={linkClass("/buses")} onClick={() => setOpen(false)}>
            <FaBus /> Bus Data
          </Link>
          <Link href="/schedule" className={linkClass("/schedule")} onClick={() => setOpen(false)}>
            <FaCalendarAlt /> Bus Schedule
          </Link>
        </nav>

        {/* Footer */}
        <div className="mt-auto text-sm text-gray-500 border-t pt-4 text-center md:text-left">
          © 2025 Lefateach
        </div>
      </aside>
    </>
  );
}
