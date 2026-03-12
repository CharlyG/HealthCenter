/**
 * Caregiver Profile Component
 * 
 * Complete caregiver profile interface with sections for personal info,
 * disciplines, credentials, training, availability, employment, and documents.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  User,
  Briefcase,
  Award,
  GraduationCap,
  Calendar,
  FileText,
  Shield,
  Edit,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Building,
  DollarSign,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type {
  CaregiverProfile as CaregiverProfileType,
  DisciplineType,
  EmploymentStatus,
  CredentialComplianceStatus,
  LicenseStatus,
  CertificationStatus,
} from '../lib/caregiverTypes';
import { DISCIPLINE_CONFIG, EMPLOYMENT_STATUS_CONFIG } from '../lib/caregiverTypes';
import {
  DisciplinesTab,
  CredentialsTab,
  TrainingTab,
  AvailabilityTab,
  EmploymentTab,
  DocumentsTab,
} from './caregiver/CaregiverProfileSections';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CaregiverProfileProps {
  profile: CaregiverProfileType;
  onEdit?: (section: string) => void;
  mode?: 'full' | 'view-only';
}

export default function CaregiverProfile({
  profile,
  onEdit,
  mode = 'full',
}: CaregiverProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const primaryDiscipline = DISCIPLINE_CONFIG[profile.primaryDiscipline];
  const fullName = `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {profile.personalInfo.firstName[0]}
            {profile.personalInfo.lastName[0]}
          </div>

          {/* Profile Summary */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{fullName}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-sm',
                      `bg-${primaryDiscipline.color}-100 text-${primaryDiscipline.color}-700 border-${primaryDiscipline.color}-300`
                    )}
                  >
                    {primaryDiscipline.label}
                  </Badge>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-600">{profile.employment.office}</span>
                </div>
              </div>

              {mode === 'full' && onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit('general')}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <QuickStat
                icon={Briefcase}
                label="Employment Status"
                value={EMPLOYMENT_STATUS_CONFIG[profile.employment.status].label}
                color={EMPLOYMENT_STATUS_CONFIG[profile.employment.status].color}
              />
              <QuickStat
                icon={Shield}
                label="Credential Status"
                value={
                  profile.credentialCompliance.overall === 'compliant'
                    ? 'Compliant'
                    : profile.credentialCompliance.overall === 'warning'
                    ? 'Warning'
                    : 'Non-Compliant'
                }
                color={
                  profile.credentialCompliance.overall === 'compliant'
                    ? 'green'
                    : profile.credentialCompliance.overall === 'warning'
                    ? 'amber'
                    : 'red'
                }
              />
              <QuickStat
                icon={Award}
                label="Active Licenses"
                value={profile.licenses.filter((l) => l.status === 'active').length}
                color="blue"
              />
              <QuickStat
                icon={GraduationCap}
                label="Certifications"
                value={profile.certifications.filter((c) => c.status === 'current').length}
                color="purple"
              />
            </div>
          </div>
        </div>

        {/* Compliance Alerts */}
        {profile.credentialCompliance.issues.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <ComplianceAlerts issues={profile.credentialCompliance.issues.slice(0, 3)} />
          </div>
        )}
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">
            <User className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="disciplines">
            <Briefcase className="w-4 h-4 mr-2" />
            Disciplines
          </TabsTrigger>
          <TabsTrigger value="credentials">
            <Award className="w-4 h-4 mr-2" />
            Credentials
          </TabsTrigger>
          <TabsTrigger value="training">
            <GraduationCap className="w-4 h-4 mr-2" />
            Training
          </TabsTrigger>
          <TabsTrigger value="availability">
            <Calendar className="w-4 h-4 mr-2" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="employment">
            <Building className="w-4 h-4 mr-2" />
            Employment
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab profile={profile} onEdit={onEdit} mode={mode} />
        </TabsContent>

        <TabsContent value="disciplines" className="mt-6">
          <DisciplinesTab profile={profile} onEdit={onEdit} mode={mode} />
        </TabsContent>

        <TabsContent value="credentials" className="mt-6">
          <CredentialsTab profile={profile} onEdit={onEdit} mode={mode} />
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <TrainingTab profile={profile} onEdit={onEdit} mode={mode} />
        </TabsContent>

        <TabsContent value="availability" className="mt-6">
          <AvailabilityTab profile={profile} onEdit={onEdit} mode={mode} />
        </TabsContent>

        <TabsContent value="employment" className="mt-6">
          <EmploymentTab profile={profile} onEdit={onEdit} mode={mode} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentsTab profile={profile} onEdit={onEdit} mode={mode} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK STAT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function QuickStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorClasses[color as keyof typeof colorClasses])}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs text-gray-600">{label}</div>
        <div className="font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE ALERTS
// ═══════════════════════════════════════════════════════════════════════════

function ComplianceAlerts({
  issues,
}: {
  issues: CaregiverProfileType['credentialCompliance']['issues'];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-semibold text-gray-900">Credential Alerts</span>
      </div>
      {issues.map((issue, index) => (
        <div
          key={index}
          className={cn(
            'p-3 rounded-lg border-l-4 text-sm',
            issue.severity === 'critical'
              ? 'bg-red-50 border-red-500 text-red-900'
              : issue.severity === 'warning'
              ? 'bg-amber-50 border-amber-500 text-amber-900'
              : 'bg-blue-50 border-blue-500 text-blue-900'
          )}
        >
          {issue.message}
          {issue.dueDate && (
            <span className="ml-2 text-xs">
              • Due: {new Date(issue.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════

function OverviewTab({
  profile,
  onEdit,
  mode,
}: {
  profile: CaregiverProfileType;
  onEdit?: (section: string) => void;
  mode: 'full' | 'view-only';
}) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Personal Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h3>
          {mode === 'full' && onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit('personal')}>
              <Edit className="w-3 h-3" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <InfoRow icon={Mail} label="Email" value={profile.personalInfo.email} />
          <InfoRow icon={Phone} label="Phone" value={profile.personalInfo.phone} />
          {profile.personalInfo.alternatePhone && (
            <InfoRow
              icon={Phone}
              label="Alternate Phone"
              value={profile.personalInfo.alternatePhone}
            />
          )}
          <InfoRow
            icon={MapPin}
            label="Address"
            value={`${profile.personalInfo.address.street}, ${profile.personalInfo.address.city}, ${profile.personalInfo.address.state} ${profile.personalInfo.address.zipCode}`}
          />
          <InfoRow
            icon={User}
            label="Date of Birth"
            value={new Date(profile.personalInfo.dateOfBirth).toLocaleDateString()}
          />
        </div>

        <div className="mt-4 pt-4 border-t">
          <h4 className="font-semibold text-gray-900 text-sm mb-3">Emergency Contact</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">
                {profile.personalInfo.emergencyContact.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Relationship:</span>
              <span className="font-medium text-gray-900">
                {profile.personalInfo.emergencyContact.relationship}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium text-gray-900">
                {profile.personalInfo.emergencyContact.phone}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Employment Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Employment Summary
          </h3>
          {mode === 'full' && onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit('employment')}>
              <Edit className="w-3 h-3" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Employee ID</span>
            <span className="font-medium text-gray-900">{profile.employment.employeeId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Hire Date</span>
            <span className="font-medium text-gray-900">
              {new Date(profile.employment.hireDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Status</span>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                profile.employment.status === 'active'
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : profile.employment.status === 'on-leave'
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300'
              )}
            >
              {EMPLOYMENT_STATUS_CONFIG[profile.employment.status].label}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Office</span>
            <span className="font-medium text-gray-900">{profile.employment.office}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Employment Type</span>
            <span className="font-medium text-gray-900 capitalize">
              {profile.employment.employmentType}
            </span>
          </div>
          {profile.employment.supervisor && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Supervisor</span>
              <span className="font-medium text-gray-900">{profile.employment.supervisor}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Credential Compliance */}
      <Card className="p-6 col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Credential Compliance Status
          </h3>
          <Badge
            variant="outline"
            className={cn(
              'text-sm px-3 py-1',
              profile.credentialCompliance.overall === 'compliant'
                ? 'bg-green-100 text-green-700 border-green-300'
                : profile.credentialCompliance.overall === 'warning'
                ? 'bg-amber-100 text-amber-700 border-amber-300'
                : 'bg-red-100 text-red-700 border-red-300'
            )}
          >
            {profile.credentialCompliance.overall === 'compliant' ? (
              <CheckCircle className="w-4 h-4 mr-1" />
            ) : profile.credentialCompliance.overall === 'warning' ? (
              <AlertTriangle className="w-4 h-4 mr-1" />
            ) : (
              <XCircle className="w-4 h-4 mr-1" />
            )}
            {profile.credentialCompliance.overall === 'compliant'
              ? 'Compliant'
              : profile.credentialCompliance.overall === 'warning'
              ? 'Warning'
              : 'Non-Compliant'}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {profile.licenses.filter((l) => l.status === 'active').length}
            </div>
            <div className="text-xs text-gray-600">Active Licenses</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {profile.certifications.filter((c) => c.status === 'current').length}
            </div>
            <div className="text-xs text-gray-600">Current Certifications</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {profile.training.filter((t) => t.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-600">Completed Training</div>
          </div>
        </div>

        {profile.credentialCompliance.issues.length > 0 && (
          <ComplianceAlerts issues={profile.credentialCompliance.issues} />
        )}

        <div className="mt-4 text-xs text-gray-600">
          Last reviewed: {new Date(profile.credentialCompliance.lastReviewDate).toLocaleDateString()} •
          Next review: {new Date(profile.credentialCompliance.nextReviewDate).toLocaleDateString()}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INFO ROW
// ═══════════════════════════════════════════════════════════════════════════

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="text-xs text-gray-600">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
    </div>
  );
}