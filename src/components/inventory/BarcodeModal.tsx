"use client";

import { useState } from "react";
import { X, QrCode, Camera, Check, Copy, Package } from "lucide-react";
import { Equipment } from "@/types";

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
}

export function BarcodeModal({ isOpen, onClose, equipment }: BarcodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  if (!isOpen || !equipment) return null;

  const barcodeValue = equipment.barcode || equipment.equipmentId;

  const handleCopy = () => {
    navigator.clipboard.writeText(barcodeValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedResult(`VERIFIED: ${equipment.equipmentId} - ${equipment.name}`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-bold text-slate-900">Equipment Barcode & QR Code</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
            {/* Visual Simulated QR / Barcode SVG */}
            <div className="w-48 h-48 bg-white p-3 rounded-xl border border-slate-300 flex flex-col items-center justify-center mx-auto shadow-xs">
              <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-slate-900 rounded">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${
                      (i * 7 + barcodeValue.length) % 3 === 0
                        ? "bg-white"
                        : (i * 3) % 2 === 0
                        ? "bg-accent"
                        : "bg-slate-900"
                    } rounded-xs transition-colors`}
                  />
                ))}
              </div>
            </div>
            <p className="font-mono text-xs font-bold text-slate-800 tracking-wider mt-3">
              {barcodeValue}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">{equipment.name}</h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{equipment.equipmentId} • Serial: {equipment.serialNumber || "N/A"}</p>
          </div>

          {/* Scanner Simulation */}
          <div className="bg-slate-900 rounded-xl p-4 text-white text-left space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-accent" /> Warehouse Scan Mode
              </span>
              <button
                onClick={simulateScan}
                disabled={isScanning}
                className="px-3 py-1 bg-accent hover:bg-orange-600 text-white rounded-lg font-bold text-[11px] transition-colors"
              >
                {isScanning ? "Scanning..." : "Simulate Scan"}
              </button>
            </div>

            {isScanning ? (
              <div className="h-10 border border-dashed border-amber-500/50 bg-amber-500/10 rounded-lg flex items-center justify-center text-xs text-amber-300 animate-pulse font-mono">
                Scanning barcode laser reader...
              </div>
            ) : scannedResult ? (
              <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{scannedResult}</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">Scan tag on equipment box for quick check-out or check-in verification.</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Code" : "Copy Code"}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
