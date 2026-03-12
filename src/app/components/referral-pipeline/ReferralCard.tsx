/**
 * ReferralCard — Draggable card representing a single referral in the pipeline.
 * Sales-pipeline style with left urgency stripe, clear typography, and rich info density.
 *
 * Displays: Patient name, DOB, referral source, diagnosis summary, insurance provider,
 * referral date, assigned intake coordinator, and urgency indicator.
 */
import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import {
  Clock,
  Stethoscope,
  Activity as ActivityIcon,
  Accessibility,
  MessageSquare,
  Heart,
  Users,
  GripVertical,
  AlertTriangle,
  Shield,
  Building2,
  Calendar,
  User,
} from 'lucide-react';
import type { Referral, ServiceType } from '../../lib/referralPipelineTypes';
import { getUrgencyConfig, SOURCE_LABELS } from '../../lib/referralPipelineTypes';

const SERVICE_ICONS: Record<ServiceType, { icon: React.ElementType; color: string; label: string }> = {
  skilled_nursing: { icon: Stethoscope, color: 'text-blue-600', label: 'SN' },
  physical_therapy: { icon: ActivityIcon, color: 'text-green-600', label: 'PT' },
  occupational_therapy: { icon: Accessibility, color: 'text-purple-600', label: 'OT' },
  speech_therapy: { icon: MessageSquare, color: 'text-orange-600', label: 'ST' },
  medical_social_work: { icon: Users, color: 'text-teal-600', label: 'MSW' },
  home_health_aide: { icon: Heart, color: 'text-pink-600', label: 'HHA' },
  hospice: { icon: Heart, color: 'text-red-600', label: 'Hospice' },
};

export const REFERRAL_DND_TYPE = 'REFERRAL_CARD';

const URGENCY_STRIPE: Record<string, string> = {
  stat: 'bg-red-500',
  urgent: 'bg-orange-400',
  routine: 'bg-gray-300',
};

interface ReferralCardProps {
  referral: Referral;
  onClick: (referral: Referral) => void;
}

function formatAge(dob: string): string {
  if (!dob) return '';
  const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return `${age}y`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const ReferralCard = React.memo(function ReferralCard({ referral, onClick }: ReferralCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const urgency = getUrgencyConfig(referral.urgency);

  const [{ isDragging }, drag] = useDrag({
    type: REFERRAL_DND_TYPE,
    item: { id: referral.id, currentStage: referral.stage },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  drag(ref);

  const daysWarning = referral.daysInStage >= 3;
  const initials = referral.assignedTo
    ? referral.assignedTo.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '';
  const sourceLabel = SOURCE_LABELS[referral.source] || referral.sourceDetails || 'Unknown';
  const isRejected = referral.stage === 'rejected';

  return (
    <div
      ref={ref}
      onClick={() => onClick(referral)}
      className={cn(
        'relative bg-white rounded-lg border shadow-sm cursor-grab active:cursor-grabbing',
        'transition-all duration-150 hover:shadow-md hover:-translate-y-px group overflow-hidden',
        isDragging && 'opacity-30 shadow-xl scale-[1.03] rotate-1',
        referral.urgency === 'stat' && 'ring-1 ring-red-200',
        isRejected && 'opacity-75 bg-red-50/30',
      )}
      style={{ touchAction: 'none' }}
    >
      {/* Left urgency stripe */}
      <div className={cn('absolute inset-y-0 left-0 w-1 rounded-l-lg', URGENCY_STRIPE[referral.urgency])} />

      <div className="pl-3.5 pr-3 py-2.5">
        {/* Row 1: Grip + Name + Urgency badge */}
        <div className="flex items-center gap-1.5 mb-1">
          <GripVertical className="size-3.5 text-gray-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <h4 className="text-[13px] font-semibold text-gray-900 truncate flex-1 leading-tight">
            {referral.patientLastName}, {referral.patientFirstName}
          </h4>
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] h-[18px] px-1.5 shrink-0 font-bold gap-1 rounded-full',
              urgency.bg, urgency.border, urgency.text,
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', urgency.dot)} />
            {urgency.label}
          </Badge>
        </div>

        {/* Row 2: DOB & Age */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-1.5 pl-0.5">
          <span className="flex items-center gap-1">
            <User className="size-3 text-gray-400" />
            DOB: {referral.patientDob}
            {referral.patientDob && (
              <span className="text-gray-400">({formatAge(referral.patientDob)})</span>
            )}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3 text-gray-400" />
            Ref: {formatDate(referral.referralDate)}
          </span>
        </div>

        {/* Row 3: Diagnosis */}
        <p className="text-xs text-gray-500 truncate mb-1.5 leading-snug pl-0.5">
          {referral.primaryDiagnosis}
          {referral.primaryDiagnosisIcd && (
            <span className="text-gray-400 ml-1">({referral.primaryDiagnosisIcd})</span>
          )}
        </p>

        {/* Row 4: Referral Source */}
        <div className="flex items-center gap-1.5 mb-2 pl-0.5">
          <Building2 className="size-3 text-gray-400 shrink-0" />
          <span className="text-[11px] text-gray-500 truncate">{sourceLabel}</span>
          {referral.sourceDetails && referral.sourceDetails !== sourceLabel && (
            <span className="text-[10px] text-gray-400 truncate">&mdash; {referral.sourceDetails}</span>
          )}
        </div>

        {/* Row 5: Service chips */}
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          {referral.requestedServices.map((svc) => {
            const config = SERVICE_ICONS[svc];
            if (!config) return null;
            const Icon = config.icon;
            return (
              <span
                key={svc}
                className="inline-flex items-center gap-0.5 bg-gray-50 border border-gray-100 rounded-md px-1.5 py-0.5"
                title={svc.replace(/_/g, ' ')}
              >
                <Icon className={cn('size-3', config.color)} />
                <span className="text-[10px] font-medium text-gray-600">{config.label}</span>
              </span>
            );
          })}
        </div>

        {/* Row 6: Insurance + Auth */}
        {referral.insurancePlan && (
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="size-3 text-gray-400 shrink-0" />
            <span className="text-[11px] text-gray-600 truncate">{referral.insurancePlan}</span>
            {referral.authorizationStatus === 'approved' && (
              <Badge variant="outline" className="text-[9px] h-4 px-1 bg-emerald-50 border-emerald-200 text-emerald-700 rounded-full">
                Auth ✓
              </Badge>
            )}
            {referral.authorizationStatus === 'denied' && (
              <Badge variant="outline" className="text-[9px] h-4 px-1 bg-red-50 border-red-200 text-red-700 rounded-full">
                Denied
              </Badge>
            )}
            {referral.authorizationStatus === 'pending' && (
              <Badge variant="outline" className="text-[9px] h-4 px-1 bg-amber-50 border-amber-200 text-amber-700 rounded-full">
                Pending
              </Badge>
            )}
          </div>
        )}

        {/* Divider + Footer */}
        <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Days counter */}
            <span
              className={cn(
                'inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-1.5 py-0.5',
                daysWarning
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-gray-400',
              )}
            >
              <Clock className="size-3" />
              {referral.daysInStage}d
              {daysWarning && <AlertTriangle className="size-3 text-amber-500" />}
            </span>
            <span className="text-[10px] text-gray-300">|</span>
            <span className="text-[10px] text-gray-400">{referral.daysTotal}d total</span>
          </div>

          {/* Assignee avatar */}
          {referral.assignedTo && (
            <div className="flex items-center gap-1.5" title={referral.assignedTo}>
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-[8px] font-bold text-blue-700">{initials}</span>
              </div>
              <span className="text-[10px] text-gray-500 truncate max-w-[80px]">{referral.assignedTo.split(',')[0]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ReferralCard;
