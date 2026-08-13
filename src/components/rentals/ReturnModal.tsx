"use client";

import { useState } from "react";
import { X, RotateCcw, AlertTriangle, CheckCircle2, Package } from "lucide-react";
import { Rental } from "@/types";
import { useAppStore } from "@/lib/store";

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: Rental | null;
}

export function ReturnModal({ isOpen, onClose, rental }: ReturnModalProps) {
  const { processReturn } = useAppStore();
  const [returnItems, setReturnItems] = useState<{ [eqId: string]: { returnedQty: number; damagedQty: number } }>({});
  const [notes, setNotes] = useState("");

  if (!isOpen || !rental) return null;

  const handleQtyChange = (eqId: string, maxQty: number, field: "returnedQty" | "damagedQty", val: number) => {
    const current = returnItems[eqId] || { returnedQty: maxQty, damagedQty: 0 };
    const safeVal = Math.max(0, Math.min(maxQty, val));

    setReturnItems({
      ...returnItems,
      [eqId]: {
        ...current,
        [field]: safeVal,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedPayload = rental.items.map((item) => {
      const state = returnItems[item.equipmentId] || {
        returnedQty: item.quantity - item.returnedQuantity,
        damagedQty: 0,
      };
      return {
        equipmentId: item.equipmentId,
        returnedQty: state.returnedQty,
        damagedQty: state.damagedQty,
      };
    });

    processReturn(rental.id, formattedPayload, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Process Equipment Check-in & Return</h3>
              <p className="text-xs text-slate-500">Order: <span className="font-mono font-bold text-slate-800">{rental.rentalNumber}</span> • {rental.projectName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">
              Itemized Check-in Verification
            </label>

            {rental.items.map((item) => {
              const remaining = item.quantity - item.returnedQuantity;
              const currentState = returnItems[item.equipmentId] || { returnedQty: remaining, damagedQty: 0 };

              return (
                <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.equipmentName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Rented Qty: {item.quantity} • Already Returned: {item.returnedQuantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {remaining} units pending
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Good Condition Return Qty</label>
                      <input
                        type="number"
                        min="0"
                        max={remaining}
                        value={currentState.returnedQty}
                        onChange={(e) => handleQtyChange(item.equipmentId, remaining, "returnedQty", parseInt(e.target.value) || 0)}
                        className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-rose-700 mb-1">Damaged / Malfunctioning Qty</label>
                      <input
                        type="number"
                        min="0"
                        max={remaining}
                        value={currentState.damagedQty}
                        onChange={(e) => handleQtyChange(item.equipmentId, remaining, "damagedQty", parseInt(e.target.value) || 0)}
                        className="w-full text-xs font-bold bg-rose-50 border border-rose-300 text-rose-800 rounded-lg px-3 py-1.5 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Return Notes / Damage Incident Report</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-accent"
              placeholder="e.g. Returned all items in good condition. Nanlux light reflector scratch noted."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Return & Restore Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
