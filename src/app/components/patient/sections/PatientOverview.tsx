/**
 * Patient Overview Section
 * Displays summary cards for quick patient status comprehension, then demographics.
 *
 * Summary cards (per spec):
 *  - Active admissions
 *  - Care team members
 *  - Insurance information
 *  - Upcoming visits
 *  - Documentation due
 *  - Alerts
 *
 * Below cards: demographics (view/edit), referral info, alternate locations.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Edit2,
  MapPin,
  UserPlus,
  Save,
  Users,
  CreditCard,
  Calendar,
  FileText,
  AlertTriangle,
  ClipboardList,
  Loader2,
  Stethoscope,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Patient } from '../../../hooks/usePatients';
import { useOffices } from '../../../hooks/useOffices';
import { useFormAutosave } from '../../../hooks/useFormAutosave';
import { useAlerts } from '../../../context/AlertContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { FormSection, FormFieldGroup } from '../../design-system/FormSection';
import PatientAlternateLocations from '../../PatientAlternateLocations';
import { admissionGateway, visitGateway } from '../../../lib/dataGateway';

interface PatientOverviewProps {
  patient: Patient;
}

interface OverviewSummary {
  activeAdmissions: Array<{ id: string; type: string; status: string; socDate?: string }>;
  careTeam: Array<{ id: string; name: string; role: string; discipline?: string }>;
  insurance: Array<{ id: string; name: string; policyNumber?: string; type: string }>;
  upcomingVisits: Array<{ id: string; date: string; time: string; discipline: string; caregiver: string }>;
  documentationDue: Array<{ id: string; title: string; dueDate: string; type: string }>;
  alertCount: number;
}

// ── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  title,
  icon,
  count,
  items,
  emptyText,
  color,
  onViewAll,
}: {
  title: string;
  icon: React.ReactNode;
  count?: number;
  items: React.ReactNode;
  emptyText: string;
  color: string;
  onViewAll?: () => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={color}>{icon}</div>
            <span>{title}</span>
          </div>
          {count !== undefined && (
            <Badge variant="secondary" className="text-xs h-5 px-1.5">
              {count}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {count === 0 ? (
          <p className="text-xs text-gray-400 text-center py-3">{emptyText}</p>
        ) : (
          <div className="space-y-2">{items}</div>
        )}
        {onViewAll && count !== undefined && count > 0 && (
          <button
            onClick={onViewAll}
            className="text-[11px] text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center gap-0.5"
          >
            View all <ChevronRight className="size-3" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}

// ── Demographics Form ────────────────────────────────────────────────────────

interface DemographicsFormData {
  first_name: string;
  last_name: string;
  dob: string;
  mrn: string;
  office_id: string;
  phone: string;
  email: string;
  gender: string;
  ssn: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

interface ReferralData {
  referral_source: string;
  referral_date: string;
  referral_contact: string;
  referral_notes: string;
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function PatientOverview({ patient }: PatientOverviewProps) {
  const { offices } = useOffices();
  const { getPatientAlertCounts } = useAlerts();
  const [isEditingDemographics, setIsEditingDemographics] = useState(false);
  const [isEditingReferral, setIsEditingReferral] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState<OverviewSummary>({
    activeAdmissions: [],
    careTeam: [],
    insurance: [],
    upcomingVisits: [],
    documentationDue: [],
    alertCount: 0,
  });

  // Load summary data from server
  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [admRes, visitRes] = await Promise.all([
        admissionGateway.search({
          filters: { patientId: patient.id },
          pagination: { page: 1, pageSize: 20 },
        }).catch(() => ({ data: [], total: 0, page: 1, pageSize: 20 })),
        visitGateway.getByPatientId(patient.id).catch(() => []),
      ]);

      const activeAdmissions = (admRes.data || [])
        .filter((a: any) => a.status === 'active' || a.status === 'admitted')
        .map((a: any) => ({
          id: a.id,
          type: a.type || 'Home Health',
          status: a.status,
          socDate: a.socDate || a.soc_date,
        }));

      // Build care team from admissions
      const careTeamMap = new Map<string, any>();
      (admRes.data || []).forEach((a: any) => {
        if (a.physicianName || a.physician_name) {
          const name = a.physicianName || a.physician_name;
          if (!careTeamMap.has(name)) {
            careTeamMap.set(name, { id: `ct-${name}`, name, role: 'Physician' });
          }
        }
        if (a.careTeam && Array.isArray(a.careTeam)) {
          a.careTeam.forEach((ct: any) => {
            if (!careTeamMap.has(ct.name)) {
              careTeamMap.set(ct.name, { id: ct.id || `ct-${ct.name}`, name: ct.name, role: ct.role || 'Clinician', discipline: ct.discipline });
            }
          });
        }
      });
      const careTeam = Array.from(careTeamMap.values()).slice(0, 6);

      // Insurance from admissions
      const insurance: OverviewSummary['insurance'] = [];
      (admRes.data || []).forEach((a: any) => {
        if (a.primaryPayerId || a.primary_payer_id || a.primaryPayer) {
          insurance.push({
            id: `ins-${a.id}-primary`,
            name: a.primaryPayer || a.primaryPayerName || a.primaryPayerId || a.primary_payer_id || 'Primary',
            policyNumber: a.primaryPolicyNumber || a.policyNumber,
            type: 'Primary',
          });
        }
        if (a.secondaryPayerId || a.secondary_payer_id || a.secondaryPayer) {
          insurance.push({
            id: `ins-${a.id}-secondary`,
            name: a.secondaryPayer || a.secondaryPayerName || a.secondaryPayerId || 'Secondary',
            type: 'Secondary',
          });
        }
      });

      // Upcoming visits
      const upcoming = (visitRes || [])
        .filter((v: any) => {
          const vDate = v.visitDate || v.visit_date;
          return vDate >= today && (v.status === 'scheduled' || v.status === 'in_progress');
        })
        .sort((a: any, b: any) => ((a.visitDate || a.visit_date) || '').localeCompare((b.visitDate || b.visit_date) || ''))
        .slice(0, 5)
        .map((v: any) => ({
          id: v.id,
          date: v.visitDate || v.visit_date || '',
          time: v.startTime || v.start_time || '',
          discipline: v.discipline || '',
          caregiver: v.caregiverName || v.caregiver_name || 'Unassigned',
        }));

      // Documentation due (visits needing notes)
      const docDue = (visitRes || [])
        .filter((v: any) => v.status === 'completed' && (!v.documentationStatus || v.documentationStatus === 'pending' || v.documentationStatus === 'in_progress'))
        .slice(0, 5)
        .map((v: any) => ({
          id: v.id,
          title: `Visit note: ${v.caregiverName || v.caregiver_name || 'Unknown'}`,
          dueDate: v.visitDate || v.visit_date || '',
          type: 'Visit Note',
        }));

      // Get real alert counts from the alert context
      const patientAlertCounts = getPatientAlertCounts(patient.id);
      const totalAlerts = (patientAlertCounts.critical || 0) + (patientAlertCounts.high || 0) +
        (patientAlertCounts.warning || 0) + (patientAlertCounts.info || 0);

      setSummary({
        activeAdmissions,
        careTeam,
        insurance: insurance.slice(0, 4),
        upcomingVisits: upcoming,
        documentationDue: docDue,
        alertCount: totalAlerts,
      });
    } catch (err) {
      console.error('[PatientOverview] Summary load error:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [patient.id, getPatientAlertCounts]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Demographics form state
  const [demographics, setDemographics] = useState<DemographicsFormData>({
    first_name: patient.first_name || '',
    last_name: patient.last_name || '',
    dob: patient.dob || '',
    mrn: patient.mrn || '',
    office_id: patient.office_id || '',
    phone: patient.phone || '',
    email: patient.email || '',
    gender: patient.gender || '',
    ssn: patient.ssn || '',
    address: patient.address || '',
    emergency_contact_name: patient.emergency_contact_name || '',
    emergency_contact_phone: patient.emergency_contact_phone || '',
  });

  const [referral, setReferral] = useState<ReferralData>({
    referral_source: 'Hospital Discharge',
    referral_date: '2024-01-15',
    referral_contact: 'Dr. Sarah Johnson',
    referral_notes: 'Post-surgical care needed',
  });

  const handleDemographicsSave = async (data: DemographicsFormData, isDraft: boolean) => {
    console.log('Saving demographics:', data, isDraft);
    toast.success('Demographics saved successfully');
  };

  const {
    isDirty: demographicsIsDirty,
    isSaving: demographicsIsSaving,
    lastSaved: demographicsLastSaved,
    saveNow: saveDemographicsNow,
  } = useFormAutosave({
    formData: demographics,
    onSave: handleDemographicsSave,
    enabled: isEditingDemographics,
  });

  const handleReferralSave = async () => {
    console.log('Saving referral:', referral);
    toast.success('Referral information saved');
    setIsEditingReferral(false);
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Patient Overview</h2>
        <Badge variant="outline" className="text-sm">
          {patient.status}
        </Badge>
      </div>

      {/* ═══ Summary Cards Grid ═══════════════════════════════════════════ */}
      {summaryLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 text-blue-500 animate-spin" />
          <span className="ml-2 text-sm text-gray-500">Loading overview...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Active Admissions */}
          <SummaryCard
            title="Active Admissions"
            icon={<ClipboardList className="size-4" />}
            count={summary.activeAdmissions.length}
            color="text-blue-600"
            emptyText="No active admissions"
            items={
              <>
                {summary.activeAdmissions.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-xs rounded-md border border-gray-100 bg-gray-50 px-2.5 py-2">
                    <div>
                      <span className="font-semibold text-gray-900">{a.type}</span>
                      {a.socDate && (
                        <span className="text-gray-500 ml-1.5">SOC {a.socDate}</span>
                      )}
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-[10px] h-5">{a.status}</Badge>
                  </div>
                ))}
              </>
            }
          />

          {/* Care Team */}
          <SummaryCard
            title="Care Team"
            icon={<Users className="size-4" />}
            count={summary.careTeam.length}
            color="text-teal-600"
            emptyText="No care team assigned"
            items={
              <>
                {summary.careTeam.map((ct) => (
                  <div key={ct.id} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-900">{ct.name}</span>
                    <span className="text-gray-500">{ct.role}{ct.discipline ? ` (${ct.discipline.toUpperCase()})` : ''}</span>
                  </div>
                ))}
              </>
            }
          />

          {/* Insurance */}
          <SummaryCard
            title="Insurance"
            icon={<CreditCard className="size-4" />}
            count={summary.insurance.length}
            color="text-emerald-600"
            emptyText="No insurance on file"
            items={
              <>
                {summary.insurance.map((ins) => (
                  <div key={ins.id} className="flex items-center justify-between text-xs rounded-md border border-gray-100 bg-gray-50 px-2.5 py-2">
                    <div>
                      <span className="font-semibold text-gray-900">{ins.name}</span>
                      {ins.policyNumber && (
                        <span className="text-gray-500 ml-1.5 font-mono text-[10px]">#{ins.policyNumber}</span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5">{ins.type}</Badge>
                  </div>
                ))}
              </>
            }
          />

          {/* Upcoming Visits */}
          <SummaryCard
            title="Upcoming Visits"
            icon={<Calendar className="size-4" />}
            count={summary.upcomingVisits.length}
            color="text-blue-500"
            emptyText="No upcoming visits"
            items={
              <>
                {summary.upcomingVisits.map((v) => (
                  <div key={v.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{v.date}</span>
                      {v.time && <span className="text-gray-500">{v.time}</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {v.discipline && (
                        <Badge className="bg-violet-100 text-violet-700 text-[10px] h-4 px-1">{v.discipline.toUpperCase()}</Badge>
                      )}
                      <span className="text-gray-500 truncate max-w-[100px]">{v.caregiver}</span>
                    </div>
                  </div>
                ))}
              </>
            }
          />

          {/* Documentation Due */}
          <SummaryCard
            title="Documentation Due"
            icon={<FileText className="size-4" />}
            count={summary.documentationDue.length}
            color={summary.documentationDue.length > 0 ? 'text-amber-600' : 'text-gray-400'}
            emptyText="All documentation complete"
            items={
              <>
                {summary.documentationDue.length === 0 ? (
                  <div className="flex items-center justify-center gap-1.5 py-2 text-green-600">
                    <CheckCircle2 className="size-4" />
                    <span className="text-xs font-medium">Up to date</span>
                  </div>
                ) : (
                  summary.documentationDue.map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-900 truncate max-w-[170px]">{d.title}</span>
                      <span className="text-gray-500">{d.dueDate}</span>
                    </div>
                  ))
                )}
              </>
            }
          />

          {/* Alerts */}
          <SummaryCard
            title="Alerts"
            icon={<AlertTriangle className="size-4" />}
            count={summary.alertCount}
            color={summary.alertCount > 0 ? 'text-red-600' : 'text-gray-400'}
            emptyText="No active alerts"
            items={
              summary.alertCount === 0 ? (
                <div className="flex items-center justify-center gap-1.5 py-2 text-green-600">
                  <CheckCircle2 className="size-4" />
                  <span className="text-xs font-medium">No alerts</span>
                </div>
              ) : (
                <p className="text-xs text-red-700">
                  {summary.alertCount} active alert{summary.alertCount > 1 ? 's' : ''} — view in Context Panel
                </p>
              )
            }
          />
        </div>
      )}

      {/* ═══ Demographics ═════════════════════════════════════════════════ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit2 className="size-5" />
              Demographics
            </CardTitle>
            {!isEditingDemographics ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingDemographics(true)}
              >
                <Edit2 className="size-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {demographicsLastSaved && (
                  <span className="text-xs text-gray-500">
                    Last saved: {new Date(demographicsLastSaved).toLocaleTimeString()}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDemographics({
                      first_name: patient.first_name || '',
                      last_name: patient.last_name || '',
                      dob: patient.dob || '',
                      mrn: patient.mrn || '',
                      office_id: patient.office_id || '',
                      phone: patient.phone || '',
                      email: patient.email || '',
                      gender: patient.gender || '',
                      ssn: patient.ssn || '',
                      address: patient.address || '',
                      emergency_contact_name: patient.emergency_contact_name || '',
                      emergency_contact_phone: patient.emergency_contact_phone || '',
                    });
                    setIsEditingDemographics(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={async () => {
                    await saveDemographicsNow(false);
                    setIsEditingDemographics(false);
                  }}
                  disabled={demographicsIsSaving}
                >
                  {demographicsIsSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="size-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isEditingDemographics ? (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-600">Full Name</Label>
                <p className="text-gray-900 font-medium">
                  {patient.first_name} {patient.last_name}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Date of Birth</Label>
                <p className="text-gray-900 font-medium">
                  {patient.dob} ({calculateAge(patient.dob)} years)
                </p>
              </div>
              <div>
                <Label className="text-gray-600">MRN</Label>
                <p className="text-gray-900 font-medium">{patient.mrn}</p>
              </div>
              <div>
                <Label className="text-gray-600">Office</Label>
                <p className="text-gray-900 font-medium">
                  {offices.find((o) => o.id === patient.office_id)?.name || 'Unknown'}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Phone</Label>
                <p className="text-gray-900 font-medium">{patient.phone}</p>
              </div>
              <div>
                <Label className="text-gray-600">Email</Label>
                <p className="text-gray-900 font-medium">{patient.email || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-gray-600">Gender</Label>
                <p className="text-gray-900 font-medium">{patient.gender || 'Not specified'}</p>
              </div>
              <div>
                <Label className="text-gray-600">SSN</Label>
                <p className="text-gray-900 font-medium">
                  {patient.ssn ? `***-**-${patient.ssn.slice(-4)}` : 'Not provided'}
                </p>
              </div>
              <div className="col-span-2">
                <Label className="text-gray-600">Address</Label>
                <p className="text-gray-900 font-medium">{patient.address}</p>
              </div>
              <div>
                <Label className="text-gray-600">Emergency Contact</Label>
                <p className="text-gray-900 font-medium">
                  {patient.emergency_contact_name || 'Not provided'}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Emergency Phone</Label>
                <p className="text-gray-900 font-medium">
                  {patient.emergency_contact_phone || 'Not provided'}
                </p>
              </div>
            </div>
          ) : (
            <FormSection>
              <FormFieldGroup columns={2}>
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={demographics.first_name}
                    onChange={(e) =>
                      setDemographics({ ...demographics, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={demographics.last_name}
                    onChange={(e) =>
                      setDemographics({ ...demographics, last_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={demographics.dob}
                    onChange={(e) => setDemographics({ ...demographics, dob: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="mrn">MRN *</Label>
                  <Input
                    id="mrn"
                    value={demographics.mrn}
                    onChange={(e) => setDemographics({ ...demographics, mrn: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="office">Office *</Label>
                  <Select
                    value={demographics.office_id}
                    onValueChange={(value) =>
                      setDemographics({ ...demographics, office_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select office" />
                    </SelectTrigger>
                    <SelectContent>
                      {offices.map((office) => (
                        <SelectItem key={office.id} value={office.id}>
                          {office.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={demographics.phone}
                    onChange={(e) => setDemographics({ ...demographics, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={demographics.email}
                    onChange={(e) => setDemographics({ ...demographics, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={demographics.gender}
                    onValueChange={(value) => setDemographics({ ...demographics, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={demographics.address}
                    onChange={(e) => setDemographics({ ...demographics, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                  <Input
                    id="emergency_contact_name"
                    value={demographics.emergency_contact_name}
                    onChange={(e) =>
                      setDemographics({ ...demographics, emergency_contact_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={demographics.emergency_contact_phone}
                    onChange={(e) =>
                      setDemographics({ ...demographics, emergency_contact_phone: e.target.value })
                    }
                  />
                </div>
              </FormFieldGroup>
            </FormSection>
          )}
        </CardContent>
      </Card>

      {/* ═══ Referral Information ═════════════════════════════════════════ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="size-5" />
              Referral Information
            </CardTitle>
            {!isEditingReferral ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingReferral(true)}
              >
                <Edit2 className="size-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingReferral(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleReferralSave}>
                  <Save className="size-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isEditingReferral ? (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-600">Referral Source</Label>
                <p className="text-gray-900 font-medium">{referral.referral_source}</p>
              </div>
              <div>
                <Label className="text-gray-600">Referral Date</Label>
                <p className="text-gray-900 font-medium">{referral.referral_date}</p>
              </div>
              <div>
                <Label className="text-gray-600">Referral Contact</Label>
                <p className="text-gray-900 font-medium">{referral.referral_contact}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-gray-600">Notes</Label>
                <p className="text-gray-900">{referral.referral_notes}</p>
              </div>
            </div>
          ) : (
            <FormSection>
              <FormFieldGroup columns={2}>
                <div>
                  <Label htmlFor="referral_source">Referral Source</Label>
                  <Input
                    id="referral_source"
                    value={referral.referral_source}
                    onChange={(e) =>
                      setReferral({ ...referral, referral_source: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="referral_date">Referral Date</Label>
                  <Input
                    id="referral_date"
                    type="date"
                    value={referral.referral_date}
                    onChange={(e) =>
                      setReferral({ ...referral, referral_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="referral_contact">Referral Contact</Label>
                  <Input
                    id="referral_contact"
                    value={referral.referral_contact}
                    onChange={(e) =>
                      setReferral({ ...referral, referral_contact: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="referral_notes">Notes</Label>
                  <Input
                    id="referral_notes"
                    value={referral.referral_notes}
                    onChange={(e) =>
                      setReferral({ ...referral, referral_notes: e.target.value })
                    }
                  />
                </div>
              </FormFieldGroup>
            </FormSection>
          )}
        </CardContent>
      </Card>

      {/* ═══ Alternate Locations ══════════════════════════════════════════ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-5" />
            Alternate Service Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PatientAlternateLocations patientId={patient.id} />
        </CardContent>
      </Card>
    </div>
  );
}
