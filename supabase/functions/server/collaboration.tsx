/**
 * Care Team Collaboration Server
 * Handles messages, tasks, and team management for patient-centric collaboration.
 */
import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// ─── Helpers ────────────────────────────────────────────────────────────────

function collabId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Seed Collaboration Data ────────────────────────────────────────────────

export async function seedCollaborationData() {
  console.log('[collaboration] Seeding care team and collaboration data...');

  // Care team members — consistent across patients for the agency
  const teamMembers = [
    { id: 'team-rn-001', name: 'Jane Smith, RN', role: 'primary_nurse', discipline: 'RN', phone: '(555) 123-4567', email: 'jane.smith@agency.com', avatarColor: 'bg-blue-500', status: 'active', isPrimary: true },
    { id: 'team-pt-001', name: 'Mike Johnson, PT', role: 'therapist_pt', discipline: 'PT', phone: '(555) 234-5678', email: 'mike.johnson@agency.com', avatarColor: 'bg-emerald-500', status: 'active', isPrimary: false },
    { id: 'team-ot-001', name: 'Lisa Park, OT', role: 'therapist_ot', discipline: 'OT', phone: '(555) 345-6789', email: 'lisa.park@agency.com', avatarColor: 'bg-purple-500', status: 'active', isPrimary: false },
    { id: 'team-st-001', name: 'David Kim, ST', role: 'therapist_st', discipline: 'ST', phone: '(555) 456-7890', email: 'david.kim@agency.com', avatarColor: 'bg-teal-500', status: 'on_leave', isPrimary: false },
    { id: 'team-msw-001', name: 'Angela Thomas, MSW', role: 'social_worker', discipline: 'MSW', phone: '(555) 567-8901', email: 'angela.thomas@agency.com', avatarColor: 'bg-amber-500', status: 'active', isPrimary: false },
    { id: 'team-md-001', name: 'Dr. Sarah Chen', role: 'medical_director', discipline: 'MD', phone: '(555) 678-9012', email: 'sarah.chen@clinic.com', avatarColor: 'bg-rose-500', status: 'active', isPrimary: false },
    { id: 'team-cc-001', name: 'Karen White, CC', role: 'care_coordinator', discipline: 'CC', phone: '(555) 789-0123', email: 'karen.white@agency.com', avatarColor: 'bg-indigo-500', status: 'active', isPrimary: false },
    { id: 'team-hha-001', name: 'Maria Rodriguez, HHA', role: 'aide', discipline: 'HHA', phone: '(555) 890-1234', email: 'maria.rodriguez@agency.com', avatarColor: 'bg-cyan-500', status: 'active', isPrimary: false },
  ];

  for (const m of teamMembers) {
    await kv.set(`collab-team:${m.id}`, m);
  }

  // Seed messages for demo patient
  const demoPatientId = 'patient-demo-001';
  const now = new Date();

  const messages = [
    {
      id: collabId('msg'),
      patientId: demoPatientId,
      authorId: 'team-rn-001',
      authorName: 'Jane Smith, RN',
      authorRole: 'primary_nurse',
      type: 'update',
      content: 'Patient reported increased pain in lower back during morning assessment. Vital signs stable. BP 138/82, HR 76, Temp 98.6F. Will monitor closely and reassess at next visit.',
      mentions: [],
      isPinned: false,
      isUrgent: false,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: collabId('msg'),
      patientId: demoPatientId,
      authorId: 'team-pt-001',
      authorName: 'Mike Johnson, PT',
      authorRole: 'therapist_pt',
      type: 'note',
      content: '@Jane Smith, RN - regarding the back pain increase, I recommend we modify the exercise program. Can we discuss before my next visit on Thursday? @Dr. Sarah Chen may want to review the current pain management plan.',
      mentions: [
        { memberId: 'team-rn-001', memberName: 'Jane Smith, RN' },
        { memberId: 'team-md-001', memberName: 'Dr. Sarah Chen' },
      ],
      isPinned: false,
      isUrgent: false,
      createdAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: collabId('msg'),
      patientId: demoPatientId,
      authorId: 'team-md-001',
      authorName: 'Dr. Sarah Chen',
      authorRole: 'medical_director',
      type: 'note',
      content: 'Reviewed pain management plan. Recommend switching from Ibuprofen to Acetaminophen given kidney function concerns. Please update medication list and inform patient. @Karen White, CC please update the care plan accordingly.',
      mentions: [
        { memberId: 'team-cc-001', memberName: 'Karen White, CC' },
      ],
      isPinned: true,
      isUrgent: true,
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: collabId('msg'),
      patientId: demoPatientId,
      authorId: 'team-msw-001',
      authorName: 'Angela Thomas, MSW',
      authorRole: 'social_worker',
      type: 'note',
      content: 'Completed psychosocial assessment. Patient expressing concerns about managing care at home alone. Discussed community resources and Meals on Wheels program. Will follow up with caregiver support options next week.',
      mentions: [],
      isPinned: false,
      isUrgent: false,
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: collabId('msg'),
      patientId: demoPatientId,
      authorId: 'team-cc-001',
      authorName: 'Karen White, CC',
      authorRole: 'care_coordinator',
      type: 'document',
      content: 'Uploaded updated care plan reflecting medication change and modified PT schedule.',
      mentions: [],
      document: {
        id: 'doc-001',
        name: 'Care_Plan_Updated_Mar2026.pdf',
        type: 'application/pdf',
        size: 245000,
        uploadedAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      },
      isPinned: false,
      isUrgent: false,
      createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: collabId('msg'),
      patientId: demoPatientId,
      authorId: 'team-hha-001',
      authorName: 'Maria Rodriguez, HHA',
      authorRole: 'aide',
      type: 'update',
      content: 'Completed morning ADL assistance. Patient was able to transfer from bed to chair with standby assist only — improvement from last week. Appetite good, ate 80% of breakfast.',
      mentions: [],
      isPinned: false,
      isUrgent: false,
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: collabId('msg'),
      patientId: demoPatientId,
      authorId: 'team-ot-001',
      authorName: 'Lisa Park, OT',
      authorRole: 'therapist_ot',
      type: 'note',
      content: 'Completed home safety assessment. Recommended grab bars in bathroom and removal of throw rugs in hallway. @Angela Thomas, MSW — can we coordinate with community resources for the home modifications? Patient is on a fixed income.',
      mentions: [
        { memberId: 'team-msw-001', memberName: 'Angela Thomas, MSW' },
      ],
      isPinned: false,
      isUrgent: false,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const msg of messages) {
    await kv.set(`collab-msg:${demoPatientId}:${msg.id}`, msg);
  }

  // Seed tasks
  const tasks = [
    {
      id: collabId('task'),
      patientId: demoPatientId,
      title: 'Update medication list — Acetaminophen switch',
      description: 'Per Dr. Chen\'s order, replace Ibuprofen with Acetaminophen. Update medication list in chart and inform patient.',
      assigneeId: 'team-rn-001',
      assigneeName: 'Jane Smith, RN',
      assigneeRole: 'primary_nurse',
      createdById: 'team-md-001',
      createdByName: 'Dr. Sarah Chen',
      priority: 'urgent',
      status: 'in_progress',
      dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: collabId('task'),
      patientId: demoPatientId,
      title: 'Install bathroom grab bars',
      description: 'Coordinate with community resources to arrange grab bar installation in patient\'s bathroom per OT recommendation.',
      assigneeId: 'team-msw-001',
      assigneeName: 'Angela Thomas, MSW',
      assigneeRole: 'social_worker',
      createdById: 'team-ot-001',
      createdByName: 'Lisa Park, OT',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: collabId('task'),
      patientId: demoPatientId,
      title: 'Schedule follow-up pain assessment',
      description: 'Reassess pain levels after medication change. Document using standard pain scale.',
      assigneeId: 'team-rn-001',
      assigneeName: 'Jane Smith, RN',
      assigneeRole: 'primary_nurse',
      createdById: 'team-rn-001',
      createdByName: 'Jane Smith, RN',
      priority: 'normal',
      status: 'pending',
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: collabId('task'),
      patientId: demoPatientId,
      title: 'Meals on Wheels enrollment',
      description: 'Submit application for Meals on Wheels program. Patient lives alone and has limited meal prep ability.',
      assigneeId: 'team-msw-001',
      assigneeName: 'Angela Thomas, MSW',
      assigneeRole: 'social_worker',
      createdById: 'team-msw-001',
      createdByName: 'Angela Thomas, MSW',
      priority: 'normal',
      status: 'completed',
      dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: collabId('task'),
      patientId: demoPatientId,
      title: 'Modify PT exercise program',
      description: 'Reduce intensity of lower back exercises. Focus on gentle stretching and strengthening until pain is managed.',
      assigneeId: 'team-pt-001',
      assigneeName: 'Mike Johnson, PT',
      assigneeRole: 'therapist_pt',
      createdById: 'team-pt-001',
      createdByName: 'Mike Johnson, PT',
      priority: 'high',
      status: 'in_progress',
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const t of tasks) {
    await kv.set(`collab-task:${demoPatientId}:${t.id}`, t);
  }

  console.log('[collaboration] Seeded collaboration data successfully');
}

// ─── GET /collaboration/:patientId — Full collaboration data ────────────────

app.get('/make-server-845bc545/collaboration/:patientId', async (c) => {
  try {
    const patientId = c.req.param('patientId');

    // Get team members
    const team = (await kv.getByPrefix('collab-team:')) || [];

    // Get messages for this patient
    const messages = (await kv.getByPrefix(`collab-msg:${patientId}:`)) || [];
    messages.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Get tasks for this patient
    const tasks = (await kv.getByPrefix(`collab-task:${patientId}:`)) || [];
    tasks.sort((a: any, b: any) => {
      // Sort: urgent first, then by due date
      const priorityOrder: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
      const statusOrder: Record<string, number> = { in_progress: 0, pending: 1, completed: 2, cancelled: 3 };
      const statusDiff = (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2);
      if (statusDiff !== 0) return statusDiff;
      const priDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (priDiff !== 0) return priDiff;
      return new Date(a.dueDate || '2099-12-31').getTime() - new Date(b.dueDate || '2099-12-31').getTime();
    });

    const pinnedMessages = messages.filter((m: any) => m.isPinned);

    return c.json({ team, messages, tasks, pinnedMessages });
  } catch (error: any) {
    console.error('[collaboration GET] Error:', error);
    return c.json({ error: `Failed to load collaboration data: ${error.message}` }, 500);
  }
});

// ─── POST /collaboration/:patientId/message — Create new message ────────────

app.post('/make-server-845bc545/collaboration/:patientId/message', async (c) => {
  try {
    const patientId = c.req.param('patientId');
    const body = await c.req.json();

    const message = {
      id: collabId('msg'),
      patientId,
      authorId: body.authorId || 'team-rn-001',
      authorName: body.authorName || 'Jane Smith, RN',
      authorRole: body.authorRole || 'primary_nurse',
      type: body.type || 'note',
      content: body.content,
      mentions: body.mentions || [],
      document: body.document || undefined,
      taskId: body.taskId || undefined,
      isPinned: body.isPinned || false,
      isUrgent: body.isUrgent || false,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`collab-msg:${patientId}:${message.id}`, message);
    console.log(`[collaboration] New message created for patient ${patientId}: ${message.id}`);
    return c.json(message, 201);
  } catch (error: any) {
    console.error('[collaboration POST message] Error:', error);
    return c.json({ error: `Failed to create message: ${error.message}` }, 500);
  }
});

// ─── POST /collaboration/:patientId/task — Create new task ──────────────────

app.post('/make-server-845bc545/collaboration/:patientId/task', async (c) => {
  try {
    const patientId = c.req.param('patientId');
    const body = await c.req.json();

    const task = {
      id: collabId('task'),
      patientId,
      title: body.title,
      description: body.description || '',
      assigneeId: body.assigneeId,
      assigneeName: body.assigneeName,
      assigneeRole: body.assigneeRole,
      createdById: body.createdById || 'team-rn-001',
      createdByName: body.createdByName || 'Jane Smith, RN',
      priority: body.priority || 'normal',
      status: 'pending',
      dueDate: body.dueDate || undefined,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`collab-task:${patientId}:${task.id}`, task);

    // Auto-create a message about the task
    const taskMsg = {
      id: collabId('msg'),
      patientId,
      authorId: task.createdById,
      authorName: task.createdByName,
      authorRole: body.createdByRole || 'primary_nurse',
      type: 'task_created',
      content: `Created task: "${task.title}" — assigned to ${task.assigneeName}`,
      mentions: [{ memberId: task.assigneeId, memberName: task.assigneeName }],
      taskId: task.id,
      isPinned: false,
      isUrgent: task.priority === 'urgent',
      createdAt: new Date().toISOString(),
    };
    await kv.set(`collab-msg:${patientId}:${taskMsg.id}`, taskMsg);

    console.log(`[collaboration] New task created for patient ${patientId}: ${task.id}`);
    return c.json({ task, message: taskMsg }, 201);
  } catch (error: any) {
    console.error('[collaboration POST task] Error:', error);
    return c.json({ error: `Failed to create task: ${error.message}` }, 500);
  }
});

// ─── PUT /collaboration/:patientId/task/:taskId — Update task status ────────

app.put('/make-server-845bc545/collaboration/:patientId/task/:taskId', async (c) => {
  try {
    const patientId = c.req.param('patientId');
    const taskId = c.req.param('taskId');
    const body = await c.req.json();

    const existing = await kv.get(`collab-task:${patientId}:${taskId}`);
    if (!existing) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      completedAt: body.status === 'completed' ? new Date().toISOString() : existing.completedAt,
    };

    await kv.set(`collab-task:${patientId}:${taskId}`, updated);

    // If marked complete, post a message
    if (body.status === 'completed' && existing.status !== 'completed') {
      const completeMsg = {
        id: collabId('msg'),
        patientId,
        authorId: body.completedById || existing.assigneeId,
        authorName: body.completedByName || existing.assigneeName,
        authorRole: body.completedByRole || existing.assigneeRole,
        type: 'task_completed',
        content: `Completed task: "${existing.title}"`,
        mentions: [],
        taskId: taskId,
        isPinned: false,
        isUrgent: false,
        createdAt: new Date().toISOString(),
      };
      await kv.set(`collab-msg:${patientId}:${completeMsg.id}`, completeMsg);
    }

    console.log(`[collaboration] Task ${taskId} updated for patient ${patientId}`);
    return c.json(updated);
  } catch (error: any) {
    console.error('[collaboration PUT task] Error:', error);
    return c.json({ error: `Failed to update task: ${error.message}` }, 500);
  }
});

// ─── PUT /collaboration/:patientId/message/:messageId/pin — Toggle pin ──────

app.put('/make-server-845bc545/collaboration/:patientId/message/:messageId/pin', async (c) => {
  try {
    const patientId = c.req.param('patientId');
    const messageId = c.req.param('messageId');

    const existing = await kv.get(`collab-msg:${patientId}:${messageId}`);
    if (!existing) {
      return c.json({ error: 'Message not found' }, 404);
    }

    existing.isPinned = !existing.isPinned;
    await kv.set(`collab-msg:${patientId}:${messageId}`, existing);

    return c.json(existing);
  } catch (error: any) {
    console.error('[collaboration PUT pin] Error:', error);
    return c.json({ error: `Failed to toggle pin: ${error.message}` }, 500);
  }
});

export default app;
