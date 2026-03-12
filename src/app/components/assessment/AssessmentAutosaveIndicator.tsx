/**
 * ASSESSMENT AUTOSAVE INDICATOR
 * 
 * Shows save status and last autosave time
 */

import { useEffect, useState } from 'react';
import { CheckCircle2, Cloud, Loader2, AlertCircle } from 'lucide-react';

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface AssessmentAutosaveIndicatorProps {
  status: SaveStatus;
  lastSaveTime?: string;
  errorMessage?: string;
}

export function AssessmentAutosaveIndicator({
  status,
  lastSaveTime,
  errorMessage,
}: AssessmentAutosaveIndicatorProps) {
  const [relativeTime, setRelativeTime] = useState<string>('');

  useEffect(() => {
    if (!lastSaveTime) return;

    const updateRelativeTime = () => {
      const now = new Date();
      const saveTime = new Date(lastSaveTime);
      const diffMs = now.getTime() - saveTime.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);

      if (diffSec < 10) {
        setRelativeTime('just now');
      } else if (diffSec < 60) {
        setRelativeTime(`${diffSec}s ago`);
      } else if (diffMin < 60) {
        setRelativeTime(`${diffMin}m ago`);
      } else {
        setRelativeTime(saveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [lastSaveTime]);

  const statusConfig = {
    saved: {
      icon: CheckCircle2,
      text: 'All changes saved',
      className: 'text-green-600',
      bgClass: 'bg-green-50',
    },
    saving: {
      icon: Loader2,
      text: 'Saving...',
      className: 'text-blue-600',
      bgClass: 'bg-blue-50',
      animate: true,
    },
    unsaved: {
      icon: Cloud,
      text: 'Unsaved changes',
      className: 'text-gray-600',
      bgClass: 'bg-gray-50',
    },
    error: {
      icon: AlertCircle,
      text: 'Save failed',
      className: 'text-red-600',
      bgClass: 'bg-red-50',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md ${config.bgClass}`}>
      <Icon className={`w-4 h-4 ${config.className} ${config.animate ? 'animate-spin' : ''}`} />
      <div className="text-sm">
        <span className={`font-medium ${config.className}`}>{config.text}</span>
        {status === 'saved' && relativeTime && (
          <span className="text-gray-600 ml-2">• {relativeTime}</span>
        )}
        {status === 'error' && errorMessage && (
          <span className="text-red-600 ml-2">• {errorMessage}</span>
        )}
      </div>
    </div>
  );
}
