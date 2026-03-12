/**
 * Predictive Visit Badges
 * 
 * Visual indicators showing AI-powered predictions for visits:
 * - Predicted Duration (based on patient acuity, complexity, history)
 * - Travel Time (from previous visit)
 * - Risk Score (scheduling conflict probability)
 * 
 * Used in:
 * - Visit Cards (PatientScheduling)
 * - Schedule Calendar
 * - Caregiver Dashboard
 */

import React, { useMemo } from 'react';
import { Clock, Navigation, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { PredictiveSchedulingService } from '../../services/PredictiveSchedulingService';
import type { Visit } from '../../services/PredictiveSchedulingService';

interface PredictiveVisitBadgesProps {
  visit: {
    id: string;
    patient_id?: string;
    patientAcuity?: 'low' | 'medium' | 'high' | 'critical';
    visit_type?: string;
    discipline?: string;
    scheduled_date?: string | Date;
    scheduled_time?: string;
    duration?: number;
    isFirstVisit?: boolean;
    requiresSupervision?: boolean;
    complexityFactors?: string[];
  };
  previousVisitLocation?: {
    lat: number;
    lng: number;
  };
  currentVisitLocation?: {
    lat: number;
    lng: number;
    streetAddress?: string;
  };
  variant?: 'default' | 'compact';
  showLabels?: boolean;
}

export const PredictiveVisitBadges = React.memo(function PredictiveVisitBadges({
  visit,
  previousVisitLocation,
  currentVisitLocation,
  variant = 'default',
  showLabels = true,
}: PredictiveVisitBadgesProps) {
  // Calculate predictions using AI service
  const prediction = useMemo(() => {
    if (!visit.patient_id || !visit.visit_type) return null;

    // Convert to Visit type expected by PredictiveSchedulingService
    const visitData: Visit = {
      id: visit.id,
      patientId: visit.patient_id,
      patientAcuity: visit.patientAcuity || 'medium',
      visitType: visit.visit_type as any,
      disciplines: visit.discipline ? [visit.discipline] : [],
      scheduledDuration: visit.duration || 60,
      scheduledDate: typeof visit.scheduled_date === 'string' 
        ? new Date(visit.scheduled_date) 
        : visit.scheduled_date || new Date(),
      scheduledTime: visit.scheduled_time || '09:00',
      address: currentVisitLocation || {
        lat: 0,
        lng: 0,
        streetAddress: '',
      },
      isFirstVisit: visit.isFirstVisit || false,
      requiresSupervision: visit.requiresSupervision || false,
      complexityFactors: visit.complexityFactors || [],
    };

    return PredictiveSchedulingService.predictVisitDuration(visitData);
  }, [visit, currentVisitLocation]);

  // Calculate travel time if we have both locations
  const travelTime = useMemo(() => {
    if (!previousVisitLocation || !currentVisitLocation) return null;

    // Simple distance calculation (Haversine formula)
    const R = 3959; // Earth's radius in miles
    const dLat = (currentVisitLocation.lat - previousVisitLocation.lat) * Math.PI / 180;
    const dLon = (currentVisitLocation.lng - previousVisitLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(previousVisitLocation.lat * Math.PI / 180) * 
      Math.cos(currentVisitLocation.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Estimate travel time: assume 30 mph average in urban areas
    const timeHours = distance / 30;
    const timeMinutes = Math.round(timeHours * 60);

    return timeMinutes;
  }, [previousVisitLocation, currentVisitLocation]);

  if (!prediction && !travelTime) return null;

  const isCompact = variant === 'compact';

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${isCompact ? 'gap-1' : 'gap-1.5'}`}>
      {/* Predicted Duration Badge */}
      {prediction && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={`
                  bg-gradient-to-r from-blue-50 to-indigo-50 
                  border-blue-200 text-blue-700 
                  hover:bg-blue-100 transition-colors
                  ${isCompact ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'}
                `}
              >
                <Clock className={isCompact ? 'size-2.5 mr-1' : 'size-3 mr-1'} />
                {showLabels && !isCompact && 'Predicted: '}
                {prediction.predictedDuration} min
                {prediction.confidence >= 0.8 && (
                  <Zap className={`${isCompact ? 'size-2.5 ml-0.5' : 'size-3 ml-1'} text-yellow-500`} />
                )}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold">Predicted Duration</span>
                  <span className="text-xs text-blue-600 font-bold">{prediction.predictedDuration} min</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500">Confidence</span>
                  <span className="text-xs font-medium">{Math.round(prediction.confidence * 100)}%</span>
                </div>
                {prediction.factors.length > 0 && (
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="text-[10px] font-semibold text-gray-500 mb-1">Contributing Factors:</div>
                    <div className="space-y-1">
                      {prediction.factors.slice(0, 3).map((factor, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[10px]">
                          <span className="text-gray-600">{factor.factor}</span>
                          <span className={`font-medium ${factor.impact > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            {factor.impact > 0 ? '+' : ''}{factor.impact} min
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Travel Time Badge */}
      {travelTime !== null && travelTime > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={`
                  bg-gradient-to-r from-purple-50 to-pink-50 
                  border-purple-200 text-purple-700 
                  hover:bg-purple-100 transition-colors
                  ${isCompact ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'}
                `}
              >
                <Navigation className={isCompact ? 'size-2.5 mr-1' : 'size-3 mr-1'} />
                {showLabels && !isCompact && 'Travel: '}
                {travelTime} min
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="text-xs">
                <div className="font-semibold mb-1">Estimated Travel Time</div>
                <div className="text-gray-500">From previous visit location</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Risk Score Badge */}
      {prediction && prediction.riskLevel !== 'low' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={`
                  ${
                    prediction.riskLevel === 'critical' 
                      ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                      : prediction.riskLevel === 'high'
                      ? 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100'
                      : 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                  }
                  transition-colors
                  ${isCompact ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'}
                `}
              >
                <AlertTriangle className={isCompact ? 'size-2.5 mr-1' : 'size-3 mr-1'} />
                {showLabels && !isCompact && 'Risk: '}
                {prediction.riskLevel.charAt(0).toUpperCase() + prediction.riskLevel.slice(1)}
                {prediction.riskLevel === 'critical' && (
                  <TrendingUp className={`${isCompact ? 'size-2.5 ml-0.5' : 'size-3 ml-1'} animate-pulse`} />
                )}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold">Schedule Risk</span>
                  <span className={`
                    text-xs font-bold
                    ${prediction.riskLevel === 'critical' ? 'text-red-600' : ''}
                    ${prediction.riskLevel === 'high' ? 'text-orange-600' : ''}
                    ${prediction.riskLevel === 'medium' ? 'text-yellow-600' : ''}
                  `}>
                    {prediction.riskLevel.toUpperCase()}
                  </span>
                </div>
                {prediction.recommendations.length > 0 && (
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="text-[10px] font-semibold text-gray-500 mb-1">Recommendations:</div>
                    <ul className="space-y-1 list-disc list-inside">
                      {prediction.recommendations.slice(0, 2).map((rec, idx) => (
                        <li key={idx} className="text-[10px] text-gray-600">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
});

PredictiveVisitBadges.displayName = 'PredictiveVisitBadges';
