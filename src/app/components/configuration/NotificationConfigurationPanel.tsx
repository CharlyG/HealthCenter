/**
 * Notification Configuration Panel
 * 
 * Configure notification delivery channels, vendor selection, credentials, and testing.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NotificationChannel {
  id: string;
  name: string;
  icon: any;
  enabled: boolean;
  vendor: string | null;
  status: 'connected' | 'disconnected' | 'error';
}

interface VendorOption {
  id: string;
  name: string;
  supportsChannels: string[];
}

interface NotificationConfigurationPanelProps {
  onConfigChange: () => void;
}

export default function NotificationConfigurationPanel({
  onConfigChange,
}: NotificationConfigurationPanelProps) {
  const [channels, setChannels] = useState<NotificationChannel[]>([
    { id: 'sms', name: 'SMS', icon: MessageSquare, enabled: true, vendor: 'twilio', status: 'connected' },
    { id: 'email', name: 'Email', icon: Mail, enabled: true, vendor: 'sendgrid', status: 'connected' },
    { id: 'push', name: 'Push Notifications', icon: Smartphone, enabled: true, vendor: 'firebase', status: 'connected' },
    { id: 'in-app', name: 'In-App Notifications', icon: Bell, enabled: true, vendor: null, status: 'connected' },
  ]);

  const vendors: VendorOption[] = [
    { id: 'twilio', name: 'Twilio', supportsChannels: ['sms'] },
    { id: 'aws-sns', name: 'AWS SNS', supportsChannels: ['sms'] },
    { id: 'sendgrid', name: 'SendGrid', supportsChannels: ['email'] },
    { id: 'smtp', name: 'SMTP', supportsChannels: ['email'] },
    { id: 'mailgun', name: 'Mailgun', supportsChannels: ['email'] },
    { id: 'firebase', name: 'Firebase Cloud Messaging', supportsChannels: ['push'] },
    { id: 'onesignal', name: 'OneSignal', supportsChannels: ['push'] },
  ];

  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | null>(channels[0]);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleChannelToggle = (channelId: string) => {
    setChannels(
      channels.map((c) => (c.id === channelId ? { ...c, enabled: !c.enabled } : c))
    );
    onConfigChange();
  };

  const handleVendorChange = (channelId: string, vendorId: string) => {
    setChannels(
      channels.map((c) => (c.id === channelId ? { ...c, vendor: vendorId, status: 'disconnected' } : c))
    );
    onConfigChange();
  };

  const handleTestConnection = () => {
    alert('Testing notification connection...');
    // In production, actually test the connection
  };

  return (
    <Tabs defaultValue="channels" className="space-y-6">
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="channels">Channels</TabsTrigger>
        <TabsTrigger value="configuration">Configuration</TabsTrigger>
        <TabsTrigger value="testing">Testing</TabsTrigger>
      </TabsList>

      {/* Channels Tab */}
      <TabsContent value="channels">
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
            <div className="grid grid-cols-2 gap-4">
              {channels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <Card
                    key={channel.id}
                    className={cn(
                      'p-4 cursor-pointer transition-all',
                      selectedChannel?.id === channel.id
                        ? 'border-blue-500 shadow-md'
                        : 'hover:border-gray-400'
                    )}
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-gray-700" />
                        <h4 className="font-medium text-gray-900">{channel.name}</h4>
                      </div>
                      {channel.status === 'connected' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : channel.status === 'error' ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      )}
                    </div>

                    {channel.vendor && (
                      <div className="mb-3">
                        <Badge variant="outline" className="text-xs">
                          {vendors.find((v) => v.id === channel.vendor)?.name}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <Label className="text-sm text-gray-700">Enabled</Label>
                      <Switch
                        checked={channel.enabled}
                        onCheckedChange={() => handleChannelToggle(channel.id)}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Notification Delivery</p>
              <p>
                Enabled channels will be available for automated notifications, alerts, and reminders.
                Select a vendor for each channel and configure credentials in the Configuration tab.
              </p>
            </div>
          </Card>
        </div>
      </TabsContent>

      {/* Configuration Tab */}
      <TabsContent value="configuration">
        {selectedChannel ? (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedChannel.name} Configuration
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configure vendor and credentials for {selectedChannel.name.toLowerCase()}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    selectedChannel.status === 'connected'
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : selectedChannel.status === 'error'
                      ? 'bg-red-100 text-red-700 border-red-300'
                      : 'bg-amber-100 text-amber-700 border-amber-300'
                  )}
                >
                  {selectedChannel.status}
                </Badge>
              </div>

              {selectedChannel.id !== 'in-app' && (
                <>
                  {/* Vendor Selection */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium text-gray-700 mb-2">Select Vendor</Label>
                    <select
                      value={selectedChannel.vendor || ''}
                      onChange={(e) => handleVendorChange(selectedChannel.id, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">-- Select Vendor --</option>
                      {vendors
                        .filter((v) => v.supportsChannels.includes(selectedChannel.id))
                        .map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Credentials */}
                  {selectedChannel.vendor && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700">Credentials</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCredentials(!showCredentials)}
                        >
                          {showCredentials ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Show
                            </>
                          )}
                        </Button>
                      </div>

                      {selectedChannel.vendor === 'twilio' && (
                        <>
                          <div>
                            <Label htmlFor="account-sid">Account SID</Label>
                            <Input
                              id="account-sid"
                              type={showCredentials ? 'text' : 'password'}
                              defaultValue="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            />
                          </div>
                          <div>
                            <Label htmlFor="auth-token">Auth Token</Label>
                            <Input
                              id="auth-token"
                              type={showCredentials ? 'text' : 'password'}
                              defaultValue="********************************"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone-number">From Phone Number</Label>
                            <Input id="phone-number" defaultValue="+15551234567" />
                          </div>
                        </>
                      )}

                      {selectedChannel.vendor === 'sendgrid' && (
                        <>
                          <div>
                            <Label htmlFor="api-key">API Key</Label>
                            <Input
                              id="api-key"
                              type={showCredentials ? 'text' : 'password'}
                              defaultValue="SG.********************************"
                            />
                          </div>
                          <div>
                            <Label htmlFor="from-email">From Email</Label>
                            <Input id="from-email" defaultValue="notifications@agency.com" />
                          </div>
                          <div>
                            <Label htmlFor="from-name">From Name</Label>
                            <Input id="from-name" defaultValue="Home Health Agency" />
                          </div>
                        </>
                      )}

                      {selectedChannel.vendor === 'firebase' && (
                        <>
                          <div>
                            <Label htmlFor="server-key">Server Key</Label>
                            <Input
                              id="server-key"
                              type={showCredentials ? 'text' : 'password'}
                              defaultValue="AAAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            />
                          </div>
                          <div>
                            <Label htmlFor="sender-id">Sender ID</Label>
                            <Input id="sender-id" defaultValue="123456789012" />
                          </div>
                        </>
                      )}

                      {selectedChannel.vendor === 'smtp' && (
                        <>
                          <div>
                            <Label htmlFor="smtp-host">SMTP Host</Label>
                            <Input id="smtp-host" defaultValue="smtp.gmail.com" />
                          </div>
                          <div>
                            <Label htmlFor="smtp-port">Port</Label>
                            <Input id="smtp-port" type="number" defaultValue="587" />
                          </div>
                          <div>
                            <Label htmlFor="smtp-username">Username</Label>
                            <Input id="smtp-username" defaultValue="notifications@agency.com" />
                          </div>
                          <div>
                            <Label htmlFor="smtp-password">Password</Label>
                            <Input
                              id="smtp-password"
                              type={showCredentials ? 'text' : 'password'}
                              defaultValue="********************************"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              {selectedChannel.id === 'in-app' && (
                <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
                  In-app notifications are handled natively by the platform and do not require vendor
                  configuration.
                </div>
              )}
            </Card>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Select a channel to configure</p>
          </Card>
        )}
      </TabsContent>

      {/* Testing Tab */}
      <TabsContent value="testing">
        {selectedChannel ? (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Test {selectedChannel.name}
            </h3>

            <div className="space-y-4 mb-6">
              {selectedChannel.id === 'sms' && (
                <div>
                  <Label htmlFor="test-phone">Phone Number</Label>
                  <Input id="test-phone" placeholder="+1 555-123-4567" />
                </div>
              )}

              {selectedChannel.id === 'email' && (
                <div>
                  <Label htmlFor="test-email">Email Address</Label>
                  <Input id="test-email" type="email" placeholder="test@example.com" />
                </div>
              )}

              {selectedChannel.id === 'push' && (
                <div>
                  <Label htmlFor="test-device">Device Token</Label>
                  <Input id="test-device" placeholder="Enter device token or user ID" />
                </div>
              )}

              <div>
                <Label htmlFor="test-message">Test Message</Label>
                <Input id="test-message" defaultValue="This is a test notification from the platform configuration center." />
              </div>
            </div>

            <Button onClick={handleTestConnection}>
              <Play className="w-4 h-4 mr-2" />
              Send Test Notification
            </Button>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Testing Notifications</p>
                  <p>
                    Send a test notification to verify your configuration is working correctly.
                    Ensure credentials are saved before testing.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Select a channel to test</p>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
