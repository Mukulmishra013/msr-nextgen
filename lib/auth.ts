import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './supabase';

// Secret key for HMAC token signing
const SESSION_SECRET = process.env.ADMIN_SECRET_KEY || 'msr_admin_2026_growth_secure_token_secret_9988';
const CLIENT_ACCOUNTS_FILE = path.join(process.cwd(), 'data', 'client_accounts.json');

export interface ClientAccount {
  id: string;
  name: string;
  businessName: string;
  category: string;
  email: string;
  phone: string;
  passwordHash: string;
  salt: string;
  city?: string;
  createdAt: number;
  orders?: string[];
  onboardingCompleted?: boolean;
}

export interface AuthSession {
  userId: string;
  role: 'admin' | 'client';
  email: string;
  phone?: string;
  name?: string;
  businessName?: string;
  exp: number;
}

function getClientAccountsDb(): Record<string, ClientAccount> {
  try {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(CLIENT_ACCOUNTS_FILE)) {
      fs.writeFileSync(CLIENT_ACCOUNTS_FILE, JSON.stringify({}, null, 2));
      return {};
    }
    const raw = fs.readFileSync(CLIENT_ACCOUNTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveClientAccountsDb(db: Record<string, ClientAccount>): void {
  try {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CLIENT_ACCOUNTS_FILE, JSON.stringify(db, null, 2));
  } catch {
    // Fail silently on serverless read-only filesystems (Vercel)
  }
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'));
  } catch {
    return false;
  }
}

export function signSession(session: Omit<AuthSession, 'exp'>, expiresInSeconds: number = 7 * 24 * 60 * 60): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload: AuthSession = { ...session, exp };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

export function verifySession(token: string | undefined | null): AuthSession | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;

  try {
    const [payloadB64, signature] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadB64)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: AuthSession = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export interface OnboardingEntitlement {
  orderId: string;
  phone: string;
  packageName: string;
  amount: number;
  isManualException?: boolean;
  exceptionReason?: string;
  exp: number;
}

export function signOnboardingToken(entitlement: Omit<OnboardingEntitlement, 'exp'>, expiresInSeconds: number = 24 * 60 * 60): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload: OnboardingEntitlement = { ...entitlement, exp };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`onboard:${payloadB64}`)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

export function verifyOnboardingToken(token: string | undefined | null): OnboardingEntitlement | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;

  try {
    const [payloadB64, signature] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(`onboard:${payloadB64}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: OnboardingEntitlement = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function createClientAccount(params: {
  name: string;
  businessName: string;
  category?: string;
  email: string;
  phone: string;
  password: string;
  city?: string;
}): Promise<{ success: boolean; account?: ClientAccount; error?: string }> {
  const cleanPhone = String(params.phone).replace(/\D/g, '');
  const cleanEmail = params.email.trim().toLowerCase();

  // 1. Check existing in Supabase leads table
  try {
    const { data: existingLead } = await supabaseAdmin
      .from('leads')
      .select('phone, website_url, notes')
      .or(`phone.eq.${cleanPhone},website_url.eq.${cleanEmail}`)
      .limit(1);

    if (existingLead && existingLead.length > 0) {
      // Check if this lead already has a client account with password
      const lead = existingLead[0];
      if (lead.notes) {
        try {
          const parsed = JSON.parse(lead.notes);
          if (parsed.passwordHash) {
            return { success: false, error: 'Is email ya mobile number se account pehle se bana hua hai. Login karein.' };
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('[Supabase Account Check Notice]:', err);
  }

  // Check local file as secondary fallback
  const localDb = getClientAccountsDb();
  const existingLocal = Object.values(localDb).find(
    (a) => a.email.toLowerCase() === cleanEmail || a.phone.replace(/\D/g, '') === cleanPhone
  );
  if (existingLocal) {
    return { success: false, error: 'Is email ya mobile number se account pehle se bana hua hai. Login karein.' };
  }

  const { hash, salt } = hashPassword(params.password);
  const id = `cli_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const account: ClientAccount = {
    id,
    name: params.name.trim(),
    businessName: params.businessName.trim(),
    category: params.category || 'Local Business',
    email: cleanEmail,
    phone: cleanPhone,
    passwordHash: hash,
    salt,
    city: params.city || '',
    createdAt: Date.now(),
    orders: [],
    onboardingCompleted: false,
  };

  // 2. Persist to Supabase leads table (Primary Cloud DB)
  try {
    const { error: upsertErr } = await supabaseAdmin.from('leads').upsert(
      {
        phone: cleanPhone,
        name: account.name,
        business_name: account.businessName,
        category: account.category,
        stage: 'client_account',
        website_url: cleanEmail,
        notes: JSON.stringify(account),
      },
      { onConflict: 'phone' }
    );
    if (upsertErr) {
      console.error('[Supabase Save Error]:', upsertErr);
    }
  } catch (err) {
    console.error('[Supabase Save Exception]:', err);
  }

  // 3. Persist to local file as well
  localDb[id] = account;
  saveClientAccountsDb(localDb);

  return { success: true, account };
}

export async function authenticateClient(
  identifier: string,
  password: string
): Promise<{ success: boolean; account?: ClientAccount; error?: string }> {
  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanPhone = identifier.replace(/\D/g, '');

  let account: ClientAccount | null = null;

  // 1. Search in Supabase leads table
  try {
    let query = supabaseAdmin.from('leads').select('*');
    if (cleanIdentifier.includes('@')) {
      query = query.eq('website_url', cleanIdentifier);
    } else if (cleanPhone && cleanPhone.length >= 10) {
      query = query.eq('phone', cleanPhone);
    } else {
      query = query.or(`phone.eq.${cleanIdentifier},website_url.eq.${cleanIdentifier}`);
    }

    const { data: leads, error } = await query.limit(1);
    if (!error && leads && leads.length > 0) {
      const lead = leads[0];
      if (lead.notes) {
        try {
          const parsed = JSON.parse(lead.notes);
          if (parsed.passwordHash && parsed.salt) {
            account = parsed as ClientAccount;
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('[Supabase Client Auth Notice]:', err);
  }

  // 2. Fallback to local file if not found in Supabase
  if (!account) {
    const db = getClientAccountsDb();
    const local = Object.values(db).find(
      (a) => a.email.toLowerCase() === cleanIdentifier || (cleanPhone && a.phone.replace(/\D/g, '') === cleanPhone)
    );
    if (local) {
      account = local;
    }
  }

  if (!account) {
    return { success: false, error: 'Account nahi mila. Kripya check karein ya naya account banayein.' };
  }

  const isValid = verifyPassword(password, account.passwordHash, account.salt);
  if (!isValid) {
    return { success: false, error: 'Password galat hai. Kripya dobara try karein.' };
  }

  return { success: true, account };
}

export async function getClientAccountById(id: string): Promise<ClientAccount | null> {
  // 1. Check local file
  const localDb = getClientAccountsDb();
  if (localDb[id]) return localDb[id];

  // 2. Check Supabase
  try {
    const { data: leads } = await supabaseAdmin
      .from('leads')
      .select('*')
      .ilike('notes', `%"id":"${id}"%`)
      .limit(1);

    if (leads && leads.length > 0 && leads[0].notes) {
      const parsed = JSON.parse(leads[0].notes);
      return parsed as ClientAccount;
    }
  } catch {}

  return null;
}

export async function getClientAccountByPhone(phone: string): Promise<ClientAccount | null> {
  const cleanPhone = String(phone).replace(/\D/g, '');

  // 1. Check Supabase
  try {
    const { data: leads } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('phone', cleanPhone)
      .limit(1);

    if (leads && leads.length > 0 && leads[0].notes) {
      const parsed = JSON.parse(leads[0].notes);
      if (parsed.passwordHash) {
        return parsed as ClientAccount;
      }
    }
  } catch {}

  // 2. Fallback to local file
  const localDb = getClientAccountsDb();
  return Object.values(localDb).find((a) => a.phone.replace(/\D/g, '') === cleanPhone) || null;
}

export async function linkOrderToClientAccount(clientIdOrPhone: string, orderId: string): Promise<void> {
  const client = (await getClientAccountById(clientIdOrPhone)) || (await getClientAccountByPhone(clientIdOrPhone));
  if (client) {
    if (!client.orders) client.orders = [];
    if (!client.orders.includes(orderId)) {
      client.orders.push(orderId);
      // Persist update in Supabase
      try {
        await supabaseAdmin.from('leads').upsert(
          {
            phone: client.phone,
            notes: JSON.stringify(client),
          },
          { onConflict: 'phone' }
        );
      } catch {}

      // Persist update in local file
      const db = getClientAccountsDb();
      if (db[client.id]) {
        db[client.id] = client;
        saveClientAccountsDb(db);
      }
    }
  }
}
