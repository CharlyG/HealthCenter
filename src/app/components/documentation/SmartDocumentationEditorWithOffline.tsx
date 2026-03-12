/**
 * Smart Documentation Editor with Offline Support
 * 
 * Example integration showing how to use the offline sync system
 * with the Smart Documentation Editor.
 * 
 * Features:
 * - Auto-save to sync queue when offline
 * - Manual sync trigger
 * - Offline indicator
 * - Work without interruption
 */

import { useState } from 'react';
import SmartDocumentationEditor, {
  type VisitDocumentationData,
} from '../documentation/SmartDocumentationEditor';
import OfflineModeManager from '../offline/OfflineModeManager';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { Card, CardContent } from '../ui/card';
import { CheckCircle2, WifiOff, Wifi, AlertCircle } from 'lucide-react';

export default function SmartDocumentationEditorWithOffline() {
  const { isOnline, addToQueue } = useOfflineSync();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'queued'>('idle');

  const handleSave = (data: VisitDocumentationData) => {
    // Auto-save to sync queue
    addToQueue({
      type: 'visit_documentation',
      data: {
        ...data,
        save_type: 'draft',
      },
      patient_id: data.patient_id,
      patient_name: data.patient_name,
      visit_id: data.visit_id,
    });
  };

  const handleSubmit = (data: VisitDocumentationData) => {
    // Add to sync queue
    addToQueue({
      type: 'visit_documentation',
      data: {
        ...data,
        save_type: 'final',
        is_complete: true,
      },
      patient_id: data.patient_id,
      patient_name: data.patient_name,
      visit_id: data.visit_id,
    });

    // Show success message
    if (isOnline) {
      setSubmitStatus('success');
      setTimeout(() => {
        alert('Documentation submitted successfully!');
        setSubmitStatus('idle');
      }, 1500);
    } else {
      setSubmitStatus('queued');
      setTimeout(() => {
        alert('Documentation saved! It will sync automatically when you\'re back online.');
        setSubmitStatus('idle');
      }, 1500);
    }
  };

  return (
    <div className="size-full flex flex-col">
      {/* Offline Mode Manager (Banner + Badge + Modal) */}
      <OfflineModeManager />

      {/* Status Card */}
      {submitStatus !== 'idle' && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top">
          <Card className={`border-2 ${
            submitStatus === 'success' 
              ? 'border-green-200 bg-green-50' 
              : 'border-blue-200 bg-blue-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {submitStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="size-6 text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">
                        Documentation Submitted
                      </p>
                      <p className="text-xs text-green-700">
                        Successfully synced to server
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <WifiOff className="size-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Saved Offline
                      </p>
                      <p className="text-xs text-blue-700">
                        Will sync when connection returns
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Connection Status Bar (Optional - shows network status) */}
      <div className={`px-4 py-2 flex items-center gap-3 ${
        isOnline ? 'bg-green-100 text-green-900' : 'bg-yellow-100 text-yellow-900'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="size-4" />
            <span className="text-xs font-semibold">Online - Changes will sync immediately</span>
          </>
        ) : (
          <>
            <WifiOff className="size-4" />
            <span className="text-xs font-semibold">Offline - Changes will sync when connection returns</span>
          </>
        )}
      </div>

      {/* Smart Documentation Editor */}
      <div className="flex-1">
        <SmartDocumentationEditor
          visitId="VST-2026-03-09-001"
          initialData={{
            patient_id: 'PAT-001',
            patient_name: 'Mary Johnson',
            discipline: 'RN',
          }}
          onSave={handleSave}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}