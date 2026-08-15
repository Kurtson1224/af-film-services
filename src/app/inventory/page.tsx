"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  QrCode, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Wrench,
  DollarSign
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Equipment } from "@/types";
import { formatCurrency, getStatusBadgeClass } from "@/lib/utils";
import { EquipmentModal } from "@/components/inventory/EquipmentModal";
import { BarcodeModal } from "@/components/inventory/BarcodeModal";

export default function InventoryPage() {
  const { equipment, categories, deleteEquipment, userRole } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [barcodeModalEquipment, setBarcodeModalEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = setTimeout(() => setToastMessage(null), 2200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Filtering Logic
  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.equipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.model && item.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.serialNumber && item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "ALL" || item.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingEquipment(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name} from equipment inventory?`)) {
      deleteEquipment(id);
    }
  };

  const handleSaved = (message: string) => {
    setToastMessage(message);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toastMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 shadow-lg animate-in fade-in">
            <p className="text-xs font-bold text-emerald-700">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-accent" /> Equipment Inventory Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete inventory tracking, equipment rates, stock bounds, and barcode verification.
          </p>
        </div>

        {userRole !== "CLIENT" && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Equipment</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name, ID, brand, model, serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-xs font-medium text-slate-800 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories ({equipment.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Table Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Equipment ID</th>
                <th className="py-3.5 px-4">Equipment Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Daily Rate (₱)</th>
                <th className="py-3.5 px-4">Weekly / Monthly</th>
                <th className="py-3.5 px-4 text-center">Total / Avail / Res / Dam</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No equipment found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.equipmentId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0">
                            EQ
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{item.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {item.brand || "N/A"} {item.model ? `• ${item.model}` : ""} {item.serialNumber ? `• S/N: ${item.serialNumber}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                        {item.categoryName || "General"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {formatCurrency(item.dailyPrice)}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-600">
                      <div>W: <span className="font-semibold text-slate-800">{formatCurrency(item.weeklyPrice || item.dailyPrice * 5)}</span></div>
                      <div>M: <span className="font-semibold text-slate-800">{formatCurrency(item.monthlyPrice || item.dailyPrice * 18)}</span></div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 font-mono text-[11px]">
                        <span className="font-black text-slate-900" title="Total Fleet Qty">{item.quantity}</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-bold text-emerald-600" title="Available Stock">{item.availableQuantity}</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-bold text-amber-600" title="Reserved/Rented">{item.reservedQuantity}</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-bold text-rose-600" title="Damaged">{item.damagedQuantity}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setBarcodeModalEquipment(item)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="View Barcode / QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5 text-slate-700" />
                        </button>
                        {userRole !== "CLIENT" && (
                          <>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Edit Equipment"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-700" />
                            </button>
                            {userRole === "ADMIN" && (
                              <button
                                onClick={() => handleDelete(item.id, item.name)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                                title="Delete Equipment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Equipment Add/Edit Modal */}
      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingEquipment}
        onSaved={handleSaved}
      />

      {/* Barcode & QR Code Modal */}
      <BarcodeModal
        isOpen={Boolean(barcodeModalEquipment)}
        onClose={() => setBarcodeModalEquipment(null)}
        equipment={barcodeModalEquipment}
      />
    </div>
  );
}
