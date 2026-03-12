/**
 * Context Drawer - Right-Side Panel
 * 
 * Reusable pattern for viewing related information without leaving current screen.
 * Reduces navigation friction and supports multitasking.
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, ChevronRight } from 'lucide-react';
import { cn } from '../ui/utils';

interface ContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: any;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function ContextDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  width = 'lg',
  children,
  footer,
}: ContextDrawerProps) {
  const widthClasses = {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[32rem]',
    xl: 'w-[40rem]',
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transition-transform duration-300 flex flex-col',
          widthClasses[width],
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {Icon && (
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t flex-shrink-0 bg-gray-50">{footer}</div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT DRAWER PRESETS
// ═══════════════════════════════════════════════════════════════════════════

import { User, FileText, Pill, ClipboardCheck, CreditCard, Heart } from 'lucide-react';

export function PatientSummaryDrawer({
  isOpen,
  onClose,
  patient,
}: {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
}) {
  return (
    <ContextDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={patient.name}
      subtitle={`MRN: ${patient.mrn} • DOB: ${patient.dob}`}
      icon={User}
      width="lg"
    >
      <div className="space-y-6">
        {/* Demographics */}
        <Section title="Demographics">
          <InfoRow label="Age" value={`${patient.age} years`} />
          <InfoRow label="Gender" value={patient.gender} />
          <InfoRow label="Phone" value={patient.phone} />
          <InfoRow label="Address" value={patient.address} />
        </Section>

        {/* Active Admissions */}
        <Section title="Active Admissions">
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
            Medicare • Started 03/01/2024
          </Badge>
        </Section>

        {/* Alerts */}
        {patient.alerts && (
          <Section title="Clinical Alerts">
            {patient.alerts.map((alert: any) => (
              <Badge
                key={alert.id}
                variant="outline"
                className="bg-red-100 text-red-700 border-red-300"
              >
                {alert.message}
              </Badge>
            ))}
          </Section>
        )}

        {/* Quick Links */}
        <Section title="Quick Links">
          <QuickLink label="View Full Chart" onClick={() => console.log('Navigate')} />
          <QuickLink label="Medications" onClick={() => console.log('Navigate')} />
          <QuickLink label="Clinical Documents" onClick={() => console.log('Navigate')} />
        </Section>
      </div>
    </ContextDrawer>
  );
}

export function AdmissionSummaryDrawer({
  isOpen,
  onClose,
  admission,
}: {
  isOpen: boolean;
  onClose: () => void;
  admission: any;
}) {
  return (
    <ContextDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Admission ${admission.startDate}`}
      subtitle={admission.patientName}
      icon={FileText}
      width="lg"
    >
      <div className="space-y-6">
        <Section title="Admission Details">
          <InfoRow label="Start Date" value={admission.startDate} />
          <InfoRow label="Status" value={admission.status} />
          <InfoRow label="Primary Payer" value={admission.primaryPayer} />
          <InfoRow label="Case Manager" value={admission.caseManager} />
        </Section>

        <Section title="Disciplines">
          <div className="flex gap-2">
            {admission.disciplines.map((d: string) => (
              <Badge key={d} variant="outline">
                {d}
              </Badge>
            ))}
          </div>
        </Section>

        <Section title="Authorization">
          <InfoRow label="Status" value={admission.authStatus} />
          <InfoRow label="Visits Authorized" value={admission.visitsAuth} />
          <InfoRow label="Visits Used" value={admission.visitsUsed} />
        </Section>

        <Section title="Quick Actions">
          <QuickLink label="View Full Admission" onClick={() => console.log('Navigate')} />
          <QuickLink label="Schedule Visit" onClick={() => console.log('Navigate')} />
          <QuickLink label="View Documents" onClick={() => console.log('Navigate')} />
        </Section>
      </div>
    </ContextDrawer>
  );
}

export function MedicationDetailsDrawer({
  isOpen,
  onClose,
  medication,
}: {
  isOpen: boolean;
  onClose: () => void;
  medication: any;
}) {
  return (
    <ContextDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={medication.name}
      subtitle={`${medication.dose} ${medication.route}`}
      icon={Pill}
      width="md"
    >
      <div className="space-y-6">
        <Section title="Medication Details">
          <InfoRow label="Dose" value={medication.dose} />
          <InfoRow label="Route" value={medication.route} />
          <InfoRow label="Frequency" value={medication.frequency} />
          <InfoRow label="Prescriber" value={medication.prescriber} />
        </Section>

        <Section title="Instructions">
          <p className="text-sm text-gray-700">{medication.instructions}</p>
        </Section>

        {medication.alerts && (
          <Section title="Alerts">
            {medication.alerts.map((alert: string, i: number) => (
              <Badge
                key={i}
                variant="outline"
                className="bg-amber-100 text-amber-700 border-amber-300"
              >
                {alert}
              </Badge>
            ))}
          </Section>
        )}
      </div>
    </ContextDrawer>
  );
}

export function CaregiverProfileDrawer({
  isOpen,
  onClose,
  caregiver,
}: {
  isOpen: boolean;
  onClose: () => void;
  caregiver: any;
}) {
  return (
    <ContextDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={caregiver.name}
      subtitle={caregiver.discipline}
      icon={Heart}
      width="lg"
    >
      <div className="space-y-6">
        <Section title="Contact">
          <InfoRow label="Phone" value={caregiver.phone} />
          <InfoRow label="Email" value={caregiver.email} />
        </Section>

        <Section title="Credentials">
          <InfoRow label="License" value={caregiver.license} />
          <InfoRow label="Expires" value={caregiver.licenseExpiry} />
          <InfoRow label="Status" value={caregiver.status} />
        </Section>

        <Section title="Today's Schedule">
          <p className="text-sm text-gray-600">3 visits scheduled</p>
        </Section>

        <Section title="Quick Actions">
          <QuickLink label="View Full Profile" onClick={() => console.log('Navigate')} />
          <QuickLink label="View Schedule" onClick={() => console.log('Navigate')} />
          <QuickLink label="Assign Visit" onClick={() => console.log('Navigate')} />
        </Section>
      </div>
    </ContextDrawer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function QuickLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
    >
      <span>{label}</span>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </button>
  );
}