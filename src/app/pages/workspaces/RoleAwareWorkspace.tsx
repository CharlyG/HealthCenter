/**
 * Role-Aware Workspace Router
 * Determines which workspace to show based on user role
 */
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import IntakeAdmissionsWorkspace from './IntakeAdmissionsWorkspace';
import SchedulerWorkspace from './SchedulerWorkspace';
import ClinicianWorkspace from './ClinicianWorkspace';
import QAWorkspace from './QAWorkspace';
import BillingWorkspace from './BillingWorkspace';
import HospiceMedicalDirectorWorkspace from './HospiceMedicalDirectorWorkspace';
import WorkspaceHome from '../../components/workspace/WorkspaceHome';
import { PageLayout, PageHeader } from '../../components/design-system';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { WorkspaceAlertQueue } from '../../components/alerts/WorkspaceAlertQueue';
import {
  UserPlus,
  Calendar,
  Stethoscope,
  Shield,
  DollarSign,
  Heart,
  Settings,
  Briefcase,
} from 'lucide-react';

// Define role types
export type UserRole =
  | 'intake'
  | 'admissions'
  | 'scheduler'
  | 'coordinator'
  | 'care_coordinator'
  | 'clinician'
  | 'nurse'
  | 'physician'
  | 'therapist'
  | 'qa'
  | 'billing'
  | 'ar'
  | 'hospice'
  | 'medical_director'
  | 'administrator'
  | 'admin';

// Role configuration for workspace mapping
const roleWorkspaceMap: Record<UserRole, React.ComponentType> = {
  intake: IntakeAdmissionsWorkspace,
  admissions: IntakeAdmissionsWorkspace,
  scheduler: SchedulerWorkspace,
  coordinator: SchedulerWorkspace,
  care_coordinator: SchedulerWorkspace,
  clinician: ClinicianWorkspace,
  nurse: ClinicianWorkspace,
  physician: ClinicianWorkspace,
  therapist: ClinicianWorkspace,
  qa: QAWorkspace,
  billing: BillingWorkspace,
  ar: BillingWorkspace,
  hospice: HospiceMedicalDirectorWorkspace,
  medical_director: HospiceMedicalDirectorWorkspace,
  administrator: AdminWorkspace,
  admin: AdminWorkspace,
};

// Admin workspace (simple version)
function AdminWorkspace() {
  return <WorkspaceHome />;
}

// Role selector for demo/testing purposes
function RoleSelector({ onSelectRole }: { onSelectRole: (role: UserRole) => void }) {
  const roles: Array<{ role: UserRole; label: string; icon: React.ReactNode; description: string }> = [
    {
      role: 'intake',
      label: 'Intake / Admissions',
      icon: <UserPlus className="size-6" />,
      description: 'Referrals, intake, and admission processing',
    },
    {
      role: 'scheduler',
      label: 'Scheduler / Coordinator',
      icon: <Calendar className="size-6" />,
      description: 'Visit scheduling and staffing coordination',
    },
    {
      role: 'clinician',
      label: 'Clinician',
      icon: <Stethoscope className="size-6" />,
      description: 'Clinical visits, documentation, and assessments',
    },
    {
      role: 'qa',
      label: 'QA Reviewer',
      icon: <Shield className="size-6" />,
      description: 'Chart review and quality assurance',
    },
    {
      role: 'billing',
      label: 'Billing / A/R',
      icon: <DollarSign className="size-6" />,
      description: 'Claims, billing, and revenue cycle',
    },
    {
      role: 'medical_director',
      label: 'Hospice / Medical Director',
      icon: <Heart className="size-6" />,
      description: 'Hospice oversight and clinical governance',
    },
    {
      role: 'admin',
      label: 'Administrator',
      icon: <Settings className="size-6" />,
      description: 'System administration and configuration',
    },
  ];

  return (
    <PageLayout maxWidth="2xl">
      <PageHeader
        title="Select Your Role"
        subtitle="Choose a role to view the personalized workspace"
      />

      <div className="grid grid-cols-2 gap-4">
        {roles.map((roleItem) => (
          <Card
            key={roleItem.role}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelectRole(roleItem.role)}
          >
            <CardContent className="p-6 flex items-start gap-4">
              <div className="text-blue-600">{roleItem.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{roleItem.label}</h3>
                <p className="text-sm text-gray-600">{roleItem.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}

export default function RoleAwareWorkspace() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = React.useState<UserRole | null>(null);

  // In production, get role from user.role or user metadata
  // For demo, allow role selection
  const userRole: UserRole | null = selectedRole || (user?.user_metadata?.role as UserRole) || null;

  if (!userRole) {
    return <RoleSelector onSelectRole={setSelectedRole} />;
  }

  const WorkspaceComponent = roleWorkspaceMap[userRole];

  if (!WorkspaceComponent) {
    return (
      <PageLayout>
        <PageHeader title="Unknown Role" subtitle="Unable to determine workspace for your role" />
        <Button onClick={() => setSelectedRole(null)}>Select Different Role</Button>
      </PageLayout>
    );
  }

  return <WorkspaceComponent />;
}