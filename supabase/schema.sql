-- AF FILM SERVICES - PRODUCTION SUPABASE POSTGRESQL SCHEMA & POLICIES

-- ENUMS
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'CLIENT');
CREATE TYPE "EquipmentStatus" AS ENUM ('AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'MAINTENANCE');
CREATE TYPE "RentalStatus" AS ENUM ('PENDING', 'RESERVED', 'PICKED_UP', 'RETURNED', 'LATE', 'CANCELLED');
CREATE TYPE "InventoryAction" AS ENUM ('RENTAL_CREATED', 'RENTAL_RETURNED', 'PARTIAL_RETURN', 'MAINTENANCE_ADDED', 'DAMAGE_LOGGED', 'STOCK_ADJUSTMENT');

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role "UserRole" DEFAULT 'STAFF',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    representative TEXT,
    phone TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    address TEXT,
    outstanding_balance NUMERIC(12, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EQUIPMENT TABLE
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    brand TEXT,
    model TEXT,
    serial_number TEXT UNIQUE,
    rental_price NUMERIC(12, 2) NOT NULL,
    daily_price NUMERIC(12, 2) NOT NULL,
    weekly_price NUMERIC(12, 2),
    monthly_price NUMERIC(12, 2),
    quantity INT DEFAULT 1 CHECK (quantity >= 0),
    available_quantity INT DEFAULT 1 CHECK (available_quantity >= 0),
    reserved_quantity INT DEFAULT 0 CHECK (reserved_quantity >= 0),
    damaged_quantity INT DEFAULT 0 CHECK (damaged_quantity >= 0),
    status "EquipmentStatus" DEFAULT 'AVAILABLE',
    image_url TEXT,
    barcode TEXT UNIQUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RENTALS TABLE
CREATE TABLE IF NOT EXISTS rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_number TEXT UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    representative TEXT,
    project_name TEXT NOT NULL,
    location TEXT,
    shooting_date TIMESTAMP WITH TIME ZONE NOT NULL,
    call_time TEXT,
    pickup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status "RentalStatus" DEFAULT 'PENDING',
    subtotal NUMERIC(12, 2) DEFAULT 0.00,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    deposit NUMERIC(12, 2) DEFAULT 0.00,
    tax NUMERIC(12, 2) DEFAULT 0.00,
    grand_total NUMERIC(12, 2) DEFAULT 0.00,
    client_signature TEXT,
    company_signature TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RENTAL ITEMS TABLE
CREATE TABLE IF NOT EXISTS rental_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1 CHECK (quantity > 0),
    returned_quantity INT DEFAULT 0 CHECK (returned_quantity >= 0),
    damaged_quantity INT DEFAULT 0 CHECK (damaged_quantity >= 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RETURNS TABLE
CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    return_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_by TEXT NOT NULL,
    items_returned_count INT DEFAULT 0,
    damaged_count INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'COMPLETED',
    transaction_ref TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INVENTORY LOGS TABLE
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    change_amount INT NOT NULL,
    action "InventoryAction" NOT NULL,
    rental_id UUID REFERENCES rentals(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT NOT NULL,
    user_role "UserRole" DEFAULT 'STAFF',
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'INFO',
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- SAMPLE RLS POLICIES FOR PUBLIC & AUTHENTICATED ACCESS
CREATE POLICY "Allow public read equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Allow authenticated manage equipment" ON equipment FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated manage rentals" ON rentals FOR ALL USING (auth.role() = 'authenticated');

-- AUTOMATIC INVENTORY CHECK TRIGGER PREVENTING OVERBOOKING
CREATE OR REPLACE FUNCTION check_equipment_inventory_bounds()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.available_quantity < 0 THEN
        RAISE EXCEPTION 'Inventory available quantity cannot be negative!';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_inventory_bounds
BEFORE INSERT OR UPDATE ON equipment
FOR EACH ROW EXECUTE FUNCTION check_equipment_inventory_bounds();
