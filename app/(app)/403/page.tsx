"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { logout } from "@/actions/auth";

export default function ForbiddenPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleLogout() {
    startTransition(async () => {
      try {
        await logout();
        router.replace("/login");
      } catch (err) {
        console.error("Logout failed:", err);
      }
    });
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <Alert className="max-w-lg">
        <Lock className="h-4 w-4" />
        <AlertTitle className="text-lg">Akses Ditolak (403)</AlertTitle>
        <AlertDescription className="mt-2">
          Kamu tidak memiliki permission untuk mengakses halaman ini.
          Jika menurutmu ini keliru, hubungi administrator untuk meminta akses.
        </AlertDescription>
      </Alert>

      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/">Kembali ke Dashboard</Link>
        </Button>
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isPending}
        >
          {isPending ? "Keluar..." : "Ganti Akun"}
        </Button>
      </div>
    </div>
  );
}
