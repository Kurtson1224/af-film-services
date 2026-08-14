export type UserRole = 'ADMIN' | 'STAFF' | 'CLIENT';

export type EquipmentStatus = 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'MAINTENANCE';

export type RentalStatus = 'PENDING' | 'RESERVED' | 'PICKED_UP' | 'RETURNED' | 'LATE' | 'CANCELLED';

export type InventoryAction = 
  | 'RENTAL_CREATED'
  | 'RENTAL_RETURNED'
  | 'PARTIAL_RETURN'
  | 'MAINTENANCE_ADDED'
  | 'DAMAGE_LOGGED'
  | 'STOCK_ADJUSTMENT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  representative?: string;
  phone: string;
  email: string;
  address?: string;
  outstandingBalance: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Equipment {
  id: string;
  equipmentId: string; // E.g. EQ-CAM-001
  name: string;
  categoryId: string;
  categoryName?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  rentalPrice: number; // Daily rate default
  dailyPrice: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  quantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
  status: EquipmentStatus;
  imageUrl?: string;
  barcode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentalItem {
  id: string;
  rentalId: string;
  equipmentId: string;
  equipmentName?: string;
  equipmentCode?: string;
  quantity: number;
  returnedQuantity: number;
  damagedQuantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface PersonnelItem {
  id: string;
  description: string;
  ratePerDay: number;
}

export interface TransportationItem {
  id: string;
  vehicle: string;
  ratePerDay: number;
}

export interface Rental {
  id: string;
  rentalNumber: string; // E.g. REN-2026-001
  clientId: string;
  clientName?: string;
  clientCompany?: string;
  clientPhone?: string;
  clientEmail?: string;
  representative?: string;
  projectName: string;
  location?: string;
  shootingDate: string;
  callTime?: string;
  pickupDate: string;
  returnDate: string;
  status: RentalStatus;
  days?: number;
  subtotal: number;
  discount: number;
  deposit: number;
  tax: number;
  grandTotal: number;
  personnelTotal?: number;
  transportationTotal?: number;
  whtAmount?: number;
  personnelItems?: PersonnelItem[];
  transportationItems?: TransportationItem[];
  clientSignature?: string;
  companySignature?: string;
  notes?: string;
  items: RentalItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  previousQuantity: number;
  newQuantity: number;
  changeAmount: number;
  action: InventoryAction;
  rentalId?: string;
  rentalNumber?: string;
  userName: string;
  notes?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'LOW_STOCK' | 'DUE_TOMORROW' | 'OVERDUE' | 'RETURNED' | 'INFO';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalEquipment: number;
  availableEquipment: number;
  currentlyRented: number;
  upcomingReturns: number;
  totalRevenue: number;
  monthlyRentalsCount: number;
}
