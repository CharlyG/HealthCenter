/**
 * Wound Detail Panel Component
 * 
 * Full detail view for a wound with longitudinal data:
 * - Measurement history and graphs
 * - Photo gallery with comparisons
 * - Assessment timeline
 * - Treatment history
 * - Notes from previous visits
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import {
  X,
  TrendingUp,
  TrendingDown,
  Ruler,
  Image as ImageIcon,
  Calendar,
  FileText,
  Droplet,
  Activity,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Download,
  MapPin,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Wound, WoundAssessment } from '../services/woundCareTracking';
import {
  WOUND_LOCATION_CONFIG,
  WOUND_TYPE_CONFIG,
  WOUND_STATUS_CONFIG,
  PRESSURE_INJURY_STAGE_CONFIG,
  getWoundAge,
  getWoundDisplayName,
} from '../services/woundCareTracking';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface WoundDetailPanelProps {
  wound: Wound;
  open: boolean;
  onClose: () => void;
}

export default function WoundDetailPanel({ wound, open, onClose }: WoundDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const woundName = getWoundDisplayName(wound);
  const woundAge = getWoundAge(wound);
  const typeConfig = WOUND_TYPE_CONFIG[wound.type];
  const statusConfig = WOUND_STATUS_CONFIG[wound.currentStatus];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl mb-2">{woundName}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className="text-xs"
                  style={{ backgroundColor: typeConfig.color, color: 'white' }}
                >
                  {typeConfig.label}
                </Badge>
                {wound.stage && (
                  <Badge variant="outline" className="text-xs">
                    {PRESSURE_INJURY_STAGE_CONFIG[wound.stage].label}
                  </Badge>
                )}
                <Badge
                  className="text-xs"
                  style={{ backgroundColor: statusConfig.color, color: 'white' }}
                >
                  {statusConfig.label}
                </Badge>
                <span className="text-xs text-gray-600">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {woundAge} days old
                </span>
                <span className="text-xs text-gray-600">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {WOUND_LOCATION_CONFIG[wound.location].label}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="overview">
                <Activity className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="measurements">
                <Ruler className="w-4 h-4 mr-2" />
                Measurements
              </TabsTrigger>
              <TabsTrigger value="photos">
                <ImageIcon className="w-4 h-4 mr-2" />
                Photos ({wound.photos.length})
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Calendar className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="treatment">
                <FileText className="w-4 h-4 mr-2" />
                Treatment
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-4 space-y-4">
              <OverviewTab wound={wound} />
            </TabsContent>

            {/* Measurements Tab */}
            <TabsContent value="measurements" className="mt-4 space-y-4">
              <MeasurementsTab wound={wound} />
            </TabsContent>

            {/* Photos Tab */}
            <TabsContent value="photos" className="mt-4">
              <PhotosTab wound={wound} />
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-4">
              <TimelineTab wound={wound} />
            </TabsContent>

            {/* Treatment Tab */}
            <TabsContent value="treatment" className="mt-4 space-y-4">
              <TreatmentTab wound={wound} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════════════════

function OverviewTab({ wound }: { wound: Wound }) {
  const recentAssessment = wound.assessments[0];
  const previousAssessment = wound.assessments[1];

  return (
    <>
      {/* Current Status Card */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Current Status</h3>
        {recentAssessment ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-600 mb-1">Size</div>
              <div className="font-bold text-lg text-gray-900">
                {recentAssessment.area ? `${recentAssessment.area} cm²` : 'Healed'}
              </div>
              {recentAssessment.length && recentAssessment.width && (
                <div className="text-xs text-gray-600">
                  {recentAssessment.length} × {recentAssessment.width} × {recentAssessment.depth || 0} cm
                </div>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Drainage</div>
              <div className="font-medium text-gray-900">
                {recentAssessment.drainageAmount || 'None'}
              </div>
              {recentAssessment.drainageType && (
                <div className="text-xs text-gray-600 capitalize">
                  {recentAssessment.drainageType.replace('-', ' ')}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Wound Bed</div>
              <div className="font-medium text-gray-900">
                {recentAssessment.woundBed.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(', ')}
              </div>
              {recentAssessment.woundBedPercentages && (
                <div className="text-xs text-gray-600">
                  {Object.entries(recentAssessment.woundBedPercentages)
                    .filter(([_, pct]) => pct > 0)
                    .map(([type, pct]) => `${pct}%`)
                    .join(', ')}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No assessments recorded</p>
        )}
      </Card>

      {/* Comparison Card */}
      {recentAssessment && previousAssessment && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Change Since Previous Assessment</h3>
          <div className="grid grid-cols-4 gap-4">
            <ComparisonMetric
              label="Area"
              current={recentAssessment.area}
              previous={previousAssessment.area}
              unit="cm²"
            />
            <ComparisonMetric
              label="Length"
              current={recentAssessment.length}
              previous={previousAssessment.length}
              unit="cm"
            />
            <ComparisonMetric
              label="Width"
              current={recentAssessment.width}
              previous={previousAssessment.width}
              unit="cm"
            />
            <ComparisonMetric
              label="Depth"
              current={recentAssessment.depth}
              previous={previousAssessment.depth}
              unit="cm"
            />
          </div>
        </Card>
      )}

      {/* Recent Notes */}
      {recentAssessment?.notes && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Recent Assessment Notes</h3>
          <p className="text-sm text-gray-700 mb-2">{recentAssessment.notes}</p>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {recentAssessment.assessedBy}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(recentAssessment.assessmentDate).toLocaleDateString()}
            </span>
          </div>
        </Card>
      )}

      {/* Mini Trend Chart */}
      {wound.assessments.length >= 3 && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Area Trend</h3>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={wound.assessments.slice(0, 10).reverse().map(a => ({
              date: new Date(a.assessmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              area: a.area || 0,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: 'cm²', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="area" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MEASUREMENTS TAB
// ═══════════════════════════════════════════════════════════════════════════

function MeasurementsTab({ wound }: { wound: Wound }) {
  return (
    <>
      {/* Charts */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Measurement Progression</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={wound.assessments.slice().reverse().map(a => ({
            date: new Date(a.assessmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            area: a.area || 0,
            length: a.length || 0,
            width: a.width || 0,
            depth: a.depth || 0,
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: 'cm / cm²', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="area" stroke="#3B82F6" name="Area (cm²)" strokeWidth={2} />
            <Line type="monotone" dataKey="length" stroke="#10B981" name="Length (cm)" strokeWidth={2} />
            <Line type="monotone" dataKey="width" stroke="#F59E0B" name="Width (cm)" strokeWidth={2} />
            <Line type="monotone" dataKey="depth" stroke="#EF4444" name="Depth (cm)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Measurement History Table */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Measurement History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="pb-2 font-semibold text-gray-900">Date</th>
                <th className="pb-2 font-semibold text-gray-900">Length</th>
                <th className="pb-2 font-semibold text-gray-900">Width</th>
                <th className="pb-2 font-semibold text-gray-900">Depth</th>
                <th className="pb-2 font-semibold text-gray-900">Area</th>
                <th className="pb-2 font-semibold text-gray-900">Change</th>
                <th className="pb-2 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {wound.assessments.map((assessment, idx) => {
                const prevAssessment = wound.assessments[idx + 1];
                const percentChange = assessment.percentChange;

                return (
                  <tr key={assessment.id} className="border-b last:border-0">
                    <td className="py-2 text-gray-900">
                      {new Date(assessment.assessmentDate).toLocaleDateString()}
                    </td>
                    <td className="py-2 text-gray-700">
                      {assessment.length ? `${assessment.length} cm` : '-'}
                    </td>
                    <td className="py-2 text-gray-700">
                      {assessment.width ? `${assessment.width} cm` : '-'}
                    </td>
                    <td className="py-2 text-gray-700">
                      {assessment.depth ? `${assessment.depth} cm` : '-'}
                    </td>
                    <td className="py-2 font-medium text-gray-900">
                      {assessment.area ? `${assessment.area} cm²` : '-'}
                    </td>
                    <td className="py-2">
                      {percentChange !== undefined && percentChange !== 0 ? (
                        <span className={cn(
                          'text-xs font-medium',
                          percentChange < 0 ? 'text-green-700' : 'text-red-700'
                        )}>
                          {percentChange > 0 ? '+' : ''}{percentChange}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-2">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: WOUND_STATUS_CONFIG[assessment.status].color,
                          color: WOUND_STATUS_CONFIG[assessment.status].color,
                        }}
                      >
                        {WOUND_STATUS_CONFIG[assessment.status].label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PHOTOS TAB
// ═══════════════════════════════════════════════════════════════════════════

function PhotosTab({ wound }: { wound: Wound }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const selectedPhoto = wound.photos[selectedPhotoIndex];

  if (wound.photos.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h4 className="font-semibold text-gray-900 mb-1">No Photos</h4>
          <p className="text-sm text-gray-600">No wound photos have been captured yet</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Photo Viewer */}
      <Card className="p-4">
        <div className="mb-4">
          <img
            src={selectedPhoto.photoUrl}
            alt={`Wound photo from ${new Date(selectedPhoto.capturedDate).toLocaleDateString()}`}
            className="w-full h-96 object-contain bg-gray-100 rounded-lg"
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-semibold text-gray-900">
              {new Date(selectedPhoto.capturedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className="text-sm text-gray-600">Captured by {selectedPhoto.capturedBy}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={selectedPhotoIndex === 0}
              onClick={() => setSelectedPhotoIndex(selectedPhotoIndex - 1)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              {selectedPhotoIndex + 1} / {wound.photos.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedPhotoIndex === wound.photos.length - 1}
              onClick={() => setSelectedPhotoIndex(selectedPhotoIndex + 1)}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {selectedPhoto.notes && (
          <p className="text-sm text-gray-700 mb-3">{selectedPhoto.notes}</p>
        )}

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ZoomIn className="w-3 h-3 mr-1.5" />
            Zoom
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-3 h-3 mr-1.5" />
            Download
          </Button>
          {selectedPhoto.isRulerIncluded && (
            <Badge variant="outline" className="text-xs">
              <Ruler className="w-3 h-3 mr-1" />
              Ruler Included
            </Badge>
          )}
        </div>
      </Card>

      {/* Photo Gallery */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Photo Gallery</h3>
        <div className="grid grid-cols-4 gap-3">
          {wound.photos.map((photo, idx) => (
            <button
              key={photo.id}
              onClick={() => setSelectedPhotoIndex(idx)}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                selectedPhotoIndex === idx ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <img
                src={photo.photoUrl}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <div className="text-xs text-white">
                  {new Date(photo.capturedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE TAB
// ═══════════════════════════════════════════════════════════════════════════

function TimelineTab({ wound }: { wound: Wound }) {
  return (
    <div className="space-y-4">
      {wound.assessments.map((assessment, idx) => (
        <Card key={assessment.id} className="p-4">
          <div className="flex items-start gap-4">
            {/* Timeline Dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-3 h-3 rounded-full',
                  assessment.trend === 'improving' && 'bg-green-500',
                  assessment.trend === 'worsening' && 'bg-red-500',
                  assessment.trend === 'stable' && 'bg-gray-400'
                )}
              />
              {idx < wound.assessments.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-900">
                    {new Date(assessment.assessmentDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-sm text-gray-600">Assessed by {assessment.assessedBy}</div>
                </div>
                <Badge
                  style={{
                    backgroundColor: WOUND_STATUS_CONFIG[assessment.status].color,
                    color: 'white',
                  }}
                  className="text-xs"
                >
                  {WOUND_STATUS_CONFIG[assessment.status].label}
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-sm">
                  <span className="text-gray-600">Size: </span>
                  <span className="font-medium text-gray-900">
                    {assessment.area ? `${assessment.area} cm²` : '-'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">L×W×D: </span>
                  <span className="font-medium text-gray-900">
                    {assessment.length && assessment.width
                      ? `${assessment.length}×${assessment.width}×${assessment.depth || 0}`
                      : '-'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Drainage: </span>
                  <span className="font-medium text-gray-900 capitalize">
                    {assessment.drainageAmount || '-'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Pain: </span>
                  <span className="font-medium text-gray-900">
                    {assessment.painLevel !== undefined ? `${assessment.painLevel}/10` : '-'}
                  </span>
                </div>
              </div>

              {assessment.notes && (
                <p className="text-sm text-gray-700 mb-2">{assessment.notes}</p>
              )}

              {assessment.statusRationale && (
                <p className="text-xs text-gray-600 italic">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  {assessment.statusRationale}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TREATMENT TAB
// ═══════════════════════════════════════════════════════════════════════════

function TreatmentTab({ wound }: { wound: Wound }) {
  return (
    <div className="space-y-4">
      {wound.treatments.map((treatment) => (
        <Card key={treatment.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Treatment Protocol</h3>
            <Badge variant={treatment.isActive ? 'default' : 'outline'}>
              {treatment.isActive ? 'Active' : 'Discontinued'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">Primary Dressing</div>
              <div className="text-sm text-gray-900">{treatment.primaryDressing || 'Not specified'}</div>
              {treatment.primaryDressingFrequency && (
                <div className="text-xs text-gray-600">Change: {treatment.primaryDressingFrequency}</div>
              )}
            </div>
            {treatment.secondaryDressing && (
              <div>
                <div className="text-xs font-medium text-gray-600 mb-1">Secondary Dressing</div>
                <div className="text-sm text-gray-900">{treatment.secondaryDressing}</div>
              </div>
            )}
          </div>

          {treatment.offloading && treatment.offloading.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-600 mb-2">Offloading/Positioning</div>
              <ul className="list-disc list-inside space-y-1">
                {treatment.offloading.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {treatment.notes && (
            <div className="pt-3 border-t">
              <div className="text-xs font-medium text-gray-600 mb-1">Notes</div>
              <p className="text-sm text-gray-700">{treatment.notes}</p>
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-600 mt-3 pt-3 border-t">
            <span>Started: {new Date(treatment.startDate).toLocaleDateString()}</span>
            {treatment.endDate && (
              <span>Ended: {new Date(treatment.endDate).toLocaleDateString()}</span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPARISON METRIC
// ═══════════════════════════════════════════════════════════════════════════

function ComparisonMetric({
  label,
  current,
  previous,
  unit,
}: {
  label: string;
  current?: number;
  previous?: number;
  unit: string;
}) {
  const change = current !== undefined && previous !== undefined ? current - previous : undefined;
  const percentChange = change !== undefined && previous !== undefined && previous !== 0
    ? Math.round((change / previous) * 100)
    : undefined;

  return (
    <div className="border rounded-lg p-3">
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="font-bold text-lg text-gray-900">
        {current !== undefined ? `${current} ${unit}` : '-'}
      </div>
      {change !== undefined && (
        <div className={cn(
          'text-xs font-medium flex items-center gap-1',
          change < 0 ? 'text-green-700' : change > 0 ? 'text-red-700' : 'text-gray-600'
        )}>
          {change < 0 ? (
            <TrendingDown className="w-3 h-3" />
          ) : change > 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : null}
          {change > 0 ? '+' : ''}{change.toFixed(1)} {unit}
          {percentChange !== undefined && ` (${percentChange > 0 ? '+' : ''}${percentChange}%)`}
        </div>
      )}
    </div>
  );
}
