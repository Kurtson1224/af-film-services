"use client";

import { useState, useEffect } from "react";
import { 
  Equipment, EquipmentStatus, Category, Client, Rental, InventoryLog, ActivityLog, Notification, UserRole 
} from "@/types";
import { 
  initialCategories, initialClients, initialEquipment, initialRentals, 
  initialInventoryLogs, initialActivityLogs, initialNotifications 
} from "./seed-data";

const STORAGE_KEYS = {
  EQUIPMENT: "af_equipment_v1",
  CATEGORIES: "af_categories_v1",
  CLIENTS: "af_clients_v1",
  RENTALS: "af_rentals_v1",
  INVENTORY_LOGS: "af_inventory_logs_v1",
  ACTIVITY_LOGS: "af_activity_logs_v1",
  NOTIFICATIONS: "af_notifications_v1",
  USER_ROLE: "af_user_role_v1",
};

export function useAppStore() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [rentals, setRentals] = useState<Rental[]>(initialRentals);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(initialInventoryLogs);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [userRole, setUserRole] = useState<UserRole>("ADMIN");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedEq = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
      if (storedEq) setEquipment(JSON.parse(storedEq));

      const storedCat = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (storedCat) setCategories(JSON.parse(storedCat));

      const storedCli = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (storedCli) setClients(JSON.parse(storedCli));

      const storedRen = localStorage.getItem(STORAGE_KEYS.RENTALS);
      if (storedRen) setRentals(JSON.parse(storedRen));

      const storedInv = localStorage.getItem(STORAGE_KEYS.INVENTORY_LOGS);
      if (storedInv) setInventoryLogs(JSON.parse(storedInv));

      const storedAct = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
      if (storedAct) setActivityLogs(JSON.parse(storedAct));

      const storedNot = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNot) setNotifications(JSON.parse(storedNot));

      const storedRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
      if (storedRole) setUserRole(storedRole as UserRole);

    } catch (e) {
      console.error("Failed to load local storage store", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to localStorage
  const saveEquipment = (data: Equipment[]) => {
    setEquipment(data);
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(data));
  };

  const saveRentals = (data: Rental[]) => {
    setRentals(data);
    localStorage.setItem(STORAGE_KEYS.RENTALS, JSON.stringify(data));
  };

  const saveClients = (data: Client[]) => {
    setClients(data);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data));
  };

  const saveRole = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  };

  // Add Log Entry
  const logActivity = (action: string, module: string, details?: string) => {
    const newEntry: ActivityLog = {
      id: "act-" + Date.now(),
      userName: userRole === "ADMIN" ? "Admin User" : userRole === "STAFF" ? "Staff Member" : "Client User",
      userRole,
      action,
      module,
      details,
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...activityLogs];
    setActivityLogs(updated);
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(updated));
  };

  // Add Inventory Log
  const logInventoryChange = (
    equipmentId: string, 
    equipmentName: string, 
    previousQty: number, 
    newQty: number, 
    action: InventoryLog["action"], 
    rentalNumber?: string,
    notes?: string
  ) => {
    const newLog: InventoryLog = {
      id: "log-" + Date.now(),
      equipmentId,
      equipmentName,
      previousQuantity: previousQty,
      newQuantity: newQty,
      changeAmount: newQty - previousQty,
      action,
      rentalNumber,
      userName: userRole === "ADMIN" ? "Admin User" : "Staff User",
      notes,
      createdAt: new Date().toISOString(),
    };
    const updated = [newLog, ...inventoryLogs];
    setInventoryLogs(updated);
    localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify(updated));
  };

  // Add Notification
  const addNotification = (title: string, message: string, type: Notification["type"], link?: string) => {
    const newNotif: Notification = {
      id: "notif-" + Date.now(),
      title,
      message,
      type,
      read: false,
      link,
      createdAt: new Date().toISOString(),
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  };

  // Equipment Actions
  const addEquipment = (eq: Omit<Equipment, "id" | "createdAt" | "updatedAt">) => {
    const newEq: Equipment = {
      ...eq,
      id: "eq-" + Date.now(),
      availableQuantity: eq.quantity - eq.reservedQuantity - eq.damagedQuantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newEq, ...equipment];
    saveEquipment(updated);
    logActivity("Added Equipment", "Inventory Management", `Added ${newEq.name} (${newEq.equipmentId})`);
  };

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    const updated = equipment.map((item) => {
      if (item.id === id) {
        const next = { ...item, ...updates, updatedAt: new Date().toISOString() };
        // Enforce inventory bound non-negative
        const available = Math.max(0, next.quantity - next.reservedQuantity - next.damagedQuantity);
        const status: EquipmentStatus = available === 0 ? "OUT_OF_STOCK" : available <= 2 ? "LOW_STOCK" : "AVAILABLE";
        return { ...next, availableQuantity: available, status };
      }
      return item;
    });
    saveEquipment(updated);
    logActivity("Updated Equipment", "Inventory Management", `Updated equipment details for ID ${id}`);
  };

  const deleteEquipment = (id: string) => {
    const target = equipment.find(e => e.id === id);
    const updated = equipment.filter((e) => e.id !== id);
    saveEquipment(updated);
    if (target) {
      logActivity("Deleted Equipment", "Inventory Management", `Deleted ${target.name}`);
    }
  };

  // Rental Actions with Automatic Inventory Tracking
  const createRental = (newRentalData: Omit<Rental, "id" | "createdAt" | "updatedAt">) => {
    // 1. Check for overbooking stock limits
    for (const item of newRentalData.items) {
      const eq = equipment.find(e => e.id === item.equipmentId);
      if (eq) {
        if (item.quantity > eq.availableQuantity) {
          throw new Error(`Insufficient available stock for ${eq.name}! Available: ${eq.availableQuantity}, Requested: ${item.quantity}`);
        }
      }
    }

    const newId = "ren-" + Date.now();
    const rental: Rental = {
      ...newRentalData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Automatically decrease inventory and increase reserved
    const updatedEquipment = equipment.map((eq) => {
      const rentalItem = rental.items.find((ri) => ri.equipmentId === eq.id);
      if (rentalItem) {
        const prevAvailable = eq.availableQuantity;
        const newAvailable = Math.max(0, eq.availableQuantity - rentalItem.quantity);
        const newReserved = eq.reservedQuantity + rentalItem.quantity;
        const status: EquipmentStatus = newAvailable === 0 ? "OUT_OF_STOCK" : newAvailable <= 2 ? "LOW_STOCK" : "AVAILABLE";
        
        logInventoryChange(
          eq.id, 
          eq.name, 
          prevAvailable, 
          newAvailable, 
          "RENTAL_CREATED", 
          rental.rentalNumber,
          `Reserved ${rentalItem.quantity} units for ${rental.projectName}`
        );

        if (newAvailable <= 2) {
          addNotification("Low Stock Alert", `${eq.name} stock level is low (${newAvailable} remaining).`, "LOW_STOCK", "/inventory");
        }

        return {
          ...eq,
          availableQuantity: newAvailable,
          reservedQuantity: newReserved,
          status
        };
      }
      return eq;
    });

    saveEquipment(updatedEquipment);
    const updatedRentals = [rental, ...rentals];
    saveRentals(updatedRentals);
    logActivity("Created Rental Order", "Rental Management", `Created ${rental.rentalNumber} for project ${rental.projectName}`);

    return rental;
  };

  // Return Equipment Workflow (Full, Partial, or Damaged)
  const processReturn = (rentalId: string, returnedItems: { equipmentId: string; returnedQty: number; damagedQty: number }[], notes?: string) => {
    const targetRental = rentals.find(r => r.id === rentalId);
    if (!targetRental) return;

    let allFullyReturned = true;

    const updatedRentalItems = targetRental.items.map((item) => {
      const ret = returnedItems.find(r => r.equipmentId === item.equipmentId);
      if (ret) {
        const newReturned = Math.min(item.quantity, item.returnedQuantity + ret.returnedQty);
        const newDamaged = item.damagedQuantity + ret.damagedQty;
        if (newReturned < item.quantity) allFullyReturned = false;
        return { ...item, returnedQuantity: newReturned, damagedQuantity: newDamaged };
      }
      if (item.returnedQuantity < item.quantity) allFullyReturned = false;
      return item;
    });

    // Restore Inventory Automatically
    const updatedEquipment = equipment.map((eq) => {
      const ret = returnedItems.find(r => r.equipmentId === eq.id);
      if (ret) {
        const prevAvailable = eq.availableQuantity;
        const restoredAvail = eq.availableQuantity + ret.returnedQty;
        const newReserved = Math.max(0, eq.reservedQuantity - (ret.returnedQty + ret.damagedQty));
        const newDamaged = eq.damagedQuantity + ret.damagedQty;
        const newTotalQty = Math.max(0, eq.quantity - ret.damagedQty);
        const status: EquipmentStatus = restoredAvail === 0 ? "OUT_OF_STOCK" : restoredAvail <= 2 ? "LOW_STOCK" : "AVAILABLE";

        logInventoryChange(
          eq.id,
          eq.name,
          prevAvailable,
          restoredAvail,
          ret.damagedQty > 0 ? "DAMAGE_LOGGED" : "RENTAL_RETURNED",
          targetRental.rentalNumber,
          `Returned ${ret.returnedQty} units. Damaged: ${ret.damagedQty}`
        );

        return {
          ...eq,
          quantity: newTotalQty,
          availableQuantity: restoredAvail,
          reservedQuantity: newReserved,
          damagedQuantity: newDamaged,
          status
        };
      }
      return eq;
    });

    const newStatus: Rental["status"] = allFullyReturned ? "RETURNED" : "PICKED_UP";

    const updatedRental: Rental = {
      ...targetRental,
      items: updatedRentalItems,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    saveEquipment(updatedEquipment);
    saveRentals(rentals.map(r => r.id === rentalId ? updatedRental : r));

    logActivity("Processed Return", "Rental Management", `Returned equipment for rental ${targetRental.rentalNumber}`);
    addNotification("Equipment Returned", `Items for rental ${targetRental.rentalNumber} have been returned.`, "RETURNED", `/rentals/${rentalId}`);
  };

  // Client Actions
  const addClient = (cli: Omit<Client, "id" | "createdAt" | "updatedAt">) => {
    const newClient: Client = {
      ...cli,
      id: "cli-" + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newClient, ...clients];
    saveClients(updated);
    logActivity("Added Client", "Client Management", `Created client profile for ${newClient.name}`);
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  };

  return {
    isLoaded,
    categories,
    clients,
    equipment,
    rentals,
    inventoryLogs,
    activityLogs,
    notifications,
    userRole,
    setUserRole: saveRole,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    createRental,
    processReturn,
    addClient,
    markNotificationRead,
  };
}
