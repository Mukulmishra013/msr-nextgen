import fs from 'fs';
import path from 'path';
import { LeadRecord } from '@/types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const MEMORY_FILE = path.join(DATA_DIR, 'agent_memory.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// -----------------------------------------------------------------------------
// LEADS PERSISTENCE
// -----------------------------------------------------------------------------
export function readLocalLeads(): LeadRecord[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(LEADS_FILE)) {
      fs.writeFileSync(LEADS_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const raw = fs.readFileSync(LEADS_FILE, 'utf8');
    return JSON.parse(raw) as LeadRecord[];
  } catch (err) {
    console.error('[Local DB] Error reading leads:', err);
    return [];
  }
}

export function writeLocalLead(lead: LeadRecord): boolean {
  try {
    ensureDataDir();
    const leads = readLocalLeads();
    const existingIdx = leads.findIndex((l) => l.id === lead.id);
    if (existingIdx >= 0) {
      leads[existingIdx] = lead;
    } else {
      leads.unshift(lead);
    }
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[Local DB] Error saving lead:', err);
    return false;
  }
}

export function updateLocalLeadStatus(leadId: string, status: LeadRecord['status']): boolean {
  try {
    ensureDataDir();
    const leads = readLocalLeads();
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      lead.status = status;
      fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
      return true;
    }
    return false;
  } catch (err) {
    console.error('[Local DB] Error updating lead status:', err);
    return false;
  }
}

// -----------------------------------------------------------------------------
// AGENT MEMORY & CONTINUOUS SELF-LEARNING STORE
// -----------------------------------------------------------------------------
export interface AgentMemory {
  learnedFacts: string[];
  faqs: Array<{ question: string; answer: string; addedAt: string }>;
  optedOutNumbers: string[];
  conversations: Record<string, Array<{ role: 'user' | 'assistant'; text: string; time: string }>>;
}

const DEFAULT_MEMORY: AgentMemory = {
  learnedFacts: [
    'MSR Next Gen specializes in high-ROI Meta Ads and Google Ads for Indian businesses and D2C brands.',
    'Founder is Mukul (Growth Architect).',
    'Case study: Amparo D2C generated ₹2.4 Lakhs in 30 days with 3.8x ROAS.',
    'Management packages start at ₹15,000/month depending on ad spend and requirements.',
    'We offer a Free 15-Minute Business Growth & Funnel Audit.',
    'Official contact WhatsApp: +91 95193 42440, Customer Care: +91 88875 21156, Email: msbestshoopingpro@gmail.com.',
  ],
  faqs: [],
  optedOutNumbers: [],
  conversations: {},
};

export function readAgentMemory(): AgentMemory {
  try {
    ensureDataDir();
    if (!fs.existsSync(MEMORY_FILE)) {
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(DEFAULT_MEMORY, null, 2), 'utf8');
      return DEFAULT_MEMORY;
    }
    const raw = fs.readFileSync(MEMORY_FILE, 'utf8');
    return JSON.parse(raw) as AgentMemory;
  } catch (err) {
    console.error('[Local DB] Error reading agent memory:', err);
    return DEFAULT_MEMORY;
  }
}

export function addLearnedFact(fact: string): boolean {
  try {
    ensureDataDir();
    const memory = readAgentMemory();
    if (!memory.learnedFacts.includes(fact)) {
      memory.learnedFacts.push(fact);
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');
    }
    return true;
  } catch (err) {
    console.error('[Local DB] Error adding learned fact:', err);
    return false;
  }
}

export function optOutPhone(phone: string): boolean {
  try {
    ensureDataDir();
    const clean = phone.replace(/[^0-9]/g, '');
    const memory = readAgentMemory();
    if (!memory.optedOutNumbers.includes(clean)) {
      memory.optedOutNumbers.push(clean);
      fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');
    }
    return true;
  } catch (err) {
    console.error('[Local DB] Error opting out phone:', err);
    return false;
  }
}

export function recordConversationTurn(
  phone: string,
  role: 'user' | 'assistant',
  text: string
): boolean {
  try {
    ensureDataDir();
    const clean = phone.replace(/[^0-9]/g, '');
    const memory = readAgentMemory();
    if (!memory.conversations[clean]) {
      memory.conversations[clean] = [];
    }
    memory.conversations[clean].push({
      role,
      text,
      time: new Date().toISOString(),
    });
    // Keep max 20 recent messages per contact to conserve memory
    if (memory.conversations[clean].length > 20) {
      memory.conversations[clean] = memory.conversations[clean].slice(-20);
    }
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[Local DB] Error saving conversation turn:', err);
    return false;
  }
}
