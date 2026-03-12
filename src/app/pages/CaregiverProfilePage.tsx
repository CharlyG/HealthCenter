/**
 * Caregiver Profile Demo Page
 * 
 * Demonstration page showcasing the complete caregiver profile architecture.
 */

import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';
import CaregiverProfile from '../components/CaregiverProfile';
import { generateMockCaregiverProfile } from '../lib/caregiverMockData';

export default function CaregiverProfilePage() {
  const navigate = useNavigate();
  const caregiverProfile = generateMockCaregiverProfile();

  const handleEdit = (section: string) => {
    console.log(`Edit section: ${section}`);
    alert(`Edit ${section} functionality would open a modal or navigate to edit form`);
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
                <h1 className="text-xl font-bold text-gray-900">Caregiver Profile</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Complete profile architecture for home health staff members
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
          <h2 className="font-semibold text-gray-900 mb-4">Caregiver Profile Architecture</h2>
          <p className="text-sm text-gray-600 mb-4">
            The Caregiver Profile acts as the central hub for all HR and credential information
            related to staff members providing patient care.
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm">7 Profile Sections</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Overview (Personal + Employment)</li>
                <li>• Disciplines and Roles</li>
                <li>• Credentials and Licenses</li>
                <li>• Certifications and Training</li>
                <li>• Availability Preferences</li>
                <li>• Employment Details</li>
                <li>• Documents Repository</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2 text-sm">6 Discipline Types</h3>
              <ul className="text-xs text-purple-800 space-y-1">
                <li>• Skilled Nursing (SN)</li>
                <li>• Physical Therapy (PT)</li>
                <li>• Occupational Therapy (OT)</li>
                <li>• Speech Therapy (ST)</li>
                <li>• Medical Social Work (MSW)</li>
                <li>• Home Health Aide (HHA)</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2 text-sm">Credential Compliance</h3>
              <ul className="text-xs text-green-800 space-y-1">
                <li>• Overall status (Compliant/Warning/Non-Compliant)</li>
                <li>• License expiration tracking</li>
                <li>• Certification renewal alerts</li>
                <li>• Training requirements monitoring</li>
                <li>• Automated compliance scoring</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Live Profile */}
        <CaregiverProfile
          profile={caregiverProfile}
          onEdit={handleEdit}
          mode="full"
        />
      </div>
    </div>
  );
}
