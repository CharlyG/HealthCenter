/**
 * ASSESSMENT HISTORY PANEL
 * 
 * Version history with ability to view and compare versions
 */

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { History, Eye, GitCompare, User, Calendar, FileText } from 'lucide-react';
import type { AssessmentVersion } from '../../types/assessment';
import { ASSESSMENT_STATUS_CONFIG } from '../../types/assessment';

interface AssessmentHistoryPanelProps {
  versions: AssessmentVersion[];
  currentVersion: number;
  onViewVersion: (version: number) => void;
  onCompareVersions: (v1: number, v2: number) => void;
}

export function AssessmentHistoryPanel({
  versions,
  currentVersion,
  onViewVersion,
  onCompareVersions,
}: AssessmentHistoryPanelProps) {
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <History className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Version History</h2>
          <p className="text-gray-600">{versions.length} versions • Current: v{currentVersion}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {sortedVersions.map((version, index) => {
          const isLatest = version.versionNumber === currentVersion;
          const isFirst = index === 0;
          const statusConfig = ASSESSMENT_STATUS_CONFIG[version.status];

          return (
            <div key={version.versionNumber} className="relative">
              {/* Timeline Line */}
              {!isFirst && (
                <div className="absolute left-6 top-0 w-0.5 h-4 bg-gray-200" />
              )}

              {/* Version Card */}
              <div
                className={`border rounded-lg p-4 ${
                  isLatest
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Version Badge */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isLatest ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`font-bold ${
                        isLatest ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      v{version.versionNumber}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            Version {version.versionNumber}
                          </h3>
                          {isLatest && (
                            <Badge className="bg-blue-600 text-white">Current</Badge>
                          )}
                          <Badge
                            className={`${
                              statusConfig.color === 'green'
                                ? 'bg-green-100 text-green-700'
                                : statusConfig.color === 'blue'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{version.changesSummary}</p>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{version.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(version.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewVersion(version.versionNumber)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      {!isFirst && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onCompareVersions(
                              sortedVersions[index - 1].versionNumber,
                              version.versionNumber
                            )
                          }
                        >
                          <GitCompare className="w-3 h-3 mr-1" />
                          Compare with Previous
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Line (after) */}
              {!isFirst && (
                <div className="absolute left-6 bottom-0 w-0.5 h-4 bg-gray-200" />
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {versions.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No Version History</h3>
          <p className="text-gray-600">This assessment doesn't have any saved versions yet</p>
        </div>
      )}
    </div>
  );
}
