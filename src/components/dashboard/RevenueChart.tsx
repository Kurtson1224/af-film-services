"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const data = [
  { month: "Jan", revenue: 245000, rentals: 14 },
  { month: "Feb", revenue: 310000, rentals: 18 },
  { month: "Mar", revenue: 420000, rentals: 22 },
  { month: "Apr", revenue: 380000, rentals: 20 },
  { month: "May", revenue: 510000, rentals: 28 },
  { month: "Jun", revenue: 490000, rentals: 26 },
  { month: "Jul", revenue: 680000, rentals: 34 },
];

export function RevenueChart() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Monthly Revenue & Growth Performance
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Film Equipment Rentals income trend (2026)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="w-3 h-3 rounded-full bg-accent inline-block"></span> Revenue (₱)
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748B" }} />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 11, fill: "#64748B" }} 
              tickFormatter={(val) => `₱${val / 1000}k`}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), "Revenue"]}
              contentStyle={{ backgroundColor: "#111827", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#F97316" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
