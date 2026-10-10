/**
 * Unified Restaurant Store
 * Manages Orders, Loyalty Customers & Manager/Chef WhatsApp Settings
 * Supports In-Memory cache, local file disk, serverless /tmp fallback, and Firestore.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { getFirebaseAdminApp } from '@/lib/firebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';

export interface RestaurantOrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

export interface RestaurantOrder {
  id: string;
  customerName: string;
  phone: string;
  table: string;
  items: RestaurantOrderItem[];
  subtotal: number;
  status: string;
  createdAt: string;
  specialNote?: string;
}

export interface RestaurantCustomer {
  id: string;
  name: string;
  phone: string;
  birthday?: string;
  birthdayDisplay?: string;
  favoriteDish?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisit: string;
  birthdayWishSent: boolean;
  status: string;
  table?: string;
}

export interface RestaurantSettings {
  managerPhone: string;
  chefPhone: string;
  restaurantName: string;
  sendToManager: boolean;
  sendToChef: boolean;
  updatedAt?: number;
}

// -----------------------------------------------------------------------------
// DEFAULT DATA & SEEDS
// -----------------------------------------------------------------------------
const DEFAULT_SETTINGS: RestaurantSettings = {
  managerPhone: '8887521156',
  chefPhone: '7310289091',
  restaurantName: 'The Grand Bistro',
  sendToManager: true,
  sendToChef: true,
  updatedAt: 1790900000000,
};

const SEED_ORDERS: RestaurantOrder[] = [
  {
    id: 'GB-801',
    customerName: 'Rahul Sharma',
    phone: '919519342440',
    table: 'Table 4',
    items: [
      { id: 'p1', name: 'Burrata & Pesto Sourdough Pizza', qty: 1, price: 549 },
      { id: 'd1', name: 'Smoked Virgin Sangria', qty: 2, price: 198 },
    ],
    subtotal: 747,
    status: 'Kitchen Preparing',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    specialNote: 'Less spicy please, birthday guest on table',
  },
];

const SEED_CUSTOMERS: RestaurantCustomer[] = [
  {
    id: 'cust-1',
    name: 'Rahul Sharma',
    phone: '919519342440',
    birthday: '12-10',
    birthdayDisplay: '12 Oct (In 3 Days)',
    favoriteDish: 'Burrata & Pesto Sourdough Pizza',
    totalVisits: 3,
    totalSpent: 3480,
    lastVisit: '2026-10-02',
    birthdayWishSent: false,
    status: 'VIP Regular',
  },
  {
    id: 'cust-2',
    name: 'Priya Verma',
    phone: '918887521156',
    birthday: '09-10',
    birthdayDisplay: 'Today 🎂',
    favoriteDish: 'Molten Belgian Chocolate Lava Cake',
    totalVisits: 5,
    totalSpent: 5890,
    lastVisit: '2026-09-28',
    birthdayWishSent: false,
    status: 'Birthday Today',
  },
  {
    id: 'cust-3',
    name: 'Amit Patel',
    phone: '919876543210',
    birthday: '15-10',
    birthdayDisplay: '15 Oct (In 6 Days)',
    favoriteDish: 'Smoked Butter Chicken Slider Bowl',
    totalVisits: 2,
    totalSpent: 2150,
    lastVisit: '2026-09-20',
    birthdayWishSent: false,
    status: 'Upcoming Birthday',
  },
];

// -----------------------------------------------------------------------------
// IN-MEMORY BUFFERS (Guarantees instant reads & runtime persistence across requests)
// -----------------------------------------------------------------------------
let memoryOrders: RestaurantOrder[] | null = null;
let memoryCustomers: RestaurantCustomer[] | null = null;
let memorySettings: RestaurantSettings | null = null;

// Paths
const PRIMARY_LOYALTY_FILE = path.resolve(process.cwd(), 'data/restaurant-loyalty.json');
const PRIMARY_SETTINGS_FILE = path.resolve(process.cwd(), 'data/restaurant-settings.json');
const TMP_LOYALTY_FILE = path.join(os.tmpdir(), 'restaurant-loyalty.json');
const TMP_SETTINGS_FILE = path.join(os.tmpdir(), 'restaurant-settings.json');

function safeWrite(primaryPath: string, tmpPath: string, content: string) {
  let written = false;
  try {
    const dir = path.dirname(primaryPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(primaryPath, content, 'utf-8');
    written = true;
  } catch {}

  try {
    const tmpDir = path.dirname(tmpPath);
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(tmpPath, content, 'utf-8');
    written = true;
  } catch {}

  return written;
}

function safeRead(primaryPath: string, tmpPath: string): string | null {
  // Read whichever has the most updated / recent content
  let tmpContent: string | null = null;
  let tmpMtime = 0;
  try {
    if (fs.existsSync(tmpPath)) {
      tmpMtime = fs.statSync(tmpPath).mtimeMs;
      tmpContent = fs.readFileSync(tmpPath, 'utf-8');
    }
  } catch {}

  let priContent: string | null = null;
  let priMtime = 0;
  try {
    if (fs.existsSync(primaryPath)) {
      priMtime = fs.statSync(primaryPath).mtimeMs;
      priContent = fs.readFileSync(primaryPath, 'utf-8');
    }
  } catch {}

  if (tmpContent && priContent) {
    return tmpMtime >= priMtime ? tmpContent : priContent;
  }
  return tmpContent || priContent || null;
}

// -----------------------------------------------------------------------------
// INITIALIZER
// -----------------------------------------------------------------------------
function initBuffers() {
  if (memoryOrders === null || memoryCustomers === null) {
    const raw = safeRead(PRIMARY_LOYALTY_FILE, TMP_LOYALTY_FILE);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        memoryOrders = Array.isArray(parsed.orders) ? parsed.orders : [...SEED_ORDERS];
        memoryCustomers = Array.isArray(parsed.customers) ? parsed.customers : [...SEED_CUSTOMERS];
      } catch {
        memoryOrders = [...SEED_ORDERS];
        memoryCustomers = [...SEED_CUSTOMERS];
      }
    } else {
      memoryOrders = [...SEED_ORDERS];
      memoryCustomers = [...SEED_CUSTOMERS];
      safeWrite(PRIMARY_LOYALTY_FILE, TMP_LOYALTY_FILE, JSON.stringify({ orders: memoryOrders, customers: memoryCustomers }, null, 2));
    }
  }

  if (memorySettings === null) {
    const rawSettings = safeRead(PRIMARY_SETTINGS_FILE, TMP_SETTINGS_FILE);
    if (rawSettings) {
      try {
        memorySettings = { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) };
      } catch {
        memorySettings = { ...DEFAULT_SETTINGS };
      }
    } else {
      memorySettings = { ...DEFAULT_SETTINGS };
      safeWrite(PRIMARY_SETTINGS_FILE, TMP_SETTINGS_FILE, JSON.stringify(memorySettings, null, 2));
    }
  }
}

// Persist current memory to disk and Firestore
async function persistLoyaltyData() {
  initBuffers();
  const payload = {
    orders: memoryOrders || [],
    customers: memoryCustomers || [],
  };
  safeWrite(PRIMARY_LOYALTY_FILE, TMP_LOYALTY_FILE, JSON.stringify(payload, null, 2));

  // Sync with Firestore if configured
  try {
    const app = getFirebaseAdminApp();
    if (app) {
      const db = getFirestore(app);
      await db.collection('restaurant').doc('loyalty').set(payload, { merge: true });
    }
  } catch {}
}

async function persistSettingsData() {
  initBuffers();
  const payload = memorySettings || DEFAULT_SETTINGS;
  safeWrite(PRIMARY_SETTINGS_FILE, TMP_SETTINGS_FILE, JSON.stringify(payload, null, 2));

  try {
    const app = getFirebaseAdminApp();
    if (app) {
      const db = getFirestore(app);
      await db.collection('restaurant').doc('settings').set(payload, { merge: true });
    }
  } catch {}
}

// -----------------------------------------------------------------------------
// PUBLIC API
// -----------------------------------------------------------------------------

export async function getRestaurantData(): Promise<{ orders: RestaurantOrder[]; customers: RestaurantCustomer[] }> {
  initBuffers();

  // Re-read latest from disk/tmp if available
  const raw = safeRead(PRIMARY_LOYALTY_FILE, TMP_LOYALTY_FILE);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.orders)) memoryOrders = parsed.orders;
      if (Array.isArray(parsed.customers)) memoryCustomers = parsed.customers;
    } catch {}
  }

  // Try fetching latest from Firestore if available
  try {
    const app = getFirebaseAdminApp();
    if (app) {
      const db = getFirestore(app);
      const snap = await db.collection('restaurant').doc('loyalty').get();
      if (snap.exists) {
        const data = snap.data();
        if (data?.orders) memoryOrders = data.orders;
        if (data?.customers) memoryCustomers = data.customers;
      }
    }
  } catch {}

  return {
    orders: memoryOrders || [],
    customers: memoryCustomers || [],
  };
}

export async function registerOrUpdateGuest(guest: {
  name: string;
  phone?: string;
  birthday?: string;
  table?: string;
}): Promise<RestaurantCustomer> {
  initBuffers();
  const cleanPhone = guest.phone ? String(guest.phone).replace(/[^0-9]/g, '') : '';
  const now = new Date().toISOString();
  const todayStr = now.split('T')[0];

  let existing = memoryCustomers!.find((c) => {
    if (cleanPhone && cleanPhone.length >= 7 && c.phone) {
      return c.phone.includes(cleanPhone.slice(-10));
    }
    return c.name.toLowerCase() === guest.name.trim().toLowerCase();
  });

  if (existing) {
    if (guest.name && guest.name.trim()) existing.name = guest.name.trim();
    if (cleanPhone) existing.phone = cleanPhone;
    if (guest.birthday) {
      existing.birthday = guest.birthday;
      existing.birthdayDisplay = `${guest.birthday} (Saved)`;
    }
    if (guest.table) existing.table = guest.table;
    existing.lastVisit = todayStr;
  } else {
    existing = {
      id: `cust-${Date.now()}`,
      name: guest.name.trim() || 'Valued Guest',
      phone: cleanPhone || 'Walk-in Table Guest',
      birthday: guest.birthday || '',
      birthdayDisplay: guest.birthday ? `${guest.birthday} (Saved)` : 'Not shared',
      favoriteDish: 'Chef Special',
      totalVisits: 1,
      totalSpent: 0,
      lastVisit: todayStr,
      birthdayWishSent: false,
      status: cleanPhone ? 'Registered Guest' : 'Table Browse',
      table: guest.table || 'Table 4',
    };
    memoryCustomers!.unshift(existing);
  }

  await persistLoyaltyData();
  return existing;
}

export async function saveRestaurantOrder(order: {
  customerName: string;
  phone: string;
  table: string;
  items: RestaurantOrderItem[];
  subtotal: number;
  specialNote?: string;
  birthday?: string;
}): Promise<{ order: RestaurantOrder; customer: RestaurantCustomer }> {
  initBuffers();
  const cleanPhone = String(order.phone).replace(/[^0-9]/g, '');
  const orderId = `GB-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date().toISOString();

  const newOrder: RestaurantOrder = {
    id: orderId,
    customerName: order.customerName.trim(),
    phone: cleanPhone,
    table: order.table || 'Table 4',
    items: order.items,
    subtotal: Number(order.subtotal) || 0,
    status: 'Kitchen Preparing',
    createdAt: now,
    specialNote: order.specialNote || '',
  };

  memoryOrders!.unshift(newOrder);

  // Update customer loyalty
  let customer = memoryCustomers!.find((c) => {
    if (cleanPhone && cleanPhone.length >= 7 && c.phone) {
      return c.phone.includes(cleanPhone.slice(-10));
    }
    return c.name.toLowerCase() === order.customerName.trim().toLowerCase();
  });

  if (customer) {
    customer.name = order.customerName.trim();
    customer.totalVisits = (customer.totalVisits || 1) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + newOrder.subtotal;
    customer.lastVisit = now.split('T')[0];
    if (order.birthday) {
      customer.birthday = order.birthday;
      customer.birthdayDisplay = `${order.birthday} (Saved)`;
    }
    if (order.items[0]?.name) customer.favoriteDish = order.items[0].name;
    customer.status = 'Dining Active';
  } else {
    customer = {
      id: `cust-${Date.now()}`,
      name: order.customerName.trim(),
      phone: cleanPhone,
      birthday: order.birthday || '',
      birthdayDisplay: order.birthday ? `${order.birthday} (Saved)` : 'Not shared',
      favoriteDish: order.items[0]?.name || 'Signature Special',
      totalVisits: 1,
      totalSpent: newOrder.subtotal,
      lastVisit: now.split('T')[0],
      birthdayWishSent: false,
      status: 'Dining Active',
      table: order.table || 'Table 4',
    };
    memoryCustomers!.unshift(customer);
  }

  await persistLoyaltyData();
  return { order: newOrder, customer };
}

export async function sendBirthdayWish(customerId: string): Promise<{ success: boolean; customer?: RestaurantCustomer }> {
  initBuffers();
  const customer = memoryCustomers!.find((c) => c.id === customerId);
  if (!customer) return { success: false };

  customer.birthdayWishSent = true;
  await persistLoyaltyData();
  return { success: true, customer };
}

export async function getRestaurantSettings(): Promise<RestaurantSettings> {
  initBuffers();

  let candidate: RestaurantSettings = {
    ...DEFAULT_SETTINGS,
    ...(memorySettings || {}),
  };

  // 1. Check disk / tmp - accept if newer or equal
  const diskRaw = safeRead(PRIMARY_SETTINGS_FILE, TMP_SETTINGS_FILE);
  if (diskRaw) {
    try {
      const diskParsed = JSON.parse(diskRaw);
      if ((diskParsed.updatedAt || 0) >= (candidate.updatedAt || 0)) {
        candidate = { ...candidate, ...diskParsed };
      }
    } catch {}
  }

  // 2. Check Firestore if configured
  try {
    const app = getFirebaseAdminApp();
    if (app) {
      const db = getFirestore(app);
      const snap = await db.collection('restaurant').doc('settings').get();
      if (snap.exists) {
        const firestoreData = snap.data() as RestaurantSettings;
        if ((firestoreData?.updatedAt || 0) >= (candidate.updatedAt || 0)) {
          candidate = { ...candidate, ...firestoreData };
        }
      }
    }
  } catch {}

  memorySettings = candidate;
  return memorySettings;
}

export async function saveRestaurantSettings(newSettings: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
  initBuffers();

  const current = await getRestaurantSettings();
  const updateTimestamp = newSettings.updatedAt || Date.now();

  memorySettings = {
    ...current,
    ...newSettings,
    updatedAt: updateTimestamp,
  };

  // Clean numbers: strip non-digits
  if (memorySettings.managerPhone) {
    memorySettings.managerPhone = memorySettings.managerPhone.replace(/[^0-9]/g, '');
  }
  if (memorySettings.chefPhone) {
    memorySettings.chefPhone = memorySettings.chefPhone.replace(/[^0-9]/g, '');
  }

  await persistSettingsData();
  return memorySettings;
}
