/**
 * Payer Integration Hub Page
 * Main page integrating all payer modules with tab navigation
 */
import React, { useState, Suspense, lazy } from 'react';
import { cn } from '../components/ui/utils';
import {
  Shield, FileCheck, Send, Activity, DollarSign,
  Building2, ArrowLeft,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { LoadingState } from '../components/design-system/LoadingState';
import { PayerIntegrationDashboard } from '../components/payer/PayerIntegrationDashboard';

// Lazy load modules for performance
const EligibilityVerificationForm = lazy(() =>
  import('../components/payer/EligibilityVerificationForm').then((m) => ({ default: m.EligibilityVerificationForm })).catch(() => ({
    default: () => <div className="p-8 text-center text-red-600">Failed to load Eligibility Verification</div>
  }))
);
const AuthorizationRequests = lazy(() =>
  import('../components/payer/AuthorizationRequests').then((m) => ({ default: m.AuthorizationRequests })).catch(() => ({
    default: () => <div className="p-8 text-center text-red-600">Failed to load Authorization Requests</div>
  }))
);
const ClaimStatusPanel = lazy(() =>
  import('../components/payer/ClaimStatusPanel').then((m) => ({ default: m.ClaimStatusPanel })).catch(() => ({
    default: () => <div className="p-8 text-center text-red-600">Failed to load Claim Status Panel</div>
  }))
);
const ERAProcessing = lazy(() =>
  import('../components/payer/ERAProcessing').then((m) => ({ default: m.ERAProcessing })).catch(() => ({
    default: () => <div className="p-8 text-center text-red-600">Failed to load ERA Processing</div>
  }))
);
const PayerConfiguration = lazy(() =>
  import('../components/payer/PayerConfiguration').then((m) => ({ default: m.PayerConfiguration })).catch(() => ({
    default: () => <div className="p-8 text-center text-red-600">Failed to load Payer Configuration</div>
  }))
);

type Section = 'dashboard' | 'eligibility' | 'authorizations' | 'claims' | 'era' | 'config';

const SECTIONS = [
  {
    id: 'dashboard' as Section,
    label: 'Dashboard',
    icon: Activity,
    description: 'Overview and quick actions',
  },
  {
    id: 'eligibility' as Section,
    label: 'Eligibility Verification',
    icon: Shield,
    description: 'Verify patient insurance coverage',
  },
  {
    id: 'authorizations' as Section,
    label: 'Authorization Requests',
    icon: FileCheck,
    description: 'Submit and track prior auths',
  },
  {
    id: 'claims' as Section,
    label: 'Claim Status',
    icon: Send,
    description: 'Track claim lifecycle',
  },
  {
    id: 'era' as Section,
    label: 'ERA Processing',
    icon: DollarSign,
    description: 'Process remittance advice',
  },
  {
    id: 'config' as Section,
    label: 'Configuration',
    icon: Building2,
    description: 'Payer and clearinghouse setup',
  },
];

export default function PayerIntegrationHub() {
  const [activeSection, setActiveSection] = useState<Section>('dashboard');

  const activeConfig = SECTIONS.find((s) => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payer Integration Hub</h1>
              <p className="text-sm text-gray-600 mt-1">
                Centralized payer integrations for eligibility, authorizations, claims, and ERA
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap',
                    'border-2 font-medium text-sm',
                    isActive
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <Icon className="size-4" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <Suspense
          fallback={
            <Card className="p-12">
              <LoadingState message={`Loading ${activeConfig?.label}...`} />
            </Card>
          }
        >
          {activeSection === 'dashboard' && (
            <PayerIntegrationDashboard onNavigate={setActiveSection} />
          )}
          {activeSection === 'eligibility' && <EligibilityVerificationForm />}
          {activeSection === 'authorizations' && <AuthorizationRequests />}
          {activeSection === 'claims' && <ClaimStatusPanel />}
          {activeSection === 'era' && <ERAProcessing />}
          {activeSection === 'config' && <PayerConfiguration />}
        </Suspense>
      </div>
    </div>
  );
}