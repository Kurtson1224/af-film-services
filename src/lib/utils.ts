import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString?: string | Date): string {
  if (!dateString) return "N/A";
  try {
    const d = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(d, "MMM dd, yyyy");
  } catch (e) {
    return String(dateString);
  }
}

export function formatDateTime(dateString?: string | Date): string {
  if (!dateString) return "N/A";
  try {
    const d = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(d, "MMM dd, yyyy - hh:mm a");
  } catch (e) {
    return String(dateString);
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toUpperCase()) {
    case "AVAILABLE":
    case "RETURNED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "LOW_STOCK":
    case "PENDING":
    case "RESERVED":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "PICKED_UP":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "OUT_OF_STOCK":
    case "LATE":
    case "OVERDUE":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "MAINTENANCE":
    case "CANCELLED":
      return "bg-slate-100 text-slate-700 border-slate-300";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}
