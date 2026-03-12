/**
 * Smart Documentation Editor Demo Page
 */

import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import SmartDocumentationEditor from '../components/documentation/SmartDocumentationEditor';
import {
  Info,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export default function SmartDocumentationEditorDemoPage() {
  const [showLive, setShowLive] = useState(false);

  if (showLive) {
    return (
      <SmartDocumentationEditor
        visitId="VST-001"
        onSave={(data) => console.log('Auto-saved:', data)}
        onSubmit={(data) => {
          console.log('Submitted:', data);
          alert('Documentation submitted successfully!');
        }}
      />
    );
  }

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="size-8 text-blue-600" />
            Smart Documentation Editor
          </h1>
          <p className="text-gray-600 mt-2">
            Intelligent clinical visit notes editor that simplifies complex documentation
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About Smart Documentation Editor</p>
                <p className="mt-1 text-blue-800">
                  The Smart Documentation Editor provides a <strong>section-based form structure</strong> with 5 organized sections (Patient Status, Clinical Observations, Interventions, Patient Education, Plan Updates). Features include: progress indicator showing completion %, auto-save every 30 seconds, required fields highlighting, sidebar navigation between sections, quick phrase library, smart templates, and validation before submit. Designed to minimize clicks and complete documentation quickly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Try It Out */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <FileText className="size-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Try the Smart Documentation Editor</h3>
            <p className="text-sm text-green-800 mb-4">
              Experience the complete documentation workflow with auto-save and progress tracking
            </p>
            <Button onClick={() => setShowLive(true)} size="lg">
              Launch Editor
            </Button>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '✅ 5 organized sections',
                '✅ Progress indicator (% complete)',
                '✅ Auto-save every 30 seconds',
                '✅ Required fields highlighting',
                '✅ Sidebar navigation',
                '✅ Quick phrase library',
                '✅ Smart templates',
                '✅ Previous/Next navigation',
                '✅ Validation before submit',
                '✅ Mobile optimized',
                '✅ Section completion tracking',
                '✅ Visual feedback',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 5 Sections */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">5 Documentation Sections</h3>
            <div className="space-y-3">
              <SectionCard
                number={1}
                title="Patient Status"
                description="Current condition, vitals, pain, functional status"
                requiredFields={['Overall condition', 'Vital signs status', 'Pain level']}
              />
              <SectionCard
                number={2}
                title="Clinical Observations"
                description="Physical assessment findings by body system"
                requiredFields={['Respiratory', 'Cardiovascular']}
              />
              <SectionCard
                number={3}
                title="Interventions"
                description="Skilled nursing interventions, medications, treatments"
                requiredFields={['Skilled nursing interventions']}
              />
              <SectionCard
                number={4}
                title="Patient Education"
                description="Topics taught, understanding level, barriers"
                requiredFields={['Topics taught', 'Patient understanding']}
              />
              <SectionCard
                number={5}
                title="Plan Updates"
                description="Goals progress, plan changes, next visit focus"
                requiredFields={['Goals progress', 'Next visit focus']}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface SectionCardProps {
  number: number;
  title: string;
  description: string;
  requiredFields: string[];
}

function SectionCard({ number, title, description, requiredFields }: SectionCardProps) {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg bg-white">
      <div className="flex items-start gap-3">
        <div className="size-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
          {number}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-700 mb-2">{description}</p>
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">Required Fields:</p>
            <ul className="space-y-0.5">
              {requiredFields.map((field, i) => (
                <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span className="text-red-600">*</span>
                  <span>{field}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
