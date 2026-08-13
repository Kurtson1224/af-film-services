"use client";

import { Wrench, AlertTriangle, CheckCircle2, Package } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatCurrency, getStatusBadgeClass } from "@/lib/utils";

export default function MaintenancePage() {
  const { equipment, updateEquipment } = useAppStore();

  const maintenanceGear = equipment.filter(
    (e) => e.damagedQuantity > 0 || e.status === "MAINTENANCE" || e.status === "OUT_OF_STOCK"
  );

  const handleResolveDamage = (id: string, currentQty: number) => {
    updateEquipment(id, {
      damagedQuantity: 0,
      status: "AVAILABLE",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-accent" /> Equipment Maintenance & Damage Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track damaged items returned from production shoots, schedule repairs, and update status.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Flagged Equipment ({maintenanceGear.length} items)
          </span>
        </div>

        {maintenanceGear.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">All Equipment Operational</h3>
            <p className="text-xs text-slate-500">There are currently no damaged or flagged items in maintenance.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {maintenanceGear.map((item) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      ID: {item.equipmentId} • Serial: {item.serialNumber || "N/A"}
                    </p>
                    <p className="text-xs text-rose-700 font-semibold mt-1">
                      Damaged Qty: {item.damagedQuantity} units • Fleet Total: {item.quantity} units
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                  <button
                    onClick={() => handleResolveDamage(item.id, item.quantity)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                  >
                    Mark Repaired & Restore Stock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
