/**
 * Offline Status Indicator
 * 
 * Compact status indicator for application header showing:
 * - Online (green)
 * - Offline (red)
 * - Syncing (blue)
 * - Sync Error (orange)
 * 
 * HIPAA Compliance: No PHI displayed - only sync status and counts
 */

import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useOfflineSync } from '../../hooks/useOfflineSync';

interface OfflineStatusIndicatorProps {
  onClick?: () => void;
  compact?: boolean;
}

export default function OfflineStatusIndicator({ 
  onClick, 
  compact = false 
}: OfflineStatusIndicatorProps) {
  const { isOnline, syncQueue, isSyncing } = useOfflineSync();

  const pendingCount = syncQueue.filter(
    item => item.status === 'pending' || item.status === 'syncing'
  ).length;
  
  const failedCount = syncQueue.filter(item => item.status === 'failed').length;

  // Determine status
  const getStatus = () => {
    if (failedCount > 0) return 'error';
    if (isSyncing) return 'syncing';
    if (!isOnline) return 'offline';
    return 'online';
  };

  const status = getStatus();

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: Wifi,
          label: 'Online',
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          dotColor: 'bg-green-500',
        };
      case 'offline':
        return {
          icon: WifiOff,
          label: 'Offline',
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          dotColor: 'bg-red-500',
        };
      case 'syncing':
        return {
          icon: RefreshCw,
          label: 'Syncing',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          dotColor: 'bg-blue-500',
        };
      case 'error':
        return {
          icon: AlertTriangle,
          label: 'Sync Error',
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          dotColor: 'bg-orange-500',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const totalPending = pendingCount + failedCount;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-md border ${config.border} ${config.bg} hover:opacity-80 transition-opacity`}
        title={`${config.label}${totalPending > 0 ? ` - ${totalPending} pending` : ''}`}
      >
        <Icon 
          className={`size-4 ${config.color} ${status === 'syncing' ? 'animate-spin' : ''}`} 
        />
        {totalPending > 0 && (
          <span className="absolute -top-1 -right-1 size-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {totalPending > 9 ? '9+' : totalPending}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.border} ${config.bg} hover:opacity-90 transition-all`}
    >
      {/* Status Dot */}
      <div className="relative">
        <span className={`flex h-3 w-3 relative`}>
          {status === 'syncing' && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dotColor} opacity-75`}></span>
          )}
          <span className={`relative inline-flex rounded-full h-3 w-3 ${config.dotColor}`}></span>
        </span>
      </div>

      {/* Icon */}
      <Icon 
        className={`size-4 ${config.color} ${status === 'syncing' ? 'animate-spin' : ''}`} 
      />

      {/* Label */}
      <span className={`text-sm font-medium ${config.color}`}>
        {config.label}
      </span>

      {/* Pending Count Badge */}
      {totalPending > 0 && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          failedCount > 0 ? 'bg-red-600' : 'bg-gray-600'
        } text-white`}>
          {totalPending}
        </span>
      )}
    </button>
  );
}
