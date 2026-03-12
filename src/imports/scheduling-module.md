Design the Scheduling module for a healthcare platform managing home health and hospice visits.

The scheduler must support high-volume visit coordination and allow users to quickly understand the schedule status.

Provide multiple scheduling views.

Visit Board (Primary View)

Display visits in a table-style operational board.

Columns should include:

Patient
Admission
Caregiver
Discipline
Start time
End time
Status
Documentation status

Status indicators should include:

Scheduled
In Progress
Completed
Missing documentation
EVV error

Calendar View

Provide a traditional calendar view showing visits by day.

Open Shift Queue

Display visits that do not yet have an assigned caregiver.

Each open shift item should show:

patient
discipline
visit time
location
required skills

Allow schedulers to assign caregivers or send open shift notifications.

Caregiver Availability Panel

Display caregiver availability and highlight conflicts.

Travel Optimization Panel

Display estimated travel time between visits and suggest improved routes.

Conflict Alerts

Highlight scheduling issues such as:

overlapping visits
missing caregivers
authorization conflicts

The scheduling interface must prioritize operational clarity and allow coordinators to manage large volumes of visits efficiently.