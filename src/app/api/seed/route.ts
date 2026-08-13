import { NextResponse } from "next/server";
import { initialEquipment, initialRentals, initialClients, initialCategories } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "AF Film Services Equipment Rental System Seed Data API",
    data: {
      categories: initialCategories,
      equipment: initialEquipment,
      clients: initialClients,
      rentals: initialRentals,
    },
  });
}
