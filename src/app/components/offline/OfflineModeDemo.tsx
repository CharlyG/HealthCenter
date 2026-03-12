/**
 * Offline Mode Demo Page
 * 
 * Demonstrates the complete offline experience for clinicians.
 * Allows testing offline functionality and sync queue management.
 */

import { useState } from 'react';
import { FileText, Activity, Pill, User, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import OfflineModeManager from '../offline/OfflineModeManager';
import { useOfflineSync } from '../../hooks/useOfflineSync';

export default function OfflineModeDemo() {
  const { addToQueue, isOnline } = useOfflineSync();
  const [selectedPatient] = useState({
    id: 'PAT-001',
    name: 'Mary Johnson',
  });

  const handleAddVisitDoc = () => {
    addToQueue({
      type: 'visit_documentation',
      data: {
        patient_status: {
          overall_condition: 'Stable, no acute distress',
          vital_signs_stable: true,
          pain_level: 3,
        },
        observations: {
          respiratory: 'Lungs clear bilaterally',
          cardiovascular: 'Heart sounds regular, no murmurs',
        },
        interventions: {
          skilled_nursing: ['Vital signs monitored', 'Medication administration taught'],
        },
      },
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.name,
      visit_id: `VST-${Date.now()}`,
    });
  };

  const handleAddVitalSigns = () => {
    addToQueue({
      type: 'vital_signs',
      data: {
        blood_pressure: '120/80',
        heart_rate: 72,
        respiratory_rate: 16,
        temperature: 98.6,
        oxygen_saturation: 98,
      },
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.name,
      visit_id: `VST-${Date.now()}`,
    });
  };

  const handleAddMedication = () => {
    addToQueue({
      type: 'medication',
      data: {
        medication_name: 'Lisinopril 10mg',
        dose: '10mg',
        route: 'Oral',
        time_given: new Date().toISOString(),
        administered_by: 'Current User',
      },
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.name,
    });
  };

  const handleAddAssessment = () => {
    addToQueue({
      type: 'assessment',
      data: {
        assessment_type: 'Pain Assessment',
        pain_level: 5,
        pain_location: 'Lower back',
        pain_description: 'Dull, constant',
        interventions: 'Patient education on proper body mechanics',
      },
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.name,
      visit_id: `VST-${Date.now()}`,
    });
  };

  const handleAddVisitNote = () => {
    addToQueue({
      type: 'visit_note',
      data: {
        note_type: 'Progress Note',
        note_text: 'Patient showing improvement in mobility. Continuing current care plan.',
        author: 'Current User',
        created_at: new Date().toISOString(),
      },
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.name,
      visit_id: `VST-${Date.now()}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Mode Manager (Banner + Badge + Modal) */}
      <OfflineModeManager />

      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Offline Mode Demo
            </h1>
            <p className="text-gray-600">
              Test the offline experience by simulating record creation. Records will be queued
              and synchronized automatically when online.
            </p>
          </div>

          {/* Instructions */}
          <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">How to Test</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-blue-900">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>
                    <strong>Go Offline:</strong> Open DevTools (F12) → Network tab → Change "Online" to "Offline"
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>
                    <strong>Create Records:</strong> Click the buttons below to add records to the sync queue
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>
                    <strong>View Queue:</strong> Click the floating badge or top banner to see pending records
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>
                    <strong>Go Online:</strong> Switch back to "Online" and watch records sync automatically
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Current Patient Context */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Current Patient Context</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <User className="size-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{selectedPatient.name}</p>
                  <p className="text-sm text-gray-600">Patient ID: {selectedPatient.id}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    All records created will be associated with this patient
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Create Test Records</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Click any button to add a record to the sync queue
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Visit Documentation */}
                <button
                  onClick={handleAddVisitDoc}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                >
                  <FileText className="size-8 text-blue-600 mb-3" />
                  <p className="font-semibold text-gray-900 mb-1">Visit Documentation</p>
                  <p className="text-xs text-gray-600">
                    Complete visit notes with patient status, observations, and interventions
                  </p>
                </button>

                {/* Vital Signs */}
                <button
                  onClick={handleAddVitalSigns}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all text-left"
                >
                  <Activity className="size-8 text-red-600 mb-3" />
                  <p className="font-semibold text-gray-900 mb-1">Vital Signs</p>
                  <p className="text-xs text-gray-600">
                    Blood pressure, heart rate, temperature, and oxygen saturation
                  </p>
                </button>

                {/* Medication */}
                <button
                  onClick={handleAddMedication}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left"
                >
                  <Pill className="size-8 text-purple-600 mb-3" />
                  <p className="font-semibold text-gray-900 mb-1">Medication</p>
                  <p className="text-xs text-gray-600">
                    Medication administration record with dose, route, and time
                  </p>
                </button>

                {/* Assessment */}
                <button
                  onClick={handleAddAssessment}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-left"
                >
                  <User className="size-8 text-green-600 mb-3" />
                  <p className="font-semibold text-gray-900 mb-1">Assessment</p>
                  <p className="text-xs text-gray-600">
                    Clinical assessment including pain level and interventions
                  </p>
                </button>

                {/* Visit Note */}
                <button
                  onClick={handleAddVisitNote}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-all text-left"
                >
                  <ClipboardList className="size-8 text-yellow-600 mb-3" />
                  <p className="font-semibold text-gray-900 mb-1">Visit Note</p>
                  <p className="text-xs text-gray-600">
                    Quick progress note or clinical observation
                  </p>
                </button>

                {/* Batch Add */}
                <button
                  onClick={() => {
                    handleAddVisitDoc();
                    setTimeout(handleAddVitalSigns, 200);
                    setTimeout(handleAddMedication, 400);
                  }}
                  className="p-6 border-2 border-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all text-left"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="size-6 text-blue-600" />
                    <Activity className="size-6 text-blue-600" />
                    <Pill className="size-6 text-blue-600" />
                  </div>
                  <p className="font-semibold text-blue-900 mb-1">Add Multiple Records</p>
                  <p className="text-xs text-blue-700">
                    Create 3 records at once to test batch syncing
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900 text-base">Auto-Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-800">
                  Records automatically sync when connection is restored. No manual intervention needed.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900 text-base">Retry Logic</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-800">
                  Failed syncs automatically retry up to 3 times. Manual retry available for persistent failures.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-900 text-base">Local Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-800">
                  All records are securely stored on your device until successfully synced to the server.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}