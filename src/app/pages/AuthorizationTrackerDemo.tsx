/**
 * Authorization Tracker Demo Page
 * 
 * Demonstrates the Authorization Tracker with different scenarios:
 * - Normal usage (< 80%)
 * - High usage (80-89%)
 * - Critical usage (90-99%)
 * - Exceeded (>= 100%)
 * - Expiring soon
 */
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import AuthorizationTracker from '../components/admission/AuthorizationTracker';

export default function AuthorizationTrackerDemo() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/design-system')}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Design System
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Authorization Tracker Demo</h1>
            <p className="text-sm text-gray-600 mt-1">
              Demonstration of different authorization scenarios
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="normal" className="space-y-6">
            <TabsList>
              <TabsTrigger value="normal">Normal Usage</TabsTrigger>
              <TabsTrigger value="high">High Usage (80%)</TabsTrigger>
              <TabsTrigger value="critical">Critical (90%)</TabsTrigger>
              <TabsTrigger value="exceeded">Exceeded</TabsTrigger>
              <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
            </TabsList>

            <TabsContent value="normal">
              <div className="bg-white rounded-lg p-6 mb-4 border border-gray-200">
                <h3 className="font-semibold text-lg mb-2">Normal Usage Scenario</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Authorization is at 45% usage - no alerts displayed. Staff can monitor progress
                  without immediate concerns.
                </p>
              </div>
              <AuthorizationTracker 
                patientId="demo-patient-1" 
                admissionId="demo-admission-1"
              />
            </TabsContent>

            <TabsContent value="high">
              <div className="bg-yellow-50 rounded-lg p-6 mb-4 border border-yellow-200">
                <h3 className="font-semibold text-lg mb-2 text-yellow-900">
                  High Usage Scenario (80%)
                </h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Authorization has reached 80% usage. System displays a warning alert recommending
                  staff to consider requesting renewal. This scenario would show mock data with 48/60
                  visits completed.
                </p>
              </div>
              <div className="opacity-60 pointer-events-none">
                <AuthorizationTracker 
                  patientId="demo-patient-2" 
                  admissionId="demo-admission-2"
                />
              </div>
              <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> In a real implementation, this would pass different data
                  showing 48 completed visits out of 60 authorized, triggering the 80% warning alert.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="critical">
              <div className="bg-orange-50 rounded-lg p-6 mb-4 border border-orange-200">
                <h3 className="font-semibold text-lg mb-2 text-orange-900">
                  Critical Usage Scenario (90%)
                </h3>
                <p className="text-sm text-orange-800 mb-4">
                  Authorization has reached 90% usage. System displays a high-severity alert with
                  stronger warning. This scenario would show 54/60 visits completed with prominent
                  alerts and recommended actions.
                </p>
              </div>
              <div className="opacity-60 pointer-events-none">
                <AuthorizationTracker 
                  patientId="demo-patient-3" 
                  admissionId="demo-admission-3"
                />
              </div>
              <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> In a real implementation, this would pass data showing
                  54 completed visits out of 60 authorized (90%), triggering high-severity alerts.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="exceeded">
              <div className="bg-red-50 rounded-lg p-6 mb-4 border border-red-200">
                <h3 className="font-semibold text-lg mb-2 text-red-900">
                  Exceeded Authorization Scenario
                </h3>
                <p className="text-sm text-red-800 mb-4">
                  Authorization has been exceeded - 63 visits completed against 60 authorized.
                  System displays critical alerts and flags this as a compliance issue requiring
                  immediate attention.
                </p>
              </div>
              <div className="opacity-60 pointer-events-none">
                <AuthorizationTracker 
                  patientId="demo-patient-4" 
                  admissionId="demo-admission-4"
                />
              </div>
              <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> In a real implementation, this would pass data showing
                  63 completed visits out of 60 authorized, triggering critical alerts and
                  displaying negative remaining visits.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="expiring">
              <div className="bg-amber-50 rounded-lg p-6 mb-4 border border-amber-200">
                <h3 className="font-semibold text-lg mb-2 text-amber-900">
                  Expiring Soon Scenario
                </h3>
                <p className="text-sm text-amber-800 mb-4">
                  Authorization expires in 10 days. System displays alerts prompting staff to
                  contact the payer for renewal. Even if visits haven't reached 80%, the expiration
                  alert ensures continuity of care.
                </p>
              </div>
              <div className="opacity-60 pointer-events-none">
                <AuthorizationTracker 
                  patientId="demo-patient-5" 
                  admissionId="demo-admission-5"
                />
              </div>
              <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> In a real implementation, this would pass data with an
                  end date 10 days from now, triggering expiration alerts even with lower usage.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Features Summary */}
          <div className="mt-8 bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-lg mb-4">Authorization Tracker Features</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Visual Indicators</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Color-coded progress bars</li>
                  <li>Segmented usage visualization</li>
                  <li>Discipline-level breakdowns</li>
                  <li>Historical authorization timeline</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Alert System</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>80% usage warning</li>
                  <li>90%+ critical alerts</li>
                  <li>Authorization exceeded flags</li>
                  <li>Expiration reminders (14 days)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Data Display</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Authorization period dates</li>
                  <li>Total, completed, remaining visits</li>
                  <li>Usage percentage calculations</li>
                  <li>Days until expiration</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-900 mb-2">Actions</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Request authorization extension</li>
                  <li>View authorization documents</li>
                  <li>Export usage reports</li>
                  <li>Access authorization history</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
