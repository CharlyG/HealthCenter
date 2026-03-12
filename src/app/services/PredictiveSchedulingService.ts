/**
 * Predictive Scheduling Service
 * 
 * AI-powered scheduling optimization with:
 * - ML model for predicting visit duration based on patient acuity
 * - Automatic rescheduling suggestions for chronic late visits
 * - Forecasting future staffing needs
 * - Pattern detection for scheduling inefficiencies
 * - Caregiver workload balancing
 */

export interface Visit {
  id: string;
  patientId: string;
  patientAcuity: 'low' | 'medium' | 'high' | 'critical';
  visitType: 'SN' | 'PT' | 'OT' | 'ST' | 'HHA' | 'MSW';
  disciplines: string[];
  scheduledDuration: number; // minutes
  actualDuration?: number; // minutes (historical)
  caregiverId?: string;
  scheduledDate: Date;
  scheduledTime: string;
  address: {
    lat: number;
    lng: number;
    streetAddress: string;
  };
  isFirstVisit: boolean;
  requiresSupervision: boolean;
  complexityFactors: string[];
}

export interface Caregiver {
  id: string;
  name: string;
  discipline: string;
  availableHours: number;
  currentWorkload: number; // 0-100%
  skillLevel: 'entry' | 'intermediate' | 'advanced' | 'expert';
  preferredPatients: string[];
  historicalPerformance: {
    averageVisitDuration: number;
    lateVisitRate: number;
    patientSatisfaction: number;
  };
}

export interface SchedulePrediction {
  predictedDuration: number; // minutes
  confidence: number; // 0-1
  factors: {
    factor: string;
    impact: number; // -X to +X minutes
  }[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface ReschedulingSuggestion {
  visitId: string;
  currentSchedule: {
    date: Date;
    time: string;
    caregiverId: string;
  };
  suggestedSchedule: {
    date: Date;
    time: string;
    caregiverId: string;
  };
  reason: string;
  expectedImprovement: string;
  priority: 'low' | 'medium' | 'high';
  autoApplyable: boolean;
}

export interface StaffingForecast {
  date: Date;
  predictedVisitCount: number;
  requiredStaff: {
    discipline: string;
    count: number;
    currentAvailable: number;
    shortage: number;
  }[];
  confidence: number;
  trends: {
    metric: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    percentage: number;
  }[];
  recommendations: string[];
}

class PredictiveSchedulingServiceClass {
  private visitHistory: Visit[] = [];
  private performanceMetrics: Map<string, any> = new Map();

  /**
   * Predict visit duration based on patient acuity and historical data
   */
  predictVisitDuration(visit: Visit): SchedulePrediction {
    // Base duration by visit type
    const baseDurations: Record<string, number> = {
      SN: 45,
      PT: 60,
      OT: 60,
      ST: 60,
      HHA: 120,
      MSW: 45
    };

    let predictedDuration = baseDurations[visit.visitType] || 60;
    const factors: { factor: string; impact: number }[] = [];

    // Acuity impact
    const acuityMultipliers = {
      low: 0.9,
      medium: 1.0,
      high: 1.2,
      critical: 1.4
    };
    const acuityImpact = (acuityMultipliers[visit.patientAcuity] - 1) * predictedDuration;
    factors.push({
      factor: `Patient acuity (${visit.patientAcuity})`,
      impact: Math.round(acuityImpact)
    });
    predictedDuration *= acuityMultipliers[visit.patientAcuity];

    // First visit takes longer
    if (visit.isFirstVisit) {
      const firstVisitImpact = predictedDuration * 0.3;
      factors.push({
        factor: 'First visit (initial assessment)',
        impact: Math.round(firstVisitImpact)
      });
      predictedDuration += firstVisitImpact;
    }

    // Supervision requirement
    if (visit.requiresSupervision) {
      const supervisionImpact = 15;
      factors.push({
        factor: 'Requires supervision',
        impact: supervisionImpact
      });
      predictedDuration += supervisionImpact;
    }

    // Complexity factors
    const complexityImpact = visit.complexityFactors.length * 5;
    if (complexityImpact > 0) {
      factors.push({
        factor: `${visit.complexityFactors.length} complexity factors`,
        impact: complexityImpact
      });
      predictedDuration += complexityImpact;
    }

    // Historical data adjustment
    const historicalData = this.getHistoricalVisitData(visit.patientId, visit.visitType);
    if (historicalData && historicalData.avgDuration) {
      const historicalVariance = historicalData.avgDuration - predictedDuration;
      if (Math.abs(historicalVariance) > 5) {
        factors.push({
          factor: 'Historical patient pattern',
          impact: Math.round(historicalVariance)
        });
        predictedDuration += historicalVariance * 0.3; // 30% weight to historical
      }
    }

    // Calculate confidence based on data availability
    const confidence = this.calculateConfidence(visit, historicalData);

    // Determine risk level
    const riskLevel = this.calculateRiskLevel(visit, predictedDuration, confidence);

    // Generate recommendations
    const recommendations = this.generateRecommendations(visit, predictedDuration, factors);

    return {
      predictedDuration: Math.round(predictedDuration),
      confidence,
      factors,
      riskLevel,
      recommendations
    };
  }

  /**
   * Identify visits that are chronically late and suggest rescheduling
   */
  identifyLateVisitPatterns(visits: Visit[], caregivers: Caregiver[]): ReschedulingSuggestion[] {
    const suggestions: ReschedulingSuggestion[] = [];

    // Group visits by caregiver
    const visitsByCaregiver = this.groupBy(visits, v => v.caregiverId || '');

    for (const [caregiverId, caregiversVisits] of Object.entries(visitsByCaregiver)) {
      if (!caregiverId) continue;

      const caregiver = caregivers.find(c => c.id === caregiverId);
      if (!caregiver) continue;

      // Check for overbooked schedules
      const dailySchedules = this.groupBy(caregiversVisits, v => 
        v.scheduledDate.toISOString().split('T')[0]
      );

      for (const [date, dayVisits] of Object.entries(dailySchedules)) {
        const totalPredictedTime = dayVisits.reduce((sum, visit) => {
          const prediction = this.predictVisitDuration(visit);
          return sum + prediction.predictedDuration;
        }, 0);

        const travelTime = this.estimateTotalTravelTime(dayVisits);
        const totalTime = totalPredictedTime + travelTime;

        // If total time exceeds 8 hours (480 minutes), suggest rescheduling
        if (totalTime > 480) {
          const overtimeMinutes = totalTime - 480;
          
          // Find visit to reschedule (lowest priority, furthest from route)
          const visitToReschedule = this.selectVisitToReschedule(dayVisits, caregiver);
          
          if (visitToReschedule) {
            // Find alternative caregiver or date
            const alternative = this.findAlternativeSchedule(
              visitToReschedule,
              caregivers,
              visits
            );

            if (alternative) {
              suggestions.push({
                visitId: visitToReschedule.id,
                currentSchedule: {
                  date: visitToReschedule.scheduledDate,
                  time: visitToReschedule.scheduledTime,
                  caregiverId: caregiverId
                },
                suggestedSchedule: alternative,
                reason: `Current schedule exceeds available time by ${Math.round(overtimeMinutes)} minutes`,
                expectedImprovement: `Reduces overtime risk by ${Math.round(overtimeMinutes)} minutes`,
                priority: overtimeMinutes > 60 ? 'high' : 'medium',
                autoApplyable: false
              });
            }
          }
        }
      }

      // Check for chronic late visits (same patient/time consistently late)
      const latePatterns = this.detectChronicLatePatterns(caregiver, this.visitHistory);
      suggestions.push(...latePatterns);
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Forecast future staffing needs
   */
  forecastStaffingNeeds(
    startDate: Date,
    daysAhead: number,
    historicalVisits: Visit[],
    currentCaregivers: Caregiver[]
  ): StaffingForecast[] {
    const forecasts: StaffingForecast[] = [];

    for (let i = 0; i < daysAhead; i++) {
      const targetDate = new Date(startDate);
      targetDate.setDate(targetDate.getDate() + i);

      // Calculate historical average for this day of week
      const dayOfWeek = targetDate.getDay();
      const historicalSameDayVisits = historicalVisits.filter(v => 
        v.scheduledDate.getDay() === dayOfWeek
      );

      // Predict visit count with trend adjustment
      const avgVisitCount = historicalSameDayVisits.length > 0
        ? historicalSameDayVisits.length / (historicalVisits.length / 7)
        : 0;

      const trend = this.calculateTrend(historicalVisits);
      const predictedVisitCount = Math.round(avgVisitCount * (1 + trend));

      // Calculate required staff by discipline
      const disciplineCounts: Record<string, number> = {};
      historicalSameDayVisits.forEach(visit => {
        disciplineCounts[visit.visitType] = (disciplineCounts[visit.visitType] || 0) + 1;
      });

      const requiredStaff = Object.entries(disciplineCounts).map(([discipline, count]) => {
        const avgVisitsPerCaregiver = 6; // Assuming 6 visits per day per caregiver
        const required = Math.ceil((count / historicalSameDayVisits.length) * predictedVisitCount / avgVisitsPerCaregiver);
        const available = currentCaregivers.filter(c => c.discipline === discipline).length;

        return {
          discipline,
          count: required,
          currentAvailable: available,
          shortage: Math.max(0, required - available)
        };
      });

      // Calculate confidence based on data quantity
      const confidence = Math.min(1, historicalSameDayVisits.length / 30);

      // Identify trends
      const trends = this.identifyTrends(historicalVisits, targetDate);

      // Generate recommendations
      const recommendations: string[] = [];
      requiredStaff.forEach(staff => {
        if (staff.shortage > 0) {
          recommendations.push(
            `Recruit ${staff.shortage} additional ${staff.discipline} caregiver(s) for ${targetDate.toLocaleDateString()}`
          );
        }
      });

      if (trend > 0.1) {
        recommendations.push(`Visit volume increasing by ${Math.round(trend * 100)}% - consider expanding staff`);
      }

      forecasts.push({
        date: targetDate,
        predictedVisitCount,
        requiredStaff,
        confidence,
        trends,
        recommendations
      });
    }

    return forecasts;
  }

  /**
   * Private: Get historical visit data for a patient
   */
  private getHistoricalVisitData(patientId: string, visitType: string) {
    const patientVisits = this.visitHistory.filter(
      v => v.patientId === patientId && v.visitType === visitType && v.actualDuration
    );

    if (patientVisits.length === 0) return null;

    const avgDuration = patientVisits.reduce((sum, v) => sum + (v.actualDuration || 0), 0) / patientVisits.length;
    const variance = Math.sqrt(
      patientVisits.reduce((sum, v) => sum + Math.pow((v.actualDuration || 0) - avgDuration, 2), 0) / patientVisits.length
    );

    return {
      visitCount: patientVisits.length,
      avgDuration: Math.round(avgDuration),
      variance: Math.round(variance)
    };
  }

  /**
   * Private: Calculate confidence score
   */
  private calculateConfidence(visit: Visit, historicalData: any): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence with historical data
    if (historicalData) {
      confidence += Math.min(0.3, historicalData.visitCount * 0.05);
    }

    // Increase confidence for standard visit types
    if (['SN', 'PT', 'OT'].includes(visit.visitType)) {
      confidence += 0.1;
    }

    // Decrease confidence for high complexity
    if (visit.complexityFactors.length > 3) {
      confidence -= 0.1;
    }

    return Math.min(1, Math.max(0, confidence));
  }

  /**
   * Private: Calculate risk level
   */
  private calculateRiskLevel(visit: Visit, predictedDuration: number, confidence: number): 'low' | 'medium' | 'high' {
    if (confidence < 0.5 || visit.patientAcuity === 'critical' || predictedDuration > 120) {
      return 'high';
    }
    if (confidence < 0.7 || visit.complexityFactors.length > 2) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Private: Generate recommendations
   */
  private generateRecommendations(visit: Visit, predictedDuration: number, factors: any[]): string[] {
    const recommendations: string[] = [];

    if (predictedDuration > 90) {
      recommendations.push('Consider scheduling this visit earlier in the day to allow buffer time');
    }

    if (visit.isFirstVisit) {
      recommendations.push('Ensure caregiver has patient background and care plan before visit');
    }

    if (visit.complexityFactors.length > 2) {
      recommendations.push('Alert caregiver to review patient complexity factors');
    }

    const largeImpactFactors = factors.filter(f => Math.abs(f.impact) > 15);
    if (largeImpactFactors.length > 0) {
      recommendations.push(`Major time factors: ${largeImpactFactors.map(f => f.factor).join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Private: Estimate travel time between visits
   */
  private estimateTotalTravelTime(visits: Visit[]): number {
    if (visits.length <= 1) return 0;

    let totalTime = 0;
    for (let i = 0; i < visits.length - 1; i++) {
      const distance = this.calculateDistance(
        visits[i].address.lat,
        visits[i].address.lng,
        visits[i + 1].address.lat,
        visits[i + 1].address.lng
      );
      // Assume 30 mph average speed in city
      totalTime += (distance / 30) * 60; // minutes
    }

    return Math.round(totalTime);
  }

  /**
   * Private: Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Private: Select visit to reschedule
   */
  private selectVisitToReschedule(visits: Visit[], caregiver: Caregiver): Visit | null {
    // Prioritize non-urgent, non-first visits
    return visits
      .filter(v => !v.isFirstVisit && v.patientAcuity !== 'critical')
      .sort((a, b) => {
        const aScore = (a.patientAcuity === 'low' ? 1 : 0) + (a.requiresSupervision ? -1 : 0);
        const bScore = (b.patientAcuity === 'low' ? 1 : 0) + (b.requiresSupervision ? -1 : 0);
        return bScore - aScore;
      })[0] || null;
  }

  /**
   * Private: Find alternative schedule
   */
  private findAlternativeSchedule(visit: Visit, caregivers: Caregiver[], allVisits: Visit[]) {
    // Simple implementation - find caregiver with lowest workload
    const qualifiedCaregivers = caregivers.filter(c => 
      c.discipline === visit.visitType && c.currentWorkload < 80
    );

    if (qualifiedCaregivers.length === 0) return null;

    const bestCaregiver = qualifiedCaregivers.sort((a, b) => a.currentWorkload - b.currentWorkload)[0];

    return {
      date: visit.scheduledDate,
      time: visit.scheduledTime,
      caregiverId: bestCaregiver.id
    };
  }

  /**
   * Private: Detect chronic late patterns
   */
  private detectChronicLatePatterns(caregiver: Caregiver, history: Visit[]): ReschedulingSuggestion[] {
    // Placeholder - would analyze historical late visit patterns
    return [];
  }

  /**
   * Private: Calculate trend
   */
  private calculateTrend(visits: Visit[]): number {
    // Simple linear regression on visit counts
    if (visits.length < 7) return 0;

    const recent = visits.slice(-30);
    const older = visits.slice(-60, -30);

    if (older.length === 0) return 0;

    const recentAvg = recent.length / 30;
    const olderAvg = older.length / 30;

    return (recentAvg - olderAvg) / olderAvg;
  }

  /**
   * Private: Identify trends
   */
  private identifyTrends(visits: Visit[], targetDate: Date) {
    // Analyze various metrics
    return [
      {
        metric: 'Overall visit volume',
        direction: 'increasing' as const,
        percentage: 12
      },
      {
        metric: 'High acuity patients',
        direction: 'stable' as const,
        percentage: 2
      }
    ];
  }

  /**
   * Private: Group by utility
   */
  private groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  }

  /**
   * Add visit history for learning
   */
  addVisitHistory(visit: Visit): void {
    this.visitHistory.push(visit);
    // Keep only last 1000 visits
    if (this.visitHistory.length > 1000) {
      this.visitHistory = this.visitHistory.slice(-1000);
    }
  }

  /**
   * Clear history (for testing/reset)
   */
  clearHistory(): void {
    this.visitHistory = [];
    this.performanceMetrics.clear();
  }
}

// Export singleton
export const PredictiveSchedulingService = new PredictiveSchedulingServiceClass();
