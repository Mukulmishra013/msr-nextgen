import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

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
  } catch (err) {
    console.error('[Client Accounts Save Error]:', err);
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

export function createClientAccount(params: {
  name: string;
  businessName: string;
  category?: string;
  email: string;
  phone: string;
  password: string;
  city?: string;
}): { success: boolean; account?: ClientAccount; error?: string } {
  const db = getClientAccountsDb();
  const cleanPhone = String(params.phone).replace(/\D/g, '');
  const cleanEmail = params.email.trim().toLowerCase();

  const existing = Object.values(db).find(
    (a) => a.email.toLowerCase() === cleanEmail || a.phone.replace(/\D/g, '') === cleanPhone
  );

  if (existing) {
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

  db[id] = account;
  saveClientAccountsDb(db);
  return { success: true, account };
}

export function authenticateClient(
  identifier: string,
  password: string
): { success: boolean; account?: ClientAccount; error?: string } {
  const db = getClientAccountsDb();
  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanPhone = identifier.replace(/\D/g, '');

  const account = Object.values(db).find(
    (a) => a.email.toLowerCase() === cleanIdentifier || (cleanPhone && a.phone.replace(/\D/g, '') === cleanPhone)
  );

  if (!account) {
    return { success: false, error: 'Account nahi mila. Kripya check karein ya naya account banayein.' };
  }

  const isValid = verifyPassword(password, account.passwordHash, account.salt);
  if (!isValid) {
    return { success: false, error: 'Password galat hai. Kripya dobara try karein.' };
  }

  return { success: true, account };
}

export function getClientAccountById(id: string): ClientAccount | null {
  const db = getClientAccountsDb();
  return db[id] || null;
}

export function getClientAccountByPhone(phone: string): ClientAccount | null {
  const db = getClientAccountsDb();
  const cleanPhone = String(phone).replace(/\D/g, '');
  return Object.values(db).find((a) => a.phone.replace(/\D/g, '') === cleanPhone) || null;
}

export function linkOrderToClientAccount(clientId: string, orderId: string): void {
  const db = getClientAccountsDb();
  if (db[clientId]) {
    if (!db[clientId].orders) db[clientId].orders = [];
    if (!db[clientId].orders?.includes(orderId)) {
      db[clientId].orders?.push(orderId);
      saveClientAccountsDb(db);
    }
  }
}
