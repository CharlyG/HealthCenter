/**
 * Patient Module - List Page (Container)
 * Orchestrates patient list display with filters and search
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Users, Plus } from 'lucide-react';
import { usePatientList } from '../hooks/usePatients';
import { useOffices } from '../hooks/useOffices';
import { PageLayout, PageHeader, PageSection } from '../components/design-system/PageLayout';
import { PatientListFilters } from '../components/patient/list/PatientListFilters';
import { PatientListTable } from '../components/patient/list/PatientListTable';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function PatientListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);

  // Data hooks
  const { offices } = useOffices();
  const { 
    patients, 
    loading, 
    search 
  } = usePatientList(
    selectedOffice !== 'all' ? selectedOffice : undefined,
    selectedStatus !== 'all' ? selectedStatus : undefined
  );

  // Client-side filtering for status when not searching
  const filteredPatients = useMemo(() => {
    let result = patients;

    if (selectedOffice !== 'all') {
      result = result.filter(p => p.office_id === selectedOffice);
    }

    if (selectedStatus !== 'all') {
      result = result.filter(p => p.status === selectedStatus);
    }

    return result;
  }, [patients, selectedOffice, selectedStatus]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    try {
      setIsSearching(true);
      const officeFilter = selectedOffice !== 'all' ? selectedOffice : undefined;
      await search(searchQuery, officeFilter);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <PageLayout maxWidth="2xl">
      <PageHeader
        icon={<Users className="size-8" />}
        title="Patients"
        subtitle={`${filteredPatients.length} patient${filteredPatients.length !== 1 ? 's' : ''}`}
        actions={
          <Button onClick={() => navigate('/patient/new')}>
            <Plus className="size-4 mr-2" />
            New Patient
          </Button>
        }
      />

      <PageSection>
        <PatientListFilters
          searchQuery={searchQuery}
          selectedOffice={selectedOffice}
          selectedStatus={selectedStatus}
          offices={offices}
          isSearching={isSearching}
          onSearchChange={setSearchQuery}
          onOfficeChange={setSelectedOffice}
          onStatusChange={setSelectedStatus}
          onSearch={handleSearch}
        />
      </PageSection>

      <PageSection>
        {filteredPatients.length === 0 && !loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <Users className="size-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">No patients found</p>
                <p className="text-sm mb-4">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first patient'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/patient/new')}>
                    <Plus className="size-4 mr-2" />
                    Add First Patient
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <PatientListTable
              patients={filteredPatients}
              offices={offices}
              loading={loading}
            />
          </Card>
        )}
      </PageSection>
    </PageLayout>
  );
}