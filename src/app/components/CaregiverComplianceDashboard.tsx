/**
 * Caregiver Compliance Dashboard
 * 
 * Global view of caregiver credential compliance with metrics, lists,
 * and management tools for administrators.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Shield,
  Users,
  AlertTriangle,
  XCircle,
  CheckCircle,
  TrendingUp,
  Download,
  Filter,
  Search,
  ChevronRight,
  User,
  Calendar,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type {
  ComplianceDashboardData,
  CaregiverCredentialSummary,
  Credential,
} from '../lib/credentialTypes';
import { CREDENTIAL_TYPE_CONFIG } from '../lib/credentialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CaregiverComplianceDashboardProps {
  data: ComplianceDashboardData;
  onViewCaregiver?: (caregiverId: string) => void;
  onExport?: () => void;
}

export default function CaregiverComplianceDashboard({
  data,
  onViewCaregiver,
  onExport,
}: CaregiverComplianceDashboardProps) {
  const [activeView, setActiveView] = useState<'overview' | 'expiring' | 'expired' | 'missing'>(
    'overview'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | 'all'>('all');

  const disciplines = Array.from(
    new Set(data.caregiverSummaries.map((c) => c.discipline))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Caregiver Compliance Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Global view of workforce credential compliance
              </p>
            </div>
          </div>

          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          )}
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <MetricCard
          label="Total Caregivers"
          value={data.metrics.totalCaregivers}
          icon={Users}
          color="blue"
        />
        <MetricCard
          label="Compliant"
          value={data.metrics.compliantCaregivers}
          subtitle={`${Math.round(
            (data.metrics.compliantCaregivers / data.metrics.totalCaregivers) * 100
          )}%`}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          label="At Risk"
          value={data.metrics.atRiskCaregivers}
          subtitle="Expiring credentials"
          icon={AlertTriangle}
          color="amber"
        />
        <MetricCard
          label="Non-Compliant"
          value={data.metrics.nonCompliantCaregivers}
          subtitle="Action required"
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Compliance Overview */}
      <Card className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Compliance Overview</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">Overall Compliance Rate</div>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-bold text-gray-900">
                {data.metrics.overallComplianceRate}%
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${data.metrics.overallComplianceRate}%` }}
              />
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">Total Credentials</div>
            <div className="text-4xl font-bold text-gray-900">{data.metrics.totalCredentials}</div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active:</span>
                <span className="font-medium text-green-700">{data.metrics.activeCredentials}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expiring:</span>
                <span className="font-medium text-amber-700">
                  {data.metrics.expiringSoonCredentials}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expired:</span>
                <span className="font-medium text-red-700">{data.metrics.expiredCredentials}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">Average per Caregiver</div>
            <div className="text-4xl font-bold text-gray-900">
              {data.metrics.averageCredentialsPerCaregiver.toFixed(1)}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              credentials per caregiver on average
            </div>
          </div>
        </div>
      </Card>

      {/* View Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView('overview')}
            className={cn(activeView === 'overview' && 'bg-blue-100 border-blue-300 text-blue-700')}
          >
            <Users className="w-4 h-4 mr-2" />
            All Caregivers ({data.caregiverSummaries.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView('expiring')}
            className={cn(activeView === 'expiring' && 'bg-amber-100 border-amber-300 text-amber-700')}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Expiring Credentials ({data.expiringCredentials.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView('expired')}
            className={cn(activeView === 'expired' && 'bg-red-100 border-red-300 text-red-700')}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Expired Credentials ({data.expiredCredentials.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView('missing')}
            className={cn(activeView === 'missing' && 'bg-purple-100 border-purple-300 text-purple-700')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Missing Required ({data.missingRequiredCertifications.length})
          </Button>
        </div>
      </Card>

      {/* Content based on active view */}
      {activeView === 'overview' && (
        <CaregiverList
          caregivers={data.caregiverSummaries}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDiscipline={selectedDiscipline}
          onDisciplineChange={setSelectedDiscipline}
          disciplines={disciplines}
          onViewCaregiver={onViewCaregiver}
        />
      )}

      {activeView === 'expiring' && (
        <ExpiringCredentialsList
          credentials={data.expiringCredentials}
          onViewCaregiver={onViewCaregiver}
        />
      )}

      {activeView === 'expired' && (
        <ExpiredCredentialsList
          credentials={data.expiredCredentials}
          onViewCaregiver={onViewCaregiver}
        />
      )}

      {activeView === 'missing' && (
        <MissingRequiredList
          missingList={data.missingRequiredCertifications}
          onViewCaregiver={onViewCaregiver}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// METRIC CARD
// ═══════════════════════════════════════════════════════════════════════════

function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  subtitle?: string;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            colorClasses[color as keyof typeof colorClasses]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-600">{subtitle}</div>}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CAREGIVER LIST
// ═══════════════════════════════════════════════════════════════════════════

function CaregiverList({
  caregivers,
  searchQuery,
  onSearchChange,
  selectedDiscipline,
  onDisciplineChange,
  disciplines,
  onViewCaregiver,
}: {
  caregivers: CaregiverCredentialSummary[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDiscipline: string | 'all';
  onDisciplineChange: (discipline: string | 'all') => void;
  disciplines: string[];
  onViewCaregiver?: (caregiverId: string) => void;
}) {
  const filteredCaregivers = caregivers.filter((caregiver) => {
    const matchesSearch =
      caregiver.caregiverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caregiver.discipline.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDiscipline =
      selectedDiscipline === 'all' || caregiver.discipline === selectedDiscipline;

    return matchesSearch && matchesDiscipline;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search caregivers..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDisciplineChange('all')}
              className={cn(selectedDiscipline === 'all' && 'bg-blue-100 border-blue-300')}
            >
              All
            </Button>
            {disciplines.map((discipline) => (
              <Button
                key={discipline}
                variant="outline"
                size="sm"
                onClick={() => onDisciplineChange(discipline)}
                className={cn(
                  selectedDiscipline === discipline && 'bg-blue-100 border-blue-300'
                )}
              >
                {discipline}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Caregiver Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                  Caregiver
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
                  Discipline
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
                  Total Credentials
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
                  Active
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
                  Expiring
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
                  Expired
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
                  Compliance
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
                  Can Schedule
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCaregivers.map((caregiver) => (
                <tr
                  key={caregiver.caregiverId}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {caregiver.caregiverName}
                        </div>
                        <div className="text-xs text-gray-600">{caregiver.office}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                      {caregiver.discipline}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-gray-900">
                    {caregiver.totalCredentials}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                      {caregiver.activeCredentials}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {caregiver.expiringSoonCredentials > 0 ? (
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                        {caregiver.expiringSoonCredentials}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {caregiver.expiredCredentials > 0 ? (
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                        {caregiver.expiredCredentials}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          caregiver.complianceStatus === 'compliant'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : caregiver.complianceStatus === 'at-risk'
                            ? 'bg-amber-100 text-amber-700 border-amber-300'
                            : 'bg-red-100 text-red-700 border-red-300'
                        )}
                      >
                        {caregiver.complianceRate}%
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {caregiver.canBeScheduled ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {onViewCaregiver && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewCaregiver(caregiver.caregiverId)}
                      >
                        View <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPIRING CREDENTIALS LIST
// ═══════════════════════════════════════════════════════════════════════════

function ExpiringCredentialsList({
  credentials,
  onViewCaregiver,
}: {
  credentials: Credential[];
  onViewCaregiver?: (caregiverId: string) => void;
}) {
  // Sort by days until expiration
  const sortedCredentials = [...credentials].sort((a, b) => {
    const daysA = Math.ceil(
      (new Date(a.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysB = Math.ceil(
      (new Date(b.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysA - daysB;
  });

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Expiring Credentials</h3>
      <div className="space-y-3">
        {sortedCredentials.map((credential) => {
          const config = CREDENTIAL_TYPE_CONFIG[credential.credentialType];
          const daysUntilExpiration = Math.ceil(
            (new Date(credential.expirationDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );

          return (
            <div
              key={credential.id}
              className="p-4 rounded-lg border bg-amber-50 border-amber-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{config.label}</div>
                    <div className="text-sm text-gray-600">
                      Caregiver ID: {credential.caregiverId}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-amber-700">
                    {daysUntilExpiration} days
                  </div>
                  <div className="text-xs text-gray-600">
                    {new Date(credential.expirationDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPIRED CREDENTIALS LIST
// ═══════════════════════════════════════════════════════════════════════════

function ExpiredCredentialsList({
  credentials,
  onViewCaregiver,
}: {
  credentials: Credential[];
  onViewCaregiver?: (caregiverId: string) => void;
}) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Expired Credentials</h3>
      <div className="space-y-3">
        {credentials.map((credential) => {
          const config = CREDENTIAL_TYPE_CONFIG[credential.credentialType];

          return (
            <div
              key={credential.id}
              className="p-4 rounded-lg border bg-red-50 border-red-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{config.label}</div>
                    <div className="text-sm text-gray-600">
                      Caregiver ID: {credential.caregiverId}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-red-700">EXPIRED</div>
                  <div className="text-xs text-gray-600">
                    {new Date(credential.expirationDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MISSING REQUIRED LIST
// ═══════════════════════════════════════════════════════════════════════════

function MissingRequiredList({
  missingList,
  onViewCaregiver,
}: {
  missingList: {
    caregiverId: string;
    caregiverName: string;
    discipline: string;
    missingCredentials: string[];
  }[];
  onViewCaregiver?: (caregiverId: string) => void;
}) {
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        Caregivers Missing Required Certifications
      </h3>
      <div className="space-y-3">
        {missingList.map((item) => (
          <div
            key={item.caregiverId}
            className="p-4 rounded-lg border bg-purple-50 border-purple-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-gray-900">{item.caregiverName}</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                  {item.discipline}
                </Badge>
              </div>

              {onViewCaregiver && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewCaregiver(item.caregiverId)}
                >
                  View Profile <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>

            <div className="text-sm text-gray-700 mb-2">
              Missing {item.missingCredentials.length} required credential
              {item.missingCredentials.length !== 1 ? 's' : ''}:
            </div>

            <div className="flex flex-wrap gap-1">
              {item.missingCredentials.map((credential, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-red-100 text-red-700 border-red-300 text-xs"
                >
                  {credential}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
