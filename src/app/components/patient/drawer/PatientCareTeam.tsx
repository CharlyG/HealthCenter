/**
 * Patient Care Team - Right Drawer Component
 * Shows care team members from the collaboration backend
 */
import { useState, useEffect, useCallback } from 'react';
import { Users, Phone, Mail, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { collaborationGateway } from '../../../lib/dataGateway';

interface PatientCareTeamProps {
  patientId: string;
}

export default function PatientCareTeam({ patientId }: PatientCareTeamProps) {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await collaborationGateway.getData(patientId);
      setTeam(data.team || []);
    } catch (err) {
      console.error('[PatientCareTeam] error:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="size-5 text-blue-500 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="size-4" />
          Care Team
          <Badge variant="secondary" className="ml-auto text-xs">{team.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {team.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">No care team members assigned</p>
        ) : (
          <div className="space-y-3">
            {team.map((member: any) => (
              <div key={member.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                  {(member.name || '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                    {member.isPrimary && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1 bg-blue-50 text-blue-700 border-blue-200">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{member.role || member.discipline || ''}</p>
                  {member.phone && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Phone className="size-3" />
                      {member.phone}
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Mail className="size-3" />
                      {member.email}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
