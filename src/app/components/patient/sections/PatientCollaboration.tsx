/**
 * Patient Collaboration Section
 * Full care team collaboration panel: messages, tasks, team roster.
 * Lightweight internal communication tool focused on patient care.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type React from 'react';
import { toast } from 'sonner';
import { cn } from '../../ui/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ScrollArea } from '../../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import {
  MessageCircle,
  ListTodo,
  Users,
  Pin,
  Plus,
  RefreshCw,
  Loader2,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react';

import { collaborationGateway } from '../../../lib/dataGateway';
import type {
  CollaborationData,
  CollaborationMessage,
  CareTeamMember,
  CareTask,
  MessageType,
  MessageMention,
  TaskPriority,
} from '../../../lib/collaborationTypes';
import { TEAM_ROLE_LABELS, TEAM_ROLE_ABBREV } from '../../../lib/collaborationTypes';

import { TeamMemberBadge } from '../../collaboration/TeamMemberBadge';
import { MessageBubble } from '../../collaboration/MessageBubble';
import { TaskCard } from '../../collaboration/TaskCard';
import { ComposeBox } from '../../collaboration/ComposeBox';
import { NewTaskForm } from '../../collaboration/NewTaskForm';

interface PatientCollaborationProps {
  patientId: string;
}

// ─── Status Counts Badge ────────────────────────────────────────────────────

function StatusCountRow({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className={cn('size-3.5', color)} />
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-gray-900 ml-auto">{count}</span>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function PatientCollaboration({ patientId }: PatientCollaborationProps) {
  const [data, setData] = useState<CollaborationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('messages');
  const [showNewTask, setShowNewTask] = useState(false);
  const [sending, setSending] = useState(false);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'active' | 'all'>('active');
  const [messageFilter, setMessageFilter] = useState<'all' | 'pinned' | 'urgent'>('all');

  // Fetch collaboration data
  const fetchData = useCallback(async () => {
    try {
      const result = await collaborationGateway.getData(patientId);
      setData(result);
      setError(null);
    } catch (err: any) {
      console.error('[PatientCollaboration] Error:', err);
      setError(err.message || 'Failed to load collaboration data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Send message
  const handleSendMessage = useCallback(
    async (msgData: {
      type: MessageType;
      content: string;
      mentions: MessageMention[];
      isUrgent: boolean;
    }) => {
      setSending(true);
      try {
        await collaborationGateway.postMessage(patientId, {
          type: msgData.type,
          content: msgData.content,
          mentions: msgData.mentions,
          isUrgent: msgData.isUrgent,
          // Default author — in production from auth context
          authorId: 'team-rn-001',
          authorName: 'Jane Smith, RN',
          authorRole: 'primary_nurse',
        } as any);
        await fetchData();
        toast.success('Message sent');
      } catch (err: any) {
        console.error('[PatientCollaboration] Send error:', err);
        toast.error('Failed to send message', { description: err.message });
      } finally {
        setSending(false);
      }
    },
    [patientId, fetchData]
  );

  // Create task
  const handleCreateTask = useCallback(
    async (taskData: {
      title: string;
      description: string;
      assigneeId: string;
      assigneeName: string;
      assigneeRole: string;
      priority: TaskPriority;
      dueDate?: string;
    }) => {
      setTaskSubmitting(true);
      try {
        await collaborationGateway.createTask(patientId, {
          ...taskData,
          createdById: 'team-rn-001',
          createdByName: 'Jane Smith, RN',
          createdByRole: 'primary_nurse',
        } as any);
        await fetchData();
        setShowNewTask(false);
        toast.success('Task created');
      } catch (err: any) {
        console.error('[PatientCollaboration] Task error:', err);
        toast.error('Failed to create task', { description: err.message });
      } finally {
        setTaskSubmitting(false);
      }
    },
    [patientId, fetchData]
  );

  // Update task status
  const handleTaskStatusChange = useCallback(
    async (taskId: string, status: string) => {
      try {
        await collaborationGateway.updateTask(patientId, taskId, {
          status: status as any,
          completedById: 'team-rn-001',
          completedByName: 'Jane Smith, RN',
        } as any);
        await fetchData();
        if (status === 'completed') {
          toast.success('Task completed');
        }
      } catch (err: any) {
        console.error('[PatientCollaboration] Task status error:', err);
        toast.error('Failed to update task');
      }
    },
    [patientId, fetchData]
  );

  // Toggle pin
  const handleTogglePin = useCallback(
    async (messageId: string) => {
      try {
        await collaborationGateway.togglePin(patientId, messageId);
        await fetchData();
      } catch (err: any) {
        console.error('[PatientCollaboration] Pin error:', err);
        toast.error('Failed to toggle pin');
      }
    },
    [patientId, fetchData]
  );

  // Computed values
  const filteredMessages = useMemo(() => {
    if (!data) return [];
    switch (messageFilter) {
      case 'pinned':
        return data.messages.filter((m) => m.isPinned);
      case 'urgent':
        return data.messages.filter((m) => m.isUrgent);
      default:
        return data.messages;
    }
  }, [data, messageFilter]);

  const filteredTasks = useMemo(() => {
    if (!data) return [];
    if (taskFilter === 'active') {
      return data.tasks.filter(
        (t) => t.status !== 'completed' && t.status !== 'cancelled'
      );
    }
    return data.tasks;
  }, [data, taskFilter]);

  const taskCounts = useMemo(() => {
    if (!data) return { urgent: 0, active: 0, completed: 0 };
    return {
      urgent: data.tasks.filter(
        (t) => t.priority === 'urgent' && t.status !== 'completed'
      ).length,
      active: data.tasks.filter(
        (t) => t.status !== 'completed' && t.status !== 'cancelled'
      ).length,
      completed: data.tasks.filter((t) => t.status === 'completed').length,
    };
  }, [data]);

  // ─── Loading ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <MessageCircle className="size-6 text-white" />
          </div>
          <Loader2 className="size-5 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading collaboration panel...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <AlertCircle className="size-10 text-amber-500 mb-3" />
        <p className="text-sm font-medium text-gray-700">
          Unable to load collaboration data
        </p>
        <p className="text-xs text-gray-500 mt-1 mb-3">{error}</p>
        <Button size="sm" onClick={handleRefresh}>
          <RefreshCw className="size-3.5 mr-1.5" /> Retry
        </Button>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="flex gap-5">
      {/* ── Main Collaboration Area (left ~70%) ──────────────────────── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <MessageCircle className="size-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Care Team Collaboration
              </h2>
              <p className="text-xs text-gray-500">
                {data.messages.length} messages &middot; {taskCounts.active} active
                tasks
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={cn('size-3.5 mr-1.5', refreshing && 'animate-spin')}
            />
            Refresh
          </Button>
        </div>

        {/* Pinned Messages (always visible if any) */}
        {data.pinnedMessages.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-xs font-semibold text-amber-700 flex items-center gap-1.5 uppercase tracking-wider">
                <Pin className="size-3" />
                Pinned ({data.pinnedMessages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2">
              {data.pinnedMessages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  teamMembers={data.team}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="messages" className="gap-1.5 text-xs">
                <MessageCircle className="size-3.5" />
                Messages ({filteredMessages.length})
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-1.5 text-xs">
                <ListTodo className="size-3.5" />
                Tasks
                {taskCounts.urgent > 0 && (
                  <Badge className="ml-1 bg-red-100 text-red-700 border-0 text-[9px] px-1 py-0 h-4">
                    {taskCounts.urgent}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {activeTab === 'messages' && (
              <div className="flex items-center gap-1">
                {(['all', 'pinned', 'urgent'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setMessageFilter(f)}
                    className={cn(
                      'text-[11px] px-2 py-1 rounded-md font-medium transition-colors capitalize',
                      messageFilter === f
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:bg-gray-100'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {(['active', 'all'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setTaskFilter(f)}
                      className={cn(
                        'text-[11px] px-2 py-1 rounded-md font-medium transition-colors capitalize',
                        taskFilter === f
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:bg-gray-100'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setShowNewTask(true)}
                >
                  <Plus className="size-3" />
                  New Task
                </Button>
              </div>
            )}
          </div>

          {/* ── Messages Tab ──────────────────────────────────────────── */}
          <TabsContent value="messages" className="mt-3 space-y-3">
            {/* Compose Box */}
            <ComposeBox
              teamMembers={data.team}
              onSend={handleSendMessage}
              sending={sending}
            />

            {/* Message Feed */}
            <ScrollArea className="max-h-[500px]">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-10">
                  <MessageCircle className="size-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">
                    {messageFilter === 'all'
                      ? 'No messages yet. Start a conversation!'
                      : `No ${messageFilter} messages`}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredMessages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      teamMembers={data.team}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* ── Tasks Tab ─────────────────────────────────────────────── */}
          <TabsContent value="tasks" className="mt-3 space-y-3">
            {/* New Task Form */}
            {showNewTask && (
              <NewTaskForm
                teamMembers={data.team}
                onSubmit={handleCreateTask}
                onCancel={() => setShowNewTask(false)}
                submitting={taskSubmitting}
              />
            )}

            {/* Task Summary */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertCircle className="size-4 text-red-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {taskCounts.urgent}
                    </div>
                    <div className="text-[10px] text-gray-500">Urgent</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <PlayCircle className="size-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {taskCounts.active}
                    </div>
                    <div className="text-[10px] text-gray-500">Active</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {taskCounts.completed}
                    </div>
                    <div className="text-[10px] text-gray-500">Done</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Task List */}
            <ScrollArea className="max-h-[440px]">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-10">
                  <ListTodo className="size-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">
                    {taskFilter === 'active'
                      ? 'No active tasks. Create one to coordinate care.'
                      : 'No tasks found'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      teamMembers={data.team}
                      onStatusChange={handleTaskStatusChange}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Care Team Sidebar (right ~30%) ────────────────────────────── */}
      <div className="w-72 shrink-0 space-y-4">
        {/* Team Roster */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="size-4 text-blue-600" />
              Care Team
              <Badge variant="outline" className="text-[10px] ml-auto">
                {data.team.filter((m) => m.status === 'active').length} active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <div className="space-y-0.5">
              {/* Primary members first, then by role */}
              {[...data.team]
                .sort((a, b) => {
                  if (a.isPrimary && !b.isPrimary) return -1;
                  if (!a.isPrimary && b.isPrimary) return 1;
                  return 0;
                })
                .map((member) => (
                  <TeamMemberBadge
                    key={member.id}
                    member={member}
                    showStatus
                  />
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Contact */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Phone className="size-4 text-emerald-600" />
              Quick Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="space-y-3">
              {data.team
                .filter((m) => m.isPrimary || m.role === 'medical_director' || m.role === 'care_coordinator')
                .map((member) => (
                  <div key={member.id} className="space-y-1">
                    <div className="text-xs font-medium text-gray-900">
                      {member.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Phone className="size-3 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Mail className="size-3 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Summary by Assignee */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <ListTodo className="size-4 text-amber-600" />
              Tasks by Assignee
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="space-y-2">
              {data.team
                .map((member) => {
                  const memberTasks = data.tasks.filter(
                    (t) =>
                      t.assigneeId === member.id &&
                      t.status !== 'completed' &&
                      t.status !== 'cancelled'
                  );
                  if (memberTasks.length === 0) return null;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="size-5">
                          <AvatarFallback
                            className={cn(
                              'text-white font-semibold text-[8px]',
                              member.avatarColor
                            )}
                          >
                            {TEAM_ROLE_ABBREV[member.role]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-700 truncate">
                          {member.name.split(',')[0]}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] px-1.5 h-5',
                          memberTasks.some((t) => t.priority === 'urgent')
                            ? 'text-red-700 border-red-300 bg-red-50'
                            : 'text-gray-600'
                        )}
                      >
                        {memberTasks.length}
                      </Badge>
                    </div>
                  );
                })
                .filter(Boolean)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}