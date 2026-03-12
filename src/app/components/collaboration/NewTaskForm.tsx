/**
 * New Task Form — inline form for creating care coordination tasks.
 */
import React, { useState, useCallback } from 'react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { CareTeamMember, TaskPriority } from '../../lib/collaborationTypes';
import { TEAM_ROLE_LABELS } from '../../lib/collaborationTypes';
import { ListTodo, X, Loader2 } from 'lucide-react';

interface NewTaskFormProps {
  teamMembers: CareTeamMember[];
  onSubmit: (task: {
    title: string;
    description: string;
    assigneeId: string;
    assigneeName: string;
    assigneeRole: string;
    priority: TaskPriority;
    dueDate?: string;
  }) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export const NewTaskForm = React.memo(function NewTaskForm({
  teamMembers,
  onSubmit,
  onCancel,
  submitting,
}: NewTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !assigneeId) return;
    const assignee = teamMembers.find((m) => m.id === assigneeId);
    if (!assignee) return;

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      assigneeId,
      assigneeName: assignee.name,
      assigneeRole: assignee.role,
      priority,
      dueDate: dueDate || undefined,
    });
  }, [title, description, assigneeId, priority, dueDate, teamMembers, onSubmit]);

  const activeMembers = teamMembers.filter((m) => m.status === 'active');

  return (
    <div className="border border-blue-200 rounded-xl bg-blue-50/30 p-4">
      <div className="flex items-center gap-2 mb-4">
        <ListTodo className="size-4 text-blue-600" />
        <span className="text-sm font-semibold text-gray-900">New Care Task</span>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={onCancel} className="size-7 p-0">
          <X className="size-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs text-gray-600 mb-1">Task Title *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Schedule follow-up assessment"
            className="h-8 text-sm"
          />
        </div>

        <div>
          <Label className="text-xs text-gray-600 mb-1">Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details..."
            className="min-h-[60px] text-sm resize-none"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-gray-600 mb-1">Assign To *</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {activeMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-gray-600 mb-1">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent" className="text-xs">Urgent</SelectItem>
                <SelectItem value="high" className="text-xs">High</SelectItem>
                <SelectItem value="normal" className="text-xs">Normal</SelectItem>
                <SelectItem value="low" className="text-xs">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-gray-600 mb-1">Due Date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onCancel} className="h-8 text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!title.trim() || !assigneeId || submitting}
            className="h-8 text-xs gap-1.5"
          >
            {submitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ListTodo className="size-3.5" />
            )}
            Create Task
          </Button>
        </div>
      </div>
    </div>
  );
});

export default NewTaskForm;
