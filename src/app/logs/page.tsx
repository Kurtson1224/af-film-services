"use client";

import { History, Shield, Package, Calendar, User } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";

export default function LogsPage() {
  const { inventoryLogs, activityLogs } = useAppStore();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-accent" /> Audit & Inventory Change Logs
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete audit trail of every stock adjustment, rental reservation, return check-in, and system action.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Logs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Package className="w-4 h-4 text-accent" /> Inventory Stock Movements
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {inventoryLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-900 font-bold">{log.equipmentName}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.changeAmount < 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {log.action} ({log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount})
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Prev Qty: <span className="font-bold">{log.previousQuantity}</span> → New Qty: <span className="font-bold text-slate-900">{log.newQuantity}</span>
                </p>
                {log.rentalNumber && (
                  <p className="text-slate-500 text-[10px] font-mono">Rental: {log.rentalNumber}</p>
                )}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                  <span>By: {log.userName}</span>
                  <span>{formatDateTime(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Activity Logs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-4 h-4 text-accent" /> System Action Audit Trail
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {activityLogs.map((act) => (
              <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">{act.action}</span>
                  <span className="text-[10px] text-slate-400">{act.module}</span>
                </div>
                {act.details && <p className="text-slate-600 text-[11px]">{act.details}</p>}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                  <span>{act.userName} ({act.userRole})</span>
                  <span>{formatDateTime(act.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
