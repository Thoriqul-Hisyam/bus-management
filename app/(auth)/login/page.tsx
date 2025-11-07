"use client";

import { useTransition, useState } from "react";
import { login } from "@/actions/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const res = await login({ username, password });
        router.push(res.redirect);
      } catch (err: any) {
        setError(err.message ?? "Terjadi kesalahan");
      }
    });
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-4 items-center">
          <Image
            src="/img/logo.png"
            className="justify-self-center"
            alt="logo"
            width={120}
            height={120}
            priority
          />
          <CardTitle className="text-center">Masuk ke Navara</CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="text-center">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  aria-label={showPwd ? "Sembunyikan password" : "Tampilkan password"}
                  onClick={() => setShowPwd((v) => !v)}
                >
                  {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Masuk...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
