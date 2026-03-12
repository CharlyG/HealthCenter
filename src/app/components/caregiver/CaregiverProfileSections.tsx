/**
 * Caregiver Profile Section Components
 * 
 * Individual section components for disciplines, credentials, training,
 * availability, employment, and documents tabs.
 */

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Award,
  GraduationCap,
  Clock,
  FileText,
  Edit,
  Download,
  Calendar,
  MapPin,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building,
  DollarSign,
  User,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type {
  CaregiverProfile,
  Discipline,
  License,
  Certification,
  Training,
  Availability,
  Employment,
  CaregiverDocument,
  LicenseStatus,
  CertificationStatus,
} from '../../lib/caregiverTypes';
import { DISCIPLINE_CONFIG } from '../../lib/caregiverTypes';

// ═══════════════════════════════════════════════════════════════════════════
// DISCIPLINES TAB
// ═══════════════════════════════════════════════════════════════════════════

export function DisciplinesTab({
  profile,
  onEdit,
  mode,
}: {
  profile: CaregiverProfile;
  onEdit?: (section: string) => void;
  mode: 'full' | 'view-only';
}) {
  const primaryDiscipline = profile.disciplines.find((d) => d.isPrimary);
  const secondaryDisciplines = profile.disciplines.filter((d) => !d.isPrimary);

  return (
    <div className="space-y-6">
      {/* Primary Discipline */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Primary Discipline
          </h3>
          {mode === 'full' && onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit('disciplines')}>
              <Edit className="w-3 h-3" />
            </Button>
          )}
        </div>

        {primaryDiscipline && (
          <DisciplineCard discipline={primaryDiscipline} isPrimary />
        )}
      </Card>

      {/* Secondary Disciplines */}
      {secondaryDisciplines.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Secondary Disciplines</h3>
          <div className="grid grid-cols-2 gap-4">
            {secondaryDisciplines.map((discipline, index) => (
              <DisciplineCard key={index} discipline={discipline} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function DisciplineCard({
  discipline,
  isPrimary = false,
}: {
  discipline: Discipline;
  isPrimary?: boolean;
}) {
  const config = DISCIPLINE_CONFIG[discipline.type];

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2',
        isPrimary ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <Badge
          variant="outline"
          className={cn(
            'text-sm',
            `bg-${config.color}-100 text-${config.color}-700 border-${config.color}-300`
          )}
        >
          {config.label}
        </Badge>
        {isPrimary && (
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
            Primary
          </Badge>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Years Experience:</span>
          <span className="font-medium text-gray-900">{discipline.yearsExperience} years</span>
        </div>

        {discipline.specialties && discipline.specialties.length > 0 && (
          <div>
            <div className="text-gray-600 mb-1">Specialties:</div>
            <div className="flex flex-wrap gap-1">
              {discipline.specialties.map((specialty, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-gray-100 text-gray-700 border-gray-300 text-xs"
                >
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CREDENTIALS TAB
// ═══════════════════════════════════════════════════════════════════════════

export function CredentialsTab({
  profile,
  onEdit,
  mode,
}: {
  profile: CaregiverProfile;
  onEdit?: (section: string) => void;
  mode: 'full' | 'view-only';
}) {
  return (
    <div className="space-y-6">
      {/* Licenses */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Professional Licenses
          </h3>
          {mode === 'full' && onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit('licenses')}>
              <Edit className="w-3 h-3 mr-2" />
              Add License
            </Button>
          )}
        </div>

        {profile.licenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No licenses on file</div>
        ) : (
          <div className="space-y-3">
            {profile.licenses.map((license) => (
              <LicenseCard key={license.id} license={license} />
            ))}
          </div>
        )}
      </Card>

      {/* Certifications */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Certifications
          </h3>
          {mode === 'full' && onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit('certifications')}>
              <Edit className="w-3 h-3 mr-2" />
              Add Certification
            </Button>
          )}
        </div>

        {profile.certifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No certifications on file</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {profile.certifications.map((cert) => (
              <CertificationCard key={cert.id} certification={cert} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function LicenseCard({ license }: { license: License }) {
  const statusConfig: Record<
    LicenseStatus,
    { label: string; icon: any; color: string }
  > = {
    active: { label: 'Active', icon: CheckCircle, color: 'green' },
    expired: { label: 'Expired', icon: XCircle, color: 'red' },
    pending: { label: 'Pending', icon: Clock, color: 'amber' },
    suspended: { label: 'Suspended', icon: AlertTriangle, color: 'red' },
  };

  const config = statusConfig[license.status];
  const StatusIcon = config.icon;
  const daysUntilExpiration = Math.ceil(
    (new Date(license.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isExpiringSoon = daysUntilExpiration <= 30 && daysUntilExpiration > 0;

  return (
    <div className="p-4 rounded-lg border bg-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900 mb-1">{license.type}</h4>
          <div className="text-xs text-gray-600">License #: {license.licenseNumber}</div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            config.color === 'green'
              ? 'bg-green-100 text-green-700 border-green-300'
              : config.color === 'amber'
              ? 'bg-amber-100 text-amber-700 border-amber-300'
              : 'bg-red-100 text-red-700 border-red-300'
          )}
        >
          <StatusIcon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">State:</span>
          <span className="font-medium text-gray-900">{license.state}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Issue Date:</span>
          <span className="font-medium text-gray-900">
            {new Date(license.issueDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Expiration:</span>
          <span
            className={cn(
              'font-medium',
              isExpiringSoon
                ? 'text-amber-700'
                : license.status === 'expired'
                ? 'text-red-700'
                : 'text-gray-900'
            )}
          >
            {new Date(license.expirationDate).toLocaleDateString()}
            {isExpiringSoon && ` (${daysUntilExpiration} days)`}
          </span>
        </div>
        {license.verificationDate && (
          <div className="flex justify-between">
            <span className="text-gray-600">Last Verified:</span>
            <span className="font-medium text-gray-900">
              {new Date(license.verificationDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {isExpiringSoon && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-2 text-xs text-amber-700">
            <AlertTriangle className="w-3 h-3" />
            <span>Expires in {daysUntilExpiration} days - renewal required</span>
          </div>
        </div>
      )}
    </div>
  );
}

function CertificationCard({ certification }: { certification: Certification }) {
  const statusConfig: Record<
    CertificationStatus,
    { label: string; color: string }
  > = {
    current: { label: 'Current', color: 'green' },
    'expiring-soon': { label: 'Expiring Soon', color: 'amber' },
    expired: { label: 'Expired', color: 'red' },
    pending: { label: 'Pending', color: 'blue' },
  };

  const config = statusConfig[certification.status];
  const daysUntilExpiration = Math.ceil(
    (new Date(certification.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-4 rounded-lg border bg-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900 mb-1">{certification.name}</h4>
          <div className="text-xs text-gray-600">{certification.issuer}</div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            config.color === 'green'
              ? 'bg-green-100 text-green-700 border-green-300'
              : config.color === 'amber'
              ? 'bg-amber-100 text-amber-700 border-amber-300'
              : config.color === 'red'
              ? 'bg-red-100 text-red-700 border-red-300'
              : 'bg-blue-100 text-blue-700 border-blue-300'
          )}
        >
          {config.label}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Issue Date:</span>
          <span className="font-medium text-gray-900">
            {new Date(certification.issueDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Expiration:</span>
          <span className="font-medium text-gray-900">
            {new Date(certification.expirationDate).toLocaleDateString()}
            {certification.status === 'expiring-soon' && ` (${daysUntilExpiration} days)`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TRAINING TAB
// ═══════════════════════════════════════════════════════════════════════════

export function TrainingTab({
  profile,
  onEdit,
  mode,
}: {
  profile: CaregiverProfile;
  onEdit?: (section: string) => void;
  mode: 'full' | 'view-only';
}) {
  const categories = Array.from(new Set(profile.training.map((t) => t.category)));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Training & Education
        </h3>
        {mode === 'full' && onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit('training')}>
            <Edit className="w-3 h-3 mr-2" />
            Add Training
          </Button>
        )}
      </div>

      {profile.training.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No training records on file</div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryTraining = profile.training.filter((t) => t.category === category);

            return (
              <div key={category}>
                <h4 className="font-semibold text-gray-900 mb-3">{category}</h4>
                <div className="space-y-2">
                  {categoryTraining.map((training) => (
                    <TrainingRow key={training.id} training={training} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function TrainingRow({ training }: { training: Training }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900">{training.name}</span>
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              training.status === 'completed'
                ? 'bg-green-100 text-green-700 border-green-300'
                : training.status === 'in-progress'
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-amber-100 text-amber-700 border-amber-300'
            )}
          >
            {training.status === 'completed'
              ? 'Completed'
              : training.status === 'in-progress'
              ? 'In Progress'
              : 'Required'}
          </Badge>
        </div>
        <div className="text-xs text-gray-600">
          Completed: {new Date(training.completionDate).toLocaleDateString()}
          {training.hours && ` • ${training.hours} hours`}
          {training.instructor && ` • Instructor: ${training.instructor}`}
        </div>
      </div>

      {training.expirationDate && (
        <div className="text-right text-xs">
          <div className="text-gray-600">Expires:</div>
          <div className="font-medium text-gray-900">
            {new Date(training.expirationDate).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// AVAILABILITY TAB
// ═══════════════════════════════════════════════════════════════════════════

export function AvailabilityTab({
  profile,
  onEdit,
  mode,
}: {
  profile: CaregiverProfile;
  onEdit?: (section: string) => void;
  mode: 'full' | 'view-only';
}) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Availability
          </h3>
          {mode === 'full' && onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit('availability')}>
              <Edit className="w-3 h-3" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {days.map((day, index) => {
            const dayPreference = profile.availability.weeklyPreferences.find(
              (p) => p.dayOfWeek === index
            );

            return (
              <div
                key={day}
                className={cn(
                  'p-3 rounded-lg border',
                  dayPreference ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{day}</span>
                  {dayPreference ? (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-700">
                        {dayPreference.startTime} - {dayPreference.endTime}
                      </span>
                      {dayPreference.maxHours && (
                        <Badge variant="outline" className="bg-white text-gray-700 border-gray-300 text-xs">
                          Max {dayPreference.maxHours}h
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">Not Available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Capacity Limits</h4>
          <div className="space-y-3">
            {profile.availability.maxWeeklyHours && (
              <div className="flex justify-between">
                <span className="text-gray-600">Max Weekly Hours:</span>
                <span className="font-medium text-gray-900">
                  {profile.availability.maxWeeklyHours}h
                </span>
              </div>
            )}
            {profile.availability.maxDailyHours && (
              <div className="flex justify-between">
                <span className="text-gray-600">Max Daily Hours:</span>
                <span className="font-medium text-gray-900">
                  {profile.availability.maxDailyHours}h
                </span>
              </div>
            )}
            {profile.availability.travelRadius && (
              <div className="flex justify-between">
                <span className="text-gray-600">Travel Radius:</span>
                <span className="font-medium text-gray-900">
                  {profile.availability.travelRadius} miles
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Preferences & Restrictions</h4>
          <div className="space-y-3">
            {profile.availability.preferredTerritory &&
              profile.availability.preferredTerritory.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Preferred Territory:</div>
                  <div className="flex flex-wrap gap-1">
                    {profile.availability.preferredTerritory.map((territory, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-blue-100 text-blue-700 border-blue-300 text-xs"
                      >
                        {territory}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            {profile.availability.restrictions && profile.availability.restrictions.length > 0 && (
              <div>
                <div className="text-sm text-gray-600 mb-2">Restrictions:</div>
                <div className="flex flex-wrap gap-1">
                  {profile.availability.restrictions.map((restriction, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-red-100 text-red-700 border-red-300 text-xs"
                    >
                      {restriction}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.availability.notes && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Notes:</div>
                <div className="text-sm text-gray-900">{profile.availability.notes}</div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPLOYMENT TAB
// ═══════════════════════════════════════════════════════════════════════════

export function EmploymentTab({
  profile,
  onEdit,
  mode,
}: {
  profile: CaregiverProfile;
  onEdit?: (section: string) => void;
  mode: 'full' | 'view-only';
}) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Employment Details
          </h3>
          {mode === 'full' && onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit('employment')}>
              <Edit className="w-3 h-3" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Employee ID:</span>
            <span className="font-medium text-gray-900">{profile.employment.employeeId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Hire Date:</span>
            <span className="font-medium text-gray-900">
              {new Date(profile.employment.hireDate).toLocaleDateString()}
            </span>
          </div>
          {profile.employment.terminationDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Termination Date:</span>
              <span className="font-medium text-gray-900">
                {new Date(profile.employment.terminationDate).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Office:</span>
            <span className="font-medium text-gray-900">{profile.employment.office}</span>
          </div>
          {profile.employment.department && (
            <div className="flex justify-between">
              <span className="text-gray-600">Department:</span>
              <span className="font-medium text-gray-900">{profile.employment.department}</span>
            </div>
          )}
          {profile.employment.supervisor && (
            <div className="flex justify-between">
              <span className="text-gray-600">Supervisor:</span>
              <span className="font-medium text-gray-900">{profile.employment.supervisor}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Employment Type:</span>
            <span className="font-medium text-gray-900 capitalize">
              {profile.employment.employmentType}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Benefits Eligible:</span>
            <span className="font-medium text-gray-900">
              {profile.employment.benefitsEligible ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Compensation
        </h3>

        {profile.employment.payRate ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Pay Rate:</span>
              <span className="font-medium text-gray-900">
                ${profile.employment.payRate.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pay Type:</span>
              <span className="font-medium text-gray-900 capitalize">
                {profile.employment.payType}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Compensation information not available
          </div>
        )}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENTS TAB
// ═══════════════════════════════════════════════════════════════════════════

export function DocumentsTab({
  profile,
  onEdit,
  mode,
}: {
  profile: CaregiverProfile;
  onEdit?: (section: string) => void;
  mode: 'full' | 'view-only';
}) {
  const categories = Array.from(new Set(profile.documents.map((d) => d.category)));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documents
        </h3>
        {mode === 'full' && onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit('documents')}>
            <Edit className="w-3 h-3 mr-2" />
            Upload Document
          </Button>
        )}
      </div>

      {profile.documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No documents on file</div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryDocs = profile.documents.filter((d) => d.category === category);

            return (
              <div key={category}>
                <h4 className="font-semibold text-gray-900 mb-3">{category}</h4>
                <div className="space-y-2">
                  {categoryDocs.map((doc) => (
                    <DocumentRow key={doc.id} document={doc} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function DocumentRow({ document }: { document: CaregiverDocument }) {
  const fileSize = document.fileSize < 1024
    ? `${document.fileSize} B`
    : document.fileSize < 1024 * 1024
    ? `${(document.fileSize / 1024).toFixed(1)} KB`
    : `${(document.fileSize / (1024 * 1024)).toFixed(1)} MB`;

  const daysUntilExpiration = document.expirationDate
    ? Math.ceil(
        (new Date(document.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 30 && daysUntilExpiration > 0;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{document.name}</span>
            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
              {document.type}
            </Badge>
            {isExpiringSoon && (
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Expires in {daysUntilExpiration} days
              </Badge>
            )}
          </div>
          <div className="text-xs text-gray-600">
            Uploaded: {new Date(document.uploadDate).toLocaleDateString()} • {fileSize}
            {document.expirationDate && (
              <> • Expires: {new Date(document.expirationDate).toLocaleDateString()}</>
            )}
          </div>
        </div>
      </div>

      <Button variant="ghost" size="sm">
        <Download className="w-4 h-4" />
      </Button>
    </div>
  );
}
