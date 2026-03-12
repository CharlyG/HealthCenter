/**
 * Offline Sync Management Demo
 * 
 * Interactive demonstration of the offline sync system including:
 * - Offline Status Indicator
 * - Offline Queue Panel
 * - Conflict Resolution UI
 * - Sync Progress
 * 
 * HIPAA Compliant: No real PHI - uses de-identified test data
 */

import { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Plus,
  FileText,
  UserCheck,
  FileSignature,
  Image,
  Activity,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import OfflineStatusIndicator from '../components/offline/OfflineStatusIndicator';
import OfflineQueuePanel from '../components/offline/OfflineQueuePanel';
import { useOfflineSync } from '../hooks/useOfflineSync';

export default function OfflineSyncDemo() {
  const { addToQueue, isOnline } = useOfflineSync();
  const [showQueue, setShowQueue] = useState(true);

  // Demo: Add sample items to queue
  const addSampleItem = (type: 'visit_check_in' | 'visit_documentation' | 'signature_capture' | 'photo_upload') => {
    const sampleData = {
      visit_check_in: {
        check_in_time: new Date().toISOString(),
        location_verified: true,
        supplies_checked: true,
      },
      visit_documentation: {
        chief_complaint: 'Wound care follow-up',
        vital_signs_completed: true,
        medications_reviewed: true,
        sections_completed: 5,
      },
      signature_capture: {
        signature_type: 'Patient Consent',
        captured_at: new Date().toISOString(),
        device: 'iPad Pro',
      },
      photo_upload: {
        photo_count: 3,
        photo_type: 'Wound Assessment',
        file_size_kb: 1250,
        resolution: '1920x1080',
      },
    };

    addToQueue({
      type,
      data: sampleData[type],
      patient_id: `PT${Math.floor(Math.random() * 90000) + 10000}`,
      patient_name: `Patient #${Math.floor(Math.random() * 90000) + 10000}`,
      visit_id: `V${Math.floor(Math.random() * 9000) + 1000}`,
    });
  };

  // Demo: Add conflicted item
  const addConflictedItem = () => {
    addToQueue({
      type: 'visit_documentation',
      data: {
        blood_pressure: '140/90',
        heart_rate: 78,
        temperature: 98.6,
        notes: 'Patient reports feeling better',
      },
      patient_id: 'PT12345',
      patient_name: 'Patient #12345',
      visit_id: 'V5678',
      conflict: {
        detected: true,
        serverVersion: {
          blood_pressure: '138/88',
          heart_rate: 76,
          temperature: 98.4,
          notes: 'Patient stable, no complaints',
        },
        localVersion: {
          blood_pressure: '140/90',
          heart_rate: 78,
          temperature: 98.6,
          notes: 'Patient reports feeling better',
        },
      },
    });
  };

  // Demo: Simulate offline mode
  const simulateOffline = () => {
    window.dispatchEvent(new Event('offline'));
    setTimeout(() => {
      alert('Offline mode simulated. The app will now behave as if you lost connection.');
    }, 100);
  };

  const simulateOnline = () => {
    window.dispatchEvent(new Event('online'));
    setTimeout(() => {
      alert('Online mode restored. Auto-sync will trigger.');
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Offline Sync Management Demo</h1>
              <p className="text-blue-100">
                Interactive demonstration of offline queue, sync status, and conflict resolution
              </p>
            </div>
            <OfflineStatusIndicator onClick={() => setShowQueue(!showQueue)} />
          </div>

          {/* Connection Status Banner */}
          <div className={`mt-4 p-4 rounded-lg ${isOnline ? 'bg-green-500/20' : 'bg-red-500/20'} border-2 ${isOnline ? 'border-green-300' : 'border-red-300'}`}>
            <div className="flex items-center gap-3">
              {isOnline ? (
                <>
                  <Wifi className="size-6" />
                  <div>
                    <p className="font-semibold">Connected to Internet</p>
                    <p className="text-sm text-blue-100">
                      Sync queue will process automatically
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="size-6" />
                  <div>
                    <p className="font-semibold">Working Offline</p>
                    <p className="text-sm text-blue-100">
                      Items will sync when connection returns
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Controls & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Feature Overview */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Info className="size-5 text-blue-600" />
                  Features
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Badge className="bg-green-600 mt-0.5">✓</Badge>
                    <p>Offline/Online detection</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-green-600 mt-0.5">✓</Badge>
                    <p>Queue management (4 item types)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-green-600 mt-0.5">✓</Badge>
                    <p>Auto-retry failed syncs</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-green-600 mt-0.5">✓</Badge>
                    <p>Conflict resolution UI</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-green-600 mt-0.5">✓</Badge>
                    <p>HIPAA compliant (no PHI)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge className="bg-green-600 mt-0.5">✓</Badge>
                    <p>localStorage persistence</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Sample Items */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Plus className="size-5 text-blue-600" />
                  Add to Queue
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Simulate creating offline items
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => addSampleItem('visit_check_in')}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <UserCheck className="size-4 text-blue-600" />
                  Visit Check-In
                </Button>
                <Button
                  onClick={() => addSampleItem('visit_documentation')}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <FileText className="size-4 text-purple-600" />
                  Visit Documentation
                </Button>
                <Button
                  onClick={() => addSampleItem('signature_capture')}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <FileSignature className="size-4 text-indigo-600" />
                  Signature Capture
                </Button>
                <Button
                  onClick={() => addSampleItem('photo_upload')}
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Image className="size-4 text-pink-600" />
                  Photo Upload
                </Button>
                <Button
                  onClick={addConflictedItem}
                  variant="outline"
                  className="w-full justify-start gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Activity className="size-4" />
                  Add Conflicted Item
                </Button>
              </CardContent>
            </Card>

            {/* Connection Controls */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Wifi className="size-5 text-blue-600" />
                  Connection
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Simulate offline/online mode
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={simulateOffline}
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                >
                  <WifiOff className="size-4 mr-2" />
                  Go Offline
                </Button>
                <Button
                  onClick={simulateOnline}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Wifi className="size-4 mr-2" />
                  Go Online
                </Button>
              </CardContent>
            </Card>

            {/* HIPAA Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">HIPAA Compliance</p>
                    <p className="text-blue-800 text-xs">
                      This system stores only de-identified data (Patient #12345) in localStorage.
                      No Protected Health Information (PHI) such as names, birthdates, or SSNs
                      are persisted locally.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Queue Panel */}
          <div className="lg:col-span-2">
            {showQueue && <OfflineQueuePanel />}
          </div>
        </div>
      </div>
    </div>
  );
}
