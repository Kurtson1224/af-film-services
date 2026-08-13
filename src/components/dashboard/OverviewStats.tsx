"use client";

import { Package, CheckCircle, Clock, AlertCircle, DollarSign, CalendarCheck } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export function OverviewStats() {
  const { equipment, rentals } = useAppStore();

  const totalEquipmentCount = equipment.reduce((acc, curr) => acc + curr.quantity, 0);
  const availableEquipmentCount = equipment.reduce((acc, curr) => acc + curr.availableQuantity, 0);
  const currentlyRentedCount = equipment.reduce((acc, curr) => acc + curr.reservedQuantity, 0);

  const activeRentals = rentals.filter((r) => r.status === "PICKED_UP" || r.status === "RESERVED");
  const totalRevenue = rentals.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const upcomingReturns = rentals.filter((r) => r.status === "PICKED_UP").length;

  const stats = [
    {
      title: "Total Inventory Units",
      value: totalEquipmentCount,
      subtitle: `${equipment.length} unique equipment models`,
      icon: Package,
      badge: "In Fleet",
      badgeColor: "bg-slate-100 text-slate-700",
    },
    {
      title: "Available Stock",
      value: availableEquipmentCount,
      subtitle: `${Math.round((availableEquipmentCount / (totalEquipmentCount || 1)) * 100)}% stock ready`,
      icon: CheckCircle,
      badge: "Ready for Rent",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Currently Rented / Reserved",
      value: currentlyRentedCount,
      subtitle: `${activeRentals.length} active rental projects`,
      icon: Clock,
      badge: "On Field",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      title: "Upcoming Returns",
      value: upcomingReturns,
      subtitle: "Due in the next 3 days",
      icon: CalendarCheck,
      badge: "Check-in Due",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "Total Revenue Generated",
      value: formatCurrency(totalRevenue),
      subtitle: "All processed film rentals",
      icon: DollarSign,
      badge: "+18.4% MoM",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">{stat.title}</span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
            </div>
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] font-medium text-slate-400">{stat.subtitle}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stat.badgeColor}`}>
                {stat.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
