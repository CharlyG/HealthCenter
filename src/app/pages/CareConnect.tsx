import { useEffect } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { HeartPulse, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export default function CareConnect() {
  const { isModuleEnabled } = useConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isModuleEnabled('careconnect')) {
      navigate('/module-disabled');
    }
  }, [isModuleEnabled, navigate]);

  return (
    <div className="size-full bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <HeartPulse className="size-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Point of Care</h1>
              <p className="text-gray-600">Visit documentation and Electronic Visit Verification</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Visits</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed Today</CardDescription>
              <CardTitle className="text-3xl text-green-600">0</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl text-blue-600">0</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-amber-600">0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Live Status */}
        <Card>
          <CardHeader>
            <CardTitle>Live Visit Status</CardTitle>
            <CardDescription>Real-time tracking of active care visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <MapPin className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No active visits</p>
              <p className="text-sm">Visit status will appear here when caregivers clock in</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
