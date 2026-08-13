"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, RotateCcw, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PrintableRentalSheet } from "@/components/rentals/PrintableRentalSheet";

export default function RentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { rentals } = useAppStore();

  const rentalId = params.id as string;
  const rental = rentals.find((r) => r.id === rentalId || r.rentalNumber === rentalId);

  if (!rental) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Rental Order Not Found</h2>
        <p className="text-xs text-slate-500">The requested rental order contract does not exist or has been removed.</p>
        <Link
          href="/rentals"
          className="inline-block px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800"
        >
          Back to Rental Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Controls */}
      <div className="no-print flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Rentals List</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Status:</span>
          <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-full">
            {rental.status}
          </span>
        </div>
      </div>

      {/* Printable Sheet Component */}
      <PrintableRentalSheet rental={rental} />
    </div>
  );
}
