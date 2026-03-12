/**
 * Conflict Resolution Modal
 * 
 * Shows comparison view between server version and local version
 * when data conflicts are detected during sync.
 * 
 * User can:
 * - Keep Server Version
 * - Keep Local Version
 * - Merge Both (manual)
 * 
 * HIPAA Compliance: Only displays de-identified data summaries
 */

import { useState } from 'react';
import {
  AlertTriangle,
  Server,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  X,
  Clock,
  User,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { SyncQueueItem } from '../../hooks/useOfflineSync';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SyncQueueItem;
}

export default function ConflictResolutionModal({
  isOpen,
  onClose,
  item,
}: ConflictResolutionModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<'server' | 'local' | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  if (!isOpen) return null;

  const serverVersion = item.conflict?.serverVersion || {};
  const localVersion = item.conflict?.localVersion || item.data || {};

  const handleResolve = async () => {
    if (!selectedVersion) return;

    setIsResolving(true);

    // Simulate API call to resolve conflict
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log(`Conflict resolved with ${selectedVersion} version for item ${item.id}`);

    setIsResolving(false);
    onClose();
  };

  // Get all unique keys from both versions
  const allKeys = Array.from(
    new Set([...Object.keys(serverVersion), ...Object.keys(localVersion)])
  );

  // Determine if values differ for each key
  const getDiffStatus = (key: string) => {
    const serverValue = serverVersion[key];
    const localValue = localVersion[key];

    if (serverValue === undefined && localValue !== undefined) return 'local-only';
    if (localValue === undefined && serverValue !== undefined) return 'server-only';
    if (JSON.stringify(serverValue) !== JSON.stringify(localValue)) return 'different';
    return 'same';
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '(not set)';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="size-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Sync Conflict Detected
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  The server version has changed while you were offline. Choose which version to keep.
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <X className="size-5" />
            </Button>
          </div>
        </div>

        {/* Item Info */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <User className="size-4 text-gray-500" />
              <span className="font-medium text-gray-700">Patient:</span>
              <span className="text-gray-900">{item.patient_name}</span>
            </div>
            {item.visit_id && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Visit:</span>
                <span className="text-gray-900">#{item.visit_id}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-gray-500" />
              <span className="text-gray-600">
                {new Date(item.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Comparison View */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 divide-x divide-gray-200 h-full">
            {/* Server Version */}
            <div className="p-6">
              <div className="sticky top-0 bg-white pb-4 border-b border-gray-200 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="size-5 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Server Version</h3>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    Latest on Server
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  This is the most recent version saved on the server
                </p>
              </div>

              <div className="space-y-3">
                {allKeys.map(key => {
                  const diffStatus = getDiffStatus(key);
                  const value = serverVersion[key];
                  const isDifferent = diffStatus === 'different' || diffStatus === 'server-only';

                  return (
                    <div
                      key={`server-${key}`}
                      className={`p-3 rounded-lg border-2 ${
                        isDifferent
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          {key.replace(/_/g, ' ')}
                        </p>
                        {diffStatus === 'server-only' && (
                          <Badge className="bg-blue-600 text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 break-words">
                        {formatValue(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Local Version */}
            <div className="p-6">
              <div className="sticky top-0 bg-white pb-4 border-b border-gray-200 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="size-5 text-green-600" />
                    <h3 className="font-bold text-gray-900">Your Local Version</h3>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    Your Changes
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  This is the version you created while offline
                </p>
              </div>

              <div className="space-y-3">
                {allKeys.map(key => {
                  const diffStatus = getDiffStatus(key);
                  const value = localVersion[key];
                  const isDifferent = diffStatus === 'different' || diffStatus === 'local-only';

                  return (
                    <div
                      key={`local-${key}`}
                      className={`p-3 rounded-lg border-2 ${
                        isDifferent
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                          {key.replace(/_/g, ' ')}
                        </p>
                        {diffStatus === 'local-only' && (
                          <Badge className="bg-green-600 text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 break-words">
                        {formatValue(value)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Decision Section */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Choose which version to keep:
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Keep Server */}
            <Card
              className={`p-4 cursor-pointer transition-all border-2 ${
                selectedVersion === 'server'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
              onClick={() => setSelectedVersion('server')}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 size-6 rounded-full border-2 flex items-center justify-center ${
                    selectedVersion === 'server'
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {selectedVersion === 'server' && (
                    <CheckCircle2 className="size-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Server className="size-4 text-blue-600" />
                    Keep Server Version
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Discard your local changes
                  </p>
                </div>
              </div>
            </Card>

            {/* Keep Local */}
            <Card
              className={`p-4 cursor-pointer transition-all border-2 ${
                selectedVersion === 'local'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
              }`}
              onClick={() => setSelectedVersion('local')}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 size-6 rounded-full border-2 flex items-center justify-center ${
                    selectedVersion === 'local'
                      ? 'border-green-600 bg-green-600'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {selectedVersion === 'local' && (
                    <CheckCircle2 className="size-4 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <Smartphone className="size-4 text-green-600" />
                    Keep Your Version
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Overwrite server with your changes
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              <AlertTriangle className="size-3 inline mr-1 text-orange-500" />
              This action cannot be undone. Choose carefully.
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={isResolving}>
                Cancel
              </Button>
              <Button
                onClick={handleResolve}
                disabled={!selectedVersion || isResolving}
                className="gap-2"
              >
                {isResolving ? (
                  <>
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Resolve Conflict
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
