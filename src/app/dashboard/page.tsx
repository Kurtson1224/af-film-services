"use client";

import Link from "next/link";
import { Plus, Package, FileText, TrendingUp, Calendar, RefreshCw } from "lucide-react";
import { OverviewStats } from "@/components/dashboard/OverviewStats";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { EquipmentChart } from "@/components/dashboard/EquipmentChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useAppStore } from "@/lib/store";

export default function DashboardPage() {
  const { userRole } = useAppStore();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Film Production Rental Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time equipment inventory tracking, rental scheduling, and revenue performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/inventory"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
          >
            <Package className="w-4 h-4 text-accent" />
            <span>Manage Inventory</span>
          </Link>
          {userRole !== "CLIENT" && (
            <Link
              href="/rentals/new"
              className="px-4 py-2.5 rounded-xl bg-accent hover:bg-orange-600 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Rental Order</span>
            </Link>
          )}
        </div>
      </div>

      {/* 1. Key Metrics Cards */}
      <OverviewStats />

      {/* 2. Monthly Revenue Performance Chart */}
      <RevenueChart />

      {/* 3. Analytics & Most Rented Equipment */}
      <EquipmentChart />

      {/* 4. Recent Rental Orders Table */}
      <RecentActivity />
    </div>
  );
}
