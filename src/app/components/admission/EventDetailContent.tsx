/**
 * Event Detail Drawer Content
 * 
 * Comprehensive detail view for timeline events shown in a side drawer.
 * Displays complete information about visits, billing, authorizations, etc.
 */
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  FileText,
  Download,
  ExternalLink,
  Copy,
  Share2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit,
  Printer,
  Mail,
  Phone,
  Building,
  CreditCard,
  Shield,
  Activity,
  TrendingUp,
  Heart,
  Pill,
  Stethoscope,
  ClipboardCheck,
} from 'lucide-react';
import type { TimelineEvent, TimelineEventType } from './AdmissionTimeline';

interface EventDetailContentProps {
  event: TimelineEvent;
}

export default function EventDetailContent({ event }: EventDetailContentProps) {
  const fullTimestamp = new Date(event.timestamp).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Get type-specific details
  const getTypeSpecificContent = () => {
    switch (event.category) {
      case 'visit':
        return <VisitEventDetails event={event} />;
      case 'billing':
        return <BillingEventDetails event={event} />;
      case 'authorization':
        return <AuthorizationEventDetails event={event} />;
      case 'assessment':
        return <AssessmentEventDetails event={event} />;
      case 'order':
        return <OrderEventDetails event={event} />;
      case 'documentation':
        return <DocumentationEventDetails event={event} />;
      case 'admission':
        return <AdmissionEventDetails event={event} />;
      case 'discharge':
        return <DischargeEventDetails event={event} />;
      default:
        return <GenericEventDetails event={event} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Event Header Summary */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-700">
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-blue-600" />
              <span className="font-medium">{fullTimestamp}</span>
            </div>
            {event.metadata?.duration && (
              <>
                <span className="text-gray-400">•</span>
                <span>{event.metadata.duration}</span>
              </>
            )}
          </div>

          {event.staffMember && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="size-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {event.staffMember.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{event.staffMember.name}</p>
                <p className="text-xs text-gray-600">{event.staffMember.role}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Type-Specific Content */}
      {getTypeSpecificContent()}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              <ExternalLink className="size-4 mr-2" />
              Open Full Record
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Download className="size-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Copy className="size-4 mr-2" />
              Copy Details
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Share2 className="size-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Printer className="size-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Mail className="size-4 mr-2" />
              Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Event Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Event Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Event ID:</span>
            <span className="font-mono font-medium text-gray-900">{event.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Category:</span>
            <Badge variant="outline" className="text-[10px] capitalize">{event.category}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <Badge variant="outline" className="text-[10px]">{event.type.replace('_', ' ')}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Recorded:</span>
            <span className="font-medium text-gray-900">{new Date(event.timestamp).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Visit Event Details
function VisitEventDetails({ event }: { event: TimelineEvent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Stethoscope className="size-4 text-purple-600" />
          Visit Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {event.metadata?.location && (
          <div className="flex items-start gap-2">
            <MapPin className="size-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600">Location</p>
              <p className="text-sm font-semibold text-gray-900">{event.metadata.location}</p>
            </div>
          </div>
        )}

        {event.metadata?.duration && (
          <div className="flex items-start gap-2">
            <Clock className="size-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600">Duration</p>
              <p className="text-sm font-semibold text-gray-900">{event.metadata.duration}</p>
            </div>
          </div>
        )}

        {event.metadata?.status && (
          <div className="flex items-start gap-2">
            <Activity className="size-4 text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600">Status</p>
              <Badge className={`text-xs ${
                event.metadata.status === 'completed' ? 'bg-green-100 text-green-800' :
                event.metadata.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {event.metadata.status}
              </Badge>
            </div>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700">Services Provided</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Vital signs assessment</li>
            <li>• Wound care and dressing change</li>
            <li>• Medication review and education</li>
            <li>• Patient/caregiver teaching</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Billing Event Details
function BillingEventDetails({ event }: { event: TimelineEvent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <DollarSign className="size-4 text-green-600" />
          Billing Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {event.metadata?.amount !== undefined && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700 mb-1">Claim Amount</p>
            <p className="text-2xl font-bold text-green-900">
              ${event.metadata.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {event.metadata?.status && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Claim Status</span>
            <Badge className={`text-xs ${
              event.metadata.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
              event.metadata.status === 'paid' ? 'bg-green-100 text-green-800' :
              event.metadata.status === 'denied' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {event.metadata.status}
            </Badge>
          </div>
        )}

        <Separator />

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Claim Number:</span>
            <span className="font-mono font-medium text-gray-900">CLM-2026-0001</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service Period:</span>
            <span className="font-medium text-gray-900">02/08/26 - 03/07/26</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Visits:</span>
            <span className="font-medium text-gray-900">12 visits</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payer:</span>
            <span className="font-medium text-gray-900">Medicare Part A</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Authorization Event Details
function AuthorizationEventDetails({ event }: { event: TimelineEvent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="size-4 text-cyan-600" />
          Authorization Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {event.metadata?.status && (
          <div className="p-3 rounded-lg border-2 bg-cyan-50 border-cyan-200">
            <p className="text-xs text-cyan-700 mb-1">Authorization Status</p>
            <Badge className={`text-sm ${
              event.metadata.status === 'approved' ? 'bg-green-600 text-white' :
              event.metadata.status === 'denied' ? 'bg-red-600 text-white' :
              'bg-yellow-600 text-white'
            }`}>
              {event.metadata.status.toUpperCase()}
            </Badge>
          </div>
        )}

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Authorization #:</span>
            <span className="font-mono font-medium text-gray-900">AUTH-2026-5678</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Authorized Visits:</span>
            <span className="font-medium text-gray-900">60 visits</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Valid Through:</span>
            <span className="font-medium text-gray-900">05/15/2026</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payer:</span>
            <span className="font-medium text-gray-900">Medicare Part A</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-700">Authorized Services</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Skilled Nursing - 3x per week</li>
            <li>• Physical Therapy - 2x per week</li>
            <li>• Home Health Aide - as needed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Assessment Event Details
function AssessmentEventDetails({ event }: { event: TimelineEvent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <ClipboardCheck className="size-4 text-teal-600" />
          Assessment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Assessment Type:</span>
            <span className="font-medium text-gray-900">OASIS-E SOC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <Badge className={`text-xs ${
              event.metadata?.status === 'completed' ? 'bg-green-100 text-green-800' :
              event.metadata?.status === 'in progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {event.metadata?.status || 'Not started'}
            </Badge>
          </div>
          {event.metadata?.location && (
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium text-gray-900">{event.metadata.location}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-700">Assessment Sections</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="size-3 text-green-600" />
              <span>Demographics</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="size-3 text-green-600" />
              <span>Clinical History</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="size-3 text-green-600" />
              <span>Medications</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="size-3 text-yellow-600" />
              <span>Care Management</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Order Event Details
function OrderEventDetails({ event }: { event: TimelineEvent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Pill className="size-4 text-amber-600" />
          Order Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {event.metadata?.status && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Order Status</span>
            <Badge className={`text-xs ${
              event.metadata.status === 'signed' ? 'bg-green-100 text-green-800' :
              event.metadata.status === 'pending signature' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {event.metadata.status}
            </Badge>
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700">Ordered Services</p>
          <ul className="space-y-2">
            <li className="p-2 bg-gray-50 rounded border border-gray-200 text-xs">
              <p className="font-semibold text-gray-900">Skilled Nursing</p>
              <p className="text-gray-600">3 times per week - wound care & medication management</p>
            </li>
            <li className="p-2 bg-gray-50 rounded border border-gray-200 text-xs">
              <p className="font-semibold text-gray-900">Physical Therapy</p>
              <p className="text-gray-600">2 times per week - eval and treat, gait training</p>
            </li>
          </ul>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Physician:</span>
            <span className="font-medium text-gray-900">Dr. James Anderson</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Order Date:</span>
            <span className="font-medium text-gray-900">{new Date(event.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Documentation Event Details
function DocumentationEventDetails({ event }: { event: TimelineEvent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="size-4 text-indigo-600" />
          Documentation Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Document Type:</span>
            <span className="font-medium text-gray-900">Visit Note</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <Badge className="text-xs bg-green-100 text-green-800">Signed</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Document ID:</span>
            <span className="font-mono font-medium text-gray-900">DOC-{event.id}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-700">Document Summary</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Comprehensive skilled nursing visit note documenting patient assessment, interventions performed, patient response to treatment, and plan of care updates.
          </p>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            ✓ Electronically signed by {event.staffMember?.name}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Admission Event Details
function AdmissionEventDetails({ event }: { event: TimelineEvent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Heart className="size-4 text-blue-600" />
          Admission Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Admission Date:</span>
            <span className="font-medium text-gray-900">{new Date(event.timestamp).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Primary Payer:</span>
            <span className="font-medium text-gray-900">Medicare Part A</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Admission Source:</span>
            <span className="font-medium text-gray-900">Hospital Discharge</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Primary Diagnosis:</span>
            <span className="font-medium text-gray-900">I50.9 - CHF</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-700">Care Team</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Primary Nurse: Jennifer Lee, RN</li>
            <li>• Physical Therapist: Michael Chen, PT</li>
            <li>• Case Manager: Sarah Martinez</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Discharge Event Details
function DischargeEventDetails({ event }: { event: TimelineEvent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckCircle2 className="size-4 text-green-600" />
          Discharge Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Discharge Date:</span>
            <span className="font-medium text-gray-900">{new Date(event.timestamp).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Discharge Reason:</span>
            <span className="font-medium text-gray-900">Goals Met</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Days in Service:</span>
            <span className="font-medium text-gray-900">60 days</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-700">Discharge Outcomes</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• Functional improvement achieved</li>
            <li>• Patient independent with ADLs</li>
            <li>• Medication regimen stabilized</li>
            <li>• No hospital readmissions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Generic Event Details
function GenericEventDetails({ event }: { event: TimelineEvent }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="size-4 text-gray-600" />
          Event Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-gray-600">{event.description}</p>
        
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <>
            <Separator />
            <div className="space-y-2 text-xs">
              {Object.entries(event.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-medium text-gray-900">{String(value)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}