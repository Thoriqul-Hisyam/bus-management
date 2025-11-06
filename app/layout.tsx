import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";
export const metadata = {
  title: "Navara Dashboard",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
