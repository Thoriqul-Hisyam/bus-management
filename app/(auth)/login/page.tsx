"use client";

import { useTransition, useState } from "react";
import { login } from "@/actions/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        setError(err.message);
      }
    });
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-gray-50">
      <div className="w-full max-w-sm bg-white shadow-md rounded-xl p-6">
        <img src="/img/logo.png" alt="logo" />
        <h1 className="text-xl font-semibold mb-4 text-center">
          Masuk ke Navara
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3 text-center">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700">Username</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 disabled:opacity-50 transition-all"
          >
            {isPending ? "Masuk..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
