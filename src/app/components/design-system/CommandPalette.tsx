/**
 * Global Command Palette (Cmd+K / Ctrl+K)
 *
 * Production-grade command palette for the healthcare platform.
 * Features:
 *  - Live patient search by name, MRN, phone, address
 *  - Live admission search with patient context
 *  - Quick actions (create patient, admission, schedule, etc.)
 *  - Module navigation with keyboard shortcuts
 *  - Operational commands (delayed visits, EVV errors, QA returns, HOPE due)
 *  - Recent items persistence (localStorage)
 *  - Search mode prefixes: `@` patients, `#` admissions, `>` commands
 *  - Full keyboard navigation
 *  - Entity type badges, icons, and preview info
 */
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useNavigate } from 'react-router';
import {
  Users,
  ClipboardCheck,
  Calendar,
  Heart,
  Settings,
  FileText,
  Search,
  Clock,
  DollarSign,
  Stethoscope,
  UserPlus,
  Activity,
  BarChart3,
  Shield,
  ArrowRight,
  Command,
  Hash,
  AtSign,
  ChevronRight,
  MapPin,
  Phone,
  AlertTriangle,
  Loader2,
  Zap,
  CornerDownLeft,
  ArrowUpDown,
  Upload,
  MonitorPlay,
  HeartPulse,
  GitBranch,
  Eye,
  FileWarning,
  RotateCcw,
  Inbox,
  X,
} from 'lucide-react';
import { supabase, publicAnonKey, API_BASE as API_BASE_IMPORT } from '../../lib/supabaseClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  type: 'patient' | 'admission' | 'action' | 'navigation' | 'operational';
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: { label: string; color: string };
  preview?: string[];
  action: () => void;
  keywords?: string;
}

interface RecentItem {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  route: string;
  timestamp: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RECENT_ITEMS_KEY = 'hcp_command_palette_recent';
const MAX_RECENT = 5;
const SEARCH_DEBOUNCE_MS = 200;

const API_BASE = API_BASE_IMPORT;

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    Authorization: `Bearer ${publicAnonKey}`,
    'X-User-Token': session?.access_token || '',
    'Content-Type': 'application/json',
  };
}

// ─── Recent Items Persistence ─────────────────────────────────────────────────

function loadRecentItems(): RecentItem[] {
  try {
    const raw = localStorage.getItem(RECENT_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentItem(item: RecentItem) {
  try {
    const existing = loadRecentItems().filter((r) => r.id !== item.id);
    const updated = [{ ...item, timestamp: Date.now() }, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(updated));
  } catch {
    /* silent */
  }
}

// ─── Status Badge Config ──────────────────────────────────────────────────────

const statusBadge: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  Active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  Pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  discharged: { label: 'Discharged', color: 'bg-gray-100 text-gray-600' },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-600' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [searchingAdmissions, setSearchingAdmissions] = useState(false);
  const [patientResults, setPatientResults] = useState<SearchResult[]>([]);
  const [admissionResults, setAdmissionResults] = useState<SearchResult[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // ─── Keyboard Shortcut ────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      // Also support Ctrl+/ as alternative
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setPatientResults([]);
      setAdmissionResults([]);
      setRecentItems(loadRecentItems());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // ─── Close Handler ────────────────────────────────────────────────────────

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const selectAndClose = useCallback((action: () => void, recent?: RecentItem) => {
    if (recent) saveRecentItem(recent);
    close();
    // Small delay to let the dialog close before navigating
    requestAnimationFrame(action);
  }, [close]);

  // ─── Search Mode Detection ────────────────────────────────────────────────

  const searchMode = useMemo(() => {
    if (query.startsWith('@')) return 'patients' as const;
    if (query.startsWith('#')) return 'admissions' as const;
    if (query.startsWith('>')) return 'commands' as const;
    return 'all' as const;
  }, [query]);

  const effectiveQuery = useMemo(() => {
    if (searchMode !== 'all') return query.slice(1).trim();
    return query.trim();
  }, [query, searchMode]);

  // ─── Static Commands ──────────────────────────────────────────────────────

  const quickActions: SearchResult[] = useMemo(() => [
    {
      id: 'qa-create-patient',
      type: 'action',
      icon: <UserPlus className="size-4 text-blue-500" />,
      title: 'Create New Patient',
      subtitle: 'Add a new patient record',
      badge: { label: 'Action', color: 'bg-blue-100 text-blue-700' },
      action: () => navigate('/patient-new'),
      keywords: 'new patient add create register',
    },
    {
      id: 'qa-create-admission',
      type: 'action',
      icon: <ClipboardCheck className="size-4 text-emerald-500" />,
      title: 'Create New Admission',
      subtitle: 'Start a new patient admission',
      badge: { label: 'Action', color: 'bg-blue-100 text-blue-700' },
      action: () => navigate('/new-admission'),
      keywords: 'new admission admit intake referral',
    },
    {
      id: 'qa-schedule-visit',
      type: 'action',
      icon: <Calendar className="size-4 text-purple-500" />,
      title: 'Schedule Visit',
      subtitle: 'Schedule a new patient visit',
      badge: { label: 'Action', color: 'bg-blue-100 text-blue-700' },
      action: () => navigate('/scheduling'),
      keywords: 'new visit schedule appointment',
    },
    {
      id: 'qa-start-documentation',
      type: 'action',
      icon: <FileText className="size-4 text-amber-500" />,
      title: 'Start Documentation',
      subtitle: 'Open clinical visit notes',
      badge: { label: 'Action', color: 'bg-blue-100 text-blue-700' },
      action: () => navigate('/clinical/visit-notes'),
      keywords: 'documentation note clinical chart start write',
    },
    {
      id: 'qa-open-careconnect',
      type: 'action',
      icon: <MonitorPlay className="size-4 text-teal-500" />,
      title: 'Open CareConnect Monitor',
      subtitle: 'Real-time visit monitoring dashboard',
      badge: { label: 'Action', color: 'bg-blue-100 text-blue-700' },
      action: () => navigate('/poc/monitor'),
      keywords: 'careconnect monitor live visits real-time evv',
    },
    {
      id: 'qa-upload-document',
      type: 'action',
      icon: <Upload className="size-4 text-rose-500" />,
      title: 'Upload Patient Document',
      subtitle: 'Upload a document to a patient chart',
      badge: { label: 'Action', color: 'bg-blue-100 text-blue-700' },
      action: () => navigate('/clinical'),
      keywords: 'upload document file attachment scan fax',
    },
  ], [navigate]);

  const navigationCommands: SearchResult[] = useMemo(() => [
    { id: 'nav-dashboard', type: 'navigation', icon: <BarChart3 className="size-4 text-gray-500" />, title: 'Dashboard', subtitle: 'Home workspace', action: () => navigate('/'), keywords: 'home dashboard overview' },
    { id: 'nav-patients', type: 'navigation', icon: <Users className="size-4 text-blue-500" />, title: 'Patient Management', subtitle: 'Search and manage patients', action: () => navigate('/patient-new'), keywords: 'patient list search management demographics' },
    { id: 'nav-admissions', type: 'navigation', icon: <ClipboardCheck className="size-4 text-emerald-500" />, title: 'Admissions', subtitle: 'Admission workspace', action: () => navigate('/admissions'), keywords: 'admission intake referral discharge' },
    { id: 'nav-scheduling', type: 'navigation', icon: <Calendar className="size-4 text-purple-500" />, title: 'Scheduling', subtitle: 'Visit scheduling & calendar', action: () => navigate('/scheduling'), keywords: 'schedule calendar visit appointment caregiver' },
    { id: 'nav-poc', type: 'navigation', icon: <HeartPulse className="size-4 text-teal-500" />, title: 'Point of Care', subtitle: 'EVV & visit documentation', action: () => navigate('/poc'), keywords: 'point of care evv clock in out visit documentation' },
    { id: 'nav-careconnect', type: 'navigation', icon: <Activity className="size-4 text-cyan-500" />, title: 'CareConnect', subtitle: 'Real-time visit status', action: () => navigate('/careconnect'), keywords: 'careconnect live status tracking' },
    { id: 'nav-monitor', type: 'navigation', icon: <Eye className="size-4 text-orange-500" />, title: 'Monitor', subtitle: 'Visit monitoring & alerts', action: () => navigate('/monitor'), keywords: 'monitor alerts oversight compliance' },
    { id: 'nav-clinical', type: 'navigation', icon: <Stethoscope className="size-4 text-indigo-500" />, title: 'Clinical', subtitle: 'Documentation & QA', action: () => navigate('/clinical'), keywords: 'clinical documentation qa review notes' },
    { id: 'nav-visit-notes', type: 'navigation', icon: <FileText className="size-4 text-indigo-400" />, title: 'Visit Notes', subtitle: 'Clinical → Visit Notes', action: () => navigate('/clinical/visit-notes'), keywords: 'visit notes documentation clinical' },
    { id: 'nav-plans-of-care', type: 'navigation', icon: <FileText className="size-4 text-indigo-400" />, title: 'Plans of Care', subtitle: 'Clinical → Plans of Care', action: () => navigate('/clinical/plans-of-care'), keywords: 'plans of care poc 485 certification' },
    { id: 'nav-verbal-orders', type: 'navigation', icon: <FileText className="size-4 text-indigo-400" />, title: 'Verbal Orders', subtitle: 'Clinical → Verbal Orders', action: () => navigate('/clinical/verbal-orders'), keywords: 'verbal orders physician telephone' },
    { id: 'nav-qa-review', type: 'navigation', icon: <Shield className="size-4 text-indigo-400" />, title: 'QA Review', subtitle: 'Clinical → QA Review Queue', action: () => navigate('/clinical/qa-review'), keywords: 'qa quality assurance review approve reject return' },
    { id: 'nav-hospice', type: 'navigation', icon: <Heart className="size-4 text-rose-500" />, title: 'Hospice', subtitle: 'Hospice care management', action: () => navigate('/hospice'), keywords: 'hospice hope idg bereavement volunteer palliative' },
    { id: 'nav-billing', type: 'navigation', icon: <DollarSign className="size-4 text-green-500" />, title: 'Billing', subtitle: 'Revenue cycle & claims', action: () => navigate('/billing'), keywords: 'billing claims revenue payer insurance ub04 837' },
    { id: 'nav-config', type: 'navigation', icon: <Settings className="size-4 text-gray-500" />, title: 'Platform Configuration', subtitle: 'Admin → Modules, features, integrations', action: () => navigate('/admin/platform-config'), keywords: 'admin config settings modules features integrations toggle' },
    { id: 'nav-design-system', type: 'navigation', icon: <Zap className="size-4 text-yellow-500" />, title: 'Design System', subtitle: 'Component showcase', action: () => navigate('/design-system'), keywords: 'design system components ui' },
  ] as SearchResult[], [navigate]);

  const operationalCommands: SearchResult[] = useMemo(() => [
    {
      id: 'ops-delayed-visits',
      type: 'operational',
      icon: <Clock className="size-4 text-red-500" />,
      title: 'Delayed Visits Queue',
      subtitle: 'Visits running late or not started',
      badge: { label: 'Operational', color: 'bg-red-100 text-red-700' },
      action: () => navigate('/monitor'),
      keywords: 'delayed visits late behind schedule overdue missed',
    },
    {
      id: 'ops-evv-errors',
      type: 'operational',
      icon: <FileWarning className="size-4 text-orange-500" />,
      title: 'EVV Exceptions',
      subtitle: 'Electronic Visit Verification errors',
      badge: { label: 'Operational', color: 'bg-orange-100 text-orange-700' },
      action: () => navigate('/poc/monitor'),
      keywords: 'evv error exception verification electronic visit gps',
    },
    {
      id: 'ops-qa-returns',
      type: 'operational',
      icon: <RotateCcw className="size-4 text-amber-500" />,
      title: 'QA Returns',
      subtitle: 'Documents returned for correction',
      badge: { label: 'Operational', color: 'bg-amber-100 text-amber-700' },
      action: () => navigate('/clinical/qa-review'),
      keywords: 'qa return correction rejected documentation',
    },
    {
      id: 'ops-hope-due',
      type: 'operational',
      icon: <GitBranch className="size-4 text-rose-500" />,
      title: 'HOPE Due List',
      subtitle: 'HOPE assessments due or overdue',
      badge: { label: 'Operational', color: 'bg-rose-100 text-rose-700' },
      action: () => navigate('/hospice?tab=hope'),
      keywords: 'hope assessment due overdue hospice oasis',
    },
    {
      id: 'ops-md-queue',
      type: 'operational',
      icon: <Inbox className="size-4 text-purple-500" />,
      title: 'Medical Director Queue',
      subtitle: 'Documents awaiting MD signature',
      badge: { label: 'Operational', color: 'bg-purple-100 text-purple-700' },
      action: () => navigate('/hospice?tab=md-queue'),
      keywords: 'medical director signature pending queue sign',
    },
    {
      id: 'ops-open-shifts',
      type: 'operational',
      icon: <AlertTriangle className="size-4 text-yellow-500" />,
      title: 'Open Shifts',
      subtitle: 'Unassigned visits needing coverage',
      badge: { label: 'Operational', color: 'bg-yellow-100 text-yellow-700' },
      action: () => navigate('/scheduling'),
      keywords: 'open shift unassigned coverage caregiver staffing',
    },
  ] as SearchResult[], [navigate]);

  // ─── Live Patient Search ──────────────────────────────────────────────────

  const searchPatients = useCallback(async (q: string) => {
    if (q.length < 2) {
      setPatientResults([]);
      return;
    }
    setSearchingPatients(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(
        `${API_BASE}/patients/search/org-demo?query=${encodeURIComponent(q)}`,
        { headers }
      );
      if (!res.ok) throw new Error('Patient search failed');
      const data = await res.json();
      const results: SearchResult[] = (data.patients || []).slice(0, 8).map((p: any) => ({
        id: `patient-${p.id}`,
        type: 'patient' as const,
        icon: <Users className="size-4 text-blue-500" />,
        title: `${p.last_name || p.lastName || ''}, ${p.first_name || p.firstName || ''}`,
        subtitle: p.mrn || p.MRN || '',
        badge: statusBadge[p.admissionStatus || p.status || 'active'] || statusBadge.active,
        preview: [
          p.phone && `${p.phone}`,
          p.address && `${p.address}`,
          p.dob && `DOB: ${new Date(p.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        ].filter(Boolean) as string[],
        action: () => navigate(`/patient-new/${p.id}`),
      }));
      setPatientResults(results);
    } catch (err) {
      console.error('[CommandPalette] Patient search error:', err);
      setPatientResults([]);
    } finally {
      setSearchingPatients(false);
    }
  }, [navigate]);

  // ─── Live Admission Search ────────────────────────────────────────────────

  const searchAdmissions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setAdmissionResults([]);
      return;
    }
    setSearchingAdmissions(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(`${API_BASE}/admissions`, { headers });
      if (!res.ok) throw new Error('Admission search failed');
      const data = await res.json();
      const qLower = q.toLowerCase();
      // Also fetch patients to join names
      const patientsRes = await fetch(`${API_BASE}/patients/search/org-demo?query=${encodeURIComponent(q)}`, { headers });
      const patientsData = patientsRes.ok ? await patientsRes.json() : { patients: [] };
      const patientMap = new Map<string, any>();
      (patientsData.patients || []).forEach((p: any) => patientMap.set(p.id, p));

      const admissions = (data.admissions || []).filter((a: any) => {
        const patient = patientMap.get(a.patientId);
        const searchStr = [
          a.id,
          a.diagnosisPrimary,
          a.payer,
          a.type,
          a.status,
          patient?.first_name,
          patient?.last_name,
          patient?.mrn,
        ].filter(Boolean).join(' ').toLowerCase();
        return searchStr.includes(qLower);
      });

      const results: SearchResult[] = admissions.slice(0, 6).map((a: any) => {
        const patient = patientMap.get(a.patientId);
        const patientName = patient
          ? `${patient.last_name || patient.lastName}, ${patient.first_name || patient.firstName}`
          : a.patientId;
        return {
          id: `admission-${a.id}`,
          type: 'admission' as const,
          icon: <ClipboardCheck className="size-4 text-emerald-500" />,
          title: patientName,
          subtitle: `${a.type || 'Admission'} · ${a.id}`,
          badge: statusBadge[a.status] || statusBadge.active,
          preview: [
            a.diagnosisPrimary && `Dx: ${a.diagnosisPrimary}`,
            a.admissionDate && `Admit: ${new Date(a.admissionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
            a.payer && `Payer: ${a.payer}`,
          ].filter(Boolean) as string[],
          action: () => navigate(`/admissions/${a.id}`),
        };
      });
      setAdmissionResults(results);
    } catch (err) {
      console.error('[CommandPalette] Admission search error:', err);
      setAdmissionResults([]);
    } finally {
      setSearchingAdmissions(false);
    }
  }, [navigate]);

  // ─── Debounced Search Trigger ─────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (effectiveQuery.length < 2) {
      setPatientResults([]);
      setAdmissionResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (searchMode === 'all' || searchMode === 'patients') {
        searchPatients(effectiveQuery);
      }
      if (searchMode === 'all' || searchMode === 'admissions') {
        searchAdmissions(effectiveQuery);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [effectiveQuery, searchMode, open, searchPatients, searchAdmissions]);

  // ─── Filter Static Commands ───────────────────────────────────────────────

  const filteredActions = useMemo(() => {
    if (searchMode === 'patients' || searchMode === 'admissions') return [];
    if (!effectiveQuery) return quickActions;
    const q = effectiveQuery.toLowerCase();
    return quickActions.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.keywords?.toLowerCase().includes(q)
    );
  }, [effectiveQuery, searchMode, quickActions]);

  const filteredNavigation = useMemo(() => {
    if (searchMode === 'patients' || searchMode === 'admissions') return [];
    if (!effectiveQuery) return navigationCommands;
    const q = effectiveQuery.toLowerCase();
    return navigationCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.keywords?.toLowerCase().includes(q)
    );
  }, [effectiveQuery, searchMode, navigationCommands]);

  const filteredOperational = useMemo(() => {
    if (searchMode === 'patients' || searchMode === 'admissions') return [];
    if (!effectiveQuery) return operationalCommands;
    const q = effectiveQuery.toLowerCase();
    return operationalCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q) ||
        c.keywords?.toLowerCase().includes(q)
    );
  }, [effectiveQuery, searchMode, operationalCommands]);

  // ─── Flatten All Results for Keyboard Nav ─────────────────────────────────

  const allResults = useMemo(() => {
    const sections: { label: string; items: SearchResult[] }[] = [];

    // Recent items (only when no query)
    if (!effectiveQuery && searchMode === 'all' && recentItems.length > 0) {
      sections.push({
        label: 'Recent',
        items: recentItems.map((r) => ({
          id: `recent-${r.id}`,
          type: r.type as any,
          icon: r.type === 'patient' ? <Users className="size-4 text-blue-500" /> : r.type === 'admission' ? <ClipboardCheck className="size-4 text-emerald-500" /> : <ArrowRight className="size-4 text-gray-400" />,
          title: r.title,
          subtitle: r.subtitle,
          action: () => navigate(r.route),
        })),
      });
    }

    if (patientResults.length > 0) {
      sections.push({ label: `Patients (${patientResults.length})`, items: patientResults });
    }
    if (admissionResults.length > 0) {
      sections.push({ label: `Admissions (${admissionResults.length})`, items: admissionResults });
    }
    if (filteredActions.length > 0 && searchMode !== 'patients' && searchMode !== 'admissions') {
      sections.push({ label: 'Quick Actions', items: filteredActions });
    }
    if (filteredOperational.length > 0 && searchMode !== 'patients' && searchMode !== 'admissions') {
      sections.push({ label: 'Operational', items: filteredOperational });
    }
    if (filteredNavigation.length > 0 && searchMode !== 'patients' && searchMode !== 'admissions') {
      sections.push({ label: 'Navigation', items: filteredNavigation });
    }

    return sections;
  }, [
    effectiveQuery, searchMode, recentItems, patientResults, admissionResults,
    filteredActions, filteredNavigation, filteredOperational, navigate,
  ]);

  const flatItems = useMemo(() => allResults.flatMap((s) => s.items), [allResults]);

  // Clamp active index
  useEffect(() => {
    if (activeIndex >= flatItems.length) {
      setActiveIndex(Math.max(0, flatItems.length - 1));
    }
  }, [flatItems.length, activeIndex]);

  // ─── Keyboard Navigation ──────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = flatItems[activeIndex];
        if (item) {
          const recentEntry: RecentItem | undefined =
            item.type === 'patient' || item.type === 'admission'
              ? { id: item.id, type: item.type, title: item.title, subtitle: item.subtitle, route: '', timestamp: Date.now() }
              : undefined;
          // For recent tracking, try to infer route
          if (recentEntry && item.type === 'patient') {
            const pid = item.id.replace('patient-', '');
            recentEntry.route = `/patient-new/${pid}`;
          } else if (recentEntry && item.type === 'admission') {
            const aid = item.id.replace('admission-', '');
            recentEntry.route = `/admissions/${aid}`;
          }
          selectAndClose(item.action, recentEntry);
        }
      } else if (e.key === 'Escape') {
        close();
      }
    },
    [flatItems, activeIndex, close, selectAndClose]
  );

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // ─── Search Hint Text ─────────────────────────────────────────────────────

  const placeholderText = useMemo(() => {
    if (searchMode === 'patients') return 'Search patients by name, MRN, phone, address...';
    if (searchMode === 'admissions') return 'Search admissions by patient, diagnosis, payer...';
    if (searchMode === 'commands') return 'Search commands and actions...';
    return 'Search patients, admissions, actions, or type @ # > for modes...';
  }, [searchMode]);

  const isSearching = searchingPatients || searchingAdmissions;
  const hasQuery = effectiveQuery.length >= 2;
  const noResults = hasQuery && !isSearching && flatItems.length === 0;

  if (!open) return null;

  // ─── Render ───────────────────────────────────────────────────────────────

  // Pre-compute flat index for each section item
  const sectionOffsets: number[] = [];
  let runningOffset = 0;
  for (const section of allResults) {
    sectionOffsets.push(runningOffset);
    runningOffset += section.items.length;
  }

  return (
    <div className="fixed inset-0 z-[100]" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
      />

      {/* Dialog */}
      <div className="absolute left-1/2 top-[12%] -translate-x-1/2 w-[640px] max-w-[calc(100vw-2rem)]">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[min(600px,72vh)]">

          {/* ─── Search Input ──────────────────────────────────────────── */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            {searchMode === 'patients' ? (
              <AtSign className="size-5 text-blue-500 flex-shrink-0" />
            ) : searchMode === 'admissions' ? (
              <Hash className="size-5 text-emerald-500 flex-shrink-0" />
            ) : searchMode === 'commands' ? (
              <ChevronRight className="size-5 text-purple-500 flex-shrink-0" />
            ) : isSearching ? (
              <Loader2 className="size-5 text-gray-400 flex-shrink-0 animate-spin" />
            ) : (
              <Search className="size-5 text-gray-400 flex-shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-400 text-gray-900"
              placeholder={placeholderText}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                className="text-gray-400 hover:text-gray-600 p-0.5"
                onClick={() => { setQuery(''); setActiveIndex(0); inputRef.current?.focus(); }}
              >
                <X className="size-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex h-5 px-1.5 items-center rounded border border-gray-200 bg-gray-50 text-[10px] font-mono text-gray-400">
              ESC
            </kbd>
          </div>

          {/* ─── Mode Hints ────────────────────────────────────────────── */}
          {!effectiveQuery && searchMode === 'all' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white border border-gray-200 font-mono text-gray-500">@</kbd> patients</span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white border border-gray-200 font-mono text-gray-500">#</kbd> admissions</span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-white border border-gray-200 font-mono text-gray-500">&gt;</kbd> commands</span>
              <span className="ml-auto flex items-center gap-2">
                <span className="flex items-center gap-1"><ArrowUpDown className="size-3" /> navigate</span>
                <span className="flex items-center gap-1"><CornerDownLeft className="size-3" /> select</span>
              </span>
            </div>
          )}

          {/* ─── Results List ──────────────────────────────────────────── */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto scroll-py-2"
            style={{ minHeight: '120px' }}
          >
            {/* Loading state for search */}
            {isSearching && hasQuery && (
              <div className="flex items-center gap-2 px-4 py-3 text-xs text-gray-500">
                <Loader2 className="size-3.5 animate-spin" />
                Searching{searchMode === 'patients' ? ' patients' : searchMode === 'admissions' ? ' admissions' : ''}...
              </div>
            )}

            {/* No results */}
            {noResults && (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Search className="size-10 mb-3 text-gray-300" />
                <div className="text-sm font-medium mb-1">No results found</div>
                <div className="text-xs">
                  Try a different search term, or use <kbd className="px-1 py-0.5 rounded bg-gray-100 border border-gray-200 font-mono text-gray-500">@</kbd> for patients
                </div>
              </div>
            )}

            {/* Sections */}
            {allResults.map((section, sectionIdx) => (
              <div key={section.label}>
                {/* Section header */}
                <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {section.label}
                  </span>
                </div>

                {/* Items */}
                {section.items.map((item, itemIdx) => {
                  const idx = sectionOffsets[sectionIdx] + itemIdx;
                  const isActive = idx === activeIndex;

                  return (
                    <button
                      key={item.id}
                      data-index={idx}
                      className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                        isActive
                          ? 'bg-blue-50 border-l-2 border-blue-500'
                          : 'hover:bg-gray-50 border-l-2 border-transparent'
                      }`}
                      onClick={() => {
                        const recentEntry: RecentItem | undefined =
                          item.type === 'patient' || item.type === 'admission'
                            ? {
                                id: item.id,
                                type: item.type,
                                title: item.title,
                                subtitle: item.subtitle,
                                route: item.type === 'patient'
                                  ? `/patient-new/${item.id.replace('patient-', '')}`
                                  : `/admissions/${item.id.replace('admission-', '')}`,
                                timestamp: Date.now(),
                              }
                            : undefined;
                        selectAndClose(item.action, recentEntry);
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      {/* Icon */}
                      <div className="mt-0.5 flex-shrink-0">
                        {item.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${item.badge.color}`}>
                              {item.badge.label}
                            </span>
                          )}
                        </div>
                        {item.subtitle && (
                          <div className="text-xs text-gray-500 truncate">{item.subtitle}</div>
                        )}
                        {/* Preview info */}
                        {item.preview && item.preview.length > 0 && isActive && (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                            {item.preview.map((p, i) => (
                              <span key={i} className="text-[11px] text-gray-400 flex items-center gap-1">
                                {p.startsWith('DOB:') && <Calendar className="size-3" />}
                                {p.startsWith('Dx:') && <Stethoscope className="size-3" />}
                                {p.startsWith('Admit:') && <ClipboardCheck className="size-3" />}
                                {p.startsWith('Payer:') && <DollarSign className="size-3" />}
                                {p.startsWith('(') && <Phone className="size-3" />}
                                {!p.startsWith('DOB:') && !p.startsWith('Dx:') && !p.startsWith('Admit:') && !p.startsWith('Payer:') && !p.startsWith('(') && p.includes(',') && <MapPin className="size-3" />}
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right side indicator */}
                      {isActive && (
                        <div className="flex-shrink-0 mt-0.5">
                          <CornerDownLeft className="size-3.5 text-blue-400" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

          </div>

          {/* ─── Footer ────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200 text-[11px] text-gray-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-4 px-1 items-center rounded border border-gray-200 bg-white font-mono text-[10px]">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-4 px-1 items-center rounded border border-gray-200 bg-white font-mono text-[10px]">↵</kbd>
                open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex h-4 px-1 items-center rounded border border-gray-200 bg-white font-mono text-[10px]">esc</kbd>
                close
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Command className="size-3" />
              <span>K to toggle</span>
              {flatItems.length > 0 && (
                <span className="ml-2 text-gray-300">· {flatItems.length} results</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}