/**
 * Offline Mode Manager
 * 
 * Provides complete offline experience for clinicians in areas with poor connectivity.
 * 
 * Features:
 * - Clear offline/online indicator
 * - Unsynchronized records counter
 * - Sync queue visualization
 * - Manual sync trigger
 * - Auto-sync when online
 * - Sync status and progress
 * - Item-level retry
 * - Error handling
 * - Work without interruption
 * 
 * Components:
 * - Offline Banner (top of screen)
 * - Sync Status Badge (floating)
 * - Sync Queue Modal (full list)
 * - Sync Progress Toast
 */

import { useState } from 'react';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  RotateCcw,
  FileText,
  User,
  Activity,
  Pill,
  ClipboardList,
  X,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useOfflineSync, type SyncQueueItem } from '../../hooks/useOfflineSync';

// ==================== OFFLINE BANNER ====================

interface OfflineBannerProps {
  isOnline: boolean;
  unsyncedCount: number;
  onShowQueue: () => void;
}

function OfflineBanner({ isOnline, unsyncedCount, onShowQueue }: OfflineBannerProps) {
  if (isOnline && unsyncedCount === 0) {
    return null;
  }

  return (
    <div
      className={`px-4 py-2 flex items-center justify-between ${
        isOnline ? 'bg-yellow-600' : 'bg-red-600'
      } text-white`}
    >
      <div className="flex items-center gap-3">
        {isOnline ? (
          <>
            <AlertCircle className="size-5 animate-pulse" />
            <div>
              <p className="text-sm font-semibold">
                Syncing {unsyncedCount} record{unsyncedCount !== 1 ? 's' : ''}...
              </p>
              <p className="text-xs opacity-90">
                You're online but some records haven't synced yet
              </p>
            </div>
          </>
        ) : (
          <>
            <WifiOff className="size-5 animate-pulse" />
            <div>
              <p className="text-sm font-semibold">You're working offline</p>
              <p className="text-xs opacity-90">
                {unsyncedCount} record{unsyncedCount !== 1 ? 's' : ''} waiting to sync
              </p>
            </div>
          </>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onShowQueue}
        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
      >
        View Queue
      </Button>
    </div>
  );
}

// ==================== SYNC STATUS BADGE ====================

interface SyncStatusBadgeProps {
  isOnline: boolean;
  unsyncedCount: number;
  isSyncing: boolean;
  onClick: () => void;
}

function SyncStatusBadge({ isOnline, unsyncedCount, isSyncing, onClick }: SyncStatusBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-full shadow-lg flex items-center gap-2 z-50 transition-all hover:scale-105 ${
        isOnline && unsyncedCount === 0
          ? 'bg-green-600 text-white'
          : isOnline
          ? 'bg-yellow-600 text-white'
          : 'bg-red-600 text-white'
      }`}
    >
      {isSyncing ? (
        <RefreshCw className="size-5 animate-spin" />
      ) : isOnline ? (
        <Wifi className="size-5" />
      ) : (
        <WifiOff className="size-5" />
      )}
      
      <div className="text-left">
        <p className="text-xs font-semibold">
          {isOnline ? 'Online' : 'Offline'}
        </p>
        {unsyncedCount > 0 && (
          <p className="text-xs opacity-90">
            {unsyncedCount} pending
          </p>
        )}
      </div>

      {unsyncedCount > 0 && (
        <div className="bg-white text-red-600 rounded-full size-6 flex items-center justify-center text-xs font-bold">
          {unsyncedCount > 99 ? '99+' : unsyncedCount}
        </div>
      )}
    </button>
  );
}

// ==================== SYNC QUEUE ITEM ====================

interface SyncQueueItemCardProps {
  item: SyncQueueItem;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

function SyncQueueItemCard({ item, onRetry, onRemove }: SyncQueueItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch (item.type) {
      case 'visit_documentation':
        return FileText;
      case 'visit_note':
        return ClipboardList;
      case 'vital_signs':
        return Activity;
      case 'medication':
        return Pill;
      case 'assessment':
        return User;
      default:
        return FileText;
    }
  };

  const getStatusBadge = () => {
    switch (item.status) {
      case 'pending':
        return <Badge className="bg-gray-500">Pending</Badge>;
      case 'syncing':
        return (
          <Badge className="bg-blue-600">
            <RefreshCw className="size-3 mr-1 animate-spin" />
            Syncing
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'synced':
        return <Badge className="bg-green-600">Synced</Badge>;
    }
  };

  const Icon = getIcon();

  return (
    <Card className={`border-2 ${
      item.status === 'synced' ? 'border-green-200 bg-green-50' :
      item.status === 'failed' ? 'border-red-200 bg-red-50' :
      item.status === 'syncing' ? 'border-blue-200 bg-blue-50' :
      'border-gray-200 bg-white'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <Icon className={`size-5 mt-0.5 ${
              item.status === 'synced' ? 'text-green-600' :
              item.status === 'failed' ? 'text-red-600' :
              item.status === 'syncing' ? 'text-blue-600' :
              'text-gray-600'
            }`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900">
                  {item.patient_name}
                </p>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-gray-600 mb-1">
                {item.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                {item.visit_id && ` • Visit ${item.visit_id}`}
              </p>
              <p className="text-xs text-gray-500">
                Created: {new Date(item.timestamp).toLocaleString()}
              </p>
              {item.last_error && (
                <p className="text-xs text-red-600 mt-1">
                  Error: {item.last_error}
                </p>
              )}
              {item.retry_count > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Retry attempts: {item.retry_count}/3
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {item.status === 'failed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRetry(item.id)}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <RotateCcw className="size-3 mr-1" />
                Retry
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(item.id)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="bg-gray-100 rounded p-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">Data Preview</p>
            <pre className="text-xs text-gray-600 overflow-auto max-h-40">
              {JSON.stringify(item.data, null, 2)}
            </pre>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ==================== SYNC QUEUE MODAL ====================

interface SyncQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  syncQueue: SyncQueueItem[];
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncProgress: { current: number; total: number };
  onTriggerSync: () => void;
  onRetryItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClearQueue: () => void;
}

function SyncQueueModal({
  isOpen,
  onClose,
  isOnline,
  syncQueue,
  isSyncing,
  lastSyncTime,
  syncProgress,
  onTriggerSync,
  onRetryItem,
  onRemoveItem,
  onClearQueue,
}: SyncQueueModalProps) {
  if (!isOpen) return null;

  const pendingCount = syncQueue.filter(i => i.status === 'pending').length;
  const failedCount = syncQueue.filter(i => i.status === 'failed').length;
  const syncedCount = syncQueue.filter(i => i.status === 'synced').length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <RefreshCw className={`size-5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Queue
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage records waiting to be synchronized
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Connection Status */}
        <div className={`px-6 py-3 ${isOnline ? 'bg-green-50 border-b border-green-200' : 'bg-red-50 border-b border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <>
                  <Wifi className="size-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Connected</p>
                    {lastSyncTime && (
                      <p className="text-xs text-green-700">
                        Last sync: {lastSyncTime.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="size-5 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Offline Mode</p>
                    <p className="text-xs text-red-700">
                      Records will sync automatically when connection returns
                    </p>
                  </div>
                </>
              )}
            </div>
            <Button
              onClick={onTriggerSync}
              disabled={!isOnline || isSyncing || pendingCount === 0}
              className="gap-2"
            >
              <RefreshCw className={`size-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>

        {/* Sync Progress */}
        {isSyncing && syncProgress.total > 0 && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-blue-900 font-semibold">
                Syncing record {syncProgress.current} of {syncProgress.total}
              </span>
              <span className="text-blue-700">
                {Math.round((syncProgress.current / syncProgress.total) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{syncQueue.length}</p>
              <p className="text-xs text-gray-600">Total Records</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{pendingCount}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{failedCount}</p>
              <p className="text-xs text-gray-600">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{syncedCount}</p>
              <p className="text-xs text-gray-600">Synced</p>
            </div>
          </div>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {syncQueue.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="size-16 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-2">All Synced!</p>
              <p className="text-sm text-gray-600">
                No records waiting to be synchronized
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {syncQueue.map(item => (
                <SyncQueueItemCard
                  key={item.id}
                  item={item}
                  onRetry={onRetryItem}
                  onRemove={onRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {syncQueue.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="size-4" />
              <span>Records are stored securely on your device</span>
            </div>
            <Button
              variant="outline"
              onClick={onClearQueue}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="size-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN OFFLINE MODE MANAGER ====================

export default function OfflineModeManager() {
  const [showQueueModal, setShowQueueModal] = useState(false);
  const {
    isOnline,
    syncQueue,
    isSyncing,
    lastSyncTime,
    syncProgress,
    triggerSync,
    clearQueue,
    removeFromQueue,
    retryItem,
  } = useOfflineSync();

  const unsyncedCount = syncQueue.filter(
    item => item.status === 'pending' || item.status === 'failed'
  ).length;

  return (
    <>
      {/* Top Banner */}
      <OfflineBanner
        isOnline={isOnline}
        unsyncedCount={unsyncedCount}
        onShowQueue={() => setShowQueueModal(true)}
      />

      {/* Floating Status Badge */}
      <SyncStatusBadge
        isOnline={isOnline}
        unsyncedCount={unsyncedCount}
        isSyncing={isSyncing}
        onClick={() => setShowQueueModal(true)}
      />

      {/* Queue Modal */}
      <SyncQueueModal
        isOpen={showQueueModal}
        onClose={() => setShowQueueModal(false)}
        isOnline={isOnline}
        syncQueue={syncQueue}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        syncProgress={syncProgress}
        onTriggerSync={triggerSync}
        onRetryItem={retryItem}
        onRemoveItem={removeFromQueue}
        onClearQueue={() => {
          if (confirm('Are you sure you want to clear all records? This cannot be undone.')) {
            clearQueue();
          }
        }}
      />
    </>
  );
}
