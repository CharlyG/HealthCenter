/**
 * Patient Clinical Section
 * Clinical documentation, assessments, care plans
 */
import { FileText, ClipboardList, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

interface PatientClinicalProps {
  patientId: string;
}

export default function PatientClinical({ patientId }: PatientClinicalProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button>New Assessment</Button>
      </div>

      <Tabs defaultValue="assessments">
        <TabsList>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="careplans">Care Plans</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
        </TabsList>

        <TabsContent value="assessments" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-5" />
                Recent Assessments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">OASIS-E Start of Care</p>
                    <p className="text-sm text-gray-500">Completed: 2024-03-01</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Care Plan Review</p>
                    <p className="text-sm text-gray-500">Due: 2024-03-15</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    <Button variant="outline" size="sm">Complete</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="careplans" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Active Care Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Wound Care Management</p>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Goal: Wound healing within 4 weeks</p>
                  <p className="text-sm text-gray-500 mt-1">Last updated: 2024-03-01</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Medication Management</p>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600">Goal: Patient compliance with medication regimen</p>
                  <p className="text-sm text-gray-500 mt-1">Last updated: 2024-02-28</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5" />
                Recent Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-600">Blood Pressure</p>
                    <p className="text-2xl font-bold">120/80</p>
                    <p className="text-xs text-gray-500">2024-03-08</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-600">Heart Rate</p>
                    <p className="text-2xl font-bold">72</p>
                    <p className="text-xs text-gray-500">2024-03-08</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="text-2xl font-bold">98.6°F</p>
                    <p className="text-xs text-gray-500">2024-03-08</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm text-gray-600">SpO2</p>
                    <p className="text-2xl font-bold">98%</p>
                    <p className="text-xs text-gray-500">2024-03-08</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}