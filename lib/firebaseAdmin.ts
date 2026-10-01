/**
 * Firebase Admin & Firestore Store for Leads, Brands & Case Studies
 */

import { LeadSubmission, LeadRecord, BrandClient, CaseStudyStat } from '@/types';
import { MANAGED_BRANDS, CASE_STUDY_AMPARO } from '@/lib/config';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// In-memory buffers for development / fallback mode
let devLeadsBuffer: LeadRecord[] = [];
let devBrandsBuffer: BrandClient[] = [...MANAGED_BRANDS];
let devCaseStudyStats: CaseStudyStat[] = [...CASE_STUDY_AMPARO.stats];

let appInstance: App | null = null;

function getFirebaseAdminApp(): App | null {
  if (appInstance) return appInstance;

  const currentApps = getApps();
  if (currentApps.length > 0) {
    appInstance = currentApps[0];
    return appInstance;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  // Only initialize if a valid service account credential is provided
  if (serviceAccountKey) {
    try {
      const parsed = JSON.parse(
        serviceAccountKey.startsWith('{')
          ? serviceAccountKey
          : Buffer.from(serviceAccountKey, 'base64').toString('utf8')
      );
      appInstance = initializeApp({
        credential: cert(parsed),
      });
      return appInstance;
    } catch (e) {
      console.error('[Firebase Admin Init Error - Service Account]', e);
    }
  }

  // Gracefully fallback to in-memory store
  return null;
}

// -----------------------------------------------------------------------------
// LEADS STORE
// -----------------------------------------------------------------------------
import {
  readLocalLeads,
  writeLocalLead,
  updateLocalLeadStatus,
} from '@/lib/localStorage';

export async function saveLeadToFirestore(
  lead: LeadSubmission & {
    aiScore?: 'hot' | 'warm' | 'cold';
    aiSummary?: string;
    aiSuggestedReply?: string;
    autoSent?: boolean;
    providerUsed?: string;
  },
  metadata?: { ip?: string; userAgent?: string }
): Promise<{ success: boolean; id: string; isDevFallback?: boolean }> {
  const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const record: LeadRecord = {
    ...lead,
    id: leadId,
    source: lead.source || 'landing-form',
    status: 'new',
    createdAt: new Date().toISOString(),
    ipAddress: metadata?.ip || 'unknown',
    userAgent: metadata?.userAgent || 'unknown',
  };

  // 1. Always persist to disk so Admin Dashboard never loses any lead
  writeLocalLead(record);
  devLeadsBuffer.unshift(record);

  const app = getFirebaseAdminApp();

  if (!app) {
    console.log('[Lead Saved to Disk & Buffer]', {
      id: record.id,
      name: record.name,
      business: record.businessName,
      phone: record.phone,
      score: record.aiScore,
      autoSent: record.autoSent,
    });
    return { success: true, id: leadId, isDevFallback: true };
  }

  try {
    const db = getFirestore(app);
    await db.collection('leads').doc(leadId).set(record);
    return { success: true, id: leadId, isDevFallback: false };
  } catch (err) {
    console.error('[Firebase Firestore Lead Save Error]', err);
    return { success: true, id: leadId, isDevFallback: true };
  }
}

export async function getLeadsFromFirestore(): Promise<LeadRecord[]> {
  // Always load from local disk first to guarantee all captured leads are shown
  const localLeads = readLocalLeads();

  const app = getFirebaseAdminApp();
  if (!app) {
    return localLeads.length > 0 ? localLeads : devLeadsBuffer;
  }

  try {
    const db = getFirestore(app);
    const snap = await db.collection('leads').orderBy('createdAt', 'desc').limit(100).get();
    if (snap.empty) {
      return localLeads.length > 0 ? localLeads : devLeadsBuffer;
    }

    const firestoreLeads = snap.docs.map((doc) => doc.data() as LeadRecord);
    // Merge without duplicates
    const leadMap = new Map<string, LeadRecord>();
    localLeads.forEach((l) => leadMap.set(l.id, l));
    firestoreLeads.forEach((l) => leadMap.set(l.id, l));
    return Array.from(leadMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return localLeads.length > 0 ? localLeads : devLeadsBuffer;
  }
}

export async function updateLeadStatusInFirestore(
  leadId: string,
  status: LeadRecord['status']
): Promise<boolean> {
  updateLocalLeadStatus(leadId, status);
  const found = devLeadsBuffer.find((l) => l.id === leadId);
  if (found) found.status = status;

  const app = getFirebaseAdminApp();
  if (!app) return true;

  try {
    const db = getFirestore(app);
    await db.collection('leads').doc(leadId).update({ status });
    return true;
  } catch {
    return true;
  }
}

// -----------------------------------------------------------------------------
// BRANDS STORE
// -----------------------------------------------------------------------------
export async function getBrandsFromFirestore(): Promise<BrandClient[]> {
  const app = getFirebaseAdminApp();
  if (!app) {
    // Return latest MANAGED_BRANDS enriched with any local custom brands
    const merged = MANAGED_BRANDS.map((defBrand) => {
      const custom = devBrandsBuffer.find((b) => b.id === defBrand.id);
      return {
        ...defBrand,
        ...custom,
        logoUrl: custom?.logoUrl || defBrand.logoUrl,
        media: defBrand.media,
      };
    });
    return merged;
  }

  try {
    const db = getFirestore(app);
    const snap = await db.collection('brands').get();
    if (snap.empty) return MANAGED_BRANDS;

    const firestoreBrands = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BrandClient));
    // Merge rich media into firestore brands
    return firestoreBrands.map((b) => {
      const defBrand = MANAGED_BRANDS.find((mb) => mb.id === b.id || mb.name.toLowerCase() === b.name.toLowerCase());
      return {
        ...defBrand,
        ...b,
        logoUrl: b.logoUrl || defBrand?.logoUrl,
        media: defBrand?.media || b.media,
      };
    });
  } catch {
    return MANAGED_BRANDS;
  }
}

export async function saveBrandToFirestore(brand: BrandClient): Promise<boolean> {
  const index = devBrandsBuffer.findIndex((b) => b.id === brand.id);
  if (index >= 0) {
    devBrandsBuffer[index] = brand;
  } else {
    devBrandsBuffer.push(brand);
  }

  const app = getFirebaseAdminApp();
  if (!app) return true;

  try {
    const db = getFirestore(app);
    await db.collection('brands').doc(brand.id).set(brand);
    return true;
  } catch {
    return true;
  }
}

export async function deleteBrandFromFirestore(brandId: string): Promise<boolean> {
  devBrandsBuffer = devBrandsBuffer.filter((b) => b.id !== brandId);

  const app = getFirebaseAdminApp();
  if (!app) return true;

  try {
    const db = getFirestore(app);
    await db.collection('brands').doc(brandId).delete();
    return true;
  } catch {
    return true;
  }
}

// -----------------------------------------------------------------------------
// CASE STUDY STORE
// -----------------------------------------------------------------------------
export async function getCaseStudyStatsFromFirestore(): Promise<CaseStudyStat[]> {
  const verifiedStats = CASE_STUDY_AMPARO.stats.map((s) => ({ ...s, isPendingVerification: false }));
  const app = getFirebaseAdminApp();
  if (!app) return verifiedStats;

  try {
    const db = getFirestore(app);
    const doc = await db.collection('caseStudies').doc('amparo').get();
    if (!doc.exists) return verifiedStats;

    const data = doc.data();
    return (data?.stats || verifiedStats).map((s: CaseStudyStat) => ({ ...s, isPendingVerification: false }));
  } catch {
    return verifiedStats;
  }
}

export async function saveCaseStudyStatsToFirestore(stats: CaseStudyStat[]): Promise<boolean> {
  devCaseStudyStats = stats;

  const app = getFirebaseAdminApp();
  if (!app) return true;

  try {
    const db = getFirestore(app);
    await db.collection('caseStudies').doc('amparo').set({
      brandName: 'Amparo',
      stats,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch {
    return true;
  }
}
