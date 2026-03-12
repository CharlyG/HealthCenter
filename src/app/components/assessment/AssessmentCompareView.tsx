/**
 * ASSESSMENT COMPARE VIEW
 * 
 * Side-by-side comparison of two assessment versions
 * Highlights changes between versions
 */

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { GitCompare, ArrowRight, Plus, Minus, Edit } from 'lucide-react';
import type { AssessmentVersion } from '../../types/assessment';

interface AssessmentCompareViewProps {
  version1: AssessmentVersion;
  version2: AssessmentVersion;
  onClose: () => void;
}

export function AssessmentCompareView({
  version1,
  version2,
  onClose,
}: AssessmentCompareViewProps) {
  // Get all unique keys from both versions
  const allKeys = Array.from(
    new Set([...Object.keys(version1.data), ...Object.keys(version2.data)])
  );

  const changes = allKeys.map((key) => {
    const val1 = version1.data[key];
    const val2 = version2.data[key];
    const hasChange = JSON.stringify(val1) !== JSON.stringify(val2);
    const changeType = !val1 ? 'added' : !val2 ? 'removed' : 'modified';

    return { key, val1, val2, hasChange, changeType };
  });

  const changedFields = changes.filter((c) => c.hasChange);
  const unchangedFields = changes.filter((c) => !c.hasChange);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <GitCompare className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Compare Versions</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <Badge variant="outline">v{version1.versionNumber}</Badge>
              <ArrowRight className="w-4 h-4" />
              <Badge variant="outline">v{version2.versionNumber}</Badge>
              <span>•</span>
              <span>{changedFields.length} changes</span>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close Comparison
        </Button>
      </div>

      {/* Version Headers */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Version {version1.versionNumber}</h3>
            <Badge className="bg-gray-100 text-gray-700">Older</Badge>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Created: {new Date(version1.createdAt).toLocaleString()}</p>
            <p>By: {version1.createdBy}</p>
            <p className="text-gray-700 font-medium mt-2">{version1.changesSummary}</p>
          </div>
        </div>

        <div className="bg-white border border-blue-300 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Version {version2.versionNumber}</h3>
            <Badge className="bg-blue-600 text-white">Newer</Badge>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Created: {new Date(version2.createdAt).toLocaleString()}</p>
            <p>By: {version2.createdBy}</p>
            <p className="text-gray-700 font-medium mt-2">{version2.changesSummary}</p>
          </div>
        </div>
      </div>

      {/* Changes Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Changes Summary</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700">
              {changes.filter((c) => c.changeType === 'added').length} Added
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Edit className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700">
              {changes.filter((c) => c.changeType === 'modified').length} Modified
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Minus className="w-4 h-4 text-red-600" />
            <span className="text-sm text-gray-700">
              {changes.filter((c) => c.changeType === 'removed').length} Removed
            </span>
          </div>
        </div>
      </div>

      {/* Changed Fields */}
      {changedFields.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Changed Fields</h3>
          <div className="space-y-3">
            {changedFields.map((change) => (
              <div
                key={change.key}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    {change.changeType === 'added' && (
                      <Plus className="w-4 h-4 text-green-600" />
                    )}
                    {change.changeType === 'modified' && (
                      <Edit className="w-4 h-4 text-blue-600" />
                    )}
                    {change.changeType === 'removed' && (
                      <Minus className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-medium text-gray-900">{change.key}</span>
                    <Badge
                      variant="outline"
                      className={
                        change.changeType === 'added'
                          ? 'bg-green-50 text-green-700'
                          : change.changeType === 'removed'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                      }
                    >
                      {change.changeType}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  {/* Old Value */}
                  <div className="p-4 border-r border-gray-200 bg-red-50">
                    <p className="text-xs text-gray-600 mb-1">Version {version1.versionNumber}</p>
                    <p className="text-sm text-gray-900 font-mono">
                      {change.val1 ? String(change.val1) : <em className="text-gray-400">empty</em>}
                    </p>
                  </div>
                  {/* New Value */}
                  <div className="p-4 bg-green-50">
                    <p className="text-xs text-gray-600 mb-1">Version {version2.versionNumber}</p>
                    <p className="text-sm text-gray-900 font-mono">
                      {change.val2 ? String(change.val2) : <em className="text-gray-400">empty</em>}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unchanged Fields (Collapsed) */}
      {unchangedFields.length > 0 && (
        <details className="bg-white border border-gray-200 rounded-lg">
          <summary className="px-4 py-3 cursor-pointer font-medium text-gray-900 hover:bg-gray-50">
            Unchanged Fields ({unchangedFields.length})
          </summary>
          <div className="p-4 border-t border-gray-200 space-y-2">
            {unchangedFields.map((change) => (
              <div key={change.key} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{change.key}</span>
                <span className="text-gray-600 font-mono">
                  {change.val1 ? String(change.val1).substring(0, 50) : 'empty'}
                  {String(change.val1).length > 50 && '...'}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
