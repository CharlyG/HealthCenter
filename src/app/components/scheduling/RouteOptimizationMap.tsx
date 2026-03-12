/**
 * Route Optimization Map
 * 
 * Interactive map visualization for optimizing caregiver routes:
 * - Visual map showing visit locations
 * - Drag-and-drop to manually reorder stops
 * - Auto-route generation using traveling salesman algorithm
 * - Real-time travel time calculation
 * - Compare current vs optimized routes
 * - Export optimized route
 * 
 * Uses:
 * - react-dnd for drag-and-drop functionality
 * - SVG for map visualization
 * - Haversine formula for distance calculation
 */

import React, { useState, useCallback, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  TrendingDown, 
  Home, 
  GripVertical,
  Sparkles,
  RotateCcw,
  Save,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface RouteStop {
  id: string;
  visitId: string;
  patientName: string;
  address: string;
  lat: number;
  lng: number;
  scheduledTime: string;
  duration: number; // minutes
  visitType: string;
}

interface RouteOptimizationMapProps {
  caregiverName: string;
  homeLocation?: { lat: number; lng: number; address: string };
  stops: RouteStop[];
  onRouteOptimized?: (optimizedStops: RouteStop[]) => void;
  onSave?: (stops: RouteStop[]) => void;
}

// Drag item type
const STOP_TYPE = 'ROUTE_STOP';

// Haversine distance calculation (in miles)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate travel time (assume 30 mph average speed)
function calculateTravelTime(distance: number): number {
  const mph = 30;
  const hours = distance / mph;
  return Math.round(hours * 60); // minutes
}

// Calculate total route metrics
function calculateRouteMetrics(
  stops: RouteStop[],
  homeLocation?: { lat: number; lng: number }
) {
  let totalDistance = 0;
  let totalTravelTime = 0;
  let totalVisitTime = 0;

  // Start from home if provided
  let prevLat = homeLocation?.lat ?? stops[0]?.lat ?? 0;
  let prevLng = homeLocation?.lng ?? stops[0]?.lng ?? 0;

  stops.forEach((stop) => {
    const dist = calculateDistance(prevLat, prevLng, stop.lat, stop.lng);
    const travelTime = calculateTravelTime(dist);
    
    totalDistance += dist;
    totalTravelTime += travelTime;
    totalVisitTime += stop.duration;

    prevLat = stop.lat;
    prevLng = stop.lng;
  });

  // Return to home if provided
  if (homeLocation && stops.length > 0) {
    const lastStop = stops[stops.length - 1];
    const dist = calculateDistance(lastStop.lat, lastStop.lng, homeLocation.lat, homeLocation.lng);
    const travelTime = calculateTravelTime(dist);
    totalDistance += dist;
    totalTravelTime += travelTime;
  }

  return {
    totalDistance: Math.round(totalDistance * 10) / 10, // round to 1 decimal
    totalTravelTime,
    totalVisitTime,
    totalTime: totalTravelTime + totalVisitTime,
  };
}

// Greedy nearest neighbor algorithm for TSP (simple but effective)
function optimizeRoute(
  stops: RouteStop[],
  startLocation: { lat: number; lng: number }
): RouteStop[] {
  if (stops.length <= 1) return stops;

  const optimized: RouteStop[] = [];
  const remaining = [...stops];
  let currentLat = startLocation.lat;
  let currentLng = startLocation.lng;

  while (remaining.length > 0) {
    // Find nearest unvisited stop
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    remaining.forEach((stop, index) => {
      const dist = calculateDistance(currentLat, currentLng, stop.lat, stop.lng);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestIndex = index;
      }
    });

    // Add nearest stop to optimized route
    const nearestStop = remaining.splice(nearestIndex, 1)[0];
    optimized.push(nearestStop);
    currentLat = nearestStop.lat;
    currentLng = nearestStop.lng;
  }

  return optimized;
}

// Draggable Stop Item
interface DraggableStopProps {
  stop: RouteStop;
  index: number;
  moveStop: (fromIndex: number, toIndex: number) => void;
  travelTimeFromPrevious?: number;
  isFirst: boolean;
  isLast: boolean;
}

function DraggableStop({ stop, index, moveStop, travelTimeFromPrevious, isFirst, isLast }: DraggableStopProps) {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: STOP_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: STOP_TYPE,
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveStop(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} className={`${isDragging ? 'opacity-50' : 'opacity-100'}`}>
      <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-move">
        {/* Drag Handle */}
        <div className="flex-shrink-0">
          <GripVertical className="size-4 text-gray-400" />
        </div>

        {/* Stop Number */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
          ${isFirst ? 'bg-green-100 text-green-700 border-2 border-green-300' : ''}
          ${isLast ? 'bg-red-100 text-red-700 border-2 border-red-300' : ''}
          ${!isFirst && !isLast ? 'bg-blue-100 text-blue-700' : ''}
        `}>
          {index + 1}
        </div>

        {/* Stop Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm text-gray-900 truncate">{stop.patientName}</h4>
            <Badge variant="outline" className="text-[10px] flex-shrink-0">
              {stop.visitType}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="size-3" />
              <span className="truncate">{stop.address}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Clock className="size-3" />
              <span>{stop.duration}min</span>
            </div>
          </div>
        </div>

        {/* Travel Time Badge */}
        {travelTimeFromPrevious !== undefined && travelTimeFromPrevious > 0 && (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 flex-shrink-0">
            <Navigation className="size-3 mr-1" />
            {travelTimeFromPrevious} min travel
          </Badge>
        )}
      </div>
    </div>
  );
}

// Main Map Component
export const RouteOptimizationMap = React.memo(function RouteOptimizationMap({
  caregiverName,
  homeLocation,
  stops: initialStops,
  onRouteOptimized,
  onSave,
}: RouteOptimizationMapProps) {
  const [stops, setStops] = useState<RouteStop[]>(initialStops);
  const [originalStops] = useState<RouteStop[]>(initialStops);
  const [showOptimized, setShowOptimized] = useState(false);

  // Calculate current route metrics
  const currentMetrics = useMemo(() => 
    calculateRouteMetrics(stops, homeLocation),
    [stops, homeLocation]
  );

  // Calculate optimized route
  const optimizedStops = useMemo(() => {
    if (!homeLocation) return stops;
    return optimizeRoute(stops, homeLocation);
  }, [stops, homeLocation]);

  const optimizedMetrics = useMemo(() => 
    calculateRouteMetrics(optimizedStops, homeLocation),
    [optimizedStops, homeLocation]
  );

  // Calculate savings
  const savings = useMemo(() => ({
    distance: Math.round((currentMetrics.totalDistance - optimizedMetrics.totalDistance) * 10) / 10,
    time: currentMetrics.totalTravelTime - optimizedMetrics.totalTravelTime,
    percentage: Math.round(((currentMetrics.totalTravelTime - optimizedMetrics.totalTravelTime) / currentMetrics.totalTravelTime) * 100),
  }), [currentMetrics, optimizedMetrics]);

  // Move stop (drag and drop)
  const moveStop = useCallback((fromIndex: number, toIndex: number) => {
    setStops(prev => {
      const newStops = [...prev];
      const [removed] = newStops.splice(fromIndex, 1);
      newStops.splice(toIndex, 0, removed);
      return newStops;
    });
  }, []);

  // Apply AI optimization
  const handleOptimize = useCallback(() => {
    if (!homeLocation) {
      toast.error('Home location required for optimization');
      return;
    }

    setStops(optimizedStops);
    setShowOptimized(true);
    onRouteOptimized?.(optimizedStops);
    toast.success(`Route optimized! Estimated savings: ${savings.time} minutes (${savings.percentage}%)`);
  }, [optimizedStops, homeLocation, savings, onRouteOptimized]);

  // Reset to original
  const handleReset = useCallback(() => {
    setStops(originalStops);
    setShowOptimized(false);
    toast('Route reset to original order');
  }, [originalStops]);

  // Save route
  const handleSave = useCallback(() => {
    onSave?.(stops);
    toast.success('Route saved successfully!');
  }, [stops, onSave]);

  // Calculate travel times between stops
  const travelTimes = useMemo(() => {
    const times: (number | undefined)[] = [];
    let prevLat = homeLocation?.lat ?? stops[0]?.lat ?? 0;
    let prevLng = homeLocation?.lng ?? stops[0]?.lng ?? 0;

    stops.forEach((stop) => {
      const dist = calculateDistance(prevLat, prevLng, stop.lat, stop.lng);
      const time = calculateTravelTime(dist);
      times.push(time);
      prevLat = stop.lat;
      prevLng = stop.lng;
    });

    return times;
  }, [stops, homeLocation]);

  // Normalize coordinates for SVG map (simple projection)
  const mapBounds = useMemo(() => {
    const allLats = stops.map(s => s.lat);
    const allLngs = stops.map(s => s.lng);
    
    if (homeLocation) {
      allLats.push(homeLocation.lat);
      allLngs.push(homeLocation.lng);
    }

    return {
      minLat: Math.min(...allLats),
      maxLat: Math.max(...allLats),
      minLng: Math.min(...allLngs),
      maxLng: Math.max(...allLngs),
    };
  }, [stops, homeLocation]);

  const normalizeCoord = useCallback((lat: number, lng: number) => {
    const padding = 0.1; // 10% padding
    const latRange = mapBounds.maxLat - mapBounds.minLat || 0.01;
    const lngRange = mapBounds.maxLng - mapBounds.minLng || 0.01;

    return {
      x: ((lng - mapBounds.minLng) / lngRange) * (1 - 2 * padding) * 100 + padding * 100,
      y: 100 - (((lat - mapBounds.minLat) / latRange) * (1 - 2 * padding) * 100 + padding * 100), // invert Y
    };
  }, [mapBounds]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {/* Header with Stats */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Navigation className="size-5 text-blue-600" />
                Route Optimization: {caregiverName}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="size-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={handleOptimize} disabled={!homeLocation}>
                  <Sparkles className="size-4 mr-2" />
                  Auto-Optimize
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="size-4 mr-2" />
                  Save Route
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Metrics Comparison */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stops.length}</div>
                <div className="text-xs text-gray-600">Total Stops</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{currentMetrics.totalDistance}mi</div>
                <div className="text-xs text-gray-600">Total Distance</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{currentMetrics.totalTravelTime}min</div>
                <div className="text-xs text-gray-600">Travel Time</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">
                  {Math.floor(currentMetrics.totalTime / 60)}h {currentMetrics.totalTime % 60}m
                </div>
                <div className="text-xs text-gray-600">Total Time</div>
              </div>
            </div>

            {/* Optimization Potential */}
            {homeLocation && savings.time > 0 && !showOptimized && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3">
                <AlertCircle className="size-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-amber-900 text-sm">
                    Route Optimization Available
                  </div>
                  <div className="text-xs text-amber-700">
                    Potential savings: <strong>{savings.distance}mi</strong> and <strong>{savings.time}min</strong> ({savings.percentage}%)
                  </div>
                </div>
                <Button size="sm" onClick={handleOptimize} className="bg-amber-600 hover:bg-amber-700">
                  <Sparkles className="size-4 mr-2" />
                  Optimize Now
                </Button>
              </div>
            )}

            {/* Success Message */}
            {showOptimized && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
                <TrendingDown className="size-5 text-emerald-600 flex-shrink-0" />
                <div className="flex-1 text-sm text-emerald-900">
                  <strong>Route Optimized!</strong> Saved <strong>{savings.distance}mi</strong> and <strong>{savings.time}min</strong>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map Visualization + Route List Side-by-Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Visual Map */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Route Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-100">
                <svg viewBox="0 0 100 100" className="w-full h-80">
                  {/* Draw route lines */}
                  {stops.map((stop, idx) => {
                    if (idx === 0 && !homeLocation) return null;
                    
                    const prevStop = idx === 0 ? homeLocation : stops[idx - 1];
                    if (!prevStop) return null;

                    const start = normalizeCoord(prevStop.lat, prevStop.lng);
                    const end = normalizeCoord(stop.lat, stop.lng);

                    return (
                      <g key={`line-${stop.id}`}>
                        <line
                          x1={start.x}
                          y1={start.y}
                          x2={end.x}
                          y2={end.y}
                          stroke="#3b82f6"
                          strokeWidth="0.5"
                          strokeDasharray="2,1"
                        />
                        {/* Arrow */}
                        <polygon
                          points={`${end.x},${end.y} ${end.x - 0.5},${end.y - 1} ${end.x + 0.5},${end.y - 1}`}
                          fill="#3b82f6"
                        />
                      </g>
                    );
                  })}

                  {/* Draw home location */}
                  {homeLocation && (
                    <g>
                      {(() => {
                        const coords = normalizeCoord(homeLocation.lat, homeLocation.lng);
                        return (
                          <>
                            <circle cx={coords.x} cy={coords.y} r="2" fill="#10b981" />
                            <circle cx={coords.x} cy={coords.y} r="3" fill="none" stroke="#10b981" strokeWidth="0.5" />
                            <text x={coords.x} y={coords.y - 4} textAnchor="middle" fontSize="3" fill="#10b981" fontWeight="bold">
                              HOME
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}

                  {/* Draw stops */}
                  {stops.map((stop, idx) => {
                    const coords = normalizeCoord(stop.lat, stop.lng);
                    const isFirst = idx === 0;
                    const isLast = idx === stops.length - 1;

                    return (
                      <g key={stop.id}>
                        <circle 
                          cx={coords.x} 
                          cy={coords.y} 
                          r="2.5" 
                          fill={isFirst ? '#22c55e' : isLast ? '#ef4444' : '#3b82f6'} 
                        />
                        <circle 
                          cx={coords.x} 
                          cy={coords.y} 
                          r="3.5" 
                          fill="none" 
                          stroke={isFirst ? '#22c55e' : isLast ? '#ef4444' : '#3b82f6'} 
                          strokeWidth="0.5" 
                        />
                        <text 
                          x={coords.x} 
                          y={coords.y + 1} 
                          textAnchor="middle" 
                          fontSize="2.5" 
                          fill="white" 
                          fontWeight="bold"
                        >
                          {idx + 1}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-600" />
                    <span className="text-gray-600">Start</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-600" />
                    <span className="text-gray-600">Stops</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-600" />
                    <span className="text-gray-600">End</span>
                  </div>
                  {homeLocation && (
                    <div className="flex items-center gap-1.5">
                      <Home className="size-3 text-emerald-500" />
                      <span className="text-gray-600">Home Base</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Draggable Route List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">
                Route Sequence <span className="text-gray-500 font-normal">(Drag to reorder)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {stops.map((stop, index) => (
                  <DraggableStop
                    key={stop.id}
                    stop={stop}
                    index={index}
                    moveStop={moveStop}
                    travelTimeFromPrevious={travelTimes[index]}
                    isFirst={index === 0}
                    isLast={index === stops.length - 1}
                  />
                ))}
              </div>

              {/* Return to Home */}
              {homeLocation && stops.length > 0 && (() => {
                const lastStop = stops[stops.length - 1];
                const dist = calculateDistance(lastStop.lat, lastStop.lng, homeLocation.lat, homeLocation.lng);
                const travelTime = calculateTravelTime(dist);

                return (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                    <Home className="size-5 text-emerald-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-emerald-900">Return to Home Base</div>
                      <div className="text-xs text-emerald-700">{homeLocation.address}</div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <Navigation className="size-3 mr-1" />
                      {travelTime} min
                    </Badge>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </DndProvider>
  );
});

RouteOptimizationMap.displayName = 'RouteOptimizationMap';
