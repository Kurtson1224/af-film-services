"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  DollarSign, 
  Film, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ArrowLeft
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { RentalItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function NewRentalPage() {
  const router = useRouter();
  const { clients, equipment, createRental } = useAppStore();

  const [rentalNumber] = useState(`REN-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || "");
  const [representative, setRepresentative] = useState("");
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [shootingDate, setShootingDate] = useState("2026-07-28");
  const [callTime, setCallTime] = useState("06:00 AM");
  const [pickupDate, setPickupDate] = useState("2026-07-27");
  const [returnDate, setReturnDate] = useState("2026-07-30");

  const [discount, setDiscount] = useState(0);
  const [deposit, setDeposit] = useState(5000);
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Selected Equipment Items List
  const [selectedItems, setSelectedItems] = useState<{ equipmentId: string; quantity: number; unitPrice: number }[]>([
    { equipmentId: equipment[0]?.id || "", quantity: 1, unitPrice: equipment[0]?.dailyPrice || 10000 },
  ]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleAddItemRow = () => {
    const defaultEq = equipment[0];
    if (defaultEq) {
      setSelectedItems([
        ...selectedItems,
        { equipmentId: defaultEq.id, quantity: 1, unitPrice: defaultEq.dailyPrice },
      ]);
    }
  };

  const handleRemoveItemRow = (index: number) => {
    if (selectedItems.length > 1) {
      setSelectedItems(selectedItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: "equipmentId" | "quantity" | "unitPrice", value: any) => {
    const updated = [...selectedItems];
    if (field === "equipmentId") {
      const eq = equipment.find((e) => e.id === value);
      updated[index] = {
        equipmentId: value,
        quantity: 1,
        unitPrice: eq ? eq.dailyPrice : 1000,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setSelectedItems(updated);
  };

  // Dynamic Live Pricing Calculation
  const subtotal = selectedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = Math.round((subtotal - discount) * 0.12);
  const grandTotal = Math.max(0, subtotal - discount + tax + deposit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!projectName.trim()) {
      setErrorMessage("Please enter a Project Name for this rental booking.");
      return;
    }

    try {
      const formattedItems: RentalItem[] = selectedItems.map((item, idx) => {
        const eqMatch = equipment.find((e) => e.id === item.equipmentId);
        return {
          id: `ri-${Date.now()}-${idx}`,
          rentalId: "",
          equipmentId: item.equipmentId,
          equipmentName: eqMatch ? eqMatch.name : "Equipment",
          equipmentCode: eqMatch ? eqMatch.equipmentId : `EQ-${idx}`,
          quantity: item.quantity,
          returnedQuantity: 0,
          damagedQuantity: 0,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
        };
      });

      const newRental = createRental({
        rentalNumber,
        clientId: selectedClientId,
        clientName: selectedClient?.name || "Client",
        clientCompany: selectedClient?.company,
        clientPhone: selectedClient?.phone,
        clientEmail: selectedClient?.email,
        representative: representative || selectedClient?.representative || selectedClient?.name,
        projectName,
        location,
        shootingDate,
        callTime,
        pickupDate,
        returnDate,
        status: "RESERVED",
        subtotal,
        discount,
        deposit,
        tax,
        grandTotal,
        notes,
        items: formattedItems,
      });

      router.push(`/rentals/${newRental.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create rental order.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Rental Order</h1>
            <p className="text-xs text-slate-500">Order Number: <span className="font-mono font-bold text-slate-800">{rentalNumber}</span></p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Order Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Client & Project Information */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-accent" /> Client & Production Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Client *</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-accent focus:bg-white"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `(${c.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Authorized Representative</label>
              <input
                type="text"
                placeholder="e.g. Direk Cathy Garcia"
                value={representative}
                onChange={(e) => setRepresentative(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-accent focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name *</label>
              <input
                type="text"
                placeholder="e.g. Unbreakable Hearts Feature Film"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-accent focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shooting Location</label>
              <input
                type="text"
                placeholder="e.g. Subic Bay Film Studio & Outdoor Set"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-accent focus:bg-white"
              />
            </div>
          </div>

          {/* Dates & Schedule Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Shooting Date</label>
              <input
                type="date"
                value={shootingDate}
                onChange={(e) => setShootingDate(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Call Time</label>
              <input
                type="text"
                value={callTime}
                onChange={(e) => setCallTime(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pickup Date</label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Return Date</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* 2. Multiple Equipment Selection with Overbooking Prevention */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Film className="w-4 h-4 text-accent" /> Equipment Line Items
            </h2>
            <button
              type="button"
              onClick={handleAddItemRow}
              className="flex items-center gap-1 text-xs font-bold text-accent hover:text-orange-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Equipment Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {selectedItems.map((item, index) => {
              const eqMatch = equipment.find((e) => e.id === item.equipmentId);
              const maxAvailable = eqMatch ? eqMatch.availableQuantity : 0;
              const isOverbooked = item.quantity > maxAvailable;

              return (
                <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Equipment</label>
                      <select
                        value={item.equipmentId}
                        onChange={(e) => handleItemChange(index, "equipmentId", e.target.value)}
                        className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                      >
                        {equipment.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name} ({e.equipmentId}) - Avail: {e.availableQuantity}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        max={maxAvailable || 1}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                        className={`w-full text-xs font-bold bg-white border rounded-lg px-3 py-2 focus:outline-none ${
                          isOverbooked ? "border-rose-500 text-rose-600" : "border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Daily Rate (₱)</label>
                      <input
                        type="number"
                        step="100"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div className="sm:col-span-2 text-right">
                      <span className="block text-[11px] font-semibold text-slate-600 mb-1">Line Subtotal</span>
                      <span className="text-xs font-black text-slate-900">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </span>
                    </div>

                    <div className="sm:col-span-1 text-right">
                      {selectedItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(index)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors mt-4"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stock Warning Alert */}
                  {isOverbooked && (
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Overbooking Warning: Only {maxAvailable} units available in stock!
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Live Pricing & Grand Total Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" /> Financial Breakdown & Rates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Amount (₱)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Security Deposit (₱)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={deposit}
                  onChange={(e) => setDeposit(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Special Notes / Equipment Handling Instructions</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-accent"
                  placeholder="e.g. VIP client request. Camera prep done."
                />
              </div>
            </div>

            {/* Live Computed Totals */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-xl">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 mb-3">
                  Live Dynamic Quote Calculation
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Equipment Subtotal:</span>
                    <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount Applied:</span>
                      <span className="font-bold">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>VAT Tax (12%):</span>
                    <span className="font-bold text-white">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Refundable Deposit:</span>
                    <span className="font-bold text-white">{formatCurrency(deposit)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Estimated Grand Total:</span>
                <span className="text-2xl font-black text-accent">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-accent hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all transform hover:-translate-y-0.5"
          >
            Confirm Rental & Generate Contract Sheet
          </button>
        </div>
      </form>
    </div>
  );
}
