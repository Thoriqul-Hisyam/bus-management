"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBus,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaHome,
  FaUsers,
  FaUserTie,
  FaUserFriends,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";

type Role = "superadmin" | "manager" | "finance" | "admin";

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const [openMaster, setOpenMaster] = useState(false);

  const linkClass = (path: string) =>
    cn(
      "flex items-center gap-3 p-3 rounded-lg transition",
      pathname === path
        ? "bg-gradient-to-r from-[#B57A36] to-[#5C3B18] text-white shadow"
        : "text-gray-700 hover:bg-gradient-to-r hover:from-[#B57A36]/20 hover:to-[#5C3B18]/20 hover:text-[#5C3B18]"
    );

  const canSeeFinance =
    role === "finance" || role === "manager" || role === "superadmin";
  const canSeePositions = role === "manager" || role === "superadmin";

  const navLinks = (
    <nav className="flex flex-col gap-2">
      <Link href="/" className={linkClass("/")}>
        <FaHome /> Dashboard
      </Link>

      <Link href="/schedule/input" className={linkClass("/schedule/input")}>
        <FaCalendarAlt /> Input Jadwal
      </Link>

      <Link href="/trip_sheet" className={linkClass("/trip_sheet")}>
        <FaFileInvoiceDollar /> Surat Jalan
      </Link>

      {canSeeFinance && (
        <>
          <Link href="/repayment" className={linkClass("/repayment")}>
            <FaFileInvoiceDollar /> Tagihan Pembayaran
          </Link>
          <Link href="/report/revenue" className={linkClass("/report/revenue")}>
            <FaMoneyBillWave /> Report Revenue
          </Link>
        </>
      )}

      <Collapsible open={openMaster} onOpenChange={setOpenMaster}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center justify-between w-full p-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#B57A36]/10 hover:to-[#5C3B18]/10"
          >
            <span className="flex items-center gap-3">
              <FaUsers /> Master Data
            </span>
            {openMaster ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-6 mt-2 flex flex-col gap-1">
          <Link href="/master/bus" className={linkClass("/master/bus")}>
            <FaBus /> Armada
          </Link>
          <Link
            href="/master/bus-type"
            className={linkClass("/master/bus-type")}
          >
            <FaBus /> Tipe Armada
          </Link>
          <Link
            href="/master/employees"
            className={linkClass("/master/employees")}
          >
            <FaUserTie /> Karyawan
          </Link>
          {canSeePositions && (
            <Link
              href="/master/position"
              className={linkClass("/master/position")}
            >
              <FaUserTie /> Jabatan
            </Link>
          )}
          <Link
            href="/master/customers"
            className={linkClass("/master/customers")}
          >
            <FaUserFriends /> Customer
          </Link>
        </CollapsibleContent>
      </Collapsible>
    </nav>
  );

  return (
    <div>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="default"
              className="fixed top-4 left-4 z-50 bg-gradient-to-r from-[#B57A36] to-[#5C3B18] text-white shadow-lg"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-4 w-64 flex flex-col">
            <div className="flex justify-center mb-6">
              <Image
                src="/img/logo.png"
                alt="logo"
                width={120}
                height={120}
                priority
              />
            </div>
            {navLinks}
            <div className="mt-auto text-sm text-gray-500 border-t pt-4 text-center">
              © 2025 Lefateach
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg p-4 h-screen fixed left-0 top-0">
        <div className="flex justify-center mb-6">
          <Image
            src="/img/logo.png"
            alt="logo"
            width={120}
            height={120}
            priority
          />
        </div>
        {navLinks}
        <div className="mt-auto text-sm text-gray-500 border-t pt-4 text-center md:text-left">
          © 2025 Lefateach
        </div>
      </aside>
    </div>
  );
}
