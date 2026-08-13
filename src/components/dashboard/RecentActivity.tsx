"use client";

import Link from "next/link";
import { ArrowRight, Calendar, User, Film, AlertTriangle, Eye } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDate, formatCurrency, getStatusBadgeClass } from "@/lib/utils";

export function RecentActivity() {
  const { rentals } = useAppStore();

  const recentRentals = rentals.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Rental Orders</h3>
          <p className="text-xs text-slate-500">Active and recent film production equipment bookings</p>
        </div>
        <Link
          href="/rentals"
          className="text-xs font-bold text-accent hover:text-orange-600 flex items-center gap-1 transition-colors"
        >
          <span>View All Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-slate-50/50">
              <th className="py-3 px-4 rounded-l-xl">Rental No.</th>
              <th className="py-3 px-4">Client & Project</th>
              <th className="py-3 px-4">Shooting Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Grand Total</th>
              <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {recentRentals.map((rental) => (
              <tr key={rental.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  {rental.rentalNumber}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-800">{rental.projectName}</div>
                  <div className="text-[11px] text-slate-500">{rental.clientName}</div>
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(rental.shootingDate)}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(rental.status)}`}>
                    {rental.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  {formatCurrency(rental.grandTotal)}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/rentals/${rental.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                  >
                    <Eye className="w-3 h-3 text-accent" />
                    <span>Sheet & Details</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
