/**
 * Visit Documentation with Medication Review Demo
 * 
 * Complete visit documentation page showing how the Medication Review
 * section integrates into the visit workflow.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Save,
  Send,
  FileText,
  Pill,
  Activity,
  ClipboardList,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import VisitMedicationReview from '../components/VisitMedicationReview';

export default function VisitDocumentationMedicationDemo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('medications');

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
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Visit Documentation
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  SN Visit • Margaret Johnson • MRN-334455 • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                <Clock className="w-3 h-3 mr-1" />
                In Progress
              </Badge>
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button size="sm">
                <Send className="w-4 h-4 mr-2" />
                Submit Visit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-9">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="vitals">
                  <Activity className="w-4 h-4 mr-2" />
                  Vitals
                </TabsTrigger>
                <TabsTrigger value="assessment">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Assessment
                </TabsTrigger>
                <TabsTrigger value="medications">
                  <Pill className="w-4 h-4 mr-2" />
                  Medications
                </TabsTrigger>
                <TabsTrigger value="interventions">
                  <FileText className="w-4 h-4 mr-2" />
                  Interventions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vitals" className="mt-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Vital Signs</h3>
                  <p className="text-sm text-gray-600">Vital signs documentation would go here...</p>
                </Card>
              </TabsContent>

              <TabsContent value="assessment" className="mt-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Clinical Assessment</h3>
                  <p className="text-sm text-gray-600">Clinical assessment documentation would go here...</p>
                </Card>
              </TabsContent>

              <TabsContent value="medications" className="mt-6">
                <VisitMedicationReview />
              </TabsContent>

              <TabsContent value="interventions" className="mt-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Interventions</h3>
                  <p className="text-sm text-gray-600">Interventions documentation would go here...</p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="col-span-3 space-y-6">
            {/* Visit Info */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
              <h3 className="font-semibold text-gray-900 mb-4">Visit Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">Visit Type</div>
                  <div className="font-medium text-gray-900">Skilled Nursing</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Start Time</div>
                  <div className="font-medium text-gray-900">10:30 AM</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Duration</div>
                  <div className="font-medium text-gray-900">45 minutes</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Clinician</div>
                  <div className="font-medium text-gray-900">Jennifer Lee, RN</div>
                </div>
              </div>
            </Card>

            {/* Documentation Checklist */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Documentation Checklist</h3>
              <div className="space-y-2">
                <ChecklistItem label="Vitals Documented" completed />
                <ChecklistItem label="Assessment Complete" completed />
                <ChecklistItem label="Medication Review" completed={activeTab === 'medications'} />
                <ChecklistItem label="Interventions Documented" completed={false} />
                <ChecklistItem label="Patient Education" completed={false} />
                <ChecklistItem label="Care Plan Updated" completed={false} />
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/patient-medication-profile-view')}
                >
                  View Full Med Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/medication-change-tracking')}
                >
                  View Change History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  View Care Plan
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ label, completed }: { label: string; completed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {completed ? (
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
      )}
      <span className={cn(
        'text-sm',
        completed ? 'text-gray-900 font-medium' : 'text-gray-600'
      )}>
        {label}
      </span>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
