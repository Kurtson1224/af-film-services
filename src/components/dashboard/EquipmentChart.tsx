"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { useAppStore } from "@/lib/store";

const COLORS = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#64748B"];

export function EquipmentChart() {
  const { equipment, categories } = useAppStore();

  // Calculate Equipment Category Breakdown
  const categoryCounts = categories.map((cat) => {
    const totalUnits = equipment
      .filter((eq) => eq.categoryId === cat.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    return { name: cat.name, count: totalUnits };
  }).filter((c) => c.count > 0);

  // Top Rented Equipment
  const mostRented = [
    { name: "Sony FX3", rentals: 24 },
    { name: "ARRI Alexa LF", rentals: 18 },
    { name: "Nanlux 720B", rentals: 31 },
    { name: "Cooke Primes", rentals: 15 },
    { name: "Sachtler V18", rentals: 22 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Most Rented Equipment Bar Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Most Rented Equipment</h3>
        <p className="text-xs text-slate-500 mb-4">Top 5 in-demand gear by rental volume</p>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={mostRented} margin={{ left: 20, right: 20, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#334155", fontWeight: 600 }} />
              <Tooltip contentStyle={{ backgroundColor: "#111827", borderRadius: "10px", color: "#fff", fontSize: "12px" }} />
              <Bar dataKey="rentals" fill="#F97316" radius={[0, 8, 8, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Equipment Category Inventory Distribution */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Inventory Category Share</h3>
        <p className="text-xs text-slate-500 mb-4">Equipment distribution across categories</p>

        <div className="h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryCounts}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="count"
              >
                {categoryCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#111827", borderRadius: "10px", color: "#fff", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-[11px] font-medium text-slate-600">
          {categoryCounts.map((cat, idx) => (
            <div key={cat.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
              <span>{cat.name} ({cat.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
