'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LeadRecord, BrandClient, CaseStudyStat } from '@/types';
import { getOneClickWhatsAppUrl } from '@/lib/whatsappSend';
import {
  Users,
  Flame,
  AlertTriangle,
  Bot,
  CheckCircle,
  MessageCircle,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  LogOut,
  RefreshCw,
  Sparkles,
  Send,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Link2,
  Search,
  FileText,
  X,
  Activity,
  Clock,
} from 'lucide-react';

export interface CrmLeadItem {
  phone: string;
  name: string;
  businessName: string;
  category: string;
  budget: string;
  painPoint: string;
  websiteUrl: string;
  auditFindings: string;
  stage: 'discovery' | 'qualifying' | 'audited' | 'pitching' | 'hot_ready_to_close' | 'converted' | 'follow_up_sent';
  psychologyNotes: string;
  history: Array<{ sender: 'customer' | 'ai' | 'admin'; text: string; timestamp: number }>;
  lastActive: number;
  alertSentToOwner: boolean;
  notes?: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'leads' | 'whatsapp_crm' | 'whatsapp_qr' | 'brands' | 'case_study' | 'digest'>('leads');
  const [leadFilter, setLeadFilter] = useState<'needs_you' | 'hot' | 'all'>('all');

  // Audio alert chime function for instant lead notifications
  const playLeadAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  // Leads state
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // WhatsApp QR Worker state
  const [waStatus, setWaStatus] = useState<{
    running: boolean;
    status: 'initializing' | 'qr_ready' | 'connected' | 'disconnected' | 'offline';
    qrCode?: string;
    user?: { id?: string; name?: string };
    lastError?: string;
  }>({ running: false, status: 'offline' });
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Hi! This is a test WhatsApp message from MSR Next Gen AI automation.');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [isDisconnectingAdmin, setIsDisconnectingAdmin] = useState(false);
  const [isRestartingAdmin, setIsRestartingAdmin] = useState(false);

  // WhatsApp Sales CRM & Memory state
  const [crmLeads, setCrmLeads] = useState<CrmLeadItem[]>([]);
  const [loadingCrm, setLoadingCrm] = useState(false);
  const [crmFilter, setCrmFilter] = useState<'all' | 'hot' | 'audited' | 'converted'>('all');
  const [selectedCrmLead, setSelectedCrmLead] = useState<CrmLeadItem | null>(null);
  const [crmFollowupText, setCrmFollowupText] = useState('');
  const [sendingCrmFollowup, setSendingCrmFollowup] = useState(false);
  const [crmSearchQuery, setCrmSearchQuery] = useState('');

  const fetchCrmLeads = async () => {
    setLoadingCrm(true);
    try {
      const res = await fetch('/api/admin/whatsapp/crm');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.leads)) {
        setCrmLeads(data.leads);
        if (selectedCrmLead) {
          const updated = data.leads.find((l: CrmLeadItem) => l.phone === selectedCrmLead.phone);
          if (updated) setSelectedCrmLead(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCrm(false);
    }
  };

  const handleUpdateCrmLead = async (phone: string, updates: Partial<CrmLeadItem>) => {
    try {
      await fetch('/api/admin/whatsapp/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_lead', phone, updates }),
      });
      fetchCrmLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendCrmFollowup = async (phone: string, text: string) => {
    if (!text.trim()) return;
    setSendingCrmFollowup(true);
    try {
      const res = await fetch('/api/admin/whatsapp/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger_followup',
          phone,
          message: text.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCrmFollowupText('');
        fetchCrmLeads();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingCrmFollowup(false);
    }
  };

  // Brands state
  const [brands, setBrands] = useState<BrandClient[]>([]);
  const [newBrand, setNewBrand] = useState({ name: '', handle: '', category: '', url: '', logoUrl: '' });
  const [brandSaving, setBrandSaving] = useState(false);

  // Case study state
  const [caseStats, setCaseStats] = useState<CaseStudyStat[]>([]);
  const [caseSaving, setCaseSaving] = useState(false);
  const [caseSuccess, setCaseSuccess] = useState(false);

  // Digest state
  const [digestRunning, setDigestRunning] = useState(false);
  const [digestResult, setDigestResult] = useState<string | null>(null);

  // Fetch leads
  const fetchLeads = async (filter: string = leadFilter) => {
    setLoadingLeads(true);
    try {
      const res = await fetch(`/api/admin/leads?filter=${filter}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setLeads(data.leads || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeads(false);
    }
  };

  // Poll WhatsApp Worker status
  const fetchWhatsAppStatus = async () => {
    try {
      const res = await fetch('/api/admin/whatsapp');
      const data = await res.json();
      setWaStatus(data);
    } catch {
      setWaStatus({ running: false, status: 'offline' });
    }
  };

  // Fetch brands
  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/admin/brands');
      const data = await res.json();
      if (res.ok && data.success) {
        setBrands(data.brands || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch case study
  const fetchCaseStudy = async () => {
    try {
      const res = await fetch('/api/admin/case-study');
      const data = await res.json();
      if (res.ok && data.success) {
        setCaseStats(data.stats || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeads(leadFilter);
    fetchBrands();
    fetchCaseStudy();
    fetchWhatsAppStatus();

    // Auto-poll leads every 6 seconds to show new leads instantly with audio chime
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/leads?filter=${leadFilter}`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.leads)) {
          setLeads((prev) => {
            if (prev.length > 0 && data.leads.length > prev.length) {
              playLeadAlertSound();
            }
            return data.leads;
          });
        }
      } catch {}
    }, 6000);

    return () => clearInterval(interval);
  }, [leadFilter]);

  // Polling for QR status when WhatsApp tab is active
  useEffect(() => {
    if (activeTab === 'whatsapp_qr') {
      fetchWhatsAppStatus();
      const interval = setInterval(fetchWhatsAppStatus, 2500);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Polling for WhatsApp Sales CRM tab
  useEffect(() => {
    fetchCrmLeads();
    if (activeTab === 'whatsapp_crm') {
      const interval = setInterval(fetchCrmLeads, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const handleUpdateLeadStatus = async (leadId: string, status: LeadRecord['status']) => {
    try {
      await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status }),
      });
      fetchLeads(leadFilter);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;
    setTestSending(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_send',
          phone: testPhone,
          message: testMessage,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({ success: true, msg: `Message delivered successfully to +${data.to}!` });
      } else {
        setTestResult({ success: false, msg: data.error || 'Failed to send WhatsApp message' });
      }
    } catch {
      setTestResult({ success: false, msg: 'Worker not reachable. Is the WhatsApp worker running?' });
    } finally {
      setTestSending(false);
    }
  };

  const handleRestartWhatsApp = async () => {
    setIsRestartingAdmin(true);
    try {
      await fetch('/api/admin/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restart' }),
      });
      await fetchWhatsAppStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRestartingAdmin(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!confirm('Are you sure you want to disconnect this WhatsApp number? You will need to scan the QR code again to link.')) {
      return;
    }
    setIsDisconnectingAdmin(true);
    try {
      await fetch('/api/admin/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      await fetchWhatsAppStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDisconnectingAdmin(false);
    }
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.name || !newBrand.handle || !newBrand.category || !newBrand.url) return;
    setBrandSaving(true);
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBrand),
      });
      if (res.ok) {
        setNewBrand({ name: '', handle: '', category: '', url: '', logoUrl: '' });
        fetchBrands();
      }
    } finally {
      setBrandSaving(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Are you sure you want to remove this brand?')) return;
    try {
      await fetch(`/api/admin/brands?id=${id}`, { method: 'DELETE' });
      fetchBrands();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCaseStudy = async () => {
    setCaseSaving(true);
    setCaseSuccess(false);
    try {
      const res = await fetch('/api/admin/case-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats: caseStats }),
      });
      if (res.ok) {
        setCaseSuccess(true);
        setTimeout(() => setCaseSuccess(false), 3000);
      }
    } finally {
      setCaseSaving(false);
    }
  };

  const handleTriggerDigest = async () => {
    setDigestRunning(true);
    setDigestResult(null);
    try {
      const res = await fetch('/api/cron/digest');
      const data = await res.json();
      if (res.ok && data.success) {
        setDigestResult(data.digestMessage);
      }
    } finally {
      setDigestRunning(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const totalLeadsCount = leads.length;
  const needsYouCount = leads.filter((l) => l.status === 'new' && (!l.autoSent || l.aiScore === 'cold')).length;
  const hotLeadsCount = leads.filter((l) => l.aiScore === 'hot').length;
  const crmHotCount = crmLeads.filter((l) => l.stage === 'hot_ready_to_close').length;

  const filteredCrmLeads = crmLeads.filter((lead) => {
    if (crmSearchQuery.trim()) {
      const q = crmSearchQuery.toLowerCase();
      const match =
        lead.phone.includes(q) ||
        (lead.name && lead.name.toLowerCase().includes(q)) ||
        (lead.businessName && lead.businessName.toLowerCase().includes(q)) ||
        (lead.category && lead.category.toLowerCase().includes(q)) ||
        (lead.painPoint && lead.painPoint.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (crmFilter === 'hot') return lead.stage === 'hot_ready_to_close';
    if (crmFilter === 'audited') return lead.stage === 'audited' || Boolean(lead.websiteUrl);
    if (crmFilter === 'converted') return lead.stage === 'converted';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Header & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Solo Operator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated Lead Scoring, WhatsApp Action Triggers & Dynamic Content Controls
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Needs Your Attention</span>
            <div className="text-3xl font-black text-amber-400 mt-1">{needsYouCount}</div>
            <span className="text-[11px] text-slate-500">Cold or unhandled leads</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">Hot High-Intent Leads</span>
            <div className="text-3xl font-black text-rose-400 mt-1">{hotLeadsCount}</div>
            <span className="text-[11px] text-slate-500">Ready to close deals</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase">WhatsApp Automation</span>
            <div className="text-sm font-extrabold mt-1 flex items-center gap-2">
              {waStatus.status === 'connected' ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Linked Phone Active</span>
                </span>
              ) : waStatus.status === 'qr_ready' ? (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <span>QR Ready to Scan</span>
                </span>
              ) : (
                <span className="text-slate-400">Ready to Link</span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">Your Existing Number</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'leads'
              ? 'bg-slate-900 text-brand-400 border-t-2 border-brand-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Leads & AI Automation</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp_crm')}
          className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'whatsapp_crm'
              ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-emerald-400" />
          <span>WhatsApp Sales CRM & Memory</span>
          {crmHotCount > 0 ? (
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
              {crmHotCount} Hot
            </span>
          ) : crmLeads.length > 0 ? (
            <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {crmLeads.length}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab('whatsapp_qr')}
          className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'whatsapp_qr'
              ? 'bg-slate-900 text-brand-400 border-t-2 border-brand-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>WhatsApp QR (Linked Device)</span>
          {waStatus.status === 'connected' && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('brands')}
          className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'brands'
              ? 'bg-slate-900 text-brand-400 border-t-2 border-brand-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Brands We Manage (CRUD)</span>
        </button>

        <button
          onClick={() => setActiveTab('case_study')}
          className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'case_study'
              ? 'bg-slate-900 text-brand-400 border-t-2 border-brand-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>Case Study Stats & Sample Toggle</span>
        </button>

        <button
          onClick={() => setActiveTab('digest')}
          className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'digest'
              ? 'bg-slate-900 text-brand-400 border-t-2 border-brand-500 border-x border-slate-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Daily Digest Job</span>
        </button>
      </div>

      {/* TAB 1: LEADS & AI ACTIONS */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLeadFilter('needs_you')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  leadFilter === 'needs_you'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                ⚠️ Needs You Queue ({needsYouCount})
              </button>
              <button
                onClick={() => setLeadFilter('hot')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  leadFilter === 'hot'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🔥 Hot Leads ({hotLeadsCount})
              </button>
              <button
                onClick={() => setLeadFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  leadFilter === 'all'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                All Inquiries ({totalLeadsCount})
              </button>
            </div>

            <button
              onClick={() => fetchLeads(leadFilter)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLeads ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {leads.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle className="w-10 h-10 text-emerald-500/50 mx-auto mb-3" />
                <p className="font-semibold text-sm">Inbox Zero in this view!</p>
                <p className="text-xs mt-1">No leads currently waiting in this queue.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Business & Client</th>
                      <th className="p-4">AI Score</th>
                      <th className="p-4">AI Executive Summary</th>
                      <th className="p-4">AI Drafted Reply</th>
                      <th className="p-4">Status & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {leads.map((lead) => {
                      const oneClickUrl = getOneClickWhatsAppUrl(
                        lead.phone,
                        lead.aiSuggestedReply || 'Hi, thank you for reaching out to MSR Next Gen!'
                      );

                      return (
                        <tr key={lead.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="p-4 align-top">
                            <div className="font-bold text-white text-sm">{lead.businessName}</div>
                            <div className="text-slate-400 mt-0.5">{lead.name}</div>
                            <div className="text-emerald-400 font-mono mt-1">{lead.phone}</div>
                            <div className="text-[10px] text-slate-500 mt-1">
                              {new Date(lead.createdAt).toLocaleString('en-IN', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </div>
                          </td>

                          <td className="p-4 align-top">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider">
                              {lead.aiScore === 'hot' ? (
                                <span className="bg-rose-950 border border-rose-700 text-rose-300 px-2 py-0.5 rounded">
                                  🔥 HOT
                                </span>
                              ) : lead.aiScore === 'warm' ? (
                                <span className="bg-amber-950 border border-amber-700 text-amber-300 px-2 py-0.5 rounded">
                                  ⚡ WARM
                                </span>
                              ) : (
                                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                                  ❄️ COLD
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-2">
                              Via {lead.providerUsed || 'AI Engine'}
                            </div>
                          </td>

                          <td className="p-4 align-top max-w-xs">
                            <p className="text-slate-300 leading-relaxed font-medium">
                              {lead.aiSummary || 'General growth inquiry'}
                            </p>
                          </td>

                          <td className="p-4 align-top max-w-sm">
                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
                              &ldquo;{lead.aiSuggestedReply}&rdquo;
                            </div>
                            <div className="mt-1.5">
                              {lead.autoSent ? (
                                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                  ✓ Auto-delivered via WhatsApp
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-400 font-medium">
                                  ⏳ Ready for 1-click manual send
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-4 align-top space-y-2">
                            <a
                              href={oneClickUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-lg transition-colors shadow-xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-white" />
                              <span>Send on WhatsApp</span>
                            </a>

                            <select
                              value={lead.status}
                              onChange={(e) =>
                                handleUpdateLeadStatus(lead.id, e.target.value as LeadRecord['status'])
                              }
                              aria-label="Update lead status"
                              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                            >
                              <option value="new">Status: New</option>
                              <option value="contacted">Status: Contacted</option>
                              <option value="converted">Status: Converted 🏆</option>
                              <option value="archived">Status: Archived</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: WHATSAPP SALES CRM & CUSTOMER MEMORY */}
      {activeTab === 'whatsapp_crm' && (
        <div className="space-y-6">
          {/* Controls Bar: Filters, Search & Refresh */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setCrmFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  crmFilter === 'all'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                All Conversations ({crmLeads.length})
              </button>
              <button
                onClick={() => setCrmFilter('hot')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  crmFilter === 'hot'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🔥 Hot Closers ({crmHotCount})
              </button>
              <button
                onClick={() => setCrmFilter('audited')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  crmFilter === 'audited'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🔍 Profile Audited ({crmLeads.filter((l) => l.websiteUrl).length})
              </button>
              <button
                onClick={() => setCrmFilter('converted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  crmFilter === 'converted'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🏆 Converted ({crmLeads.filter((l) => l.stage === 'converted').length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by phone, business, pain..."
                  value={crmSearchQuery}
                  onChange={(e) => setCrmSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <button
                onClick={fetchCrmLeads}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-800 transition-colors shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCrm ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* CRM Leads Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {filteredCrmLeads.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <MessageCircle className="w-10 h-10 text-emerald-500/50 mx-auto mb-3" />
                <p className="font-semibold text-sm">No WhatsApp sales conversations in this view!</p>
                <p className="text-xs mt-1">
                  Jab bhi koi customer WhatsApp par message karega, unki memory profile aur transcript yahan live store hogi.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Customer & Phone</th>
                      <th className="p-4">Business & Niche</th>
                      <th className="p-4">AI Memory & Psychological Dossier</th>
                      <th className="p-4">Funnel Stage</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCrmLeads.map((lead) => {
                      const waUrl = `https://wa.me/${lead.phone}`;
                      const lastMsg = lead.history?.[lead.history.length - 1];

                      return (
                        <tr key={lead.phone} className="hover:bg-slate-850/50 transition-colors">
                          {/* Col 1: Customer & Phone */}
                          <td className="p-4 align-top">
                            <div className="font-bold text-white text-sm">
                              {lead.name || 'WhatsApp Client'}
                            </div>
                            <div className="text-emerald-400 font-mono mt-0.5">+{lead.phone}</div>
                            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-600" />
                              <span>
                                {new Date(lead.lastActive).toLocaleString('en-IN', {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })}
                              </span>
                            </div>
                          </td>

                          {/* Col 2: Business & Niche */}
                          <td className="p-4 align-top">
                            <div className="font-bold text-slate-200">
                              {lead.businessName || 'Business Name Pending'}
                            </div>
                            <div className="mt-1">
                              <span className="inline-block bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                {lead.category}
                              </span>
                            </div>
                            {lead.websiteUrl && (
                              <div className="mt-1.5 flex items-center gap-1 text-[11px] text-brand-400">
                                <Link2 className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{lead.websiteUrl}</span>
                              </div>
                            )}
                          </td>

                          {/* Col 3: AI Memory & Dossier */}
                          <td className="p-4 align-top max-w-sm">
                            <div className="space-y-1.5">
                              {lead.budget && (
                                <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                                  <span>💰 Budget:</span>
                                  <span className="bg-amber-950/60 border border-amber-800 px-1.5 py-0.5 rounded">
                                    {lead.budget}
                                  </span>
                                </div>
                              )}

                              {lead.painPoint && (
                                <div className="text-[11px] text-slate-300">
                                  <strong className="text-rose-400">⚠️ Issue:</strong> {lead.painPoint}
                                </div>
                              )}

                              {lastMsg && (
                                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 line-clamp-2">
                                  <span className="text-slate-500 font-bold mr-1">
                                    {lastMsg.sender === 'customer' ? 'Client:' : 'AI:'}
                                  </span>
                                  &ldquo;{lastMsg.text}&rdquo;
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Col 4: Funnel Stage Selector */}
                          <td className="p-4 align-top">
                            <select
                              value={lead.stage}
                              onChange={(e) =>
                                handleUpdateCrmLead(lead.phone, {
                                  stage: e.target.value as CrmLeadItem['stage'],
                                })
                              }
                              aria-label="Update lead stage"
                              className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none ${
                                lead.stage === 'hot_ready_to_close'
                                  ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                                  : lead.stage === 'converted'
                                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                                  : lead.stage === 'audited'
                                  ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300'
                                  : lead.stage === 'qualifying'
                                  ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-300'
                              }`}
                            >
                              <option value="discovery">🔍 Discovery</option>
                              <option value="qualifying">⚡ Qualifying</option>
                              <option value="audited">📋 Profile Audited</option>
                              <option value="pitching">🎯 Pitching Call</option>
                              <option value="hot_ready_to_close">🔥 Hot Closer</option>
                              <option value="converted">🏆 Converted Deal</option>
                              <option value="follow_up_sent">⏳ Follow-up Sent</option>
                            </select>

                            {lead.alertSentToOwner && (
                              <div className="mt-1 text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Dossier sent to 8887521156</span>
                              </div>
                            )}
                          </td>

                          {/* Col 5: Actions */}
                          <td className="p-4 align-top text-right space-y-1.5">
                            <button
                              onClick={() => {
                                setSelectedCrmLead(lead);
                                setCrmFollowupText('');
                              }}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors border border-slate-700"
                            >
                              <Eye className="w-3.5 h-3.5 text-brand-400" />
                              <span>Transcript & Memory</span>
                            </button>

                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg transition-colors text-xs shadow-xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-white" />
                              <span>Open Chat</span>
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* INTERACTIVE TRANSCRIPT & MEMORY DRAWER / MODAL */}
          {selectedCrmLead && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Top Header */}
                <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-white text-base">
                          {selectedCrmLead.name || 'WhatsApp Client'}
                        </h3>
                        <span className="text-xs text-emerald-400 font-mono">
                          +{selectedCrmLead.phone}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {selectedCrmLead.businessName || 'Business'} • {selectedCrmLead.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${selectedCrmLead.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-xl text-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>Chat on Phone</span>
                    </a>
                    <button
                      onClick={() => setSelectedCrmLead(null)}
                      className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Body: 2 Columns */}
                <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                  {/* Left Column: Persistent Memory Dossier (5 cols) */}
                  <div className="md:col-span-5 p-5 space-y-4 bg-slate-950/40">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-emerald-400" />
                      <span>AI Customer Memory Profile</span>
                    </h4>

                    {/* Memory Fields */}
                    <div className="space-y-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Category</span>
                        <div className="text-white font-bold">{selectedCrmLead.category}</div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Monthly Ad Spend / Budget</span>
                        <div className="text-amber-300 font-bold">{selectedCrmLead.budget || 'Not yet disclosed'}</div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Core Identified Bottleneck</span>
                        <div className="text-rose-300 font-medium leading-relaxed">
                          {selectedCrmLead.painPoint || 'Discovery in progress...'}
                        </div>
                      </div>

                      {selectedCrmLead.websiteUrl && (
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">Website / Instagram</span>
                          <div className="text-brand-400 font-mono underline truncate">
                            {selectedCrmLead.websiteUrl}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Live Audit Report if Available */}
                    {selectedCrmLead.auditFindings && (
                      <div className="bg-cyan-950/30 border border-cyan-800/60 p-3.5 rounded-2xl text-xs space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-cyan-300 tracking-wider flex items-center gap-1">
                          <Search className="w-3 h-3" />
                          <span>Live Profile Audit Report</span>
                        </span>
                        <pre className="text-cyan-100 font-sans text-xs whitespace-pre-wrap leading-relaxed">
                          {selectedCrmLead.auditFindings}
                        </pre>
                      </div>
                    )}

                    {/* Psychology Strategy Note */}
                    <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Sales Strategy Note</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {selectedCrmLead.psychologyNotes || 'Consultative open-ended discovery active.'}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Real-Time Chat Timeline & Follow-up (7 cols) */}
                  <div className="md:col-span-7 flex flex-col h-full p-5 justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Live Conversation Transcript ({selectedCrmLead.history?.length || 0} messages)</span>
                      </h4>

                      {/* Timeline Messages Bubble */}
                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                        {(!selectedCrmLead.history || selectedCrmLead.history.length === 0) ? (
                          <div className="text-center py-10 text-slate-500 text-xs">
                            No messages recorded yet.
                          </div>
                        ) : (
                          selectedCrmLead.history.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex flex-col ${
                                msg.sender === 'customer' ? 'items-start' : 'items-end'
                              }`}
                            >
                              <div className="text-[10px] text-slate-500 mb-0.5 px-1 font-semibold">
                                {msg.sender === 'customer' ? 'Customer' : 'Mukul (MSR AI Closer)'}
                              </div>
                              <div
                                className={`p-3 rounded-2xl max-w-sm text-xs leading-relaxed ${
                                  msg.sender === 'customer'
                                    ? 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                                    : 'bg-emerald-950 border border-emerald-800/80 text-emerald-100 rounded-tr-sm'
                                }`}
                              >
                                {msg.text}
                              </div>
                              <span className="text-[9px] text-slate-600 mt-0.5 px-1">
                                {new Date(msg.timestamp).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Follow-up Quick Dispatcher Bar */}
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <button
                          type="button"
                          onClick={() =>
                            setCrmFollowupText(
                              `Hi ${selectedCrmLead.name || 'there'}, kya hum aaj shaam ko ek 15-minute quick audit call schedule karein taaki aapka custom plan review ho sake?`
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium shrink-0 transition-colors"
                        >
                          + 15-Min Call Schedule
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCrmFollowupText(
                              `Hi ${selectedCrmLead.name || 'there'}, jaise humne Amparo D2C ke liye WhatsApp conversion 40% increase ki thi, bilkul waise aapke liye bhi ek blueprint ready hai.`
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium shrink-0 transition-colors"
                        >
                          + Amparo Proof Drop
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type custom follow-up or reply to send on WhatsApp..."
                          value={crmFollowupText}
                          onChange={(e) => setCrmFollowupText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSendCrmFollowup(selectedCrmLead.phone, crmFollowupText);
                            }
                          }}
                          className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          onClick={() => handleSendCrmFollowup(selectedCrmLead.phone, crmFollowupText)}
                          disabled={sendingCrmFollowup || !crmFollowupText.trim()}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{sendingCrmFollowup ? 'Sending...' : 'Send'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WHATSAPP QR AUTOMATION (LINKED DEVICE) */}
      {activeTab === 'whatsapp_qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: QR Code & Status */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">WhatsApp Linked Device</h3>
                    <p className="text-xs text-slate-400">No new number needed — uses your existing WhatsApp</p>
                  </div>
                </div>

                <button
                  onClick={handleRestartWhatsApp}
                  title="Refresh or restart connection"
                  className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Status Display */}
              {waStatus.status === 'connected' ? (
                <div className="p-6 bg-emerald-950/40 border border-emerald-700/60 rounded-2xl text-center space-y-4 my-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-300">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white">Your WhatsApp is Linked & Active!</h4>
                    <p className="text-xs text-emerald-200 mt-1">
                      {waStatus.user?.id ? `Connected as ${waStatus.user.id.split(':')[0]}` : 'Ready to dispatch automated replies'}
                    </p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                    New leads will receive their personalized AI reply directly from your linked WhatsApp. Session is saved locally and will auto-reconnect.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={handleDisconnectWhatsApp}
                      disabled={isDisconnectingAdmin}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 font-bold transition-all shadow-xs"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isDisconnectingAdmin ? 'Disconnecting...' : 'Disconnect & Re-scan QR'}</span>
                    </button>
                    <button
                      onClick={handleRestartWhatsApp}
                      disabled={isRestartingAdmin}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 font-semibold transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRestartingAdmin ? 'animate-spin' : ''}`} />
                      <span>{isRestartingAdmin ? 'Reconnecting...' : 'Reconnect'}</span>
                    </button>
                  </div>
                </div>
              ) : waStatus.status === 'qr_ready' && waStatus.qrCode ? (
                <div className="flex flex-col items-center p-6 bg-slate-950 border border-slate-800 rounded-2xl my-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={waStatus.qrCode}
                    alt="WhatsApp QR Code"
                    className="w-64 h-64 rounded-xl border-4 border-white shadow-2xl"
                  />
                  <div className="flex items-center gap-2 mt-4 text-xs font-bold text-amber-400 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Scan this QR code with WhatsApp on your phone</span>
                  </div>
                </div>
              ) : waStatus.status === 'offline' ? (
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-3 my-6">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <h4 className="text-base font-extrabold text-white">Worker Offline</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Start the WhatsApp worker by running in your terminal:
                  </p>
                  <pre className="bg-slate-900 border border-slate-800 text-emerald-400 p-2.5 rounded-xl font-mono text-xs max-w-xs mx-auto">
                    npm run whatsapp
                  </pre>
                  <button
                    onClick={fetchWhatsAppStatus}
                    className="mt-2 text-xs font-bold text-brand-400 hover:text-brand-300"
                  >
                    Check Status Again
                  </button>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 my-6">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-400 mb-3" />
                  <p className="text-xs font-semibold">Initializing WhatsApp Socket...</p>
                </div>
              )}
            </div>

            {/* Step-by-Step Scan Instructions */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
              <span className="font-bold text-white uppercase text-[10px]">How to Scan on Mobile:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Open <strong>WhatsApp</strong> on your phone.</li>
                <li>Tap <strong>Settings</strong> (or 3-dots Menu) → <strong>Linked Devices</strong>.</li>
                <li>Tap <strong>Link a Device</strong> and point your camera at the QR code above.</li>
              </ol>
            </div>
          </div>

          {/* Right Column: Live Test Message Dispatcher */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Test Live WhatsApp Delivery</h3>
                  <p className="text-xs text-slate-400">Send an instant test WhatsApp message from your linked number</p>
                </div>
              </div>

              <form onSubmit={handleTestSendWhatsApp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">
                    Recipient Phone Number (10 digits)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      className="w-full pl-12 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">
                    Message Content
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:ring-2 focus:ring-brand-500 outline-none resize-none leading-relaxed"
                  />
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                        : 'bg-rose-950/60 border-rose-800 text-rose-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{testResult.msg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={testSending || waStatus.status !== 'connected'}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {testSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching WhatsApp Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Live Message via Linked WhatsApp</span>
                    </>
                  )}
                </button>

                {waStatus.status !== 'connected' && (
                  <p className="text-[11px] text-amber-400/90 text-center font-medium">
                    ⚠️ Link your WhatsApp with the QR code on the left to enable sending.
                  </p>
                )}
              </form>
            </div>

            <div className="pt-6 border-t border-slate-800 text-slate-500 text-xs">
              <p>
                💡 Once linked, your phone acts as the official sender. No Meta Cloud API setup, no business approval wait times, and zero per-message charges.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: BRANDS MANAGER */}
      {activeTab === 'brands' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4">Add a New Brand to Landing Page</h3>
            <form onSubmit={handleAddBrand} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <input
                type="text"
                placeholder="Brand Name (e.g. Amparo)"
                value={newBrand.name}
                onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
              <input
                type="text"
                placeholder="Instagram Handle (e.g. @amparo.shop.india)"
                value={newBrand.handle}
                onChange={(e) => setNewBrand({ ...newBrand, handle: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
              <input
                type="text"
                placeholder="Category (e.g. D2C Wellness)"
                value={newBrand.category}
                onChange={(e) => setNewBrand({ ...newBrand, category: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
              <input
                type="url"
                placeholder="Instagram URL"
                value={newBrand.url}
                onChange={(e) => setNewBrand({ ...newBrand, url: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                required
              />
              <button
                type="submit"
                disabled={brandSaving}
                className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Brand</span>
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="p-4">Brand</th>
                  <th className="p-4">Handle</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Instagram Link</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {brands.map((b) => (
                  <tr key={b.id}>
                    <td className="p-4 font-bold text-white">{b.name}</td>
                    <td className="p-4 text-slate-400">{b.handle}</td>
                    <td className="p-4">
                      <span className="bg-brand-950 text-brand-300 border border-brand-800 px-2 py-0.5 rounded text-[11px]">
                        {b.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Open Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteBrand(b.id)}
                        className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CASE STUDY EDITOR */}
      {activeTab === 'case_study' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-3xl">
          <div>
            <h3 className="text-base font-bold text-white">Amparo Case Study Metrics</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Edit the 3 big numbers shown in Section 4. Uncheck &ldquo;Verification Pending&rdquo; once numbers are verified to remove the [Sample] badge.
            </p>
          </div>

          <div className="space-y-4">
            {caseStats.map((stat, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => {
                        const updated = [...caseStats];
                        updated[idx].label = e.target.value;
                        setCaseStats(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                      Value (e.g. +340%, 4.2x)
                    </label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => {
                        const updated = [...caseStats];
                        updated[idx].value = e.target.value;
                        setCaseStats(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-brand-400 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Subtext Context
                  </label>
                  <input
                    type="text"
                    value={stat.subtext}
                    onChange={(e) => {
                      const updated = [...caseStats];
                      updated[idx].subtext = e.target.value;
                      setCaseStats(updated);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id={`pending-${idx}`}
                    checked={stat.isPendingVerification}
                    onChange={(e) => {
                      const updated = [...caseStats];
                      updated[idx].isPendingVerification = e.target.checked;
                      setCaseStats(updated);
                    }}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor={`pending-${idx}`} className="text-xs text-amber-300 font-semibold cursor-pointer">
                    Keep [Sample / Verification Pending] badge active on landing page
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveCaseStudy}
              disabled={caseSaving}
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{caseSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            {caseSuccess && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                ✓ Case study updated successfully!
              </span>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DAILY DIGEST */}
      {activeTab === 'digest' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-white">Daily WhatsApp Digest Agent</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configured in vercel.json to run every morning at 9:00 AM IST. You can also trigger an instant test run below.
            </p>
          </div>

          <button
            onClick={handleTriggerDigest}
            disabled={digestRunning}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{digestRunning ? 'Dispatching Digest...' : 'Run Digest Now (Test)'}</span>
          </button>

          {digestResult && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-emerald-400 uppercase">Digest Output Preview:</span>
              <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans mt-2 leading-relaxed">
                {digestResult}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
