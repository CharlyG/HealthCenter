/**
 * Offline Queue Panel
 * 
 * Shows items waiting for synchronization with detailed status.
 * Includes actions: Retry, Edit, Delete
 * 
 * Queue items include:
 * - visit check-ins
 * - visit documentation
 * - signature capture
 * - photo uploads
 * 
 * HIPAA Compliance: Patient names are de-identified (Patient #12345)
 * No PHI is stored in localStorage
 */

import { useState } from 'react';
import {
  FileText,
  UserCheck,
  FileSignature,
  Image,
  Activity,
  Pill,
  ClipboardList,
  User,
  RefreshCw,
  Trash2,
  Edit3,
  AlertCircle,
  CheckCircle2,
  Clock,
  Upload,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useOfflineSync, type SyncQueueItem } from '../../hooks/useOfflineSync';
import ConflictResolutionModal from './ConflictResolutionModal';

// ==================== TYPE ICONS & LABELS ====================

const getTypeConfig = (type: SyncQueueItem['type']) => {
  switch (type) {
    case 'visit_check_in':
      return {
        icon: UserCheck,
        label: 'Visit Check-In',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      };
    case 'visit_documentation':
      return {
        icon: FileText,
        label: 'Visit Documentation',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      };
    case 'signature_capture':
      return {
        icon: FileSignature,
        label: 'Signature Capture',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
      };
    case 'photo_upload':
      return {
        icon: Image,
        label: 'Photo Upload',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
      };
    case 'visit_note':
      return {
        icon: ClipboardList,
        label: 'Visit Note',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      };
    case 'vital_signs':
      return {
        icon: Activity,
        label: 'Vital Signs',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      };
    case 'medication':
      return {
        icon: Pill,
        label: 'Medication',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      };
    case 'assessment':
      return {
        icon: User,
        label: 'Assessment',
        color: 'text-teal-600',
        bgColor: 'bg-teal-50',
      };
  }
};

// ==================== STATUS BADGE ====================

interface StatusBadgeProps {
  status: SyncQueueItem['status'];
}

function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-gray-500 text-white gap-1">
          <Clock className="size-3" />
          Pending
        </Badge>
      );
    case 'syncing':
      return (
        <Badge className="bg-blue-600 text-white gap-1">
          <RefreshCw className="size-3 animate-spin" />
          Uploading
        </Badge>
      );
    case 'synced':
      return (
        <Badge className="bg-green-600 text-white gap-1">
          <CheckCircle2 className="size-3" />
          Completed
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="size-3" />
          Failed
        </Badge>
      );
  }
}

// ==================== QUEUE ITEM CARD ====================

interface QueueItemCardProps {
  item: SyncQueueItem;
  onRetry: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onResolveConflict: (id: string) => void;
}

function QueueItemCard({ 
  item, 
  onRetry, 
  onEdit, 
  onDelete,
  onResolveConflict,
}: QueueItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const typeConfig = getTypeConfig(item.type);
  const Icon = typeConfig.icon;

  const hasConflict = item.conflict?.detected;

  return (
    <Card className={`border-l-4 ${
      item.status === 'synced' ? 'border-l-green-500 bg-green-50/50' :
      item.status === 'failed' || hasConflict ? 'border-l-red-500 bg-red-50/50' :
      item.status === 'syncing' ? 'border-l-blue-500 bg-blue-50/50' :
      'border-l-gray-300'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Icon + Info */}
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
              <Icon className={`size-5 ${typeConfig.color}`} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Type & Status */}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="text-sm font-semibold text-gray-900">
                  {typeConfig.label}
                </h4>
                <StatusBadge status={item.status} />
                {hasConflict && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="size-3" />
                    Conflict
                  </Badge>
                )}
              </div>

              {/* Patient & Visit */}
              <div className="text-xs text-gray-600 space-y-0.5">
                <p>
                  <span className="font-medium">Patient:</span> {item.patient_name}
                </p>
                {item.visit_id && (
                  <p>
                    <span className="font-medium">Visit:</span> #{item.visit_id}
                  </p>
                )}
                <p>
                  <span className="font-medium">Created:</span>{' '}
                  {new Date(item.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Error Message */}
              {item.last_error && (
                <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                  <p className="text-xs text-red-700">
                    <AlertCircle className="size-3 inline mr-1" />
                    {item.last_error}
                  </p>
                </div>
              )}

              {/* Conflict Alert */}
              {hasConflict && (
                <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                  <p className="text-xs text-orange-700">
                    <AlertCircle className="size-3 inline mr-1" />
                    Server data has changed. Please resolve conflict.
                  </p>
                </div>
              )}

              {/* Retry Count */}
              {item.retry_count > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Retry attempts: {item.retry_count}/3
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-start gap-2">
            {hasConflict && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onResolveConflict(item.id)}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <AlertCircle className="size-3 mr-1" />
                Resolve
              </Button>
            )}

            {item.status === 'failed' && !hasConflict && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRetry(item.id)}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <RefreshCw className="size-3 mr-1" />
                Retry
              </Button>
            )}

            {item.status === 'pending' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(item.id)}
                className="text-gray-600 hover:bg-gray-100"
              >
                <Edit3 className="size-3 mr-1" />
                Edit
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500"
            >
              {isExpanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Expanded Details */}
      {isExpanded && (
        <CardContent className="pt-0 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3 mt-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Data Summary
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Type:</span> {item.type}
              </p>
              <p>
                <span className="font-medium">Patient ID:</span> {item.patient_id}
              </p>
              <p>
                <span className="font-medium">Created:</span> {item.timestamp}
              </p>
              <p>
                <span className="font-medium">Status:</span> {item.status}
              </p>
              {item.data && Object.keys(item.data).length > 0 && (
                <p className="mt-2 pt-2 border-t border-gray-200">
                  <span className="font-medium">Fields:</span>{' '}
                  {Object.keys(item.data).join(', ')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ==================== MAIN OFFLINE QUEUE PANEL ====================

interface OfflineQueuePanelProps {
  className?: string;
}

export default function OfflineQueuePanel({ className = '' }: OfflineQueuePanelProps) {
  const {
    syncQueue,
    isOnline,
    isSyncing,
    removeFromQueue,
    retryItem,
    triggerSync,
  } = useOfflineSync();

  const [filterStatus, setFilterStatus] = useState<SyncQueueItem['status'] | 'all'>('all');
  const [conflictItemId, setConflictItemId] = useState<string | null>(null);

  // Filter queue
  const filteredQueue = syncQueue.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  // Stats
  const pendingCount = syncQueue.filter(i => i.status === 'pending').length;
  const failedCount = syncQueue.filter(i => i.status === 'failed').length;
  const syncedCount = syncQueue.filter(i => i.status === 'synced').length;
  const uploadingCount = syncQueue.filter(i => i.status === 'syncing').length;
  const conflictCount = syncQueue.filter(i => i.conflict?.detected).length;

  const handleEdit = (id: string) => {
    // In production, open edit modal with the item data
    console.log('Edit item:', id);
    alert('Edit functionality would open a modal to modify the queued data.');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item? This cannot be undone.')) {
      removeFromQueue(id);
    }
  };

  const handleResolveConflict = (id: string) => {
    setConflictItemId(id);
  };

  const conflictItem = syncQueue.find(i => i.id === conflictItemId);

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Upload className="size-5 text-blue-600" />
              Sync Queue
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {syncQueue.length === 0
                ? 'All items synced'
                : `${syncQueue.length} item${syncQueue.length !== 1 ? 's' : ''} waiting to sync`}
            </p>
          </div>

          <Button
            onClick={triggerSync}
            disabled={!isOnline || isSyncing || pendingCount === 0}
            className="gap-2"
          >
            <RefreshCw className={`size-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{syncQueue.length}</p>
            <p className="text-xs text-gray-600">Total</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-600">{pendingCount}</p>
            <p className="text-xs text-gray-600">Pending</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{uploadingCount}</p>
            <p className="text-xs text-gray-600">Uploading</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{failedCount}</p>
            <p className="text-xs text-gray-600">Failed</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{syncedCount}</p>
            <p className="text-xs text-gray-600">Completed</p>
          </Card>
        </div>

        {/* Conflict Alert */}
        {conflictCount > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-orange-600" />
              <div>
                <p className="text-sm font-semibold text-orange-900">
                  {conflictCount} Conflict{conflictCount !== 1 ? 's' : ''} Detected
                </p>
                <p className="text-xs text-orange-700 mt-0.5">
                  Server data changed while offline. Review and resolve conflicts below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <Filter className="size-4 text-gray-400" />
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'syncing', 'failed', 'synced'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Queue List */}
        <div className="space-y-3">
          {filteredQueue.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CheckCircle2 className="size-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">
                {filterStatus === 'all'
                  ? 'No items in queue'
                  : `No ${filterStatus} items`}
              </p>
            </div>
          ) : (
            filteredQueue.map(item => (
              <QueueItemCard
                key={item.id}
                item={item}
                onRetry={retryItem}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onResolveConflict={handleResolveConflict}
              />
            ))
          )}
        </div>
      </div>

      {/* Conflict Resolution Modal */}
      {conflictItem && (
        <ConflictResolutionModal
          isOpen={!!conflictItemId}
          onClose={() => setConflictItemId(null)}
          item={conflictItem}
        />
      )}
    </>
  );
}
