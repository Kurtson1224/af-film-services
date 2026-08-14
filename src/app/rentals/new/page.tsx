"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  ArrowLeft,
  Video,
  FileCheck
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { RentalItem, PersonnelItem, TransportationItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function NewRentalPage() {
  const router = useRouter();
  const { clients, equipment, createRental } = useAppStore();

  const [rentalNumber] = useState(`REN-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || "");
  const [companyName, setCompanyName] = useState(clients[0]?.company || clients[0]?.name || "");
  const [representative, setRepresentative] = useState(clients[0]?.representative || clients[0]?.name || "");
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [shootingDate, setShootingDate] = useState("2026-07-28");
  const [callTime, setCallTime] = useState("06:00 AM");
  const [pickupDate, setPickupDate] = useState("2026-07-27");
  const [returnDate, setReturnDate] = useState("2026-07-30");

  const [numberOfDays, setNumberOfDays] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState("");

  // Selected Equipment Items List (Image 2 - Equipment Table)
  const [equipmentItems, setEquipmentItems] = useState<{
    equipmentId: string;
    unit: string;
    description: string;
    quantity: number;
    costPerUnit: number;
  }[]>([
    {
      equipmentId: equipment[0]?.id || "",
      unit: equipment[0]?.name || "Camera Unit",
      description: equipment[0]?.notes || "Main Camera Body & Accessories",
      quantity: 1,
      costPerUnit: equipment[0]?.dailyPrice || 10000,
    },
  ]);

  // Selected Personnel Items List (Image 2 - Personnel Table)
  const [personnelItems, setPersonnelItems] = useState<PersonnelItem[]>([
    { id: "p-1", description: "Caretaker", ratePerDay: 0 },
  ]);

  // Selected Transportation Items List (Image 2 - Transportation Table)
  const [transportationItems, setTransportationItems] = useState<TransportationItem[]>([
    { id: "t-1", vehicle: "Van / Service Vehicle", ratePerDay: 5000 },
  ]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const matched = clients.find((c) => c.id === clientId);
    if (matched) {
      setCompanyName(matched.company || matched.name);
      setRepresentative(matched.representative || matched.name);
    }
  };

  // --- Equipment Handlers ---
  const handleAddEquipmentRow = () => {
    const defaultEq = equipment[0];
    setEquipmentItems([
      ...equipmentItems,
      {
        equipmentId: defaultEq ? defaultEq.id : "",
        unit: defaultEq ? defaultEq.name : "Equipment",
        description: defaultEq ? (defaultEq.notes || defaultEq.brand || "Standard Accessories") : "",
        quantity: 1,
        costPerUnit: defaultEq ? defaultEq.dailyPrice : 5000,
      },
    ]);
  };

  const handleRemoveEquipmentRow = (index: number) => {
    if (equipmentItems.length > 1) {
      setEquipmentItems(equipmentItems.filter((_, i) => i !== index));
    }
  };

  const handleEquipmentChange = (index: number, field: string, value: any) => {
    const updated = [...equipmentItems];
    if (field === "equipmentId") {
      const eq = equipment.find((e) => e.id === value);
      updated[index] = {
        equipmentId: value,
        unit: eq ? eq.name : "",
        description: eq ? (eq.notes || `${eq.brand || ""} ${eq.model || ""}`.trim()) : "",
        quantity: 1,
        costPerUnit: eq ? eq.dailyPrice : 1000,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setEquipmentItems(updated);
  };

  // --- Personnel Handlers ---
  const handleAddPersonnelRow = () => {
    setPersonnelItems([
      ...personnelItems,
      { id: `p-${Date.now()}`, description: "", ratePerDay: 0 },
    ]);
  };

  const handleRemovePersonnelRow = (index: number) => {
    setPersonnelItems(personnelItems.filter((_, i) => i !== index));
  };

  const handlePersonnelChange = (index: number, field: keyof PersonnelItem, value: any) => {
    const updated = [...personnelItems];
    updated[index] = { ...updated[index], [field]: value };
    setPersonnelItems(updated);
  };

  // --- Transportation Handlers ---
  const handleAddTransportationRow = () => {
    setTransportationItems([
      ...transportationItems,
      { id: `t-${Date.now()}`, vehicle: "Service Vehicle", ratePerDay: 5000 },
    ]);
  };

  const handleRemoveTransportationRow = (index: number) => {
    setTransportationItems(transportationItems.filter((_, i) => i !== index));
  };

  const handleTransportationChange = (index: number, field: keyof TransportationItem, value: any) => {
    const updated = [...transportationItems];
    updated[index] = { ...updated[index], [field]: value };
    setTransportationItems(updated);
  };

  // --- Section Calculations (Matching Images 2 & 3) ---
  const equipmentSubtotal = equipmentItems.reduce((sum, item) => sum + item.quantity * item.costPerUnit, 0);
  const equipmentTotal = equipmentSubtotal * (numberOfDays || 1);

  const personnelSubtotal = personnelItems.reduce((sum, item) => sum + (Number(item.ratePerDay) || 0), 0);
  const personnelTotal = personnelSubtotal * (numberOfDays || 1);

  const transportationSubtotal = transportationItems.reduce((sum, item) => sum + (Number(item.ratePerDay) || 0), 0);
  const transportationTotal = transportationSubtotal * (numberOfDays || 1);

  // Total Production Cost Table calculations (Image 3)
  const baseParticularsSum = equipmentTotal + personnelTotal + transportationTotal;
  const whtAmount = baseParticularsSum * 0.05; // 5% WHT
  const totalCost = baseParticularsSum + whtAmount;
  const lessWHT = whtAmount;
  const totalNetOfWHT = totalCost - lessWHT; // Net amount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!projectName.trim()) {
      setErrorMessage("Please enter a Project Name for this rental order.");
      return;
    }

    try {
      const formattedItems: RentalItem[] = equipmentItems.map((item, idx) => {
        const eqMatch = equipment.find((e) => e.id === item.equipmentId);
        return {
          id: `ri-${Date.now()}-${idx}`,
          rentalId: "",
          equipmentId: item.equipmentId,
          equipmentName: item.unit || eqMatch?.name || "Equipment",
          equipmentCode: eqMatch ? eqMatch.equipmentId : `EQ-${idx + 1}`,
          quantity: item.quantity,
          returnedQuantity: 0,
          damagedQuantity: 0,
          unitPrice: item.costPerUnit,
          subtotal: item.quantity * item.costPerUnit,
          notes: item.description,
        };
      });

      const newRental = createRental({
        rentalNumber,
        clientId: selectedClientId,
        clientName: selectedClient?.name || companyName || "Client",
        clientCompany: companyName,
        clientPhone: selectedClient?.phone,
        clientEmail: selectedClient?.email,
        representative: representative || selectedClient?.representative || companyName,
        projectName,
        location,
        shootingDate,
        callTime,
        pickupDate,
        returnDate,
        status: "RESERVED",
        days: numberOfDays,
        subtotal: equipmentSubtotal,
        discount: 0,
        deposit: 5000,
        tax: whtAmount,
        grandTotal: totalNetOfWHT,
        personnelTotal,
        transportationTotal,
        whtAmount,
        personnelItems,
        transportationItems,
        items: formattedItems,
      });

      router.push(`/rentals/${newRental.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create rental order.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Create Rental Order Sheet</h1>
            <p className="text-xs text-slate-500">Official AF Film Services Equipment Rental Contract Layout</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-3 text-xs text-rose-700 font-semibold shadow-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Order Form (Styled like Images 2 & 3) */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* PAGE 1 CONTENT (IMAGE 2) */}
        <div className="bg-white border-2 border-slate-900 p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Company Header (Image 2 Top) */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-start gap-4">
                {/* Logo Box */}
                <div className="w-16 h-16 bg-slate-900 text-white flex flex-col items-center justify-center rounded-sm shrink-0">
                  <Video className="w-8 h-8 text-white" />
                  <span className="text-[8px] tracking-widest font-mono uppercase mt-0.5">AF FILM</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-wider text-slate-900 uppercase">
                    AF FILM SERVICES
                  </h1>
                  <p className="text-xs font-bold tracking-widest text-slate-700 uppercase">
                    CAMERAS | LIGHTS | GRIPS
                  </p>
                  <p className="text-[11px] text-slate-600 mt-2 font-medium">
                    1261 J. De Jesus st. Parada Santa Maria Bulacan
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    (0917) 515 5734 | a.vidfilmproduction@gmail.com
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="border-2 border-slate-900 px-3 py-1 bg-slate-100 font-mono font-bold text-xs inline-block">
                  {rentalNumber}
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">EQUIPMENT RENTAL ORDER</p>
              </div>
            </div>
          </div>

          {/* Client & Production Details Table (Image 2 Top Table) */}
          <div className="border-2 border-slate-900 overflow-hidden text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-900">
              
              {/* Left Column */}
              <div className="divide-y divide-slate-900">
                <div className="flex items-center bg-white">
                  <span className="w-36 bg-slate-200 p-2 font-bold border-r border-slate-900 text-slate-800 shrink-0">
                    Company Name:
                  </span>
                  <div className="p-1.5 flex-1 flex gap-2">
                    <select
                      value={selectedClientId}
                      onChange={(e) => handleClientChange(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-slate-300 p-1 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.company ? `${c.company} (${c.name})` : c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center bg-white">
                  <span className="w-36 bg-slate-200 p-2 font-bold border-r border-slate-900 text-slate-800 shrink-0">
                    Representative:
                  </span>
                  <input
                    type="text"
                    value={representative}
                    onChange={(e) => setRepresentative(e.target.value)}
                    placeholder="Representative Name"
                    className="w-full p-2 font-semibold bg-white focus:outline-none text-xs"
                  />
                </div>

                <div className="flex items-center bg-white">
                  <span className="w-36 bg-slate-200 p-2 font-bold border-r border-slate-900 text-slate-800 shrink-0">
                    Project Name:
                  </span>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. Subic Feature Film"
                    className="w-full p-2 font-semibold bg-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="divide-y divide-slate-900">
                <div className="flex items-center bg-white">
                  <span className="w-36 bg-slate-200 p-2 font-bold border-r border-slate-900 text-slate-800 shrink-0">
                    Shooting Date:
                  </span>
                  <input
                    type="date"
                    value={shootingDate}
                    onChange={(e) => setShootingDate(e.target.value)}
                    className="w-full p-1.5 font-semibold bg-white focus:outline-none text-xs"
                  />
                </div>

                <div className="flex items-center bg-white">
                  <span className="w-36 bg-slate-200 p-2 font-bold border-r border-slate-900 text-slate-800 shrink-0">
                    Location:
                  </span>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Shoot Location"
                    className="w-full p-2 font-semibold bg-white focus:outline-none text-xs"
                  />
                </div>

                <div className="flex items-center bg-white">
                  <span className="w-36 bg-slate-200 p-2 font-bold border-r border-slate-900 text-slate-800 shrink-0">
                    Call Time:
                  </span>
                  <input
                    type="text"
                    value={callTime}
                    onChange={(e) => setCallTime(e.target.value)}
                    placeholder="06:00 AM"
                    className="w-full p-2 font-semibold bg-white focus:outline-none text-xs"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* 1. EQUIPMENT SECTION (Image 2) */}
          <div className="space-y-0">
            {/* Section Banner Header */}
            <div className="bg-slate-200 border-2 border-slate-900 p-1.5 text-center font-bold text-xs uppercase tracking-widest text-slate-900">
              EQUIPMENT
            </div>

            {/* Equipment Table */}
            <div className="border-2 border-t-0 border-slate-900 overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b-2 border-slate-900 font-bold uppercase text-[11px] text-slate-800">
                    <th className="p-2 border-r border-slate-900 text-center w-16">QTY.</th>
                    <th className="p-2 border-r border-slate-900 w-44">UNIT</th>
                    <th className="p-2 border-r border-slate-900">DESCRIPTION</th>
                    <th className="p-2 border-r border-slate-900 text-right w-36">COST PER UNIT</th>
                    <th className="p-2 text-right w-36">TOTAL</th>
                    <th className="p-2 w-10 no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-medium">
                  {equipmentItems.map((item, index) => {
                    const eqMatch = equipment.find((e) => e.id === item.equipmentId);
                    const maxAvailable = eqMatch ? eqMatch.availableQuantity : 10;
                    const isOverbooked = item.quantity > maxAvailable;

                    return (
                      <tr key={index} className="bg-white hover:bg-slate-50">
                        <td className="p-1 border-r border-slate-900 text-center align-top">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleEquipmentChange(index, "quantity", parseInt(e.target.value) || 1)}
                            className={`w-12 text-center p-1 font-bold border rounded focus:outline-none ${
                              isOverbooked ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-300"
                            }`}
                          />
                        </td>
                        <td className="p-1 border-r border-slate-900 align-top">
                          <select
                            value={item.equipmentId}
                            onChange={(e) => handleEquipmentChange(index, "equipmentId", e.target.value)}
                            className="w-full p-1 font-bold bg-white border border-slate-300 rounded text-xs focus:outline-none"
                          >
                            {equipment.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1 border-r border-slate-900 align-top">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleEquipmentChange(index, "description", e.target.value)}
                            placeholder="Specification / Accessories"
                            className="w-full p-1 bg-transparent focus:outline-none text-xs"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-900 text-right align-top">
                          <div className="flex items-center justify-end">
                            <span className="text-slate-500 font-mono mr-1">₱</span>
                            <input
                              type="number"
                              step="100"
                              value={item.costPerUnit}
                              onChange={(e) => handleEquipmentChange(index, "costPerUnit", parseFloat(e.target.value) || 0)}
                              className="w-24 text-right p-1 font-semibold border border-slate-300 rounded focus:outline-none text-xs"
                            />
                          </div>
                        </td>
                        <td className="p-2 text-right font-bold text-slate-900 align-top font-mono">
                          ₱{(item.quantity * item.costPerUnit).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-1 text-center no-print align-top">
                          {equipmentItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveEquipmentRow(index)}
                              className="p-1 text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Add Equipment Row Action */}
              <div className="p-2 bg-slate-50 border-t border-slate-900 no-print flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleAddEquipmentRow}
                  className="flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-orange-600"
                >
                  <Plus className="w-4 h-4" /> Add Equipment Item
                </button>
              </div>

              {/* Equipment Subtotal Footer (Image 2) */}
              <div className="border-t-2 border-slate-900 bg-white">
                <div className="flex justify-end font-bold text-xs divide-y divide-slate-900 border-l border-slate-900">
                  <div className="w-full sm:w-80 divide-y divide-slate-900">
                    <div className="flex justify-between p-2">
                      <span>Subtotal</span>
                      <span className="font-mono">₱{equipmentSubtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between p-2 items-center">
                      <span>Total of Day(s)</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={numberOfDays}
                          onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 1)}
                          className="w-12 text-center border border-slate-400 p-0.5 font-bold"
                        />
                        <span>day(s)</span>
                      </div>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-100 font-extrabold text-sm">
                      <span>Grand Total</span>
                      <span className="font-mono text-slate-900">
                        ₱{equipmentTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. PERSONNEL SECTION (Image 2) */}
          <div className="space-y-0">
            <div className="bg-slate-200 border-2 border-slate-900 p-1.5 text-center font-bold text-xs uppercase tracking-widest text-slate-900">
              PERSONNEL
            </div>

            <div className="border-2 border-t-0 border-slate-900 overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b-2 border-slate-900 font-bold uppercase text-[11px] text-slate-800">
                    <th className="p-2 border-r border-slate-900">DESCRIPTION</th>
                    <th className="p-2 text-right w-56">RATE PER DAY</th>
                    <th className="p-2 w-10 no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-medium">
                  {personnelItems.map((item, index) => (
                    <tr key={item.id} className="bg-white">
                      <td className="p-1 border-r border-slate-900">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handlePersonnelChange(index, "description", e.target.value)}
                          placeholder="e.g. Caretaker, Camera Tech"
                          className="w-full p-1 italic focus:outline-none text-xs"
                        />
                      </td>
                      <td className="p-1 text-right">
                        <div className="flex items-center justify-end">
                          <span className="text-slate-500 font-mono mr-1">₱</span>
                          <input
                            type="number"
                            step="100"
                            value={item.ratePerDay}
                            onChange={(e) => handlePersonnelChange(index, "ratePerDay", parseFloat(e.target.value) || 0)}
                            className="w-32 text-right p-1 font-semibold border border-slate-300 rounded focus:outline-none text-xs"
                          />
                        </div>
                      </td>
                      <td className="p-1 text-center no-print">
                        <button
                          type="button"
                          onClick={() => handleRemovePersonnelRow(index)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-2 bg-slate-50 border-t border-slate-900 no-print">
                <button
                  type="button"
                  onClick={handleAddPersonnelRow}
                  className="flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-orange-600"
                >
                  <Plus className="w-4 h-4" /> Add Personnel
                </button>
              </div>

              {/* Personnel Subtotal Footer (Image 2) */}
              <div className="border-t-2 border-slate-900 bg-white">
                <div className="flex justify-end font-bold text-xs divide-y divide-slate-900">
                  <div className="w-full sm:w-80 divide-y divide-slate-900">
                    <div className="flex justify-between p-2">
                      <span>Subtotal</span>
                      <span className="font-mono">₱{personnelSubtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between p-2">
                      <span>Total of Day(s)</span>
                      <span>{numberOfDays} day(s)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-100 font-extrabold text-xs">
                      <span>Total</span>
                      <span className="font-mono">₱{personnelTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. TRANSPORTATION SECTION (Image 2) */}
          <div className="space-y-0">
            <div className="bg-slate-200 border-2 border-slate-900 p-1.5 text-center font-bold text-xs uppercase tracking-widest text-slate-900">
              TRANSPORTATION
            </div>

            <div className="border-2 border-t-0 border-slate-900 overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b-2 border-slate-900 font-bold uppercase text-[11px] text-slate-800">
                    <th className="p-2 border-r border-slate-900">VEHICLE</th>
                    <th className="p-2 text-right w-56">RATE PER DAY</th>
                    <th className="p-2 w-10 no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-medium">
                  {transportationItems.map((item, index) => (
                    <tr key={item.id} className="bg-white">
                      <td className="p-1 border-r border-slate-900">
                        <input
                          type="text"
                          value={item.vehicle}
                          onChange={(e) => handleTransportationChange(index, "vehicle", e.target.value)}
                          placeholder="e.g. Van / Service Vehicle"
                          className="w-full p-1 focus:outline-none text-xs"
                        />
                      </td>
                      <td className="p-1 text-right">
                        <div className="flex items-center justify-end">
                          <span className="text-slate-500 font-mono mr-1">₱</span>
                          <input
                            type="number"
                            step="100"
                            value={item.ratePerDay}
                            onChange={(e) => handleTransportationChange(index, "ratePerDay", parseFloat(e.target.value) || 0)}
                            className="w-32 text-right p-1 font-semibold border border-slate-300 rounded focus:outline-none text-xs"
                          />
                        </div>
                      </td>
                      <td className="p-1 text-center no-print">
                        <button
                          type="button"
                          onClick={() => handleRemoveTransportationRow(index)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-2 bg-slate-50 border-t border-slate-900 no-print">
                <button
                  type="button"
                  onClick={handleAddTransportationRow}
                  className="flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-orange-600"
                >
                  <Plus className="w-4 h-4" /> Add Vehicle
                </button>
              </div>

              {/* Transportation Subtotal Footer (Image 2) */}
              <div className="border-t-2 border-slate-900 bg-white">
                <div className="flex justify-end font-bold text-xs divide-y divide-slate-900">
                  <div className="w-full sm:w-80 divide-y divide-slate-900">
                    <div className="flex justify-between p-2">
                      <span>Subtotal</span>
                      <span className="font-mono">₱{transportationSubtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between p-2">
                      <span>Total of Day(s)</span>
                      <span>{numberOfDays} day(s)</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-100 font-extrabold text-xs">
                      <span>Total</span>
                      <span className="font-mono">₱{transportationTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* PAGE 2 CONTENT (IMAGE 3) */}
        <div className="bg-white border-2 border-slate-900 p-6 sm:p-8 shadow-xl space-y-6">

          {/* 4. TOTAL PRODUCTION COST SECTION (Image 3 Top) */}
          <div className="space-y-0">
            <div className="bg-slate-200 border-2 border-slate-900 p-1.5 text-center font-bold text-xs uppercase tracking-widest text-slate-900">
              TOTAL PRODUCTION COST
            </div>

            <div className="border-2 border-t-0 border-slate-900 overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b-2 border-slate-900 font-bold uppercase text-[11px] text-slate-800">
                    <th className="p-2 border-r border-slate-900">PARTICULAR</th>
                    <th className="p-2 text-right w-56">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-medium">
                  <tr className="bg-white">
                    <td className="p-2 border-r border-slate-900 italic">Equipment</td>
                    <td className="p-2 text-right font-mono font-semibold">
                      ₱{equipmentTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2 border-r border-slate-900 italic">Personnel</td>
                    <td className="p-2 text-right font-mono font-semibold">
                      ₱{personnelTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2 border-r border-slate-900 italic">Transportation</td>
                    <td className="p-2 text-right font-mono font-semibold">
                      ₱{transportationTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2 border-r border-slate-900 italic">WHT (5%)</td>
                    <td className="p-2 text-right font-mono font-semibold">
                      ₱{whtAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-white font-bold">
                    <td className="p-2 border-r border-slate-900 italic">Total</td>
                    <td className="p-2 text-right font-mono">
                      ₱{totalCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2 border-r border-slate-900 italic">Less WHT</td>
                    <td className="p-2 text-right font-mono font-semibold text-rose-600">
                      -₱{lessWHT.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  {/* Highlighted Yellow Total Net Row (Image 3) */}
                  <tr className="bg-[#fff200] font-black text-slate-900 text-sm">
                    <td className="p-2.5 border-r border-slate-900 italic">Total net of WHT</td>
                    <td className="p-2.5 text-right font-mono text-base">
                      ₱{totalNetOfWHT.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. TERMS AND CONDITIONS (Image 3 Middle) */}
          <div className="space-y-2 text-[11px] text-slate-800 leading-relaxed font-sans border-t-2 border-slate-900 pt-4">
            <h3 className="font-bold text-xs uppercase tracking-wide text-slate-900">
              TERMS AND CONDITIONS:
            </h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                There will be <span className="text-red-600 font-bold italic">NO REFUNDS</span> for unused equipment.
              </li>
              <li>
                Upon rental, the client is responsible for the safety and proper handling of the equipment. Any damage or loss caused by negligence will result in repair or replacement charges.
              </li>
              <li>
                A <span className="text-red-600 font-bold italic">50% downpayment</span> is required before equipment can be handed over for pickup. Payment can be made through the following channels: Gcash, or Bank Transfer. Renters must provide valid proof of payment and send it to our email.
              </li>
              <li>
                All of the equipment prices are <span className="text-red-600 font-bold">tax free</span>. An <span className="text-red-600 font-bold">additional 5%</span> of the total net will be added for the issuance of official receipt.
              </li>
              <li>
                <span className="text-red-600 font-bold italic">Equipment rent</span> is good for 24 hours only. Overtime usage will result in additional charges.
              </li>
              <li>
                We do not keep <span className="text-red-600 font-bold italic">backups</span>. All <span className="text-red-600 font-bold italic">files</span> or <span className="text-red-600 font-bold italic">media</span> will be deleted after return.
              </li>
              <li>
                <span className="text-red-600 font-bold italic">Toll fee</span> and <span className="text-red-600 font-bold italic">fuel</span> inclusive for transportation. <span className="text-red-600 font-bold italic">Parking fee</span> not included.
              </li>
              <li>
                <span className="text-red-600 font-bold italic">Working hours</span> shall begin at call time and end at pack-up. Any time worked beyond <span className="text-red-600 font-bold italic">14 hours</span> will be subject to an <span className="text-red-600 font-bold italic">overtime fee</span> of ₱150.00 per hour.
              </li>
              <li>
                <span className="text-red-600 font-bold italic">Food</span> and <span className="text-red-600 font-bold italic">lodging</span> of the crew should be provided by the client.
              </li>
              <li>
                A <span className="text-red-600 font-bold italic">3% penalty fee</span> shall be imposed on each instance of delayed payment (every <span className="text-red-600 font-bold italic">succeeding five (5) calendar days of delay</span> until full payment is made).
              </li>
            </ol>
          </div>

          {/* 6. Bank Details & Signatures Block (Image 3 Bottom) */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
            {/* Bank Details */}
            <div className="space-y-3 font-sans">
              <div>
                <p className="font-semibold text-slate-900">Bank Details:</p>
                <div className="pl-4 text-slate-700">
                  <p className="italic">Bank: PNB</p>
                  <p>Account Number: <span className="text-red-600 font-semibold font-mono">2012 1027 0850</span></p>
                  <p>Account Name: <span className="text-red-600 font-semibold italic">Angelo O. Fernando</span></p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-900">Gcash:</p>
                <div className="pl-4 text-slate-700">
                  <p>Account Name: <span className="text-red-600 font-semibold italic">Angelo O. Fernando</span></p>
                  <p>Account Number: <span className="text-red-600 font-semibold font-mono">0917-515-5734</span></p>
                </div>
              </div>
            </div>

            {/* Signatures (Image 3) */}
            <div className="flex flex-col justify-between space-y-8 pt-4 sm:pt-0">
              <div>
                <div className="border-b border-slate-900 w-full mb-1"></div>
                <p className="text-[11px] font-bold text-slate-900">Conforme: <span className="font-normal text-slate-600">Renter's Signature over Printed Name</span></p>
              </div>

              <div className="text-right">
                <div className="inline-block text-center relative">
                  {/* Signature Graphic simulated */}
                  <div className="font-script text-lg font-bold text-slate-800 -mb-2 italic opacity-80">
                    A. Fernando
                  </div>
                  <div className="border-b border-slate-900 w-56 mb-1"></div>
                  <p className="text-xs font-bold uppercase text-slate-900">Prepared by: ANGELO FERNANDO</p>
                  <p className="text-[11px] text-slate-600">Managing Director</p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Submit Actions Bottom */}
        <div className="flex items-center justify-end gap-4 no-print">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            <span>Confirm Rental & Generate Contract Sheet</span>
          </button>
        </div>

      </form>
    </div>
  );
}
