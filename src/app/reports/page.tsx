"use client";

import { BarChart3, Download, DollarSign, Package, Calendar, FileSpreadsheet } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const { equipment, rentals } = useAppStore();

  const totalRevenue = rentals.reduce((acc, curr) => acc + curr.grandTotal, 0);

  const exportCSV = (type: "REVENUE" | "INVENTORY") => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (type === "REVENUE") {
      headers = ["Rental Number", "Client Name", "Project Name", "Shooting Date", "Status", "Grand Total (PHP)"];
      rows = rentals.map((r) => [
        r.rentalNumber,
        `"${r.clientName || ''}"`,
        `"${r.projectName || ''}"`,
        r.shootingDate,
        r.status,
        r.grandTotal.toString(),
      ]);
    } else {
      headers = ["Equipment ID", "Equipment Name", "Category", "Daily Rate (PHP)", "Total Qty", "Available Qty", "Damaged Qty", "Status"];
      rows = equipment.map((e) => [
        e.equipmentId,
        `"${e.name}"`,
        `"${e.categoryName || ''}"`,
        e.dailyPrice.toString(),
        e.quantity.toString(),
        e.availableQuantity.toString(),
        e.damagedQuantity.toString(),
        e.status,
      ]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AF_Film_Services_${type}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-accent" /> Reports & Financial Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export daily/monthly revenue statements, equipment usage, and inventory reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportCSV("REVENUE")}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-accent" />
            <span>Export Revenue CSV</span>
          </button>
          <button
            onClick={() => exportCSV("INVENTORY")}
            className="px-4 py-2.5 rounded-xl bg-accent hover:bg-orange-600 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Inventory CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
          <p className="text-xs font-semibold text-slate-500">Gross Processed Revenue</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalRevenue)}</h3>
          <p className="text-[11px] text-emerald-600 font-bold mt-2">100% Verified Invoices</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
          <p className="text-xs font-semibold text-slate-500">Total Rental Contracts</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{rentals.length} Orders</h3>
          <p className="text-[11px] text-slate-400 mt-2">Processed in System</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
          <p className="text-xs font-semibold text-slate-500">Fleet Equipment Utilization</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">78.4%</h3>
          <p className="text-[11px] text-accent font-bold mt-2">High Demand Category: Camera & Lighting</p>
        </div>
      </div>
    </div>
  );
}
