import "./globals.css";
import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "AF Film Services | Equipment Rental Management System",
  description: "Production-ready Equipment Rental Management System for film cameras, lenses, lighting, audio, and grip gear.",
  keywords: "film rental, equipment management, cinema camera rental, ARRI, RED, Sony FX3, Nanlux, rental contract generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#F8FAFC] text-slate-900 antialiased flex overflow-hidden">
        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
