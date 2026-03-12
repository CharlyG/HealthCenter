/**
 * Cross-Module Interaction Patterns
 * 
 * Seamless navigation between related records without losing context.
 * 
 * Components:
 * - Quick View Drawer: Side panel for viewing related records
 * - Contextual Links: Smart links that open quick views or navigate
 * - Related Records Panel: Widget showing related items
 * - Breadcrumb Navigation: Track navigation path
 * 
 * Interaction Patterns:
 * 1. From visit → view patient chart (drawer)
 * 2. From claim → view admission (drawer)
 * 3. From alert → view documentation (drawer)
 * 4. From patient → view related visits (panel)
 * 5. From admission → view authorization (drawer)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  X,
  ChevronRight,
  ExternalLink,
  User,
  Briefcase,
  Stethoscope,
  FileText,
  Receipt,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Heart,
  AlertTriangle,
  Shield,
  ArrowLeft,
  Home,
  Eye,
  Edit,
  MoreHorizontal,
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

export type DrawerSize = 'sm' | 'md' | 'lg' | 'full';

export interface QuickViewConfig {
  id: string;
  type: 'patient' | 'admission' | 'visit' | 'document' | 'claim' | 'authorization';
  title: string;
  subtitle?: string;
  data: any;
}

export interface RelatedRecord {
  id: string;
  type: 'patient' | 'admission' | 'visit' | 'document' | 'claim' | 'authorization' | 'alert';
  title: string;
  subtitle?: string;
  metadata?: Record<string, string>;
  path?: string;
  onQuickView?: () => void;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isCurrent?: boolean;
}

// ==================== QUICK VIEW DRAWER ====================

interface QuickViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: QuickViewConfig;
  size?: DrawerSize;
}

export function QuickViewDrawer({ isOpen, onClose, config, size = 'lg' }: QuickViewDrawerProps) {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    full: 'max-w-full',
  };

  const handleFullView = () => {
    if (config.data.path) {
      navigate(config.data.path);
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full ${sizeClasses[size]} w-full bg-white shadow-2xl z-50 flex flex-col transition-transform`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-white">
                Quick View
              </Badge>
              <Badge variant="outline" className="bg-white">
                {config.type}
              </Badge>
            </div>
            <h2 className="text-xl font-bold text-gray-900 truncate">{config.title}</h2>
            {config.subtitle && (
              <p className="text-sm text-gray-600 truncate">{config.subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullView}
              className="gap-2"
            >
              <ExternalLink className="size-4" />
              Open Full View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="size-8 p-0"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {config.type === 'patient' && <PatientQuickView data={config.data} />}
          {config.type === 'admission' && <AdmissionQuickView data={config.data} />}
          {config.type === 'visit' && <VisitQuickView data={config.data} />}
          {config.type === 'document' && <DocumentQuickView data={config.data} />}
          {config.type === 'claim' && <ClaimQuickView data={config.data} />}
          {config.type === 'authorization' && <AuthorizationQuickView data={config.data} />}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Edit className="size-4 mr-2" />
                Edit
              </Button>
              <Button size="sm" onClick={handleFullView}>
                View Full Record
                <ChevronRight className="size-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ==================== QUICK VIEW CONTENT COMPONENTS ====================

function PatientQuickView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Patient Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="size-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {data.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{data.name}</h3>
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div>
                  <span className="text-gray-600">MRN:</span>
                  <span className="ml-2 font-semibold">{data.mrn}</span>
                </div>
                <div>
                  <span className="text-gray-600">DOB:</span>
                  <span className="ml-2 font-semibold">{data.dob}</span>
                </div>
                <div>
                  <span className="text-gray-600">Age:</span>
                  <span className="ml-2 font-semibold">{data.age} years</span>
                </div>
                <div>
                  <span className="text-gray-600">Gender:</span>
                  <span className="ml-2 font-semibold">{data.gender}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="size-4 text-gray-500" />
            <span className="font-semibold">{data.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 text-gray-500" />
            <span>{data.address}</span>
          </div>
        </CardContent>
      </Card>

      {/* Active Admissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Admissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.activeAdmissions?.map((admission: any) => (
              <div
                key={admission.id}
                className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{admission.id}</p>
                    <p className="text-xs text-gray-600">{admission.type} • Day {admission.day}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diagnoses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Primary Diagnoses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.diagnoses?.map((diagnosis: string, index: number) => (
              <div key={index} className="text-sm text-gray-700">
                • {diagnosis}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdmissionQuickView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Admission Header */}
      <Card className="border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{data.admissionId}</h3>
              <p className="text-gray-600 mt-1">{data.patientName}</p>
            </div>
            <Badge className="bg-green-100 text-green-800">{data.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Start Date:</span>
              <span className="ml-2 font-semibold">{data.startDate}</span>
            </div>
            <div>
              <span className="text-gray-600">Day in Episode:</span>
              <span className="ml-2 font-semibold">{data.dayInEpisode}/60</span>
            </div>
            <div>
              <span className="text-gray-600">Primary Payer:</span>
              <span className="ml-2 font-semibold">{data.primaryPayer}</span>
            </div>
            <div>
              <span className="text-gray-600">Episode:</span>
              <span className="ml-2 font-semibold">#{data.episodeNumber}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnosis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Primary Diagnosis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-900">{data.primaryDiagnosis}</p>
        </CardContent>
      </Card>

      {/* Authorization Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Authorization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Status:</span>
            <Badge className="bg-green-100 text-green-800">Approved</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Visits Authorized:</span>
            <span className="font-semibold">20</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Visits Used:</span>
            <span className="font-semibold">12</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Visits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Visits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.recentVisits?.map((visit: any) => (
              <div
                key={visit.id}
                className="p-3 border border-gray-200 rounded-lg text-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-blue-100 text-blue-800 text-xs mb-1">
                      {visit.discipline}
                    </Badge>
                    <p className="font-semibold text-gray-900">{visit.type}</p>
                    <p className="text-xs text-gray-600">{visit.date}</p>
                  </div>
                  <ChevronRight className="size-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VisitQuickView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Visit Header */}
      <Card className="border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge className="bg-blue-100 text-blue-800 mb-2">{data.discipline}</Badge>
              <h3 className="text-xl font-bold text-gray-900">{data.visitType}</h3>
              <p className="text-gray-600 mt-1">{data.patientName}</p>
            </div>
            <Badge className={data.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
              {data.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-gray-500" />
              <span>{data.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-gray-500" />
              <span>{data.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="size-4 text-gray-500" />
              <span>{data.clinician}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-gray-500" />
              <span>{data.admissionId}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visit Notes Preview */}
      {data.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visit Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Vital Signs */}
      {data.vitals && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vital Signs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">BP:</span>
                <span className="ml-2 font-semibold">{data.vitals.bp}</span>
              </div>
              <div>
                <span className="text-gray-600">HR:</span>
                <span className="ml-2 font-semibold">{data.vitals.hr} bpm</span>
              </div>
              <div>
                <span className="text-gray-600">Temp:</span>
                <span className="ml-2 font-semibold">{data.vitals.temp}°F</span>
              </div>
              <div>
                <span className="text-gray-600">O2 Sat:</span>
                <span className="ml-2 font-semibold">{data.vitals.o2}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DocumentQuickView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="size-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="size-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{data.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{data.type}</p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="text-gray-600">Created: {data.createdDate}</span>
                <span className="text-gray-600">By: {data.createdBy}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{data.content}</p>
          </div>
        </CardContent>
      </Card>

      {data.signatures && data.signatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Signatures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.signatures.map((sig: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <span className="font-semibold">{sig.name}</span>
                  <span className="text-gray-600">{sig.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ClaimQuickView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{data.claimNumber}</h3>
              <p className="text-gray-600 mt-1">{data.patientName}</p>
            </div>
            <Badge className={
              data.status === 'paid' ? 'bg-green-100 text-green-800' :
              data.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-amber-100 text-amber-800'
            }>
              {data.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Admission:</span>
              <span className="ml-2 font-semibold">{data.admissionId}</span>
            </div>
            <div>
              <span className="text-gray-600">Payer:</span>
              <span className="ml-2 font-semibold">{data.payer}</span>
            </div>
            <div>
              <span className="text-gray-600">Submitted:</span>
              <span className="ml-2 font-semibold">{data.submittedDate}</span>
            </div>
            <div>
              <span className="text-gray-600">Amount:</span>
              <span className="ml-2 font-semibold">${data.amount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Claim Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Episode:</span>
            <span className="font-semibold">#{data.episodeNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">HIPPS Code:</span>
            <span className="font-semibold">{data.hippsCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Visits:</span>
            <span className="font-semibold">{data.visitCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Episode Dates:</span>
            <span className="font-semibold">{data.episodeDates}</span>
          </div>
        </CardContent>
      </Card>

      {data.rejectionReasons && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base text-red-900">Rejection Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.rejectionReasons.map((reason: string, index: number) => (
                <div key={index} className="flex items-start gap-2 text-sm text-red-800">
                  <AlertTriangle className="size-4 flex-shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AuthorizationQuickView({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{data.authNumber}</h3>
              <p className="text-gray-600 mt-1">{data.patientName}</p>
            </div>
            <Badge className={
              data.status === 'approved' ? 'bg-green-100 text-green-800' :
              data.status === 'denied' ? 'bg-red-100 text-red-800' :
              'bg-amber-100 text-amber-800'
            }>
              {data.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Payer:</span>
              <span className="ml-2 font-semibold">{data.payer}</span>
            </div>
            <div>
              <span className="text-gray-600">Valid Through:</span>
              <span className="ml-2 font-semibold">{data.validThrough}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Authorization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Visits Authorized:</span>
            <span className="font-semibold">{data.visitsAuthorized}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Visits Used:</span>
            <span className="font-semibold">{data.visitsUsed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Visits Remaining:</span>
            <span className="font-semibold text-green-700">{data.visitsRemaining}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${(data.visitsUsed / data.visitsAuthorized) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {data.services?.map((service: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Shield className="size-4 text-blue-600" />
                <span>{service}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== CONTEXTUAL LINK ====================

interface ContextualLinkProps {
  type: 'patient' | 'admission' | 'visit' | 'document' | 'claim' | 'authorization';
  id: string;
  label: string;
  data: any;
  onQuickView?: (config: QuickViewConfig) => void;
  showIcon?: boolean;
  className?: string;
}

export function ContextualLink({
  type,
  id,
  label,
  data,
  onQuickView,
  showIcon = true,
  className = '',
}: ContextualLinkProps) {
  const navigate = useNavigate();

  const icons = {
    patient: User,
    admission: Briefcase,
    visit: Stethoscope,
    document: FileText,
    claim: Receipt,
    authorization: Shield,
  };

  const Icon = icons[type];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onQuickView) {
      onQuickView({
        id,
        type,
        title: label,
        subtitle: data.subtitle,
        data: { ...data, path: data.path },
      });
    } else if (data.path) {
      navigate(data.path);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
    >
      {showIcon && <Icon className="size-4" />}
      <span className="font-medium">{label}</span>
      <Eye className="size-3 opacity-60" />
    </button>
  );
}

// ==================== RELATED RECORDS PANEL ====================

interface RelatedRecordsPanelProps {
  title: string;
  records: RelatedRecord[];
  onQuickView?: (config: QuickViewConfig) => void;
}

export function RelatedRecordsPanel({ title, records, onQuickView }: RelatedRecordsPanelProps) {
  const navigate = useNavigate();

  const icons = {
    patient: User,
    admission: Briefcase,
    visit: Stethoscope,
    document: FileText,
    claim: Receipt,
    authorization: Shield,
    alert: AlertTriangle,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No related records</p>
        ) : (
          <div className="space-y-2">
            {records.map((record) => {
              const Icon = icons[record.type];
              return (
                <button
                  key={record.id}
                  onClick={() => {
                    if (record.onQuickView) {
                      record.onQuickView();
                    } else if (record.path) {
                      navigate(record.path);
                    }
                  }}
                  className="w-full p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="size-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {record.title}
                      </p>
                      {record.subtitle && (
                        <p className="text-xs text-gray-600 truncate">{record.subtitle}</p>
                      )}
                      {record.metadata && (
                        <div className="flex items-center gap-2 mt-1">
                          {Object.entries(record.metadata).map(([key, value]) => (
                            <span key={key} className="text-xs text-gray-500">
                              {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onQuickView && record.onQuickView) {
                            record.onQuickView();
                          }
                        }}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <ChevronRight className="size-4 text-gray-400" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== CONTEXTUAL BREADCRUMB ====================

interface ContextualBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function ContextualBreadcrumb({ items }: ContextualBreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <button
        onClick={() => navigate('/')}
        className="text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Home className="size-4" />
      </button>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="size-4 text-gray-400" />
          {item.isCurrent ? (
            <span className="font-semibold text-gray-900">{item.label}</span>
          ) : item.path ? (
            <button
              onClick={() => navigate(item.path!)}
              className="text-gray-600 hover:text-gray-900 hover:underline transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-600">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
