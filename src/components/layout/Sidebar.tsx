"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  PlusCircle, 
  Users, 
  Calendar, 
  Wrench, 
  BarChart3, 
  History, 
  Shield, 
  Film,
  ChevronDown
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { UserRole } from "@/types";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { userRole, setUserRole } = useAppStore();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "STAFF", "CLIENT"] },
    { name: "Inventory", href: "/inventory", icon: Package, roles: ["ADMIN", "STAFF", "CLIENT"] },
    { name: "Rental Orders", href: "/rentals", icon: FileText, roles: ["ADMIN", "STAFF", "CLIENT"] },
    { name: "Create Rental", href: "/rentals/new", icon: PlusCircle, roles: ["ADMIN", "STAFF"] },
    { name: "Clients", href: "/clients", icon: Users, roles: ["ADMIN", "STAFF"] },
    { name: "Schedule / Timeline", href: "/schedule", icon: Calendar, roles: ["ADMIN", "STAFF", "CLIENT"] },
    { name: "Maintenance & Damage", href: "/maintenance", icon: Wrench, roles: ["ADMIN", "STAFF"] },
    { name: "Reports & Analytics", href: "/reports", icon: BarChart3, roles: ["ADMIN"] },
    { name: "Audit & Inventory Logs", href: "/logs", icon: History, roles: ["ADMIN"] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`w-64 bg-[#111827] text-white flex flex-col h-screen fixed lg:sticky top-0 left-0 border-r border-slate-800 z-50 lg:z-30 shadow-2xl lg:shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-accent to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
                AF FILM <span className="text-accent text-xs px-1.5 py-0.5 rounded bg-orange-500/20 font-semibold border border-orange-500/30">PRO</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Equipment Rental System</p>
            </div>
          </div>

          {/* Close button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
            </button>
          )}
        </div>

        {/* Role Switcher */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1">
              <Shield className="w-3 h-3 text-accent" /> Active Access Role
            </span>
          </div>
          <div className="relative">
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="w-full bg-slate-800 text-xs font-semibold text-slate-200 py-2 px-3 pr-8 rounded-lg border border-slate-700 focus:outline-none focus:border-accent cursor-pointer appearance-none"
            >
              <option value="ADMIN">Administrator (Full Access)</option>
              <option value="STAFF">Staff Member (Rentals & Gear)</option>
              <option value="CLIENT">Client View (Quotations & Gear)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 custom-scrollbar overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Main Modules
          </div>
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-accent text-white shadow-md shadow-orange-500/20 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-white">
            {userRole === "ADMIN" ? "AD" : userRole === "STAFF" ? "ST" : "CL"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {userRole === "ADMIN" ? "Production Admin" : userRole === "STAFF" ? "Rental Staff" : "Client Portal"}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {userRole === "ADMIN" ? "admin@affilmservices.com" : userRole === "STAFF" ? "staff@affilmservices.com" : "client@starcinema.ph"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
