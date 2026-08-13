"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight, Film, Clock, User, Eye } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDate, getStatusBadgeClass } from "@/lib/utils";

export default function SchedulePage() {
  const { rentals, equipment } = useAppStore();

  const dates = [
    { day: "Thu", date: "24", full: "2026-07-24" },
    { day: "Fri", date: "25", full: "2026-07-25", isToday: true },
    { day: "Sat", date: "26", full: "2026-07-26" },
    { day: "Sun", date: "27", full: "2026-07-27" },
    { day: "Mon", date: "28", full: "2026-07-28" },
    { day: "Tue", date: "29", full: "2026-07-29" },
    { day: "Wed", date: "30", full: "2026-07-30" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-accent" /> Equipment Rental Schedule & Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual booking calendar matrix for film camera packages, lighting rigs, and gear availability.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 px-2">July 2026</span>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Timeline Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-64 border-r border-slate-800">Equipment Model</th>
                {dates.map((d) => (
                  <th
                    key={d.full}
                    className={`py-3.5 px-3 text-center border-r border-slate-800 ${
                      d.isToday ? "bg-accent text-white" : ""
                    }`}
                  >
                    <div>{d.day}</div>
                    <div className="text-sm font-black">{d.date}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {equipment.slice(0, 8).map((eq) => {
                return (
                  <tr key={eq.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 border-r border-slate-100 font-semibold text-slate-900 bg-slate-50/30">
                      <div>{eq.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{eq.equipmentId} • Qty: {eq.quantity}</div>
                    </td>

                    {dates.map((d) => {
                      // Find if any rental active on this date
                      const activeRental = rentals.find((r) => {
                        const hasEq = r.items.some((i) => i.equipmentId === eq.id);
                        return hasEq;
                      });

                      return (
                        <td key={d.full} className="p-1.5 border-r border-slate-100 text-center relative h-14">
                          {activeRental && (d.date === "25" || d.date === "26" || d.date === "27") ? (
                            <Link
                              href={`/rentals/${activeRental.id}`}
                              className="block h-full bg-orange-500/15 border border-orange-500/40 hover:bg-orange-500/25 rounded-lg p-1 text-left group transition-all"
                            >
                              <p className="text-[10px] font-bold text-amber-900 truncate group-hover:text-accent">
                                {activeRental.projectName}
                              </p>
                              <p className="text-[9px] text-slate-600 truncate">{activeRental.clientName}</p>
                            </Link>
                          ) : (
                            <span className="text-[10px] text-slate-300 font-mono">Available</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
