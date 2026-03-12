/**
 * Credential Management Demo Page
 * 
 * Complete credential management system demonstration including:
 * - Credential Manager
 * - Expiration Alert System
 * - Caregiver Compliance Dashboard
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Shield, Bell, BarChart3 } from 'lucide-react';
import CredentialManager from '../components/CredentialManager';
import {
  CredentialAlertBanner,
  CredentialAlertList,
  CredentialAlertWidget,
} from '../components/CredentialExpirationAlerts';
import CaregiverComplianceDashboard from '../components/CaregiverComplianceDashboard';
import {
  generateMockCredentials,
  generateMockAlerts,
  generateMockComplianceDashboard,
} from '../lib/credentialMockData';

export default function CredentialManagementPage() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'individual' | 'alerts' | 'dashboard'>('individual');

  // Mock data
  const caregiverId = 'caregiver-001';
  const credentials = generateMockCredentials(caregiverId);
  const alerts = generateMockAlerts();
  const complianceData = generateMockComplianceDashboard();

  const handleAddCredential = () => {
    console.log('Add credential');
    alert('Add credential dialog would open here');
  };

  const handleEditCredential = (credentialId: string) => {
    console.log('Edit credential:', credentialId);
    alert(`Edit credential ${credentialId} dialog would open here`);
  };

  const handleDeleteCredential = (credentialId: string) => {
    console.log('Delete credential:', credentialId);
    if (confirm('Are you sure you want to delete this credential?')) {
      alert('Credential deleted');
    }
  };

  const handleUploadDocument = (credentialId: string) => {
    console.log('Upload document for credential:', credentialId);
    alert('Document upload dialog would open here');
  };

  const handleViewDocument = (credentialId: string) => {
    console.log('View document for credential:', credentialId);
    alert('Document viewer would open here');
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    console.log('Acknowledge alert:', alertId);
    alert('Alert acknowledged');
  };

  const handleViewCaregiver = (caregiverId: string) => {
    console.log('View caregiver:', caregiverId);
    alert(`Navigate to caregiver profile: ${caregiverId}`);
  };

  const handleExportReport = () => {
    console.log('Export compliance report');
    alert('Compliance report exported to CSV');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Credential Management System</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Complete credential tracking with expiration alerts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Architecture Overview */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Credential Management Architecture</h2>
          <p className="text-sm text-gray-600 mb-4">
            Complete credential management system for caregiver profiles with multi-level
            expiration alerts and compliance dashboard.
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm">7 Credential Types</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Professional License 🏥</li>
                <li>• CPR Certification ❤️</li>
                <li>• Background Check 🔍</li>
                <li>• TB Test 💉</li>
                <li>• Continuing Education 📚</li>
                <li>• Driver's License 🚗</li>
                <li>• Other credentials 📄</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2 text-sm">Alert Timing System</h3>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>• 90 days (Info severity)</li>
                <li>• 60 days (Medium severity)</li>
                <li>• 30 days (High severity)</li>
                <li>• 7 days (Critical severity)</li>
                <li>• Expired (Critical severity)</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2 text-sm">Key Features</h3>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Document upload & storage</li>
                <li>• Automatic expiration tracking</li>
                <li>• Multi-level alerts (4 locations)</li>
                <li>• Scheduling prevention logic</li>
                <li>• Compliance dashboard</li>
                <li>• Required credential tracking</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* View Selector */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Select View</h2>
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="individual">
                <Shield className="w-4 h-4 mr-2" />
                Individual Credential Manager
              </TabsTrigger>
              <TabsTrigger value="alerts">
                <Bell className="w-4 h-4 mr-2" />
                Expiration Alert System
              </TabsTrigger>
              <TabsTrigger value="dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Compliance Dashboard
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        {/* Individual Credential Manager View */}
        {activeView === 'individual' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Credential Manager Features</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 text-sm">Core Functionality</h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Add/Edit/Delete credentials</li>
                    <li>• Upload documents (PDF, images)</li>
                    <li>• Track issue and expiration dates</li>
                    <li>• View credential status (active/expiring/expired)</li>
                    <li>• Filter by credential type</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2 text-sm">Status Indicators</h3>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Active (green) - valid credential</li>
                    <li>• Expiring Soon (amber) - ≤30 days</li>
                    <li>• Expired (red) - blocks scheduling</li>
                    <li>• Required badge for mandatory credentials</li>
                    <li>• Days until expiration countdown</li>
                  </ul>
                </div>
              </div>
            </Card>

            <CredentialManager
              caregiverId={caregiverId}
              credentials={credentials}
              onAddCredential={handleAddCredential}
              onEditCredential={handleEditCredential}
              onDeleteCredential={handleDeleteCredential}
              onUploadDocument={handleUploadDocument}
              onViewDocument={handleViewDocument}
              mode="full"
            />
          </div>
        )}

        {/* Expiration Alert System View */}
        {activeView === 'alerts' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Alert System Features</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2 text-sm">4 Alert Locations</h3>
                  <ul className="text-xs text-red-800 space-y-1">
                    <li>• HR Dashboard (banner + list)</li>
                    <li>• Command Center (widget)</li>
                    <li>• Caregiver Profile (inline alerts)</li>
                    <li>• Scheduling Module (prevention)</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2 text-sm">Alert Features</h3>
                  <ul className="text-xs text-orange-800 space-y-1">
                    <li>• Severity-based filtering</li>
                    <li>• Acknowledge alerts</li>
                    <li>• Show/hide acknowledged</li>
                    <li>• Quick navigation to caregiver</li>
                    <li>• Detailed alert messages</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Alert Banner */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Alert Banner (HR Dashboard)</h3>
              <CredentialAlertBanner
                alerts={alerts}
                onViewAll={() => alert('View all alerts')}
                onAcknowledge={handleAcknowledgeAlert}
                mode="full"
              />
            </div>

            {/* Alert Widget */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Alert Widget (Command Center/Sidebar)
                </h3>
                <CredentialAlertWidget
                  alerts={alerts}
                  onViewAll={() => alert('View all alerts')}
                />
              </div>
              <div className="col-span-2">
                <h3 className="font-semibold text-gray-900 mb-3">Compact Banner</h3>
                <CredentialAlertBanner
                  alerts={alerts}
                  onViewAll={() => alert('View all alerts')}
                  mode="compact"
                />
              </div>
            </div>

            {/* Alert List */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Full Alert List</h3>
              <CredentialAlertList
                alerts={alerts}
                onAcknowledge={handleAcknowledgeAlert}
                onViewCaregiver={handleViewCaregiver}
                showFilters={true}
              />
            </div>
          </div>
        )}

        {/* Compliance Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Compliance Dashboard Features</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2 text-sm">Key Metrics</h3>
                  <ul className="text-xs text-green-800 space-y-1">
                    <li>• Total caregivers</li>
                    <li>• Compliant/At-Risk/Non-Compliant counts</li>
                    <li>• Overall compliance rate</li>
                    <li>• Total credentials</li>
                    <li>• Average credentials per caregiver</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-900 mb-2 text-sm">List Views</h3>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• All caregivers with compliance status</li>
                    <li>• Expiring credentials list</li>
                    <li>• Expired credentials list</li>
                    <li>• Missing required certifications</li>
                    <li>• Can be scheduled indicator</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2 text-sm">Filters & Actions</h3>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• Search by name/discipline</li>
                    <li>• Filter by discipline</li>
                    <li>• Export compliance report</li>
                    <li>• View caregiver profiles</li>
                    <li>• Sort by compliance metrics</li>
                  </ul>
                </div>
              </div>
            </Card>

            <CaregiverComplianceDashboard
              data={complianceData}
              onViewCaregiver={handleViewCaregiver}
              onExport={handleExportReport}
            />
          </div>
        )}
      </div>
    </div>
  );
}
