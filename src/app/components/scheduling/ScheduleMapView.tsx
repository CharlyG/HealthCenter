/**
 * Schedule Map View
 * Displays visit locations on a map placeholder with route sidebar – fetches live data.
 */
import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Phone, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { supabase, publicAnonKey, API_BASE } from '../../lib/supabaseClient';

interface ScheduleMapViewProps {
  selectedDate: Date;
  filters: {
    office: string;
    discipline: string;
    clinician: string;
    status: string;
  };
  refreshKey?: number;
}

interface Visit {
  id: string;
  patient_name: string;
  start_time: string;
  patient_address: string;
  patient_phone: string;
  discipline: string;
  visit_type: string;
  status: string;
}

export default function ScheduleMapView({ selectedDate, filters, refreshKey }: ScheduleMapViewProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token || publicAnonKey;
        const dateStr = selectedDate.toISOString().split('T')[0];
        let url = `${API_BASE}/visits?start_date=${dateStr}&end_date=${dateStr}`;
        if (filters.status && filters.status !== 'all') url += `&status=${filters.status}`;
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const json = await res.json();
          let data = json.data || [];
          if (filters.discipline && filters.discipline !== 'all') {
            data = data.filter((v: any) => v.discipline === filters.discipline);
          }
          setVisits(data);
        }
      } catch (err) {
        console.error('[ScheduleMapView] Error loading visits:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedDate, filters.status, filters.discipline, refreshKey]);

  const getDisciplineColor = (discipline: string) => {
    const colors: Record<string, string> = {
      RN: 'bg-blue-100 text-blue-800',
      PT: 'bg-green-100 text-green-800',
      OT: 'bg-purple-100 text-purple-800',
      ST: 'bg-pink-100 text-pink-800',
      MSW: 'bg-orange-100 text-orange-800',
      AIDE: 'bg-gray-100 text-gray-800',
    };
    return colors[discipline] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-500">Loading map data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Map Area - Placeholder */}
      <div className="col-span-2">
        <Card className="h-[700px]">
          <CardContent className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MapPin className="size-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold text-gray-700 mb-2">Map View</p>
              <p className="text-sm text-gray-500">
                Interactive map with {visits.length} visit location{visits.length !== 1 ? 's' : ''} would display here.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Integration with Google Maps, Mapbox, or similar service required.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visit List Sidebar */}
      <div className="space-y-4">
        {/* Route Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Navigation className="size-5" />
              Route Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Visits:</span>
                <span className="font-semibold text-gray-900">{visits.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Distance:</span>
                <span className="font-semibold text-gray-900">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Est. Drive Time:</span>
                <span className="font-semibold text-gray-900">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Est. Visit Time:</span>
                <span className="font-semibold text-gray-900">
                  {visits.length > 0 ? `${visits.length}h (est.)` : '—'}
                </span>
              </div>
              <div className="pt-3 border-t">
                <Button className="w-full">
                  <Navigation className="size-4 mr-2" />
                  Optimize Route
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visit List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's Visits ({visits.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {visits.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                No visits scheduled for this day
              </div>
            ) : (
              <div className="space-y-3">
                {visits.map((visit, index) => (
                  <div
                    key={visit.id}
                    className="p-3 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex items-center justify-center size-6 bg-blue-600 text-white text-xs font-bold rounded-full mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900">{visit.patient_name}</span>
                          <Badge className={getDisciplineColor(visit.discipline)} style={{ fontSize: '10px' }}>
                            {visit.discipline}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            <span>{formatTime(visit.start_time)}</span>
                          </div>
                          {visit.patient_address && (
                            <div className="flex items-start gap-1">
                              <MapPin className="size-3 mt-0.5 flex-shrink-0" />
                              <span>{visit.patient_address}</span>
                            </div>
                          )}
                          {visit.patient_phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="size-3" />
                              <span>{visit.patient_phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        Get Directions
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        Call Patient
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}