"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Printer, Download, Film, CheckCircle, Shield, FileText } from "lucide-react";
import { Rental } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { SignaturePad } from "./SignaturePad";
import { useAppStore } from "@/lib/store";

interface PrintableRentalSheetProps {
  rental: Rental;
}

export function PrintableRentalSheet({ rental }: PrintableRentalSheetProps) {
  const { equipment } = useAppStore();
  const printableRef = useRef<HTMLDivElement | null>(null);

  const [clientSig, setClientSig] = useState(rental.clientSignature || "");
  const [companySig, setCompanySig] = useState(rental.companySignature || "");

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      if (!printableRef.current) return;

      const canvas = await html2canvas(printableRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${rental.rentalNumber}_Rental_Sheet.pdf`);
    } catch (e) {
      console.error("PDF Export error", e);
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden on print) */}
      <div className="no-print bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" /> Official Film Rental Contract Sheet
          </h2>
          <p className="text-xs text-slate-500">Rental Sheet Number: <span className="font-mono font-bold text-slate-800">{rental.rentalNumber}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Contract (A4)</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div
        ref={printableRef}
        className="printable-contract bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-card text-slate-900 max-w-4xl mx-auto space-y-6"
      >
        {/* Header Block */}
        <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-accent flex items-center justify-center font-black text-xl shadow-md">
              <Film className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                AF FILM SERVICES
              </h1>
              <p className="text-xs font-bold text-slate-600 tracking-wide uppercase">
                Professional Film Equipment Rental & Production Logistics
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                QC Studio Complex, Diliman, Quezon City • Tel: +63 2 8888 7300 • Email: rentals@affilmservices.ph
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block bg-slate-900 text-white font-mono font-bold text-sm px-3.5 py-1.5 rounded-xl shadow-xs">
              {rental.rentalNumber}
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase mt-2">EQUIPMENT RENTAL SHEET</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">Date: {formatDate(rental.createdAt)}</p>
          </div>
        </div>

        {/* Client & Production Information Grid */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-xs">
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Client & Production</h3>
            <p className="text-sm font-bold text-slate-900">{rental.clientName || "N/A"}</p>
            {rental.clientCompany && <p className="font-semibold text-slate-700">Company: {rental.clientCompany}</p>}
            <p className="text-slate-600">Representative: <span className="font-semibold text-slate-900">{rental.representative || rental.clientName}</span></p>
            <p className="text-slate-600">Phone: {rental.clientPhone || "+63 917 555 0192"}</p>
            <p className="text-slate-600">Email: {rental.clientEmail || "contact@client.ph"}</p>
          </div>

          <div className="space-y-1.5 border-l border-slate-200 pl-6">
            <h3 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Shoot Schedule & Location</h3>
            <p className="text-sm font-bold text-accent">{rental.projectName}</p>
            <p className="text-slate-700 font-medium">Location: {rental.location || "On Location Manila Studio"}</p>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-500 font-semibold block">Shooting Date:</span>
                <span className="font-bold text-slate-900">{formatDate(rental.shootingDate)}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Call Time:</span>
                <span className="font-bold text-slate-900">{rental.callTime || "06:00 AM"}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Pickup Date:</span>
                <span className="font-bold text-slate-900">{formatDate(rental.pickupDate)}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Return Date:</span>
                <span className="font-bold text-slate-900">{formatDate(rental.returnDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Equipment Items Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Itemized Rented Equipment</h3>
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Qty</th>
                <th className="py-2.5 px-3">Equipment ID</th>
                <th className="py-2.5 px-3">Item Description & Accessories</th>
                <th className="py-2.5 px-3 text-right">Daily Rate (₱)</th>
                <th className="py-2.5 px-3 text-right">Subtotal (₱)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rental.items.map((item, idx) => {
                const eqMatch = equipment.find(e => e.id === item.equipmentId);
                return (
                  <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    <td className="py-3 px-3 font-black text-slate-900 text-center">{item.quantity}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">{item.equipmentCode || eqMatch?.equipmentId || `EQ-${idx+1}`}</td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{item.equipmentName}</p>
                      {eqMatch?.notes && <p className="text-[10px] text-slate-500 mt-0.5">{eqMatch.notes}</p>}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
          <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 text-[11px] space-y-1">
            <p className="font-bold text-slate-900 uppercase">Payment Notes & Deposit</p>
            <p className="text-slate-600">Security Deposit: <span className="font-bold text-slate-900">{formatCurrency(rental.deposit)}</span> (Refundable upon inspection)</p>
            {rental.notes && <p className="text-slate-600 italic">Note: {rental.notes}</p>}
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">{formatCurrency(rental.subtotal)}</span>
            </div>
            {rental.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount:</span>
                <span>-{formatCurrency(rental.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>VAT / Tax (12%):</span>
              <span className="font-bold text-slate-900">{formatCurrency(rental.tax)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Security Deposit:</span>
              <span className="font-bold text-slate-900">{formatCurrency(rental.deposit)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-sm font-black text-slate-900">
              <span>GRAND TOTAL:</span>
              <span className="text-accent text-base">{formatCurrency(rental.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-500 space-y-1">
          <h4 className="font-bold text-slate-700 uppercase">Terms & Conditions of Rental Agreement</h4>
          <ol className="list-decimal pl-4 space-y-0.5">
            <li>The Renter assumes full responsibility for all rented equipment from dispatch until physical return and inspection by AF Film Services staff.</li>
            <li>Any loss, theft, or physical damage occurring during the rental period will be charged at full replacement value or certified repair cost.</li>
            <li>Late returns past agreed Return Date will incur a standard daily rental rate penalty per day.</li>
            <li>Equipment must be tested and verified working by Authorized Representative prior to release.</li>
          </ol>
        </div>

        {/* Digital Signatures Block */}
        <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SignaturePad
            label="Client Authorized Representative Signature"
            initialSignature={clientSig}
            onSave={(sig) => setClientSig(sig)}
          />
          <SignaturePad
            label="AF Film Services Dispatcher Signature"
            initialSignature={companySig}
            onSave={(sig) => setCompanySig(sig)}
          />
        </div>
      </div>
    </div>
  );
}
