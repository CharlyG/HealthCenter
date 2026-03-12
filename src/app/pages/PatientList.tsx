/**
 * Patient List Page
 * 
 * REFACTORED TO COMPLY WITH:
 * - SCREEN_GENERATION.md - Uses ListPageShell, semantic tokens, pagination
 * - LARGE_DATA.md - Server-side pagination and filtering
 * - PATTERNS.md - Standard StatusBadge component
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import * as dataGateway from '../lib/dataGateway';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import ListPageShell from '../components/shells/ListPageShell';
import { StatusBadge } from '../components/design-system/StatusBadge';
import { textColor, space, typography } from '../design-system/semantic/tokens';

interface Office {
  id: string;
  name: string;
}

export default function PatientList() {
  const navigate = useNavigate();
  const { profile, user, loading: authLoading } = useAuth();
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Data state
  const [data, setData] = useState<dataGateway.PaginatedResponse<dataGateway.PatientSummary> | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load paginated data (OPTIMIZED - server-side pagination)
  const loadData = useCallback(async () => {
    if (!profile?.org_id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('[PatientList] Loading paginated data:', { page, pageSize, searchQuery, selectedOffice, selectedStatus });
      
      const result = await dataGateway.getPatientsPaginated(profile.org_id, {
        page,
        pageSize,
        filters: {
          search: searchQuery || undefined,
          officeId: selectedOffice !== 'all' ? selectedOffice : undefined,
          status: selectedStatus !== 'all' ? (selectedStatus as any) : undefined,
        }
      });
      
      setData(result);
      console.log('[PatientList] Loaded data:', result);
    } catch (error: any) {
      console.error('[PatientList] Error loading patients:', error);
      if (!error.message?.includes('Authentication failed') && 
          !error.message?.includes('No active session')) {
        toast.error(error.message || 'Failed to load patients');
      }
    } finally {
      setLoading(false);
    }
  }, [profile?.org_id, page, pageSize, searchQuery, selectedOffice, selectedStatus]);
  
  // Load offices for filter
  const loadOffices = useCallback(async () => {
    if (!profile?.org_id) return;
    
    try {
      const { offices: officesData } = await dataGateway.getOffices(profile.org_id);
      setOffices(officesData || []);
    } catch (error: any) {
      console.error('[PatientList] Error loading offices:', error);
    }
  }, [profile?.org_id]);
  
  // Load on mount and when filters change
  useEffect(() => {
    if (!authLoading && user && profile?.org_id) {
      loadData();
      loadOffices();
    }
  }, [authLoading, user, profile?.org_id, loadData, loadOffices]);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedOffice, selectedStatus]);
  
  // Active filters count
  const activeFiltersCount = 
    (selectedOffice !== 'all' ? 1 : 0) +
    (selectedStatus !== 'all' ? 1 : 0);
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <ListPageShell
      title="Patients"
      subtitle="Manage patient records and admissions"
      primaryAction={{
        label: 'New Patient',
        icon: <Plus className="w-4 h-4 mr-2" />,
        onClick: () => navigate('/patient/new')
      }}
      searchPlaceholder="Search by name, MRN..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      filterPanel={
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: space.md 
        }}>
          <div>
            <label 
              style={{ 
                display: 'block',
                fontSize: typography.helper.size, 
                color: textColor.secondary,
                marginBottom: space.xs,
                fontWeight: 500
              }}
            >
              Office
            </label>
            <Select value={selectedOffice} onValueChange={setSelectedOffice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Offices</SelectItem>
                {offices.map(office => (
                  <SelectItem key={office.id} value={office.id}>
                    {office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label 
              style={{ 
                display: 'block',
                fontSize: typography.helper.size, 
                color: textColor.secondary,
                marginBottom: space.xs,
                fontWeight: 500
              }}
            >
              Status
            </label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      }
      activeFiltersCount={activeFiltersCount}
      onRefresh={loadData}
      loading={loading}
      totalCount={data?.total}
    >
      {/* Patient Table */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.5rem', 
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <th style={{ 
                padding: space.md, 
                textAlign: 'left', 
                fontSize: typography.helper.size, 
                fontWeight: 600, 
                color: textColor.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Patient
              </th>
              <th style={{ 
                padding: space.md, 
                textAlign: 'left', 
                fontSize: typography.helper.size, 
                fontWeight: 600, 
                color: textColor.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                MRN
              </th>
              <th style={{ 
                padding: space.md, 
                textAlign: 'left', 
                fontSize: typography.helper.size, 
                fontWeight: 600, 
                color: textColor.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Status
              </th>
              <th style={{ 
                padding: space.md, 
                textAlign: 'left', 
                fontSize: typography.helper.size, 
                fontWeight: 600, 
                color: textColor.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Last Visit
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: space.xl, textAlign: 'center' }}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p style={{ fontSize: typography.body.size, color: textColor.muted }}>
                    Loading patients...
                  </p>
                </td>
              </tr>
            ) : data && data.data.length > 0 ? (
              data.data.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  style={{ 
                    cursor: 'pointer', 
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <td style={{ padding: space.md }}>
                    <div style={{ 
                      fontSize: typography.body.size, 
                      fontWeight: 500, 
                      color: textColor.primary 
                    }}>
                      {patient.name}
                    </div>
                  </td>
                  <td style={{ 
                    padding: space.md, 
                    fontSize: typography.body.size, 
                    color: textColor.secondary 
                  }}>
                    {patient.mrn}
                  </td>
                  <td style={{ padding: space.md }}>
                    <StatusBadge status={patient.status} size="sm" />
                  </td>
                  <td style={{ 
                    padding: space.md, 
                    fontSize: typography.body.size, 
                    color: textColor.secondary 
                  }}>
                    {patient.lastVisit || 'Never'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: space.xl, textAlign: 'center' }}>
                  <p style={{ fontSize: typography.body.size, color: textColor.muted }}>
                    No patients found
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {data && data.total > 0 && (
          <div style={{ 
            padding: space.md, 
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, data.total)} of {data.total}
            </div>
            
            <div style={{ display: 'flex', gap: space.sm }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span style={{ 
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                fontSize: typography.body.size,
                color: textColor.primary,
                fontWeight: 500
              }}>
                {page} / {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(data.totalPages)}
                disabled={page === data.totalPages}
              >
                Last
              </Button>
            </div>
            
            <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
              Page {page} of {data.totalPages}
            </div>
          </div>
        )}
      </div>
    </ListPageShell>
  );
}