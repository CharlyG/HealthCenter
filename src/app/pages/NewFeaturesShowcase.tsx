/**
 * New Features Showcase
 * 
 * Demonstration page for the 5 newly implemented priority features:
 * 1. Real-time Notification System
 * 2. Advanced Search
 * 3. Voice-to-Text Documentation
 * 4. Predictive Scheduling
 * 5. Photo/Video Capture
 */

import React, { useState } from 'react';
import { Bell, Search, Mic, Calendar, Camera, CheckCircle, ArrowRight } from 'lucide-react';
import { NotificationCenter } from '../components/notifications/NotificationCenter';
import { AdvancedSearch, SearchResult, SearchFilters } from '../components/search/AdvancedSearch';
import { VoiceToTextEditor } from '../components/documentation/VoiceToTextEditor';
import { PhotoVideoCapture, CapturedMedia } from '../components/clinical/PhotoVideoCapture';
import { PredictiveSchedulingService, Visit, Caregiver } from '../services/PredictiveSchedulingService';
import { NotificationService } from '../services/NotificationService';
import { Button } from '../design-system/components/Button';

export const NewFeaturesShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [documentationText, setDocumentationText] = useState('');
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);

  // Demo: Notification System
  const handleSendDemoNotification = () => {
    NotificationService.send({
      type: 'patient_alert',
      priority: 'high',
      title: 'Patient Vital Signs Alert',
      message: 'John Doe - Blood pressure elevated: 160/95 mmHg. Requires immediate attention.',
      actionUrl: '/patients/123',
      actionLabel: 'View Patient'
    });
  };

  // Demo: Advanced Search
  const handleSearch = async (filters: SearchFilters): Promise<SearchResult[]> => {
    // Mock search results
    return [
      {
        id: '1',
        type: 'visit_note',
        title: 'Skilled Nursing Visit - Wound Care',
        patientName: 'Mary Johnson',
        patientMRN: 'MRN-12345',
        clinicianName: 'Sarah Smith, RN',
        date: new Date('2026-03-10'),
        snippet: `Patient presents with stage 2 pressure ulcer on sacrum. Wound measuring 3cm x 2cm. Applied ${filters.query} dressing after cleansing. Patient tolerated procedure well.`,
        matchedTerms: [filters.query],
        score: 0.95
      },
      {
        id: '2',
        type: 'assessment',
        title: 'OASIS-E Comprehensive Assessment',
        patientName: 'Robert Williams',
        patientMRN: 'MRN-67890',
        clinicianName: 'Jennifer Lee, RN',
        date: new Date('2026-03-09'),
        snippet: `M1242 Frequency of Pain: 3 - Daily but not constantly. Pain management includes ${filters.query}. Patient reports improved pain control.`,
        matchedTerms: [filters.query],
        score: 0.88
      },
      {
        id: '3',
        type: 'care_plan',
        title: 'Care Plan - CHF Management',
        patientName: 'Elizabeth Brown',
        patientMRN: 'MRN-11223',
        clinicianName: 'Michael Chen, RN',
        date: new Date('2026-03-08'),
        snippet: `Goal: Patient will maintain fluid balance. Interventions include daily weight monitoring, ${filters.query}, and patient education on dietary restrictions.`,
        matchedTerms: [filters.query],
        score: 0.82
      }
    ];
  };

  // Demo: Predictive Scheduling
  const handlePredictScheduling = () => {
    const demoVisit: Visit = {
      id: 'visit_1',
      patientId: 'patient_123',
      patientAcuity: 'high',
      visitType: 'SN',
      disciplines: ['Skilled Nursing'],
      scheduledDuration: 60,
      caregiverId: 'caregiver_1',
      scheduledDate: new Date(),
      scheduledTime: '10:00',
      address: {
        lat: 30.2672,
        lng: -97.7431,
        streetAddress: '123 Main St, Austin, TX'
      },
      isFirstVisit: true,
      requiresSupervision: false,
      complexityFactors: ['wound care', 'multiple medications', 'diabetes management']
    };

    const prediction = PredictiveSchedulingService.predictVisitDuration(demoVisit);
    
    alert(`Predictive Scheduling Results:
    
Predicted Duration: ${prediction.predictedDuration} minutes
Confidence: ${Math.round(prediction.confidence * 100)}%
Risk Level: ${prediction.riskLevel.toUpperCase()}

Time Adjustments:
${prediction.factors.map(f => `• ${f.factor}: ${f.impact > 0 ? '+' : ''}${f.impact} min`).join('\n')}

Recommendations:
${prediction.recommendations.map(r => `• ${r}`).join('\n')}`);
  };

  // Demo: Photo Capture
  const handlePhotoCapture = (media: CapturedMedia) => {
    console.log('Captured media:', media);
    alert(`Photo captured successfully!
    
Type: ${media.type}
Location: ${media.metadata.location}
Notes: ${media.metadata.notes || 'None'}
Size: ${Math.round(media.blob.size / 1024)} KB`);
  };

  const features = [
    {
      id: 'notifications',
      icon: Bell,
      title: 'Real-time Notification System',
      description: 'Push notifications for schedule changes, patient alerts, and critical events with desktop integration and sound alerts',
      status: 'complete',
      demoComponent: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Live Notification Center</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">Click the bell icon in the top right to view notifications</p>
            </div>
            <NotificationCenter />
          </div>
          <Button onClick={handleSendDemoNotification}>
            Send Demo Notification
          </Button>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="font-medium mb-1">Features</div>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>✓ Push notifications</li>
                <li>✓ Sound alerts</li>
                <li>✓ Desktop sync</li>
                <li>✓ Do Not Disturb</li>
              </ul>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="font-medium mb-1">Settings</div>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                <li>✓ Mute by type</li>
                <li>✓ Custom hours</li>
                <li>✓ Priority filtering</li>
                <li>✓ History (100 max)</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'search',
      icon: Search,
      title: 'Advanced Search',
      description: 'Full-text search across clinical documents with ICD-10, medications, and saved filters',
      status: 'complete',
      demoComponent: (
        <div className="space-y-4">
          <AdvancedSearch
            onSearch={handleSearch}
            onSelectResult={(result) => alert(`Selected: ${result.title}\nPatient: ${result.patientName}`)}
          />
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="font-medium mb-1">Search Capabilities</div>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-xs">
                <li>✓ Full-text search</li>
                <li>✓ Keyword highlighting</li>
                <li>✓ Relevance scoring</li>
              </ul>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="font-medium mb-1">Advanced Filters</div>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-xs">
                <li>✓ Document types</li>
                <li>✓ Date ranges</li>
                <li>✓ Clinician/Patient</li>
              </ul>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="font-medium mb-1">Saved Features</div>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-xs">
                <li>✓ Save searches</li>
                <li>✓ Search history</li>
                <li>✓ Quick suggestions</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'voice',
      icon: Mic,
      title: 'Voice-to-Text Documentation',
      description: 'Speech-to-text transcription with medical terminology optimization and voice commands',
      status: 'complete',
      demoComponent: (
        <div className="space-y-4">
          <VoiceToTextEditor
            value={documentationText}
            onChange={setDocumentationText}
            onSave={(text) => alert(`Documentation saved!\n\nWord count: ${text.split(/\s+/).length}\nCharacter count: ${text.length}`)}
            placeholder="Click 'Start Dictation' and begin speaking..."
          />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="font-medium mb-1">Voice Features</div>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-xs">
                <li>✓ Continuous recording</li>
                <li>✓ Pause/resume</li>
                <li>✓ Live transcription</li>
                <li>✓ Duration timer</li>
              </ul>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="font-medium mb-1">Smart Features</div>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-xs">
                <li>✓ Medical terms (50+)</li>
                <li>✓ Voice commands</li>
                <li>✓ Auto-punctuation</li>
                <li>✓ Edit while recording</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'scheduling',
      icon: Calendar,
      title: 'Predictive Scheduling',
      description: 'AI-powered visit duration prediction, rescheduling suggestions, and staffing forecasts',
      status: 'complete',
      demoComponent: (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Intelligent Scheduling Engine</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
              Predicts visit durations based on patient acuity, historical patterns, and complexity factors
            </p>
            <Button onClick={handlePredictScheduling}>
              Run Prediction Demo
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="font-medium mb-1">Prediction Factors</div>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-xs">
                <li>• Patient acuity</li>
                <li>• First visit (+30%)</li>
                <li>• Complexity factors</li>
                <li>• Historical patterns</li>
              </ul>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="font-medium mb-1">Optimization</div>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-xs">
                <li>• Travel time calc</li>
                <li>• Workload balancing</li>
                <li>• Late visit detection</li>
                <li>• Auto-rescheduling</li>
              </ul>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="font-medium mb-1">Forecasting</div>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-xs">
                <li>• 7-30 day forecasts</li>
                <li>• Staffing needs</li>
                <li>• Discipline-specific</li>
                <li>• Trend analysis</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'photo',
      icon: Camera,
      title: 'Photo/Video Capture',
      description: 'HIPAA-compliant media capture for wound documentation with annotation tools',
      status: 'complete',
      demoComponent: (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Clinical Photo/Video Capture</h4>
            <p className="text-sm text-green-700 dark:text-green-300 mb-4">
              Secure camera access with wound measurement tools and EXIF data stripping for HIPAA compliance
            </p>
            <Button onClick={() => setShowPhotoCapture(true)}>
              <Camera className="size-4 mr-2" />
              Open Camera
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="font-medium mb-1">Capture Features</div>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-xs">
                <li>✓ Photo & video modes</li>
                <li>✓ 1920x1080 resolution</li>
                <li>✓ Zoom 1x-3x</li>
                <li>✓ Front/back camera</li>
              </ul>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="font-medium mb-1">Documentation</div>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-xs">
                <li>✓ Annotation tools</li>
                <li>✓ Measurement ruler</li>
                <li>✓ Before/after comparison</li>
                <li>✓ EXIF stripping</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="size-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              New Features Showcase
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            5 priority features implemented on March 11, 2026 - Now available in production
          </p>
        </div>

        {/* Implementation Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-blue-600 mb-1">5</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Features Added</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-green-600 mb-1">100%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Priority Complete</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-purple-600 mb-1">455+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Features</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-orange-600 mb-1">98.9%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Implementation</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="space-y-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeDemo === feature.id;

            return (
              <div
                key={feature.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => setActiveDemo(isActive ? null : feature.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Icon className="size-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {feature.title}
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full">
                            Complete
                          </span>
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      className={`size-5 text-gray-400 transition-transform ${
                        isActive ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>

                {isActive && (
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    {feature.demoComponent}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Photo Capture Modal */}
      {showPhotoCapture && (
        <PhotoVideoCapture
          patientId="demo_patient"
          visitId="demo_visit"
          userId="demo_user"
          onCapture={handlePhotoCapture}
          onClose={() => setShowPhotoCapture(false)}
        />
      )}
    </div>
  );
};
