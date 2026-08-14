"use client";

import { useRef, useState } from "react";
import { Printer, Download, Video, FileText, CheckCircle } from "lucide-react";
import { Rental } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

interface PrintableRentalSheetProps {
  rental: Rental;
}

export function PrintableRentalSheet({ rental }: PrintableRentalSheetProps) {
  const { equipment } = useAppStore();
  const printableRef = useRef<HTMLDivElement | null>(null);

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

  const days = rental.days || 1;
  const equipmentSubtotal = rental.items.reduce((sum, i) => sum + i.subtotal, 0);
  const equipmentTotal = equipmentSubtotal * days;

  const personnelItems = rental.personnelItems || [
    { id: "p1", description: "Caretaker", ratePerDay: 0 }
  ];
  const personnelSubtotal = personnelItems.reduce((sum, p) => sum + (Number(p.ratePerDay) || 0), 0);
  const personnelTotal = rental.personnelTotal ?? (personnelSubtotal * days);

  const transportationItems = rental.transportationItems || [
    { id: "t1", vehicle: "Van / Service Vehicle", ratePerDay: 5000 }
  ];
  const transportationSubtotal = transportationItems.reduce((sum, t) => sum + (Number(t.ratePerDay) || 0), 0);
  const transportationTotal = rental.transportationTotal ?? (transportationSubtotal * days);

  const baseParticularsSum = equipmentTotal + personnelTotal + transportationTotal;
  const whtAmount = rental.whtAmount ?? (baseParticularsSum * 0.05);
  const totalCost = baseParticularsSum + whtAmount;
  const lessWHT = whtAmount;
  const totalNetOfWHT = rental.grandTotal || (totalCost - lessWHT);

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans text-slate-900">
      {/* Top Action Bar (Hidden on print) */}
      <div className="no-print bg-white rounded-2xl p-4 border border-slate-200 shadow-card flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" /> Official Film Rental Contract Sheet
          </h2>
          <p className="text-xs text-slate-500">Rental Order: <span className="font-mono font-bold text-slate-800">{rental.rentalNumber}</span></p>
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
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Contract (A4)</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container (Identical layout to Images 2 & 3) */}
      <div ref={printableRef} className="space-y-8">
        
        {/* PAGE 1 FORMAT (IMAGE 2) */}
        <div className="printable-contract bg-white border-2 border-slate-900 p-6 sm:p-8 shadow-card space-y-6">
          
          {/* Company Header (Image 2 Top) */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex items-start gap-4">
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
                  {rental.rentalNumber}
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
                  <div className="p-2 font-semibold text-slate-900">
                    {rental.clientCompany || rental.clientName || "—"}
                  </div>
                </div>

                <div className="flex items-center bg-white">
                  <span className="w-36 bg-slate-200 p-2 font-bold border-r border-slate-900 text-slate-800 shrink-0">
                    Representative:
                  </span>
                  <div className="p-2 font-semibold text-slate-900">
                    {rental.representative || rental.clientName || "—"}
                  </div>
                </div>

                <div className="flex items-center bg-white">
                  <span className="w-36 bg-slate-200 p-2 font-bold border-r border-slate-900 text-slate-800 shrink-0">
                    Project Name:
                  </span>
                  <div className="p-2 font-semibold text-slate-900">
                    {rental.projectName || "—"}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="divide-y divide-slate-900">
                <div className="flex items-center bg-white">
                  <span className="w-36 bg-slate-200 p-2 font-bold border-r border-slate-900 text-slate-800 shrink-0">
                    Shooting Date:
                  </span>
                  <div className="p-2 font-semibold text-slate-900">
                    {rental.shootingDate ? formatDate(rental.shootingDate) : "—"}
                  </div>
                </div>

                <div className="flex items-center bg-white">
                  <span className="w-36 bg-slate-200 p-2 font-bold border-r border-slate-900 text-slate-800 shrink-0">
                    Location:
                  </span>
                  <div className="p-2 font-semibold text-slate-900">
                    {rental.location || "—"}
                  </div>
                </div>

                <div className="flex items-center bg-white">
                  <span className="w-36 bg-slate-200 p-2 font-bold border-r border-slate-900 text-slate-800 shrink-0">
                    Call Time:
                  </span>
                  <div className="p-2 font-semibold text-slate-900">
                    {rental.callTime || "06:00 AM"}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 1. EQUIPMENT SECTION (Image 2) */}
          <div className="space-y-0">
            <div className="bg-slate-200 border-2 border-slate-900 p-1.5 text-center font-bold text-xs uppercase tracking-widest text-slate-900">
              EQUIPMENT
            </div>

            <div className="border-2 border-t-0 border-slate-900 overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b-2 border-slate-900 font-bold uppercase text-[11px] text-slate-800">
                    <th className="p-2 border-r border-slate-900 text-center w-16">QTY.</th>
                    <th className="p-2 border-r border-slate-900 w-44">UNIT</th>
                    <th className="p-2 border-r border-slate-900">DESCRIPTION</th>
                    <th className="p-2 border-r border-slate-900 text-right w-36">COST PER UNIT</th>
                    <th className="p-2 text-right w-36">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-medium">
                  {rental.items.map((item, index) => (
                    <tr key={item.id || index} className="bg-white">
                      <td className="p-2 border-r border-slate-900 text-center font-bold">{item.quantity}</td>
                      <td className="p-2 border-r border-slate-900 font-bold">{item.equipmentName}</td>
                      <td className="p-2 border-r border-slate-900 text-slate-700">{item.notes || "—"}</td>
                      <td className="p-2 border-r border-slate-900 text-right font-mono">
                        ₱{item.unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-right font-bold font-mono">
                        ₱{item.subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Subtotal Footer */}
              <div className="border-t-2 border-slate-900 bg-white">
                <div className="flex justify-end font-bold text-xs divide-y divide-slate-900">
                  <div className="w-full sm:w-80 divide-y divide-slate-900 border-l border-slate-900">
                    <div className="flex justify-between p-2">
                      <span>Subtotal</span>
                      <span className="font-mono">₱{equipmentSubtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between p-2">
                      <span>Total of Day(s)</span>
                      <span>{days} day(s)</span>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-medium">
                  {personnelItems.map((p) => (
                    <tr key={p.id} className="bg-white">
                      <td className="p-2 border-r border-slate-900 italic">{p.description}</td>
                      <td className="p-2 text-right font-mono font-semibold">
                        ₱{Number(p.ratePerDay).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t-2 border-slate-900 bg-white">
                <div className="flex justify-end font-bold text-xs divide-y divide-slate-900">
                  <div className="w-full sm:w-80 divide-y divide-slate-900 border-l border-slate-900">
                    <div className="flex justify-between p-2">
                      <span>Subtotal</span>
                      <span className="font-mono">₱{personnelSubtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between p-2">
                      <span>Total of Day(s)</span>
                      <span>{days} day(s)</span>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-medium">
                  {transportationItems.map((t) => (
                    <tr key={t.id} className="bg-white">
                      <td className="p-2 border-r border-slate-900">{t.vehicle}</td>
                      <td className="p-2 text-right font-mono font-semibold">
                        ₱{Number(t.ratePerDay).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t-2 border-slate-900 bg-white">
                <div className="flex justify-end font-bold text-xs divide-y divide-slate-900">
                  <div className="w-full sm:w-80 divide-y divide-slate-900 border-l border-slate-900">
                    <div className="flex justify-between p-2">
                      <span>Subtotal</span>
                      <span className="font-mono">₱{transportationSubtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between p-2">
                      <span>Total of Day(s)</span>
                      <span>{days} day(s)</span>
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

        {/* PAGE 2 FORMAT (IMAGE 3) */}
        <div className="printable-contract bg-white border-2 border-slate-900 p-6 sm:p-8 shadow-card space-y-6">

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

      </div>
    </div>
  );
}
