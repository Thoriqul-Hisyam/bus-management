"use client";

import * as React from "react";
import { useTransition, useState } from "react";
import { changeMyPassword } from "@/actions/account";
import { logout } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CrudModal } from "@/components/shared/crud-modal";
import PasswordField from "@/components/shared/password-field";
import { z } from "zod";
import { Loader2, ChevronDown } from "lucide-react";

const PasswordSchema = z.object({
  newPassword: z.string().min(6, "Minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Minimal 6 karakter"),
}).refine((v) => v.newPassword === v.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

export default function NavbarClient({
  name,
  positionName,
}: { name: string; positionName: string | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pwdOpen, setPwdOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <h2 className="text-xl font-semibold text-gray-700" />
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 text-white font-medium bg-linear-to-r from-[#B57A36] to-[#5C3B18]  border border-transparent hover:brightness-110 transition">
              <span className="hidden sm:inline">
                {name} {positionName ? `• ${positionName}` : ""}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuLabel>Akun</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="transition-colors hover:[background:linear-gradient(90deg,rgba(181,122,54,0.05),rgba(92,59,24,0.05))]" onClick={() => setPwdOpen(true)}>
              Ubah Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive transition-colors hover:[background:linear-gradient(90deg,rgba(181,122,54,0.05),rgba(92,59,24,0.05))]"
              onClick={() =>
                startTransition(async () => {
                  await logout();
                  router.push("/login");
                })
              }
            >
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <CrudModal<z.infer<typeof PasswordSchema>>
          open={pwdOpen}
          onOpenChange={setPwdOpen}
          title="Ubah Password"
          description="Masukkan password baru Anda dan konfirmasinya."
          schema={PasswordSchema}
          defaultValues={{
            newPassword: "",
            confirmPassword: "",
          }}
          onSubmit={async (values) => {
            const res = await changeMyPassword(values);
            if (res.ok) {
              setPwdOpen(false);
            } else {
              throw new Error(res.error);
            }
          }}
          renderFields={(f) => (
            <>
              <PasswordField
                form={f}
                name="newPassword"
                label="Password Baru"
                placeholder="Minimal 6 karakter"
              />
              <PasswordField
                form={f}
                name="confirmPassword"
                label="Konfirmasi Password"
                placeholder="Ulangi password baru"
              />
            </>
          )}
          submitText="Simpan"
          cancelText="Batal"
        />
      </div>
    </header>
  );
}
