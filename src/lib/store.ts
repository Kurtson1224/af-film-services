"use client";

import { useEffect, useSyncExternalStore } from "react";
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

type AppStoreState = {
  categories: Category[];
  clients: Client[];
  equipment: Equipment[];
  rentals: Rental[];
  inventoryLogs: InventoryLog[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  userRole: UserRole;
  isLoaded: boolean;
};

const createInitialState = (): AppStoreState => ({
  categories: initialCategories,
  clients: initialClients,
  equipment: initialEquipment,
  rentals: initialRentals,
  inventoryLogs: initialInventoryLogs,
  activityLogs: initialActivityLogs,
  notifications: initialNotifications,
  userRole: "ADMIN",
  isLoaded: false,
});

let storeState = createInitialState();
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const updateStore = (updater: (state: AppStoreState) => AppStoreState) => {
  storeState = updater(storeState);
  emit();
};

const loadFromStorage = () => {
  if (typeof window === "undefined") return;

  try {
    const storedEq = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
    if (storedEq) {
      storeState = { ...storeState, equipment: JSON.parse(storedEq) };
    }

    const storedCat = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (storedCat) {
      storeState = { ...storeState, categories: JSON.parse(storedCat) };
    }

    const storedCli = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (storedCli) {
      storeState = { ...storeState, clients: JSON.parse(storedCli) };
    }

    const storedRen = localStorage.getItem(STORAGE_KEYS.RENTALS);
    if (storedRen) {
      storeState = { ...storeState, rentals: JSON.parse(storedRen) };
    }

    const storedInv = localStorage.getItem(STORAGE_KEYS.INVENTORY_LOGS);
    if (storedInv) {
      storeState = { ...storeState, inventoryLogs: JSON.parse(storedInv) };
    }

    const storedAct = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    if (storedAct) {
      storeState = { ...storeState, activityLogs: JSON.parse(storedAct) };
    }

    const storedNot = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (storedNot) {
      storeState = { ...storeState, notifications: JSON.parse(storedNot) };
    }

    const storedRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    if (storedRole) {
      storeState = { ...storeState, userRole: storedRole as UserRole };
    }
  } catch (e) {
    console.error("Failed to load local storage store", e);
  } finally {
    updateStore((state) => ({ ...state, isLoaded: true }));
  }
};

export function useAppStore() {
  useEffect(() => {
    loadFromStorage();
  }, []);

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const snapshot = useSyncExternalStore(
    subscribe,
    () => storeState,
    () => storeState,
  );

  const saveEquipment = (data: Equipment[]) => {
    updateStore((state) => ({ ...state, equipment: data }));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(data));
    }
  };

  const saveRentals = (data: Rental[]) => {
    updateStore((state) => ({ ...state, rentals: data }));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.RENTALS, JSON.stringify(data));
    }
  };

  const saveClients = (data: Client[]) => {
    updateStore((state) => ({ ...state, clients: data }));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(data));
    }
  };

  const saveRole = (role: UserRole) => {
    updateStore((state) => ({ ...state, userRole: role }));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    }
  };

  const logActivity = (action: string, module: string, details?: string) => {
    const newEntry: ActivityLog = {
      id: "act-" + Date.now(),
      userName: storeState.userRole === "ADMIN" ? "Admin User" : storeState.userRole === "STAFF" ? "Staff Member" : "Client User",
      userRole: storeState.userRole,
      action,
      module,
      details,
      createdAt: new Date().toISOString(),
    };

    updateStore((state) => ({ ...state, activityLogs: [newEntry, ...state.activityLogs] }));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify([newEntry, ...storeState.activityLogs]));
    }
  };

  const logInventoryChange = (
    equipmentId: string,
    equipmentName: string,
    previousQty: number,
    newQty: number,
    action: InventoryLog["action"],
    rentalNumber?: string,
    notes?: string,
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
      userName: storeState.userRole === "ADMIN" ? "Admin User" : "Staff User",
      notes,
      createdAt: new Date().toISOString(),
    };

    updateStore((state) => ({ ...state, inventoryLogs: [newLog, ...state.inventoryLogs] }));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.INVENTORY_LOGS, JSON.stringify([newLog, ...storeState.inventoryLogs]));
    }
  };

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

    updateStore((state) => ({ ...state, notifications: [newNotif, ...state.notifications] }));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([newNotif, ...storeState.notifications]));
    }
  };

  const addEquipment = (eq: Omit<Equipment, "id" | "createdAt" | "updatedAt">) => {
    const newEq: Equipment = {
      ...eq,
      id: "eq-" + Date.now(),
      availableQuantity: eq.quantity - eq.reservedQuantity - eq.damagedQuantity,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateStore((state) => ({ ...state, equipment: [newEq, ...state.equipment] }));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify([newEq, ...storeState.equipment]));
    }

    logActivity("Added Equipment", "Inventory Management", `Added ${newEq.name} (${newEq.equipmentId})`);
  };

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    const currentEquipment = storeState.equipment;
    const updated = currentEquipment.map((item) => {
      if (item.id === id) {
        const next = { ...item, ...updates, updatedAt: new Date().toISOString() };
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
    const target = storeState.equipment.find((e) => e.id === id);
    const updated = storeState.equipment.filter((e) => e.id !== id);
    saveEquipment(updated);
    if (target) {
      logActivity("Deleted Equipment", "Inventory Management", `Deleted ${target.name}`);
    }
  };

  const createRental = (newRentalData: Omit<Rental, "id" | "createdAt" | "updatedAt">) => {
    for (const item of newRentalData.items) {
      const eq = storeState.equipment.find((e) => e.id === item.equipmentId);
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

    const updatedEquipment = storeState.equipment.map((eq) => {
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
          `Reserved ${rentalItem.quantity} units for ${rental.projectName}`,
        );

        if (newAvailable <= 2) {
          addNotification("Low Stock Alert", `${eq.name} stock level is low (${newAvailable} remaining).`, "LOW_STOCK", "/inventory");
        }

        return {
          ...eq,
          availableQuantity: newAvailable,
          reservedQuantity: newReserved,
          status,
        };
      }
      return eq;
    });

    saveEquipment(updatedEquipment);
    saveRentals([rental, ...storeState.rentals]);
    logActivity("Created Rental Order", "Rental Management", `Created ${rental.rentalNumber} for project ${rental.projectName}`);

    return rental;
  };

  const processReturn = (rentalId: string, returnedItems: { equipmentId: string; returnedQty: number; damagedQty: number }[], notes?: string) => {
    const targetRental = storeState.rentals.find((r) => r.id === rentalId);
    if (!targetRental) return;

    let allFullyReturned = true;

    const updatedRentalItems = targetRental.items.map((item) => {
      const ret = returnedItems.find((r) => r.equipmentId === item.equipmentId);
      if (ret) {
        const newReturned = Math.min(item.quantity, item.returnedQuantity + ret.returnedQty);
        const newDamaged = item.damagedQuantity + ret.damagedQty;
        if (newReturned < item.quantity) allFullyReturned = false;
        return { ...item, returnedQuantity: newReturned, damagedQuantity: newDamaged };
      }
      if (item.returnedQuantity < item.quantity) allFullyReturned = false;
      return item;
    });

    const updatedEquipment = storeState.equipment.map((eq) => {
      const ret = returnedItems.find((r) => r.equipmentId === eq.id);
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
          `Returned ${ret.returnedQty} units. Damaged: ${ret.damagedQty}`,
        );

        return {
          ...eq,
          quantity: newTotalQty,
          availableQuantity: restoredAvail,
          reservedQuantity: newReserved,
          damagedQuantity: newDamaged,
          status,
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
    saveRentals(storeState.rentals.map((r) => r.id === rentalId ? updatedRental : r));

    logActivity("Processed Return", "Rental Management", `Returned equipment for rental ${targetRental.rentalNumber}`);
    addNotification("Equipment Returned", `Items for rental ${targetRental.rentalNumber} have been returned.`, "RETURNED", `/rentals/${rentalId}`);
  };

  const addClient = (cli: Omit<Client, "id" | "createdAt" | "updatedAt">) => {
    const newClient: Client = {
      ...cli,
      id: "cli-" + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveClients([newClient, ...storeState.clients]);
    logActivity("Added Client", "Client Management", `Created client profile for ${newClient.name}`);
  };

  const markNotificationRead = (id: string) => {
    const updated = storeState.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    updateStore((state) => ({ ...state, notifications: updated }));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    }
  };

  return {
    isLoaded: snapshot.isLoaded,
    categories: snapshot.categories,
    clients: snapshot.clients,
    equipment: snapshot.equipment,
    rentals: snapshot.rentals,
    inventoryLogs: snapshot.inventoryLogs,
    activityLogs: snapshot.activityLogs,
    notifications: snapshot.notifications,
    userRole: snapshot.userRole,
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
