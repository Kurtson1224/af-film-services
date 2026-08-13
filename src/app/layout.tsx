import "./globals.css";
import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/AppLayout";

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
      <body className="h-full bg-[#F8FAFC] text-slate-900 antialiased">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
