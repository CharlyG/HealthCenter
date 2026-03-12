import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import * as dataGateway from '../lib/dataGateway';
import { toast } from 'sonner';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface SetupWizardProps {
  onComplete: () => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Organization data
  const [orgName, setOrgName] = useState('HealthCare Demo Org');
  const [orgType, setOrgType] = useState('Home Health Agency');
  const [orgId, setOrgId] = useState('');
  
  // Office data
  const [officeName, setOfficeName] = useState('Main Office');
  const [officeAddress, setOfficeAddress] = useState('123 Healthcare Blvd, City, ST 12345');
  const [officePhone, setOfficePhone] = useState('(555) 123-4567');
  const [officeId, setOfficeId] = useState('');
  
  // Admin user data
  const [adminName, setAdminName] = useState('Admin User');
  const [adminEmail, setAdminEmail] = useState('admin@healthcare.com');
  const [adminPassword, setAdminPassword] = useState('healthcare123');

  const handleCreateOrg = async () => {
    setLoading(true);
    try {
      console.log('Starting organization creation...');
      const { org } = await dataGateway.setupCreateOrganization(orgName, orgType);
      console.log('Organization created:', org);
      setOrgId(org.id);
      toast.success('Organization created successfully');
      setStep(2);
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast.error(error.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffice = async () => {
    setLoading(true);
    try {
      console.log('Starting office creation...');
      const { office } = await dataGateway.setupCreateOffice(officeName, orgId, officeAddress, officePhone);
      console.log('Office created:', office);
      setOfficeId(office.id);
      toast.success('Office created successfully');
      setStep(3);
    } catch (error: any) {
      console.error('Error creating office:', error);
      toast.error(error.message || 'Failed to create office');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      console.log('Starting admin user creation...');
      await dataGateway.setupCreateAdmin(adminEmail, adminPassword, adminName, 'Admin', orgId, [officeId]);
      console.log('Admin user created successfully');
      toast.success('Admin user created successfully');
      setStep(4);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      toast.error(error.message || 'Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">System Setup</CardTitle>
          <CardDescription>
            Complete the initial setup to get started with the healthcare platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Create Organization */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Step 1: Create Organization</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Enter organization name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgType">Organization Type</Label>
                <Input
                  id="orgType"
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  placeholder="e.g., Home Health Agency, Hospice"
                />
              </div>
              <Button onClick={handleCreateOrg} className="w-full" disabled={loading || !orgName}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Organization'
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Create Office */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Step 2: Create Office</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="officeName">Office Name</Label>
                <Input
                  id="officeName"
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  placeholder="Enter office name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="officeAddress">Address</Label>
                <Input
                  id="officeAddress"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  placeholder="Enter office address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="officePhone">Phone</Label>
                <Input
                  id="officePhone"
                  value={officePhone}
                  onChange={(e) => setOfficePhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <Button onClick={handleCreateOffice} className="w-full" disabled={loading || !officeName}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Office'
                )}
              </Button>
            </div>
          )}

          {/* Step 3: Create Admin User */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Step 3: Create Admin User</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminName">Name</Label>
                <Input
                  id="adminName"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Enter admin name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter admin email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <Button onClick={handleCreateAdmin} className="w-full" disabled={loading || !adminName || !adminEmail || !adminPassword}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Admin User'
                )}
              </Button>
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <div className="text-center py-8">
              <CheckCircle2 className="size-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Setup Complete!</h3>
              <p className="text-gray-600 mb-4">
                Your healthcare platform is ready to use.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <div className="text-sm font-semibold text-blue-900 mb-2">Login Credentials</div>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>Email: {adminEmail}</div>
                  <div>Password: {adminPassword}</div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Redirecting to login page...
              </p>
            </div>
          )}

          {/* Progress indicator */}
          {step < 4 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Step {step} of 3</span>
                <span>{Math.round((step / 3) * 100)}% complete</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}