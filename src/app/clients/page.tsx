"use client";

import { useState } from "react";
import { Users, Plus, Search, Phone, Mail, Building, DollarSign, FileText, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Client } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ClientsPage() {
  const { clients, rentals, addClient, userRole } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [representative, setRepresentative] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    addClient({
      name,
      company,
      representative,
      phone,
      email,
      address,
      outstandingBalance: 0,
      notes,
    });

    setName("");
    setCompany("");
    setRepresentative("");
    setPhone("");
    setEmail("");
    setAddress("");
    setNotes("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" /> Client & Production House Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage production studios, director contacts, rental histories, and outstanding balances.
          </p>
        </div>

        {userRole !== "CLIENT" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search client name, company, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-xs font-medium text-slate-800 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent focus:bg-white focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const clientRentals = rentals.filter((r) => r.clientId === client.id || r.clientName === client.name);
          const totalSpent = clientRentals.reduce((sum, r) => sum + r.grandTotal, 0);

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{client.name}</h3>
                    {client.company && (
                      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{client.company}</span>
                      </p>
                    )}
                  </div>
                  <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                    {client.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.representative && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      Rep: <span className="font-semibold text-slate-800">{client.representative}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Rentals</span>
                  <span className="font-bold text-slate-900">{clientRentals.length} orders ({formatCurrency(totalSpent)})</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Balance</span>
                  <span className={`font-bold ${client.outstandingBalance > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    {formatCurrency(client.outstandingBalance)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New Production Client</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client / Studio Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Star Cinema Productions"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company / Org</label>
                  <input
                    type="text"
                    placeholder="ABS-CBN Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Representative</label>
                  <input
                    type="text"
                    placeholder="Direk Cathy"
                    value={representative}
                    onChange={(e) => setRepresentative(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+63 917 555 0192"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="cathy@starcinema.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Office / Billing Address</label>
                <input
                  type="text"
                  placeholder="Quezon City, Metro Manila"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent text-white font-semibold hover:bg-orange-600 shadow-sm"
                >
                  Save Client Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
