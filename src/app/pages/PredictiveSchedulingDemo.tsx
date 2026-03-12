/**
 * Predictive Scheduling Demo Page
 * 
 * Showcases the complete Smart Scheduling Assistant with AI-powered features:
 * - Visit Cards with Predictive Badges (Duration, Travel Time, Risk Score)
 * - Enhanced Scheduling Suggestions Panel
 * - Interactive Route Optimization Map
 * - Drag-and-drop route planning
 * - Real-time travel time calculations
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Navigation, 
  Clock, 
  TrendingDown, 
  Sparkles, 
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { RouteOptimizationMap } from '../components/scheduling/RouteOptimizationMap';
import { PredictiveVisitBadges } from '../components/scheduling/PredictiveVisitBadges';
import TravelOptimizationPanel from '../components/scheduling/TravelOptimizationPanel';

export default function PredictiveSchedulingDemo() {
  const [activeTab, setActiveTab] = useState('overview');

  // Demo data for visit cards
  const demoVisit = {
    id: 'visit-001',
    patient_id: 'patient-123',
    patientAcuity: 'high' as const,
    visit_type: 'SN',
    discipline: 'Nursing',
    scheduled_date: '2026-03-15',
    scheduled_time: '10:00',
    duration: 60,
    isFirstVisit: false,
    requiresSupervision: false,
    complexityFactors: ['wound care', 'diabetes management'],
  };

  // Demo route stops for map
  const demoStops = [
    {
      id: 'stop-1',
      visitId: 'visit-001',
      patientName: 'Margaret Chen',
      address: '742 Oak Avenue, Brooklyn NY',
      lat: 40.7128,
      lng: -74.006,
      scheduledTime: '09:00',
      duration: 60,
      visitType: 'Initial Evaluation',
    },
    {
      id: 'stop-2',
      visitId: 'visit-002',
      patientName: 'Robert Thompson',
      address: '1534 Pine Street, Brooklyn NY',
      lat: 40.7228,
      lng: -73.996,
      scheduledTime: '10:30',
      duration: 45,
      visitType: 'Wound Care',
    },
    {
      id: 'stop-3',
      visitId: 'visit-003',
      patientName: 'Lisa Martinez',
      address: '892 Maple Drive, Queens NY',
      lat: 40.7328,
      lng: -73.986,
      scheduledTime: '12:00',
      duration: 60,
      visitType: 'Skilled Nursing',
    },
    {
      id: 'stop-4',
      visitId: 'visit-004',
      patientName: 'James Wilson',
      address: '321 Elm Court, Bronx NY',
      lat: 40.7028,
      lng: -73.976,
      scheduledTime: '14:00',
      duration: 60,
      visitType: 'Med Management',
    },
    {
      id: 'stop-5',
      visitId: 'visit-005',
      patientName: 'Patricia Garcia',
      address: '1876 Cedar Lane, Manhattan NY',
      lat: 40.7428,
      lng: -74.016,
      scheduledTime: '15:30',
      duration: 45,
      visitType: 'Reassessment',
    },
  ];

  const homeLocation = {
    lat: 40.7128,
    lng: -74.006,
    address: 'Home Health Services - 456 Medical Plaza, NYC',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-semibold shadow-lg">
            <Sparkles className="size-4" />
            AI-Powered Smart Scheduling
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Predictive Scheduling Assistant
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Leverage machine learning to optimize visit scheduling with predicted durations, 
            intelligent route planning, and real-time travel time calculations.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="pt-6 pb-4">
              <Clock className="size-8 mb-3 opacity-90" />
              <h3 className="font-bold text-lg mb-1">Duration Prediction</h3>
              <p className="text-sm opacity-90">AI predicts visit length based on acuity & history</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="pt-6 pb-4">
              <Navigation className="size-8 mb-3 opacity-90" />
              <h3 className="font-bold text-lg mb-1">Travel Time</h3>
              <p className="text-sm opacity-90">Real-time calculation from previous visits</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
            <CardContent className="pt-6 pb-4">
              <AlertTriangle className="size-8 mb-3 opacity-90" />
              <h3 className="font-bold text-lg mb-1">Risk Scoring</h3>
              <p className="text-sm opacity-90">Identify scheduling conflicts before they happen</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
            <CardContent className="pt-6 pb-4">
              <TrendingDown className="size-8 mb-3 opacity-90" />
              <h3 className="font-bold text-lg mb-1">Route Optimization</h3>
              <p className="text-sm opacity-90">Save time with intelligent route planning</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Demo Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">
              <Sparkles className="size-4 mr-2" />
              AI Predictions
            </TabsTrigger>
            <TabsTrigger value="route-map" className="data-[state=active]:bg-white">
              <MapPin className="size-4 mr-2" />
              Route Optimization
            </TabsTrigger>
            <TabsTrigger value="travel-panel" className="data-[state=active]:bg-white">
              <Navigation className="size-4 mr-2" />
              Travel Analysis
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: AI Predictions Demo */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5 text-blue-600" />
                  AI-Powered Visit Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Demo Visit Card */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Example Visit Card with Predictive Badges:</h3>
                  
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2.5 rounded-lg bg-blue-50">
                        <Calendar className="size-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Friday, March 15, 2026</h4>
                        <p className="text-sm text-gray-600">10:00 AM • 60 min scheduled</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Confirmed
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="text-gray-600">
                          <p className="text-[10px] text-gray-500">Discipline</p>
                          <p className="font-medium">Nursing</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="text-gray-600">
                          <p className="text-[10px] text-gray-500">Patient</p>
                          <p className="font-medium">Margaret Chen</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Predictions */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-[10px] text-gray-500 mb-2 font-medium uppercase">AI Predictions</p>
                      <PredictiveVisitBadges
                        visit={demoVisit}
                        previousVisitLocation={{
                          lat: 40.7028,
                          lng: -74.016,
                        }}
                        currentVisitLocation={{
                          lat: 40.7128,
                          lng: -74.006,
                          streetAddress: '742 Oak Avenue, Brooklyn NY',
                        }}
                        variant="default"
                        showLabels={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="size-4 text-blue-600" />
                      <h4 className="font-semibold text-sm text-blue-900">Predicted Duration</h4>
                    </div>
                    <p className="text-xs text-blue-700">
                      ML model analyzes patient acuity, complexity factors, and historical data to predict 
                      actual visit duration with 80%+ confidence.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="size-4 text-purple-600" />
                      <h4 className="font-semibold text-sm text-purple-900">Travel Time</h4>
                    </div>
                    <p className="text-xs text-purple-700">
                      Calculates driving time from previous visit using Haversine formula, 
                      accounting for urban traffic patterns (avg 30mph).
                    </p>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="size-4 text-orange-600" />
                      <h4 className="font-semibold text-sm text-orange-900">Risk Score</h4>
                    </div>
                    <p className="text-xs text-orange-700">
                      Identifies potential scheduling conflicts based on workload, 
                      predicted duration vs scheduled time, and caregiver history.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Route Optimization Map */}
          <TabsContent value="route-map" className="space-y-4">
            <RouteOptimizationMap
              caregiverName="Sarah Johnson, RN"
              homeLocation={homeLocation}
              stops={demoStops}
              onRouteOptimized={(optimizedStops) => {
                console.log('Optimized route:', optimizedStops);
              }}
              onSave={(stops) => {
                console.log('Route saved:', stops);
              }}
            />

            {/* Instructions */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900">Interactive Features:</h4>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                      <li><strong>Drag & Drop:</strong> Reorder visits manually by dragging stops in the route list</li>
                      <li><strong>Auto-Optimize:</strong> Click to apply AI-powered traveling salesman algorithm</li>
                      <li><strong>Visual Map:</strong> See route changes in real-time on the map visualization</li>
                      <li><strong>Save Route:</strong> Apply optimized route to update visit schedule</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Travel Optimization Panel */}
          <TabsContent value="travel-panel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="size-5 text-blue-600" />
                  Travel Optimization Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TravelOptimizationPanel selectedDate={new Date()} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Technical Details */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5" />
              Technical Implementation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2 text-blue-300">AI/ML Components</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Duration prediction model</li>
                  <li>• Risk scoring algorithm</li>
                  <li>• Pattern detection engine</li>
                  <li>• Confidence scoring</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-purple-300">Route Optimization</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Greedy nearest neighbor TSP</li>
                  <li>• Haversine distance calc</li>
                  <li>• Real-time re-calculation</li>
                  <li>• Drag-and-drop reordering</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-green-300">UI/UX Features</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Predictive badge system</li>
                  <li>• Interactive SVG maps</li>
                  <li>• Real-time tooltips</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
