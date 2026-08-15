import { NextResponse } from "next/server";
import { initialEquipment, initialRentals, initialClients, initialCategories } from "@/lib/seed-data";
import { createClient } from '@supabase/supabase-js';

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action } = body as { action?: string };

    if (action !== 'upsert') {
      return new Response(JSON.stringify({ error: 'Unsupported action' }), { status: 400 });
    }

    const { table, rows } = body as { table?: string; rows?: any[] };
    if (!table || !rows) {
      return new Response(JSON.stringify({ error: 'Missing table or rows in request body' }), { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRole) {
      return new Response(JSON.stringify({ error: 'Server missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL' }), { status: 500 });
    }

    const allowedTables = new Set([
      'equipment',
      'rentals',
      'clients',
      'inventory_logs',
      'activity_logs',
      'notifications',
      'categories',
    ]);

    if (!allowedTables.has(table)) {
      return new Response(JSON.stringify({ error: 'Table not allowed' }), { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false } });

    const { data, error } = await supabase.from(table).upsert(rows, { onConflict: 'id' }).select();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ data }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
}
