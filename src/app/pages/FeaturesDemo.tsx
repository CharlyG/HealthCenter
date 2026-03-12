/**
 * Features Demo Page
 * 
 * Interactive demonstration of the 5 new priority features:
 * 1. Real-time Notification System
 * 2. Voice-to-Text Documentation
 * 3. Duplicate Patient Detection
 * 4. Advanced Search (Clinical Documentation)
 * 5. Photo/Video Capture (HIPAA-compliant)
 */

import React, { useState } from 'react';
import { Bell, Mic, Users, Search, Camera, ChevronDown, ChevronUp } from 'lucide-react';
import { NotificationCenter } from '../components/notifications/NotificationCenter';
import { useNotifications } from '../hooks/useNotifications';
import { VoiceRecorder } from '../components/voice/VoiceRecorder';
import { DuplicateDetectionAlert } from '../components/patients/DuplicateDetectionAlert';
import { DuplicateDetectionService, PatientIdentifier } from '../services/DuplicateDetectionService';
import { AdvancedSearchPanel } from '../components/search/AdvancedSearchPanel';
import { useAdvancedSearch } from '../hooks/useAdvancedSearch';
import { MediaCapturePanel } from '../components/media/MediaCapturePanel';

export default function FeaturesDemo() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const { sendNotification } = useNotifications();

  // Demo: Duplicate Detection
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<any[]>([]);
  const demoNewPatient = {
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1965-05-15',
    ssn: '5555',
    mrn: 'MRN-12345'
  };
  const demoExistingPatients: PatientIdentifier[] = [
    {
      id: 'PAT-001',
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: '1965-05-15',
      ssn: '5555',
      mrn: 'MRN-12344'
    },
    {
      id: 'PAT-002',
      firstName: 'Jon',
      lastName: 'Smyth',
      dateOfBirth: '1965-05-15',
      mrn: 'MRN-99999'
    }
  ];

  // Demo: Advanced Search
  const demoDocuments = [
    {
      id: 'DOC-001',
      type: 'Visit Note',
      title: 'Skilled Nursing Visit',
      content: 'Patient vital signs stable. BP 120/80, HR 72 bpm.',
      status: 'Approved',
      author: 'Sarah Johnson, RN',
      date: '2026-03-10',
      patientId: 'PAT-001',
      icd10Codes: ['I50.9', 'E11.9'],
      medications: ['Metformin 500mg', 'Lisinopril 10mg']
    },
    {
      id: 'DOC-002',
      type: 'Assessment',
      title: 'OASIS-E Start of Care',
      content: 'Initial assessment completed. Patient requires skilled nursing 3x/week.',
      status: 'Pending Review',
      author: 'Michael Chen, RN',
      date: '2026-03-09',
      patientId: 'PAT-002',
      icd10Codes: ['I50.9'],
      medications: ['Furosemide 40mg']
    },
    {
      id: 'DOC-003',
      type: 'Progress Note',
      title: 'Physical Therapy Progress',
      content: 'Patient showing improvement in gait and balance.',
      status: 'Draft',
      author: 'Lisa Wong, PT',
      date: '2026-03-11',
      patientId: 'PAT-001',
      icd10Codes: ['M25.561']
    }
  ];

  const {
    filter,
    results,
    resultCount,
    totalCount,
    updateFilter,
    resetFilter,
    savedSearches,
    saveSearch,
    loadSearch,
    deleteSavedSearch,
    searchHistory,
    clearHistory
  } = useAdvancedSearch({
    data: demoDocuments,
    searchableFields: ['title', 'content', 'author']
  });

  const handleTestNotification = (priority: 'critical' | 'high' | 'medium') => {
    const notifications = {
      critical: {
        title: 'Critical Patient Alert',
        message: 'Patient vitals out of range - BP 180/110',
        type: 'patient_alert' as const,
        actionUrl: '/patients/123',
        actionLabel: 'View Patient'
      },
      high: {
        title: 'Schedule Change',
        message: 'Your 2:00 PM visit has been rescheduled to 3:30 PM',
        type: 'schedule_change' as const,
        actionUrl: '/schedule',
        actionLabel: 'View Schedule'
      },
      medium: {
        title: 'Documentation Reminder',
        message: 'You have 3 visit notes pending completion',
        type: 'documentation_reminder' as const,
        actionUrl: '/documentation',
        actionLabel: 'Complete Now'
      }
    };

    const notif = notifications[priority];
    sendNotification({
      ...notif,
      priority
    });
  };

  const handleCheckDuplicates = async () => {
    const result = await DuplicateDetectionService.checkForDuplicates(
      demoNewPatient,
      demoExistingPatients
    );
    
    if (result.matches.length > 0) {
      setDuplicateMatches(result.matches);
      setShowDuplicateAlert(true);
    } else {
      alert('No duplicates found!');
    }
  };

  const features = [
    {
      id: 1,
      title: '1. Real-time Notification System',
      icon: Bell,
      color: 'blue',
      description: 'Push notifications for critical events with desktop notifications, sound alerts, and Do Not Disturb mode.',
      demo: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The notification center is always visible in the top-right corner. Click the tests below to see it in action:
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleTestNotification('critical')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
            >
              🚨 Test Critical Alert
            </button>
            <button
              onClick={() => handleTestNotification('high')}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium"
            >
              ⚠️ Test High Priority
            </button>
            <button
              onClick={() => handleTestNotification('medium')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              📝 Test Medium Priority
            </button>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Features:</strong> Desktop notifications, sound alerts, priority badges, action buttons, Do Not Disturb mode, notification persistence
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: '2. Voice-to-Text Documentation',
      icon: Mic,
      color: 'purple',
      description: 'Speech-to-text transcription with medical terminology optimization and auto-punctuation.',
      demo: (
        <div className="space-y-4">
          <VoiceRecorder 
            showMedicalMode={true}
            onTranscriptChange={(transcript) => console.log('Transcript:', transcript)}
          />
          <div className="p-4 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
            <p className="text-sm text-purple-900 dark:text-purple-100">
              <strong>Try saying:</strong> "Patient blood pressure is one twenty over eighty, heart rate seventy two beats per minute, oxygen saturation ninety eight percent."
            </p>
            <p className="text-sm text-purple-900 dark:text-purple-100 mt-2">
              Medical terms like "blood pressure" will auto-convert to "BP", "beats per minute" to "bpm", etc.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: '3. Duplicate Patient Detection',
      icon: Users,
      color: 'green',
      description: 'Fuzzy matching algorithm prevents duplicate admissions using name, DOB, SSN, and MRN.',
      demo: (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">New Patient:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Name:</strong> {demoNewPatient.firstName} {demoNewPatient.lastName}</div>
              <div><strong>DOB:</strong> {demoNewPatient.dateOfBirth}</div>
              <div><strong>SSN:</strong> ***-**-{demoNewPatient.ssn}</div>
              <div><strong>MRN:</strong> {demoNewPatient.mrn}</div>
            </div>
          </div>

          <button
            onClick={handleCheckDuplicates}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            Check for Duplicates
          </button>

          <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-900 dark:text-green-100">
              <strong>Algorithm:</strong> Uses Levenshtein distance for name matching, Soundex for phonetic similarity, 
              and weighted scoring across multiple identifiers (Name 30%, DOB 40%, SSN 20%, MRN 10%).
            </p>
          </div>

          <DuplicateDetectionAlert
            isOpen={showDuplicateAlert}
            matches={duplicateMatches}
            newPatient={demoNewPatient}
            onProceedWithNew={() => {
              setShowDuplicateAlert(false);
              alert('Proceeding with new patient admission');
            }}
            onSelectExisting={(patient) => {
              setShowDuplicateAlert(false);
              alert(`Using existing patient: ${patient.firstName} ${patient.lastName} (${patient.id})`);
            }}
            onCancel={() => setShowDuplicateAlert(false)}
          />
        </div>
      )
    },
    {
      id: 4,
      title: '4. Advanced Search (Clinical Documentation)',
      icon: Search,
      color: 'yellow',
      description: 'Full-text search with ICD-10 codes, medications, date ranges, and saved filters.',
      demo: (
        <div className="space-y-4">
          <AdvancedSearchPanel
            filter={filter}
            onFilterChange={updateFilter}
            onReset={resetFilter}
            onSave={saveSearch}
            savedSearches={savedSearches}
            onLoadSaved={loadSearch}
            onDeleteSaved={deleteSavedSearch}
            searchHistory={searchHistory}
            onClearHistory={clearHistory}
            resultCount={resultCount}
            totalCount={totalCount}
          />

          {/* Results */}
          <div className="space-y-2">
            {results.map((doc: any) => (
              <div key={doc.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{doc.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{doc.type} • {doc.author}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    doc.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' :
                    doc.status === 'Pending Review' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{doc.content}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {doc.icd10Codes?.map((code: string) => (
                    <span key={code} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 rounded">
                      {code}
                    </span>
                  ))}
                  {doc.medications?.map((med: string) => (
                    <span key={med} className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 rounded">
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-900 dark:text-yellow-100">
              <strong>Try searching:</strong> "BP", "I50.9", "Metformin", or filter by document type/status
            </p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: '5. Photo/Video Capture (HIPAA-compliant)',
      icon: Camera,
      color: 'red',
      description: 'Secure camera capture with metadata, annotations, and encrypted storage.',
      demo: (
        <div className="space-y-4">
          <MediaCapturePanel
            patientId="PAT-DEMO"
            visitId="VISIT-DEMO"
            allowVideo={true}
            onMediaCaptured={(media) => console.log('Media captured:', media)}
            onMediaUploaded={(id, url) => console.log('Media uploaded:', id, url)}
          />

          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-900 dark:text-red-100">
              <strong>Security:</strong> All media is stored in private Supabase Storage buckets with encryption at rest. 
              Access is granted only via signed URLs with expiration. Patient metadata is attached for audit trails.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header with Notification Center */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Priority Features Demo
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Interactive demonstration of 5 new features
            </p>
          </div>
          <NotificationCenter />
        </div>
      </div>

      {/* Features List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeFeature === feature.id;
            
            return (
              <div
                key={feature.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
              >
                {/* Feature Header */}
                <button
                  onClick={() => setActiveFeature(isActive ? null : feature.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-950`}>
                      <Icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {feature.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  {isActive ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Feature Demo */}
                {isActive && (
                  <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    {feature.demo}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📊 Implementation Summary
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>✅ <strong>Real-time Notifications:</strong> NotificationService, NotificationCenter component, useNotifications hook</li>
            <li>✅ <strong>Voice-to-Text:</strong> useVoiceToText hook with Web Speech API, VoiceRecorder component, medical terminology optimization</li>
            <li>✅ <strong>Duplicate Detection:</strong> DuplicateDetectionService with Levenshtein + Soundex, DuplicateDetectionAlert component</li>
            <li>✅ <strong>Advanced Search:</strong> useAdvancedSearch hook with full-text search, AdvancedSearchPanel component, saved searches</li>
            <li>✅ <strong>Media Capture:</strong> useMediaCapture hook with MediaDevices API, MediaCapturePanel component, HIPAA-compliant storage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
