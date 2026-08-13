"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Package, DollarSign, Tag, Info, AlertTriangle } from "lucide-react";
import { Equipment } from "@/types";
import { useAppStore } from "@/lib/store";

const equipmentSchema = z.object({
  equipmentId: z.string().min(2, "Equipment ID is required (e.g. EQ-CAM-001)"),
  name: z.string().min(2, "Equipment Name is required"),
  categoryId: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  dailyPrice: z.number().min(0, "Daily Price must be 0 or greater"),
  weeklyPrice: z.number().optional(),
  monthlyPrice: z.number().optional(),
  quantity: z.number().min(1, "Total Quantity must be at least 1"),
  reservedQuantity: z.number().min(0).default(0),
  damagedQuantity: z.number().min(0).default(0),
  imageUrl: z.string().optional(),
  barcode: z.string().optional(),
  notes: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Equipment | null;
}

export function EquipmentModal({ isOpen, onClose, initialData }: EquipmentModalProps) {
  const { categories, addEquipment, updateEquipment } = useAppStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: initialData
      ? {
          equipmentId: initialData.equipmentId,
          name: initialData.name,
          categoryId: initialData.categoryId,
          brand: initialData.brand || "",
          model: initialData.model || "",
          serialNumber: initialData.serialNumber || "",
          dailyPrice: initialData.dailyPrice,
          weeklyPrice: initialData.weeklyPrice || initialData.dailyPrice * 5,
          monthlyPrice: initialData.monthlyPrice || initialData.dailyPrice * 18,
          quantity: initialData.quantity,
          reservedQuantity: initialData.reservedQuantity,
          damagedQuantity: initialData.damagedQuantity,
          imageUrl: initialData.imageUrl || "",
          barcode: initialData.barcode || "",
          notes: initialData.notes || "",
        }
      : {
          equipmentId: `EQ-${Math.floor(100 + Math.random() * 900)}`,
          name: "",
          categoryId: categories[0]?.id || "",
          brand: "",
          model: "",
          serialNumber: "",
          dailyPrice: 1000,
          weeklyPrice: 5000,
          monthlyPrice: 18000,
          quantity: 1,
          reservedQuantity: 0,
          damagedQuantity: 0,
          imageUrl: "",
          barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          notes: "",
        },
  });

  const watchQty = watch("quantity") || 1;
  const watchRes = watch("reservedQuantity") || 0;
  const watchDam = watch("damagedQuantity") || 0;
  const calculatedAvailable = Math.max(0, watchQty - watchRes - watchDam);

  if (!isOpen) return null;

  const onSubmit = (data: EquipmentFormData) => {
    const selectedCategory = categories.find((c) => c.id === data.categoryId);
    const categoryName = selectedCategory ? selectedCategory.name : "General";

    if (initialData) {
      updateEquipment(initialData.id, {
        ...data,
        rentalPrice: data.dailyPrice,
        categoryName,
      });
    } else {
      addEquipment({
        ...data,
        rentalPrice: data.dailyPrice,
        categoryName,
        availableQuantity: calculatedAvailable,
        status: calculatedAvailable === 0 ? "OUT_OF_STOCK" : calculatedAvailable <= 2 ? "LOW_STOCK" : "AVAILABLE",
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto custom-scrollbar">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-accent">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialData ? "Edit Equipment Item" : "Add New Film Equipment"}
              </h2>
              <p className="text-xs text-slate-500">Configure item details, stock limits, and daily/weekly pricing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment ID *</label>
              <input
                {...register("equipmentId")}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono focus:outline-none focus:border-accent focus:bg-white"
                placeholder="e.g. EQ-CAM-001"
              />
              {errors.equipmentId && <p className="text-[11px] text-rose-500 mt-1">{errors.equipmentId.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                {...register("categoryId")}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:border-accent focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment Full Name *</label>
            <input
              {...register("name")}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-semibold focus:outline-none focus:border-accent focus:bg-white"
              placeholder="e.g. Sony FX3 Full-Frame Cinema Camera"
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
              <input
                {...register("brand")}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-accent focus:bg-white"
                placeholder="e.g. Sony, ARRI, Nanlux"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Model</label>
              <input
                {...register("model")}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-accent focus:bg-white"
                placeholder="e.g. ILME-FX3"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number</label>
              <input
                {...register("serialNumber")}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-accent focus:bg-white font-mono"
                placeholder="e.g. SN-902183"
              />
            </div>
          </div>

          {/* Pricing Row */}
          <div className="bg-orange-50/50 p-3.5 rounded-xl border border-orange-100 space-y-2">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-accent" /> Pricing Rates (PHP ₱)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Daily Rate (₱) *</label>
                <input
                  type="number"
                  step="100"
                  {...register("dailyPrice", { valueAsNumber: true })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Weekly Rate (₱)</label>
                <input
                  type="number"
                  step="500"
                  {...register("weeklyPrice", { valueAsNumber: true })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Monthly Rate (₱)</label>
                <input
                  type="number"
                  step="1000"
                  {...register("monthlyPrice", { valueAsNumber: true })}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Quantities & Inventory Stock Enforcer */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Total Fleet Qty *</label>
              <input
                type="number"
                min="1"
                {...register("quantity", { valueAsNumber: true })}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reserved Qty</label>
              <input
                type="number"
                min="0"
                {...register("reservedQuantity", { valueAsNumber: true })}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-amber-700 focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Damaged Qty</label>
              <input
                type="number"
                min="0"
                {...register("damagedQuantity", { valueAsNumber: true })}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-rose-700 focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Calculated Available</label>
              <div className="w-full text-xs bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-2 font-black text-emerald-800 flex items-center justify-between">
                <span>{calculatedAvailable} units</span>
                {calculatedAvailable === 0 && <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded">OUT</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
              <input
                {...register("imageUrl")}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-accent focus:bg-white"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode / Serial Code</label>
              <input
                {...register("barcode")}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-accent focus:bg-white"
                placeholder="880192837401"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes & Included Accessories</label>
            <textarea
              rows={2}
              {...register("notes")}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-accent focus:bg-white"
              placeholder="e.g. Includes Pelican flight case, power adapter, top handle..."
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-accent hover:bg-orange-600 text-white font-semibold text-xs shadow-sm transition-all"
            >
              {initialData ? "Save Equipment Changes" : "Create Equipment Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
