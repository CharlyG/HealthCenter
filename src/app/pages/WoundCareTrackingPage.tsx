/**
 * Wound Care Tracking Demo Page
 * 
 * Demonstrates the wound care tracking module with longitudinal data
 */

import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ArrowLeft,
  Activity,
  Info,
  Check,
  AlertCircle,
} from 'lucide-react';
import WoundCareTracking from '../components/WoundCareTracking';

export default function WoundCareTrackingPage() {
  const navigate = useNavigate();

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
                <h1 className="text-xl font-bold text-gray-900">Wound Care Tracking</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Margaret Johnson • MRN-334455 • Admission #12345
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="tracking">
          <TabsList>
            <TabsTrigger value="tracking">
              <Activity className="w-4 h-4 mr-2" />
              Wound Tracking
            </TabsTrigger>
            <TabsTrigger value="features">
              <Info className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="mt-6">
            <WoundCareTracking />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-6 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Wound Care Tracking Features</h3>

              <div className="space-y-6">
                {/* Core Data */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Wound Data Tracked (8 Categories)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <FeatureBox
                      title="Location"
                      description="Anatomical location (25+ predefined locations + custom)"
                      items={['Right heel', 'Left sacrum', 'Coccyx', 'Right ankle', '+ 21 more']}
                    />
                    <FeatureBox
                      title="Type"
                      description="Wound classification with color coding"
                      items={['Pressure injury', 'Diabetic ulcer', 'Venous ulcer', 'Surgical wound', '+ 5 more']}
                    />
                    <FeatureBox
                      title="Start Date"
                      description="When wound first identified"
                      items={['Initial identification date', 'Auto-calculates wound age', 'Tracks healing duration']}
                    />
                    <FeatureBox
                      title="Current Status"
                      description="6 status levels with trend indicators"
                      items={['New', 'Healing', 'Stable', 'Worsening', 'Infected', 'Healed']}
                    />
                    <FeatureBox
                      title="Measurements"
                      description="Comprehensive dimensional tracking"
                      items={['Length × Width × Depth (cm)', 'Area (cm²)', 'Undermining', 'Tunneling']}
                    />
                    <FeatureBox
                      title="Drainage"
                      description="Exudate assessment"
                      items={['Amount (none to copious)', 'Type (serous/purulent/etc)', 'Color', 'Odor level']}
                    />
                    <FeatureBox
                      title="Treatment"
                      description="Complete treatment protocol"
                      items={['Primary/secondary dressings', 'Change frequency', 'Topical medications', 'Offloading strategies']}
                    />
                    <FeatureBox
                      title="Photos"
                      description="Visual documentation with metadata"
                      items={['Time-stamped images', 'Ruler inclusion flag', 'Comparison gallery', 'Side-by-side views']}
                    />
                  </div>
                </div>

                {/* Progression View */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Progression View Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Timeline Visualization:</strong>
                        <p className="text-sm text-gray-700">Chronological display of all assessments with visual indicators</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Trend Detection:</strong>
                        <p className="text-sm text-gray-700">Automatic calculation of improving/stable/worsening based on measurements</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Percent Change Tracking:</strong>
                        <p className="text-sm text-gray-700">Shows % change in area between consecutive assessments</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Measurement Graphs:</strong>
                        <p className="text-sm text-gray-700">Line charts showing area, length, width, and depth over time</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Mini Chart in Cards:</strong>
                        <p className="text-sm text-gray-700">At-a-glance bar chart showing recent progression on wound card</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Photo Comparison:</strong>
                        <p className="text-sm text-gray-700">Side-by-side or sequential view of wound photos over time</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Wound Detail Panel */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Wound Detail Panel (5 Tabs)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">📊 Overview Tab</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Current status summary</li>
                        <li>• Comparison with previous assessment</li>
                        <li>• Recent assessment notes</li>
                        <li>• Mini trend chart (area over time)</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">📏 Measurements Tab</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Multi-line chart (L/W/D/Area)</li>
                        <li>• Measurement history table</li>
                        <li>• Percent change calculations</li>
                        <li>• Status per assessment</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">📸 Photos Tab</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Large photo viewer with navigation</li>
                        <li>• Photo metadata (date, clinician)</li>
                        <li>• Thumbnail gallery</li>
                        <li>• Zoom and download options</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">⏰ Timeline Tab</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Chronological assessment list</li>
                        <li>• Visual timeline with status dots</li>
                        <li>• Full assessment details per visit</li>
                        <li>• Clinician and date per entry</li>
                      </ul>
                    </div>
                    <div className="border border-gray-200 rounded p-3 col-span-2">
                      <h5 className="font-medium text-sm text-gray-900 mb-2">💊 Treatment Tab</h5>
                      <ul className="space-y-1 text-xs text-gray-700">
                        <li>• Complete treatment protocol</li>
                        <li>• Primary and secondary dressings with change frequency</li>
                        <li>• Offloading strategies and positioning</li>
                        <li>• Active vs discontinued treatments</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Longitudinal Analysis */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Longitudinal Analysis Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Wound Age Tracking:</strong>
                        <p className="text-sm text-gray-700">Automatic calculation of days since wound identified</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Days Since Last Assessment:</strong>
                        <p className="text-sm text-gray-700">Alerts when wound hasn't been assessed recently</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Healing Rate Analysis:</strong>
                        <p className="text-sm text-gray-700">Percent change between assessments shows healing velocity</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Complete Assessment History:</strong>
                        <p className="text-sm text-gray-700">Full longitudinal record from identification to healing</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Photo Comparison Capability:</strong>
                        <p className="text-sm text-gray-700">Visual comparison of wound appearance over time</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Treatment Effectiveness:</strong>
                        <p className="text-sm text-gray-700">Correlate treatment changes with healing progression</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Visual Indicators */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Visual Status Indicators</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border-l-4 border-l-green-500 bg-green-50 p-3 rounded">
                      <div className="font-medium text-green-900 mb-1">Healing</div>
                      <p className="text-xs text-green-700">Green border • Decreasing size • Positive trend</p>
                    </div>
                    <div className="border-l-4 border-l-gray-400 bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-900 mb-1">Stable</div>
                      <p className="text-xs text-gray-700">Gray border • No significant change • Neutral trend</p>
                    </div>
                    <div className="border-l-4 border-l-amber-500 bg-amber-50 p-3 rounded">
                      <div className="font-medium text-amber-900 mb-1">Worsening</div>
                      <p className="text-xs text-amber-700">Amber border • Increasing size • Negative trend</p>
                    </div>
                    <div className="border-l-4 border-l-red-500 bg-red-50 p-3 rounded">
                      <div className="font-medium text-red-900 mb-1">Infected</div>
                      <p className="text-xs text-red-700">Red border • Critical status • Requires intervention</p>
                    </div>
                    <div className="border-l-4 border-l-emerald-500 bg-emerald-50 p-3 rounded">
                      <div className="font-medium text-emerald-900 mb-1">Healed</div>
                      <p className="text-xs text-emerald-700">Emerald border • Area = 0 • Completed</p>
                    </div>
                    <div className="border-l-4 border-l-blue-500 bg-blue-50 p-3 rounded">
                      <div className="font-medium text-blue-900 mb-1">New</div>
                      <p className="text-xs text-blue-700">Blue border • Recently identified • Baseline</p>
                    </div>
                  </div>
                </div>

                {/* Wound Bed Assessment */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Wound Bed Tissue Types (6 Types)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-gray-200 rounded p-2">
                      <div className="w-6 h-6 bg-red-500 rounded mb-1" />
                      <p className="font-medium text-xs text-gray-900">Granulation</p>
                      <p className="text-xs text-gray-600">Healthy, red tissue</p>
                    </div>
                    <div className="border border-gray-200 rounded p-2">
                      <div className="w-6 h-6 bg-yellow-400 rounded mb-1" />
                      <p className="font-medium text-xs text-gray-900">Slough</p>
                      <p className="text-xs text-gray-600">Yellow, fibrinous</p>
                    </div>
                    <div className="border border-gray-200 rounded p-2">
                      <div className="w-6 h-6 bg-gray-900 rounded mb-1" />
                      <p className="font-medium text-xs text-gray-900">Eschar</p>
                      <p className="text-xs text-gray-600">Black, necrotic</p>
                    </div>
                    <div className="border border-gray-200 rounded p-2">
                      <div className="w-6 h-6 bg-pink-300 rounded mb-1" />
                      <p className="font-medium text-xs text-gray-900">Epithelial</p>
                      <p className="text-xs text-gray-600">Pink, new skin</p>
                    </div>
                    <div className="border border-gray-200 rounded p-2">
                      <div className="w-6 h-6 bg-stone-400 rounded mb-1" />
                      <p className="font-medium text-xs text-gray-900">Bone/Tendon</p>
                      <p className="text-xs text-gray-600">Exposed structures</p>
                    </div>
                    <div className="border border-gray-200 rounded p-2">
                      <div className="w-6 h-6 bg-red-700 rounded mb-1" />
                      <p className="font-medium text-xs text-gray-900">Muscle</p>
                      <p className="text-xs text-gray-600">Exposed muscle</p>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Clinical Use Cases</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Wound Nurses:</strong>
                        <p className="text-sm text-gray-700">Track all wounds across caseload, prioritize by status, ensure timely reassessment</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Visiting Clinicians:</strong>
                        <p className="text-sm text-gray-700">Review previous assessments before visit, document current state, track progression</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Physicians:</strong>
                        <p className="text-sm text-gray-700">Quick visual review of wound progression, adjust treatment orders, monitor outcomes</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Quality Teams:</strong>
                        <p className="text-sm text-gray-700">Monitor healing rates, identify trends, ensure documentation compliance</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Care Coordinators:</strong>
                        <p className="text-sm text-gray-700">Ensure wounds are being assessed per protocol, escalate non-healing wounds</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Mock Data */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Demo Data Included</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="p-3 bg-amber-50 border-amber-200">
                      <div className="font-medium text-amber-900 mb-2">Wound #1: Sacral Pressure Injury</div>
                      <ul className="space-y-1 text-xs text-amber-800">
                        <li>• Stage 2, 45 days old</li>
                        <li>• 6 assessments showing improvement</li>
                        <li>• Area decreased from 10.0 → 6.16 cm²</li>
                        <li>• Status: Healing (↓38% overall)</li>
                        <li>• 3 photos with ruler</li>
                      </ul>
                    </Card>
                    <Card className="p-3 bg-blue-50 border-blue-200">
                      <div className="font-medium text-blue-900 mb-2">Wound #2: Diabetic Heel Ulcer</div>
                      <ul className="space-y-1 text-xs text-blue-800">
                        <li>• Right heel, 60 days old</li>
                        <li>• 3 assessments, stable size</li>
                        <li>• Area stable at ~1.8 cm²</li>
                        <li>• Status: Stable (no change)</li>
                        <li>• 1 photo</li>
                      </ul>
                    </Card>
                    <Card className="p-3 bg-green-50 border-green-200">
                      <div className="font-medium text-green-900 mb-2">Wound #3: Venous Ankle Ulcer</div>
                      <ul className="space-y-1 text-xs text-green-800">
                        <li>• Left ankle, 90 days old</li>
                        <li>• 5 assessments, full healing</li>
                        <li>• Area: 0 cm² (healed 10 days ago)</li>
                        <li>• Status: Healed ✓</li>
                        <li>• Complete progression record</li>
                      </ul>
                    </Card>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper Component
function FeatureBox({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <h5 className="font-medium text-sm text-gray-900 mb-1">{title}</h5>
      <p className="text-xs text-gray-600 mb-2">{description}</p>
      <ul className="space-y-0.5">
        {items.map((item, idx) => (
          <li key={idx} className="text-xs text-gray-700">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
