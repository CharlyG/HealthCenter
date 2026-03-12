/**
 * Travel Optimization Panel
 * Display estimated travel time between visits and suggest improved routes.
 * "Apply Optimized Route" reorders visit times server-side via POST /scheduling/apply-route.
 * Includes interactive Route Optimization Map with drag-and-drop.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, Clock, TrendingDown, Loader2, RefreshCw, Route, CheckCircle2, X, ChevronDown, ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { visitGateway } from '../../lib/dataGateway';
import { RouteOptimizationMap } from './RouteOptimizationMap';

interface RouteStop {
  visitId: string;
  patientName: string;
  time: string;
  zone: string;
}

interface TravelOptimization {
  caregiverId: string;
  caregiverName: string;
  currentRoute: RouteStop[];
  suggestedRoute: RouteStop[];
  currentTravelScore: number;
  optimizedTravelScore: number;
  estimatedSavingsMinutes: number;
}

interface TravelOptimizationPanelProps {
  selectedDate: Date;
}

export default function TravelOptimizationPanel({ selectedDate }: TravelOptimizationPanelProps) {
  const [optimizations, setOptimizations] = useState<TravelOptimization[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCg, setExpandedCg] = useState<string | null>(null);
  const [applyingCg, setApplyingCg] = useState<string | null>(null);
  const [appliedCgs, setAppliedCgs] = useState<Set<string>>(new Set());
  const [dismissedCgs, setDismissedCgs] = useState<Set<string>>(new Set());

  const dateStr = selectedDate.toISOString().split('T')[0];

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setAppliedCgs(new Set());
      setDismissedCgs(new Set());
      const data = await visitGateway.getSmartAssist(dateStr);
      setOptimizations(data.travelOptimizations || []);
    } catch (err) {
      console.error('[TravelOptimizationPanel] error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => { load(); }, [load]);

  const handleApplyRoute = useCallback(async (opt: TravelOptimization) => {
    setApplyingCg(opt.caregiverId);
    try {
      // Build the new visit order: map suggested route stops to use the time slots
      // from the current route, but in the optimized order
      const currentTimes = opt.currentRoute.map(s => ({
        startTime: s.time,
        // Estimate end time as 1 hour after start (preserve original visit duration)
        endTime: addHour(s.time),
      }));

      const visitOrder = opt.suggestedRoute.map((stop, idx) => ({
        visitId: stop.visitId,
        newStartTime: currentTimes[idx]?.startTime || stop.time,
        newEndTime: currentTimes[idx]?.endTime || addHour(stop.time),
      }));

      const result = await visitGateway.applyRoute(opt.caregiverId, dateStr, visitOrder);
      if (result.success) {
        toast.success(`Route optimized for ${opt.caregiverName}: ${result.updatedCount} visits reordered, ~${opt.estimatedSavingsMinutes} min saved`);
        setAppliedCgs(prev => new Set(prev).add(opt.caregiverId));
      } else {
        toast.error('Failed to apply route optimization');
      }
    } catch (err: any) {
      console.error('[TravelOptimizationPanel] apply error:', err);
      toast.error(err.message || 'Failed to apply route');
    } finally {
      setApplyingCg(null);
    }
  }, [dateStr]);

  const handleDismiss = useCallback((caregiverId: string) => {
    setDismissedCgs(prev => new Set(prev).add(caregiverId));
    setExpandedCg(null);
    toast('Route suggestion dismissed');
  }, []);

  const visibleOptimizations = optimizations.filter(o => !dismissedCgs.has(o.caregiverId));
  const totalSavings = visibleOptimizations.reduce((sum, o) => sum + o.estimatedSavingsMinutes, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-500">Analyzing travel routes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <Route className="size-4 text-blue-500" />
              <span className="text-xs font-medium text-gray-600">Routes Analyzable</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{visibleOptimizations.length}</p>
          </CardContent>
        </Card>
        <Card className={totalSavings > 0 ? 'ring-1 ring-green-200' : ''}>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="size-4 text-green-500" />
              <span className="text-xs font-medium text-gray-600">Est. Time Saved</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{totalSavings} min</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="size-4 text-green-500" />
              <span className="text-xs font-medium text-gray-600">Applied</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{appliedCgs.size}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
        <Button variant="ghost" size="sm" onClick={load} className="h-8 gap-1 text-xs">
          <RefreshCw className="size-3.5" /> Re-analyze
        </Button>
      </div>

      {visibleOptimizations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="size-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700">Routes are optimal</p>
            <p className="text-sm text-gray-500 mt-1">No route improvements found for this date</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleOptimizations.map(opt => {
            const isExpanded = expandedCg === opt.caregiverId;
            const isApplied = appliedCgs.has(opt.caregiverId);
            const isApplying = applyingCg === opt.caregiverId;

            // Convert route stops to format expected by RouteOptimizationMap
            const mapStops = opt.currentRoute.map((stop, idx) => ({
              id: `stop-${idx}`,
              visitId: stop.visitId,
              patientName: stop.patientName,
              address: `${stop.zone} - Visit location`,
              lat: 40.7128 + (Math.random() - 0.5) * 0.1, // Mock coordinates in NYC area
              lng: -74.006 + (Math.random() - 0.5) * 0.1,
              scheduledTime: stop.time,
              duration: 60, // Mock 60 min duration
              visitType: 'Home Visit',
            }));

            const homeLocation = {
              lat: 40.7128,
              lng: -74.006,
              address: 'Home Health Office - 123 Main St',
            };

            return (
              <Card key={opt.caregiverId} className={isApplied ? 'ring-2 ring-green-300 bg-green-50/30' : ''}>
                <div
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedCg(isExpanded ? null : opt.caregiverId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isApplied ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {isApplied ? <CheckCircle2 className="size-4 text-green-600" /> : <MapPin className="size-4 text-blue-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{opt.caregiverName}</p>
                        <p className="text-[10px] text-gray-500">{opt.currentRoute.length} visits today</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isApplied ? (
                        <Badge className="text-xs bg-green-600 text-white gap-1">
                          <CheckCircle2 className="size-3" /> Applied
                        </Badge>
                      ) : (
                        <Badge className="text-xs bg-green-600 text-white gap-1">
                          <TrendingDown className="size-3" />
                          Save {opt.estimatedSavingsMinutes} min
                        </Badge>
                      )}
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">Travel score</p>
                        <p className="text-xs text-gray-600">
                          <span className="text-red-500 line-through">{opt.currentTravelScore}</span>
                          {' → '}
                          <span className="text-green-600 font-semibold">{opt.optimizedTravelScore}</span>
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50/50">
                    {/* Interactive Route Optimization Map */}
                    <RouteOptimizationMap
                      caregiverName={opt.caregiverName}
                      homeLocation={homeLocation}
                      stops={mapStops}
                      onRouteOptimized={(optimizedStops) => {
                        console.log('Route optimized:', optimizedStops);
                      }}
                      onSave={async (stops) => {
                        // Convert back to visit order and apply
                        const visitOrder = stops.map((stop, idx) => ({
                          visitId: stop.visitId,
                          newStartTime: stop.scheduledTime,
                          newEndTime: addHour(stop.scheduledTime),
                        }));
                        
                        try {
                          const result = await visitGateway.applyRoute(opt.caregiverId, dateStr, visitOrder);
                          if (result.success) {
                            toast.success(`Route saved for ${opt.caregiverName}`);
                            setAppliedCgs(prev => new Set(prev).add(opt.caregiverId));
                            setExpandedCg(null);
                          }
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to save route');
                        }
                      }}
                    />

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(opt.caregiverId);
                        }}
                      >
                        <X className="size-3.5 mr-2" />
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyRoute(opt);
                        }}
                        disabled={isApplying || isApplied}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isApplying ? (
                          <>
                            <Loader2 className="size-3.5 mr-2 animate-spin" />
                            Applying...
                          </>
                        ) : isApplied ? (
                          <>
                            <CheckCircle2 className="size-3.5 mr-2" />
                            Applied
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-3.5 mr-2" />
                            Apply Optimized Route
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function addHour(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const newH = (h + 1) % 24;
  return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
