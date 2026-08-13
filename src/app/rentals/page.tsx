"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  RotateCcw, 
  Calendar, 
  User, 
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Rental } from "@/types";
import { formatDate, formatCurrency, getStatusBadgeClass } from "@/lib/utils";
import { ReturnModal } from "@/components/rentals/ReturnModal";

export default function RentalsPage() {
  const { rentals, userRole } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [returnModalRental, setReturnModalRental] = useState<Rental | null>(null);

  const filteredRentals = rentals.filter((r) => {
    const matchesSearch =
      r.rentalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.clientName && r.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.representative && r.representative.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === "ALL" || r.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent" /> Rental Orders & Dispatch Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create film rental orders, process returns, track inventory state, and generate official contract sheets.
          </p>
        </div>

        {userRole !== "CLIENT" && (
          <Link
            href="/rentals/new"
            className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Rental Order</span>
          </Link>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search order number, project, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-xs font-medium text-slate-800 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "PENDING", "RESERVED", "PICKED_UP", "RETURNED", "LATE", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedStatus === status
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Rental Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Rental No.</th>
                <th className="py-3.5 px-4">Client & Representative</th>
                <th className="py-3.5 px-4">Project Name & Location</th>
                <th className="py-3.5 px-4">Pickup & Return Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Grand Total (₱)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No rental orders found.
                  </td>
                </tr>
              ) : (
                filteredRentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {rental.rentalNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rental.clientName || "Client"}</div>
                      <div className="text-[11px] text-slate-500">{rental.representative || rental.clientCompany}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rental.projectName}</div>
                      <div className="text-[11px] text-slate-500">{rental.location || "Studio"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="text-[11px]">Pickup: <span className="font-semibold text-slate-900">{formatDate(rental.pickupDate)}</span></div>
                      <div className="text-[11px]">Return: <span className="font-semibold text-slate-900">{formatDate(rental.returnDate)}</span></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(rental.status)}`}>
                        {rental.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900">
                      {formatCurrency(rental.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rental.status === "PICKED_UP" && userRole !== "CLIENT" && (
                          <button
                            onClick={() => setReturnModalRental(rental)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Return Gear</span>
                          </button>
                        )}
                        <Link
                          href={`/rentals/${rental.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-accent" />
                          <span>View Sheet</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Modal */}
      <ReturnModal
        isOpen={Boolean(returnModalRental)}
        onClose={() => setReturnModalRental(null)}
        rental={returnModalRental}
      />
    </div>
  );
}
