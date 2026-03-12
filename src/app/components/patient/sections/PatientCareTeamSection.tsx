/**
 * PatientCareTeamSection
 * Admission-level care team assignments and management
 */
import { useState, useEffect } from 'react';
import { Users, Plus, Loader2, Mail, Phone, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { careTeamGateway } from '../../../lib/dataGateway';
import NoAdmissionSelected from './NoAdmissionSelected';

interface PatientCareTeamSectionProps {
  patientId: string;
  admissionId?: string;
}

interface CareTeamMember {
  id: string;
  user_id?: string;
  role: string;
  discipline?: string;
  is_primary?: boolean;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
}

export default function PatientCareTeamSection({ patientId, admissionId }: PatientCareTeamSectionProps) {
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (admissionId) {
      loadCareTeam();
    } else {
      setLoading(false);
    }
  }, [admissionId, patientId]);

  const loadCareTeam = async () => {
    if (!admissionId) return;

    setLoading(true);
    try {
      const result = await careTeamGateway.search({
        filters: { patientId, admissionId },
        pagination: { page: 1, pageSize: 100 },
      });
      setCareTeam(result.data || []);
    } catch (err) {
      console.error('[PatientCareTeamSection] Load error:', err);
      toast.error('Failed to load care team');
      setCareTeam([]);
    } finally {
      setLoading(false);
    }
  };

  if (!admissionId) {
    return (
      <NoAdmissionSelected 
        message="Select an admission to view its care team"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <Loader2 className="size-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-600">Loading care team...</p>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'case_manager':
      case 'case manager':
        return 'bg-purple-100 text-purple-800';
      case 'rn':
      case 'nurse':
        return 'bg-blue-100 text-blue-800';
      case 'pt':
      case 'physical therapist':
        return 'bg-green-100 text-green-800';
      case 'ot':
      case 'occupational therapist':
        return 'bg-teal-100 text-teal-800';
      case 'st':
      case 'speech therapist':
        return 'bg-pink-100 text-pink-800';
      case 'aide':
      case 'hha':
        return 'bg-orange-100 text-orange-800';
      case 'msw':
      case 'social worker':
        return 'bg-indigo-100 text-indigo-800';
      case 'physician':
      case 'md':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const primaryMembers = careTeam.filter(m => m.is_primary);
  const otherMembers = careTeam.filter(m => !m.is_primary);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="size-6 text-gray-600" />
            Care Team
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Team members assigned to the selected admission
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {careTeam.length} {careTeam.length === 1 ? 'Member' : 'Members'}
          </Badge>
          <Button size="sm">
            <Plus className="size-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* No care team */}
      {careTeam.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <div className="bg-gray-100 rounded-full p-4 inline-flex">
                <Users className="size-8 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">No care team members</p>
                <p className="text-xs text-gray-600 mt-1">
                  Add members to the care team for this admission
                </p>
              </div>
              <Button size="sm" variant="outline">
                <Plus className="size-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary Care Team */}
      {primaryMembers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Stethoscope className="size-4" />
            Primary Care Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {primaryMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {member.name}
                          </h4>
                          <Badge className={`${getRoleColor(member.role)} text-xs mt-1`}>
                            {member.discipline || member.role}
                          </Badge>
                        </div>
                        {member.is_primary && (
                          <Badge variant="outline" className="text-[10px] ml-2 flex-shrink-0">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        {member.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="size-3" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="size-3" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Care Team Members */}
      {otherMembers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Team Members ({otherMembers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-gray-100 text-gray-700 font-medium text-sm">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1.5">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {member.name}
                        </h4>
                        <Badge className={`${getRoleColor(member.role)} text-xs mt-1`}>
                          {member.discipline || member.role}
                        </Badge>
                      </div>
                      <div className="space-y-0.5 text-xs text-gray-600">
                        {member.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="size-3" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="size-3" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
