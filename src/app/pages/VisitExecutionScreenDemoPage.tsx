/**
 * Visit Execution Screen Demo Page
 */

import { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import VisitExecutionScreen from '../components/visit-execution/VisitExecutionScreen';
import {
  Info,
  Stethoscope,
  CheckCircle2,
} from 'lucide-react';

export default function VisitExecutionScreenDemoPage() {
  const [showLive, setShowLive] = useState(false);

  if (showLive) {
    return (
      <VisitExecutionScreen
        visitId="VST-001"
        onComplete={() => alert('Visit completed successfully!')}
      />
    );
  }

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="size-8 text-blue-600" />
            Visit Execution Screen
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time visit documentation interface for clinicians during patient visits
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold">About Visit Execution Screen</p>
                <p className="mt-1 text-blue-800">
                  The Visit Execution Screen provides a <strong>guided workflow</strong> for documenting patient visits in real-time. Features include: EVV Clock In/Out with GPS verification, structured vital signs entry, interventions checklist, clinical observations, patient education tracking, signature capture, progress stepper, auto-save, and offline capability. Designed to minimize navigation and complete visits quickly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Try It Out */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <Stethoscope className="size-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Try the Visit Execution Screen</h3>
            <p className="text-sm text-green-800 mb-4">
              Experience the complete visit documentation workflow
            </p>
            <Button onClick={() => setShowLive(true)} size="lg">
              Launch Visit Execution
            </Button>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                '✅ 7-step guided workflow',
                '✅ EVV Clock In/Out with GPS',
                '✅ Structured vital signs form',
                '✅ Interventions checklist',
                '✅ Clinical observations',
                '✅ Patient education tracking',
                '✅ Signature capture',
                '✅ Progress stepper',
                '✅ Auto-save functionality',
                '✅ Offline capable',
                '✅ Mobile optimized',
                '✅ Timer tracking',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
