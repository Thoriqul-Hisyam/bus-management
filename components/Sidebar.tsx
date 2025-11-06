// components/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBus,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaHome,
  FaBars,
  FaTimes,
  FaUsers,
  FaUserTie,
  FaUserFriends,
  FaFileInvoiceDollar,
} from "react-icons/fa";

function linkClass(currentPath: string, path: string) {
  const active = currentPath === path;
  return `flex items-center gap-3 p-3 rounded-lg hover:bg-blue-600 hover:text-white transition ${
    active ? "bg-blue-600 text-white" : "text-gray-700"
  }`;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openMaster, setOpenMaster] = useState(false);

  return (
    <>
      {/* Toggle (mobile) */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-[60] md:hidden bg-blue-600 text-white p-2 rounded-lg shadow-lg"
        aria-label="Toggle sidebar"
      >
        {open ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-white shadow-lg p-4 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <h1 className="text-xl font-bold mb-6 text-blue-800 text-center md:text-left">
          Manajemen Armada
        </h1>

        <nav className="flex flex-col gap-2">
          <Link
            href="/"
            className={linkClass(pathname, "/")}
            onClick={() => setOpen(false)}
          >
            <FaHome /> Dashboard
          </Link>

          <Link
            href="/schedule/input"
            className={linkClass(pathname, "/schedule/input")}
            onClick={() => setOpen(false)}
          >
            <FaCalendarAlt /> Input Jadwal
          </Link>
          <Link
            href="/repayment"
            className={linkClass(pathname, "/repayment")}
            onClick={() => setOpen(false)}
          >
            <FaFileInvoiceDollar /> Tagihan Pembayaran
          </Link>

          <Link
            href="/report/revenue"
            className={linkClass(pathname, "/report/revenue")}
            onClick={() => setOpen(false)}
          >
            <FaMoneyBillWave /> Report Revenue
          </Link>

          {/* Master */}
          <div>
            <button
              onClick={() => setOpenMaster(!openMaster)}
              className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-blue-50 text-gray-700"
              aria-expanded={openMaster}
            >
              <span className="flex items-center gap-3">
                <FaUsers /> Master Data
              </span>
              <span className="text-gray-500">{openMaster ? "▾" : "▸"}</span>
            </button>

            {openMaster && (
              <div className="ml-6 mt-2 flex flex-col gap-1">
                <Link
                  href="/master/bus"
                  className={linkClass(pathname, "/master/bus")}
                  onClick={() => setOpen(false)}
                >
                  <FaBus /> Armada
                </Link>
                <Link
                  href="/master/employees"
                  className={linkClass(pathname, "/master/employees")}
                  onClick={() => setOpen(false)}
                >
                  <FaUserTie /> Karyawan
                </Link>
                <Link
                  href="/master/position"
                  className={linkClass(pathname, "/master/position")}
                  onClick={() => setOpen(false)}
                >
                  <FaUserTie /> Jabatan
                </Link>
                <Link
                  href="/master/customers"
                  className={linkClass(pathname, "/master/customers")}
                  onClick={() => setOpen(false)}
                >
                  <FaUserFriends /> Customer
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="mt-auto text-sm text-gray-500 border-t pt-4 text-center md:text-left">
          © 2025 Lefateach
        </div>
      </aside>
    </>
  );
}
