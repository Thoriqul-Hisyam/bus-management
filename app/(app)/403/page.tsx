"use client";

import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function ForbiddenPage() {
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
        <Button variant="outline" asChild>
          <Link href="/login">Ganti Akun</Link>
        </Button>
      </div>
    </div>
  );
}
