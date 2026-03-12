/**
 * Operational Heatmap Visualization
 * 
 * Visual analytics for operational trends across regions and caregivers.
 * 
 * Heatmap Types:
 * 1. Visit Density - Volume of visits by region
 * 2. Delayed Visits - Locations with delayed visit patterns
 * 3. Caregiver Workload - Distribution of caregiver assignments
 * 4. Travel Inefficiencies - Regions with high travel time vs visit time
 * 
 * Features:
 * - Grid-based heatmap visualization
 * - Color-coded intensity indicators
 * - Multi-dimensional filtering (office, discipline, date range)
 * - Drill-down to regional details
 * - Bottleneck identification
 * - Export capabilities
 */

import { useState, useMemo } from 'react';
import {
  MapPin,
  Clock,
  Users,
  TrendingUp,
  Filter,
  Calendar,
  Download,
  ZoomIn,
  AlertTriangle,
  Navigation,
  Activity,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { PageHeader } from '../design-system/PageLayout';

// ==================== TYPE DEFINITIONS ====================

export type HeatmapType = 'visit_density' | 'delayed_visits' | 'caregiver_workload' | 'travel_inefficiency';

export interface RegionData {
  id: string;
  name: string;
  zip_code: string;
  lat: number;
  lng: number;
  visit_count: number;
  delayed_visit_count: number;
  caregiver_count: number;
  avg_travel_time_minutes: number;
  avg_visit_time_minutes: number;
  total_patients: number;
  office_id: string;
}

export interface CaregiverWorkload {
  caregiver_id: string;
  caregiver_name: string;
  assigned_visits: number;
  completed_visits: number;
  delayed_visits: number;
  total_drive_time_hours: number;
  avg_visits_per_day: number;
  regions_covered: string[];
  discipline: string;
  utilization_percent: number;
}

export interface HeatmapFilters {
  office_id: string;
  discipline: string;
  date_from: string;
  date_to: string;
}

export interface BottleneckAlert {
  id: string;
  type: 'high_density' | 'delayed_cluster' | 'overloaded_caregiver' | 'travel_inefficient';
  severity: 'critical' | 'high' | 'medium';
  region_name: string;
  description: string;
  metric_value: number;
  recommendation: string;
}

// ==================== HEATMAP CONFIG ====================

const HEATMAP_CONFIGS = {
  visit_density: {
    label: 'Visit Density',
    description: 'Volume of visits by region',
    icon: MapPin,
    color_scale: ['#f0fdf4', '#86efac', '#22c55e', '#15803d', '#14532d'],
    metric_label: 'Visits',
    threshold_critical: 50,
    threshold_high: 30,
  },
  delayed_visits: {
    label: 'Delayed Visits',
    description: 'Locations with delayed visit patterns',
    icon: Clock,
    color_scale: ['#fef2f2', '#fca5a5', '#ef4444', '#dc2626', '#991b1b'],
    metric_label: 'Delayed',
    threshold_critical: 10,
    threshold_high: 5,
  },
  caregiver_workload: {
    label: 'Caregiver Workload',
    description: 'Distribution of caregiver assignments',
    icon: Users,
    color_scale: ['#fef3c7', '#fbbf24', '#f59e0b', '#d97706', '#92400e'],
    metric_label: 'Caregivers',
    threshold_critical: 8,
    threshold_high: 5,
  },
  travel_inefficiency: {
    label: 'Travel Inefficiencies',
    description: 'High travel time vs visit time ratio',
    icon: Navigation,
    color_scale: ['#f0f9ff', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'],
    metric_label: 'Travel/Visit Ratio',
    threshold_critical: 0.8,
    threshold_high: 0.5,
  },
};

// ==================== HEATMAP LEGEND ====================

interface HeatmapLegendProps {
  heatmapType: HeatmapType;
}

function HeatmapLegend({ heatmapType }: HeatmapLegendProps) {
  const config = HEATMAP_CONFIGS[heatmapType];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600 font-medium">Intensity:</span>
      <div className="flex items-center gap-1">
        {config.color_scale.map((color, i) => (
          <div
            key={i}
            className="size-6 rounded border border-gray-300"
            style={{ backgroundColor: color }}
            title={`Level ${i + 1}`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-600">Low → High</span>
    </div>
  );
}

// ==================== REGION HEATMAP GRID ====================

interface RegionHeatmapGridProps {
  regions: RegionData[];
  heatmapType: HeatmapType;
  onRegionClick: (region: RegionData) => void;
}

function RegionHeatmapGrid({ regions, heatmapType, onRegionClick }: RegionHeatmapGridProps) {
  const config = HEATMAP_CONFIGS[heatmapType];

  const getMetricValue = (region: RegionData): number => {
    switch (heatmapType) {
      case 'visit_density':
        return region.visit_count;
      case 'delayed_visits':
        return region.delayed_visit_count;
      case 'caregiver_workload':
        return region.caregiver_count;
      case 'travel_inefficiency':
        return region.avg_travel_time_minutes / (region.avg_visit_time_minutes || 1);
      default:
        return 0;
    }
  };

  const getColorForValue = (value: number): string => {
    const maxValue = Math.max(...regions.map(r => getMetricValue(r)));
    const normalizedValue = maxValue > 0 ? value / maxValue : 0;
    const index = Math.min(Math.floor(normalizedValue * config.color_scale.length), config.color_scale.length - 1);
    return config.color_scale[index];
  };

  const getSeverity = (value: number): 'critical' | 'high' | 'medium' | 'normal' => {
    if (value >= config.threshold_critical) return 'critical';
    if (value >= config.threshold_high) return 'high';
    if (value > 0) return 'medium';
    return 'normal';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {regions.map((region) => {
        const metricValue = getMetricValue(region);
        const color = getColorForValue(metricValue);
        const severity = getSeverity(metricValue);
        const Icon = config.icon;

        return (
          <Card
            key={region.id}
            className="cursor-pointer hover:shadow-lg transition-all border-2"
            style={{ backgroundColor: color, borderColor: severity === 'critical' ? '#dc2626' : severity === 'high' ? '#f59e0b' : '#d1d5db' }}
            onClick={() => onRegionClick(region)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <Icon className="size-5 text-gray-700" />
                {severity !== 'normal' && (
                  <Badge className={`text-xs ${
                    severity === 'critical' ? 'bg-red-600' :
                    severity === 'high' ? 'bg-orange-600' :
                    'bg-amber-600'
                  } text-white`}>
                    {severity.toUpperCase()}
                  </Badge>
                )}
              </div>
              <h4 className="font-semibold text-sm text-gray-900 mb-1">{region.name}</h4>
              <p className="text-xs text-gray-600 mb-2">{region.zip_code}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">
                  {heatmapType === 'travel_inefficiency' ? metricValue.toFixed(2) : metricValue}
                </span>
                <span className="text-xs text-gray-600">{config.metric_label}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Patients:</span>
                  <span className="font-semibold">{region.total_patients}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ==================== CAREGIVER WORKLOAD TABLE ====================

interface CaregiverWorkloadTableProps {
  workloads: CaregiverWorkload[];
  onCaregiverClick: (caregiver: CaregiverWorkload) => void;
}

function CaregiverWorkloadTable({ workloads, onCaregiverClick }: CaregiverWorkloadTableProps) {
  const getUtilizationColor = (percent: number): string => {
    if (percent >= 95) return 'bg-red-100 text-red-700';
    if (percent >= 85) return 'bg-orange-100 text-orange-700';
    if (percent >= 70) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="overflow-auto max-h-[600px]">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 sticky top-0">
          <tr>
            <th className="text-left p-3 font-semibold">Caregiver</th>
            <th className="text-left p-3 font-semibold">Discipline</th>
            <th className="text-center p-3 font-semibold">Assigned</th>
            <th className="text-center p-3 font-semibold">Completed</th>
            <th className="text-center p-3 font-semibold">Delayed</th>
            <th className="text-center p-3 font-semibold">Avg/Day</th>
            <th className="text-center p-3 font-semibold">Drive Time</th>
            <th className="text-center p-3 font-semibold">Utilization</th>
            <th className="text-center p-3 font-semibold">Regions</th>
          </tr>
        </thead>
        <tbody>
          {workloads.map((workload) => (
            <tr
              key={workload.caregiver_id}
              className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
              onClick={() => onCaregiverClick(workload)}
            >
              <td className="p-3">
                <p className="font-medium text-gray-900">{workload.caregiver_name}</p>
              </td>
              <td className="p-3 text-gray-700">{workload.discipline}</td>
              <td className="p-3 text-center font-semibold">{workload.assigned_visits}</td>
              <td className="p-3 text-center text-green-700">{workload.completed_visits}</td>
              <td className="p-3 text-center">
                {workload.delayed_visits > 0 && (
                  <Badge className="bg-red-100 text-red-700">{workload.delayed_visits}</Badge>
                )}
              </td>
              <td className="p-3 text-center">{workload.avg_visits_per_day.toFixed(1)}</td>
              <td className="p-3 text-center">{workload.total_drive_time_hours.toFixed(1)}h</td>
              <td className="p-3 text-center">
                <Badge className={getUtilizationColor(workload.utilization_percent)}>
                  {workload.utilization_percent}%
                </Badge>
              </td>
              <td className="p-3 text-center text-gray-600">{workload.regions_covered.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ==================== BOTTLENECK ALERTS ====================

interface BottleneckAlertsProps {
  alerts: BottleneckAlert[];
}

function BottleneckAlerts({ alerts }: BottleneckAlertsProps) {
  const severityConfig = {
    critical: { color: 'bg-red-100 border-red-300 text-red-900', badge: 'bg-red-600 text-white', icon: '🔴' },
    high: { color: 'bg-orange-100 border-orange-300 text-orange-900', badge: 'bg-orange-600 text-white', icon: '🟠' },
    medium: { color: 'bg-amber-100 border-amber-300 text-amber-900', badge: 'bg-amber-600 text-white', icon: '🟡' },
  };

  if (alerts.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <Activity className="size-12 text-green-600 mx-auto mb-3" />
          <p className="font-semibold text-green-900">No Bottlenecks Detected</p>
          <p className="text-sm text-green-800 mt-1">Operations running smoothly</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const config = severityConfig[alert.severity];
        return (
          <Card key={alert.id} className={`border-2 ${config.color}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <h4 className="font-semibold text-sm">{alert.region_name}</h4>
                    <p className="text-xs opacity-80">{alert.description}</p>
                  </div>
                </div>
                <Badge className={config.badge}>{alert.severity.toUpperCase()}</Badge>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold">{alert.metric_value}</span>
                <span className="text-xs opacity-80">metric value</span>
              </div>
              <div className="bg-white/50 rounded p-2">
                <p className="text-xs font-medium">💡 Recommendation:</p>
                <p className="text-xs mt-1">{alert.recommendation}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ==================== FILTERS PANEL ====================

interface FiltersPanelProps {
  filters: HeatmapFilters;
  onFiltersChange: (filters: HeatmapFilters) => void;
}

function FiltersPanel({ filters, onFiltersChange }: FiltersPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Filter className="size-4" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Office</label>
          <Select
            value={filters.office_id}
            onValueChange={(value) => onFiltersChange({ ...filters, office_id: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Offices</SelectItem>
              <SelectItem value="OFF-001">Downtown Office</SelectItem>
              <SelectItem value="OFF-002">Northside Office</SelectItem>
              <SelectItem value="OFF-003">Southside Office</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Discipline</label>
          <Select
            value={filters.discipline}
            onValueChange={(value) => onFiltersChange({ ...filters, discipline: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Disciplines</SelectItem>
              <SelectItem value="RN">Registered Nurse (RN)</SelectItem>
              <SelectItem value="LPN">Licensed Practical Nurse (LPN)</SelectItem>
              <SelectItem value="PT">Physical Therapist (PT)</SelectItem>
              <SelectItem value="OT">Occupational Therapist (OT)</SelectItem>
              <SelectItem value="ST">Speech Therapist (ST)</SelectItem>
              <SelectItem value="HHA">Home Health Aide (HHA)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Date From</label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => onFiltersChange({ ...filters, date_from: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Date To</label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => onFiltersChange({ ...filters, date_to: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onFiltersChange({
            office_id: 'all',
            discipline: 'all',
            date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            date_to: new Date().toISOString().split('T')[0],
          })}
        >
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
}

// ==================== SUMMARY METRICS ====================

interface SummaryMetricsProps {
  regions: RegionData[];
  workloads: CaregiverWorkload[];
}

function SummaryMetrics({ regions, workloads }: SummaryMetricsProps) {
  const totalVisits = regions.reduce((sum, r) => sum + r.visit_count, 0);
  const totalDelayed = regions.reduce((sum, r) => sum + r.delayed_visit_count, 0);
  const delayedPercent = totalVisits > 0 ? ((totalDelayed / totalVisits) * 100).toFixed(1) : '0';
  const avgUtilization = workloads.length > 0
    ? (workloads.reduce((sum, w) => sum + w.utilization_percent, 0) / workloads.length).toFixed(1)
    : '0';
  const overloadedCaregivers = workloads.filter(w => w.utilization_percent >= 95).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <MapPin className="size-5 mx-auto mb-2 text-blue-600" />
          <p className="text-2xl font-bold text-gray-900">{regions.length}</p>
          <p className="text-xs text-gray-700 font-medium mt-1">Active Regions</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <Activity className="size-5 mx-auto mb-2 text-green-600" />
          <p className="text-2xl font-bold text-gray-900">{totalVisits}</p>
          <p className="text-xs text-gray-700 font-medium mt-1">Total Visits</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <Clock className="size-5 mx-auto mb-2 text-red-600" />
          <p className="text-2xl font-bold text-gray-900">{delayedPercent}%</p>
          <p className="text-xs text-gray-700 font-medium mt-1">Delayed Rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <Users className="size-5 mx-auto mb-2 text-purple-600" />
          <p className="text-2xl font-bold text-gray-900">{avgUtilization}%</p>
          <p className="text-xs text-gray-700 font-medium mt-1">Avg Utilization</p>
          {overloadedCaregivers > 0 && (
            <Badge className="bg-red-100 text-red-700 mt-1 text-xs">
              {overloadedCaregivers} overloaded
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== MAIN OPERATIONAL HEATMAP ====================

interface OperationalHeatmapProps {
  initialData?: {
    regions?: RegionData[];
    workloads?: CaregiverWorkload[];
    alerts?: BottleneckAlert[];
  };
}

export default function OperationalHeatmap({ initialData }: OperationalHeatmapProps) {
  const [heatmapType, setHeatmapType] = useState<HeatmapType>('visit_density');
  const [filters, setFilters] = useState<HeatmapFilters>({
    office_id: 'all',
    discipline: 'all',
    date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
  });
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [selectedCaregiver, setSelectedCaregiver] = useState<CaregiverWorkload | null>(null);

  const regions = initialData?.regions || generateMockRegions();
  const workloads = initialData?.workloads || generateMockWorkloads();
  const alerts = initialData?.alerts || generateMockAlerts(regions, workloads);

  const filteredRegions = useMemo(() => {
    return regions.filter(region => {
      if (filters.office_id !== 'all' && region.office_id !== filters.office_id) return false;
      return true;
    });
  }, [regions, filters]);

  const filteredWorkloads = useMemo(() => {
    return workloads.filter(workload => {
      if (filters.discipline !== 'all' && workload.discipline !== filters.discipline) return false;
      return true;
    });
  }, [workloads, filters]);

  const handleExport = () => {
    console.log('Exporting heatmap data...');
    alert('Export functionality would download CSV/Excel with current heatmap data');
  };

  return (
    <div className="size-full bg-gray-50 overflow-auto">
      <div className="max-w-[1800px] mx-auto p-6">
        <PageHeader
          icon={<BarChart3 className="size-8" />}
          title="Operational Heatmap"
          subtitle="Visual analytics for operational trends and bottleneck identification"
          actions={
            <Button onClick={handleExport} className="gap-2">
              <Download className="size-4" />
              Export Data
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters & Alerts */}
          <div className="space-y-6">
            <FiltersPanel filters={filters} onFiltersChange={setFilters} />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="size-4 text-red-600" />
                  Bottleneck Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BottleneckAlerts alerts={alerts} />
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Summary Metrics */}
            <SummaryMetrics regions={filteredRegions} workloads={filteredWorkloads} />

            {/* Heatmap Type Selector */}
            <Card>
              <CardHeader>
                <Tabs value={heatmapType} onValueChange={(value) => setHeatmapType(value as HeatmapType)}>
                  <TabsList className="grid grid-cols-4 w-full">
                    {Object.entries(HEATMAP_CONFIGS).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <TabsTrigger key={key} value={key} className="gap-2">
                          <Icon className="size-4" />
                          <span className="hidden md:inline">{config.label}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {HEATMAP_CONFIGS[heatmapType].label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {HEATMAP_CONFIGS[heatmapType].description}
                    </p>
                  </div>
                  <HeatmapLegend heatmapType={heatmapType} />
                </div>

                {heatmapType === 'caregiver_workload' ? (
                  <CaregiverWorkloadTable
                    workloads={filteredWorkloads}
                    onCaregiverClick={setSelectedCaregiver}
                  />
                ) : (
                  <RegionHeatmapGrid
                    regions={filteredRegions}
                    heatmapType={heatmapType}
                    onRegionClick={setSelectedRegion}
                  />
                )}
              </CardContent>
            </Card>

            {/* Region Detail Modal (placeholder) */}
            {selectedRegion && (
              <Card className="border-blue-300 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900">Region Detail: {selectedRegion.name}</h4>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-blue-700 font-medium">Total Visits</p>
                          <p className="text-2xl font-bold text-blue-900">{selectedRegion.visit_count}</p>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">Delayed Visits</p>
                          <p className="text-2xl font-bold text-blue-900">{selectedRegion.delayed_visit_count}</p>
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">Caregivers</p>
                          <p className="text-2xl font-bold text-blue-900">{selectedRegion.caregiver_count}</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSelectedRegion(null)}>
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MOCK DATA GENERATORS ====================

function generateMockRegions(): RegionData[] {
  const regions = [
    { name: 'Downtown', zip: '12345', lat: 40.7128, lng: -74.0060, office: 'OFF-001' },
    { name: 'Northside', zip: '12346', lat: 40.7589, lng: -73.9851, office: 'OFF-002' },
    { name: 'Southside', zip: '12347', lat: 40.6782, lng: -73.9442, office: 'OFF-003' },
    { name: 'Eastside', zip: '12348', lat: 40.7282, lng: -73.9442, office: 'OFF-001' },
    { name: 'Westside', zip: '12349', lat: 40.7589, lng: -74.0442, office: 'OFF-002' },
    { name: 'Midtown', zip: '12350', lat: 40.7549, lng: -73.9840, office: 'OFF-001' },
    { name: 'Uptown', zip: '12351', lat: 40.8075, lng: -73.9626, office: 'OFF-002' },
    { name: 'Riverside', zip: '12352', lat: 40.6895, lng: -74.0445, office: 'OFF-003' },
    { name: 'Parkview', zip: '12353', lat: 40.7614, lng: -73.9776, office: 'OFF-001' },
    { name: 'Lakeside', zip: '12354', lat: 40.7480, lng: -73.9862, office: 'OFF-002' },
  ];

  return regions.map((r, i) => ({
    id: `REG-${String(i + 1).padStart(3, '0')}`,
    name: r.name,
    zip_code: r.zip,
    lat: r.lat,
    lng: r.lng,
    visit_count: Math.floor(Math.random() * 60) + 10,
    delayed_visit_count: Math.floor(Math.random() * 15),
    caregiver_count: Math.floor(Math.random() * 10) + 2,
    avg_travel_time_minutes: Math.floor(Math.random() * 40) + 10,
    avg_visit_time_minutes: Math.floor(Math.random() * 30) + 30,
    total_patients: Math.floor(Math.random() * 40) + 10,
    office_id: r.office,
  }));
}

function generateMockWorkloads(): CaregiverWorkload[] {
  const caregivers = [
    { name: 'Sarah Chen', discipline: 'RN' },
    { name: 'Mike Johnson', discipline: 'PT' },
    { name: 'Emily Rodriguez', discipline: 'RN' },
    { name: 'David Kim', discipline: 'LPN' },
    { name: 'Lisa Martinez', discipline: 'OT' },
    { name: 'James Wilson', discipline: 'PT' },
    { name: 'Maria Garcia', discipline: 'HHA' },
    { name: 'Robert Brown', discipline: 'RN' },
  ];

  return caregivers.map((c, i) => {
    const assigned = Math.floor(Math.random() * 40) + 20;
    const completed = Math.floor(assigned * (0.7 + Math.random() * 0.25));
    const delayed = assigned - completed;
    return {
      caregiver_id: `CG-${String(i + 1).padStart(3, '0')}`,
      caregiver_name: c.name,
      assigned_visits: assigned,
      completed_visits: completed,
      delayed_visits: delayed,
      total_drive_time_hours: Math.floor(Math.random() * 20) + 5,
      avg_visits_per_day: (assigned / 7).toFixed(1) as unknown as number,
      regions_covered: [`REG-${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`],
      discipline: c.discipline,
      utilization_percent: Math.floor(Math.random() * 30) + 70,
    };
  });
}

function generateMockAlerts(regions: RegionData[], workloads: CaregiverWorkload[]): BottleneckAlert[] {
  const alerts: BottleneckAlert[] = [];

  // High density regions
  const highDensityRegions = regions.filter(r => r.visit_count > 50);
  highDensityRegions.forEach((region, i) => {
    alerts.push({
      id: `ALT-${alerts.length + 1}`,
      type: 'high_density',
      severity: 'high',
      region_name: region.name,
      description: 'High visit volume detected',
      metric_value: region.visit_count,
      recommendation: `Consider adding ${Math.ceil(region.visit_count / 15)} more caregivers to this region`,
    });
  });

  // Delayed clusters
  const delayedRegions = regions.filter(r => r.delayed_visit_count > 10);
  delayedRegions.forEach((region) => {
    alerts.push({
      id: `ALT-${alerts.length + 1}`,
      type: 'delayed_cluster',
      severity: 'critical',
      region_name: region.name,
      description: 'Multiple delayed visits in region',
      metric_value: region.delayed_visit_count,
      recommendation: 'Review caregiver schedules and reassign visits to available staff',
    });
  });

  // Overloaded caregivers
  const overloadedCaregivers = workloads.filter(w => w.utilization_percent >= 95);
  overloadedCaregivers.forEach((workload) => {
    alerts.push({
      id: `ALT-${alerts.length + 1}`,
      type: 'overloaded_caregiver',
      severity: 'critical',
      region_name: workload.caregiver_name,
      description: 'Caregiver at maximum capacity',
      metric_value: workload.utilization_percent,
      recommendation: 'Redistribute workload or hire additional staff',
    });
  });

  return alerts.slice(0, 5); // Return top 5 alerts
}
