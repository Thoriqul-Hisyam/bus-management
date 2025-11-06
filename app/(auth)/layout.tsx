import "../globals.css";
import { ReactNode } from "react";

export const metadata = { title: "Login • Navara" };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
