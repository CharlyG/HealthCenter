/**
 * Notifications Configuration Panel
 * 
 * Configure notification channels, templates, and delivery rules.
 */

import { useState } from 'react';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Bell, Mail, MessageSquare, Smartphone, CheckCircle } from 'lucide-react';

export default function NotificationsConfigPanel({ onConfigChange }: { onConfigChange: () => void }) {
  const [channels, setChannels] = useState({
    email: true,
    sms: true,
    push: true,
    inApp: true,
  });

  const [notifications, setNotifications] = useState([
    { id: 'visit-reminder', name: 'Visit Reminder', category: 'scheduling', email: true, sms: true, push: true },
    { id: 'visit-complete', name: 'Visit Completed', category: 'scheduling', email: false, sms: false, push: true },
    { id: 'doc-required', name: 'Documentation Required', category: 'clinical', email: true, sms: false, push: true },
    { id: 'qa-review', name: 'QA Review Needed', category: 'compliance', email: true, sms: false, push: true },
    { id: 'credential-expiring', name: 'Credential Expiring', category: 'compliance', email: true, sms: true, push: true },
    { id: 'new-referral', name: 'New Referral', category: 'operations', email: true, sms: false, push: true },
  ]);

  const handleChannelToggle = (channel: string) => {
    setChannels({ ...channels, [channel]: !channels[channel] });
    onConfigChange();
  };

  const handleNotificationToggle = (id: string, channel: 'email' | 'sms' | 'push') => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, [channel]: !n[channel] } : n))
    );
    onConfigChange();
  };

  return (
    <div className="space-y-6">
      {/* Channel Status */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Notification Channels</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { key: 'email', label: 'Email', icon: Mail, color: 'blue' },
            { key: 'sms', label: 'SMS', icon: MessageSquare, color: 'green' },
            { key: 'push', label: 'Push', icon: Smartphone, color: 'purple' },
            { key: 'inApp', label: 'In-App', icon: Bell, color: 'amber' },
          ].map((ch) => {
            const Icon = ch.icon;
            return (
              <div key={ch.key} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 text-${ch.color}-600`} />
                  <Switch
                    checked={channels[ch.key as keyof typeof channels]}
                    onCheckedChange={() => handleChannelToggle(ch.key)}
                  />
                </div>
                <div className="font-medium text-gray-900">{ch.label}</div>
                <div className="text-xs text-gray-600">
                  {channels[ch.key as keyof typeof channels] ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Notification Types */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Notification Rules</h3>
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div key={notif.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-900 mb-1">{notif.name}</div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {notif.category}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-sm text-gray-600 w-20">Channels:</Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <Switch
                      checked={notif.email && channels.email}
                      disabled={!channels.email}
                      onCheckedChange={() => handleNotificationToggle(notif.id, 'email')}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    <Switch
                      checked={notif.sms && channels.sms}
                      disabled={!channels.sms}
                      onCheckedChange={() => handleNotificationToggle(notif.id, 'sms')}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    <Switch
                      checked={notif.push && channels.push}
                      disabled={!channels.push}
                      onCheckedChange={() => handleNotificationToggle(notif.id, 'push')}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
