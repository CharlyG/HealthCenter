import { useEffect, useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Plus, Search } from 'lucide-react';
import { Input } from '../components/ui/input';

export default function PatientManagement() {
  const { isModuleEnabled } = useConfig();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isModuleEnabled('patient')) {
      navigate('/module-disabled');
    }
  }, [isModuleEnabled, navigate]);

  return (
    <div className="size-full bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="size-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
                <p className="text-gray-600">Manage patient records and demographics</p>
              </div>
            </div>
            <Button>
              <Plus className="size-4 mr-2" />
              New Patient
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name, MRN, or DOB..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
            <CardDescription>View and manage all patient records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500">
              <Users className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No patients found</p>
              <p className="text-sm mb-4">Get started by adding your first patient</p>
              <Button>
                <Plus className="size-4 mr-2" />
                Add Patient
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
