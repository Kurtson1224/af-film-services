"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Bell, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  X,
  ExternalLink,
  Film,
  Menu
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { notifications, markNotificationRead, userRole, equipment, rentals, clients } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filter search matches across Equipment, Rentals, Clients
  const matchedEquipment = searchQuery.trim() ? equipment.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.equipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.brand && e.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const matchedRentals = searchQuery.trim() ? rentals.filter(r => 
    r.rentalNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.clientName && r.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const matchedClients = searchQuery.trim() ? clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : [];

  const totalMatches = matchedEquipment.length + matchedRentals.length + matchedClients.length;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 shadow-xs gap-2">
      {/* Mobile Hamburger & Logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1">
          AF FILM <span className="text-[10px] bg-orange-500/10 text-accent font-bold px-1.5 py-0.5 rounded">PRO</span>
        </span>
      </div>

      {/* Left/Center: Quick Search Bar */}
      <div className="relative flex-1 max-w-xs sm:max-w-md lg:max-w-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search equipment, rentals..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchModal(true);
            }}
            onFocus={() => setShowSearchModal(true)}
            className="w-full bg-slate-100/80 hover:bg-slate-100 text-xs font-medium text-slate-800 pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 rounded-xl border border-transparent focus:border-accent focus:bg-white focus:outline-none transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {showSearchModal && searchQuery.trim() && (
          <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-dropdown p-4 z-50 max-h-96 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Search Results ({totalMatches})
              </span>
              <button 
                onClick={() => setShowSearchModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Close
              </button>
            </div>

            {totalMatches === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No matching records found for "{searchQuery}"</p>
            ) : (
              <div className="space-y-3">
                {matchedEquipment.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Equipment</p>
                    {matchedEquipment.slice(0, 3).map((eq) => (
                      <Link
                        key={eq.id}
                        href="/inventory"
                        onClick={() => setShowSearchModal(false)}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-accent">{eq.name}</p>
                          <p className="text-[11px] text-slate-500">{eq.equipmentId} • Qty: {eq.availableQuantity} available</p>
                        </div>
                        <span className="text-xs font-bold text-slate-700">₱{eq.dailyPrice.toLocaleString()}/day</span>
                      </Link>
                    ))}
                  </div>
                )}

                {matchedRentals.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Rental Orders</p>
                    {matchedRentals.slice(0, 3).map((ren) => (
                      <Link
                        key={ren.id}
                        href={`/rentals/${ren.id}`}
                        onClick={() => setShowSearchModal(false)}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-accent">{ren.rentalNumber} - {ren.projectName}</p>
                          <p className="text-[11px] text-slate-500">{ren.clientName} • {ren.status}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-accent" />
                      </Link>
                    ))}
                  </div>
                )}

                {matchedClients.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Clients</p>
                    {matchedClients.slice(0, 3).map((cli) => (
                      <Link
                        key={cli.id}
                        href="/clients"
                        onClick={() => setShowSearchModal(false)}
                        className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-accent">{cli.name}</p>
                          <p className="text-[11px] text-slate-500">{cli.company} • {cli.phone}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {userRole !== "CLIENT" && (
          <Link
            href="/rentals/new"
            className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Rental Order</span>
          </Link>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-200 shadow-dropdown p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-accent" /> System Notifications ({unreadCount} unread)
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No notifications</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        notif.read ? "bg-white border-slate-100" : "bg-amber-50/50 border-amber-100"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {notif.type === "LOW_STOCK" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : notif.type === "DUE_TOMORROW" ? (
                          <Calendar className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                          <p className="text-[11px] text-slate-600 leading-tight mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(notif.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
