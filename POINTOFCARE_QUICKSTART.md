# Point of Care Module - Quick Start Guide

## For Caregivers

### Accessing Your Visits

1. Navigate to **Point of Care** from the main menu (or `/poc`)
2. You'll see your visits dashboard with:
   - Today's visits by default
   - Summary counts (Upcoming, In Progress, Completed)
   - Visit cards showing patient info, time, and status

### Starting a Visit

1. Click on a visit card to open visit details
2. Review patient information and address
3. Click **"Clock In to Visit"**
   - GPS will automatically capture if patient has granted consent
   - Visit status changes to "In Progress"

### During the Visit

1. **Complete Tasks**
   - Check off each task as you complete it
   - Add notes to any task (optional)
   - Required tasks show a "Required" badge

2. **Capture Patient Signature**
   - Click **"Capture Patient Signature"**
   - Patient signs on the canvas using mouse or touch
   - Click **"Save Signature"** when done

3. **Add Visit Notes**
   - Use the Visit Notes field for observations
   - Document any important information

### Ending the Visit

1. Click **"Clock Out from Visit"**
2. System validates:
   - All required tasks are completed ✓
   - Patient signature is captured ✓
   - GPS capture (if consent granted) ✓
3. Visit is marked as complete
4. You're redirected back to My Visits dashboard

### Creating a Manual Visit

1. Click **"Add Manual Visit"** from My Visits
2. Fill out the form:
   - Select patient
   - Select admission
   - Choose date and time
   - Select visit type and discipline
3. **Optional: Enable Recurrence**
   - Toggle "Enable recurring visits"
   - Choose frequency (daily, weekly, bi-weekly, monthly)
   - Select specific days (for weekly)
   - Set end date or number of occurrences
4. Click **"Create Visit"** or **"Create Recurring Visits"**

## For Administrators

### Configuring GPS Consent

GPS tracking is patient-specific and requires explicit consent:

```typescript
// Enable GPS consent for a patient
await dataGateway.evvGateway.updatePatientConsent(
  patientId,
  'gps_tracking',
  true // granted
);

// Check if patient has GPS consent
const hasConsent = await dataGateway.evvGateway.checkGPSConsent(patientId);
```

**When to enable GPS consent:**
- Patient has signed GPS tracking consent form
- Documentation is on file
- Patient understands what data is captured

**When GPS is used:**
- Clock In event (captures arrival location)
- Clock Out event (captures departure location)

### Viewing Audit Trail

All EVV events are logged with:
- Timestamp (UTC)
- User ID
- Event type
- GPS coordinates (if applicable)
- Device information

```typescript
// Get all events for a visit
const events = await dataGateway.evvGateway.getVisitEvents(visitId);

// Events include:
// - clock_in
// - clock_out
// - signature_captured
// - task_completed
// - note_added
// - gps_captured
```

## Technical Integration

### Backend Integration Points

Replace mock implementations in `/src/app/lib/dataGateway.ts`:

```typescript
// Example: Get visits from real API
async getMyVisits(clinicianId: string, date?: string): Promise<Visit[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/visits/my-visits?clinician_id=${clinicianId}&date=${date}`,
    {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
    }
  );
  
  const data = await response.json();
  return data.visits;
}
```

### Supabase Integration

```typescript
// Example: Clock in with Supabase
async clockIn(visitId: string, userId: string, lat?: number, lng?: number): Promise<VisitEvent> {
  const timestamp = new Date().toISOString();
  
  // Insert visit event
  const { data: event, error } = await supabase
    .from('visit_events')
    .insert({
      visit_id: visitId,
      event_type: 'clock_in',
      timestamp,
      user_id: userId,
      latitude: lat,
      longitude: lng,
      device_info: navigator.userAgent,
    })
    .select()
    .single();

  if (error) throw error;

  // Update visit status
  await supabase
    .from('visits')
    .update({ status: 'in_progress' })
    .eq('id', visitId);

  return event;
}
```

### GPS Error Handling

```typescript
// The GPS component handles all error cases:
// - Permission denied
// - Position unavailable
// - Timeout
// - No consent granted

// Usage:
<GPSCapture
  patientId={visit.patient_id}
  hasConsent={hasGPSConsent}
  onCapture={(lat, lng, acc) => {
    // Handle successful GPS capture
    console.log('GPS captured:', lat, lng, acc);
  }}
  autoCapture={true} // Automatically capture on mount
/>
```

## Common Workflows

### Workflow 1: Normal Visit
```
1. Caregiver opens visit
2. Clocks in (GPS captured)
3. Completes all tasks
4. Captures signature
5. Clocks out (GPS captured)
6. Visit complete
```

### Workflow 2: Visit without GPS Consent
```
1. Caregiver opens visit
2. Sees "GPS tracking disabled" warning
3. Clocks in (no GPS)
4. Completes tasks
5. Captures signature
6. Clocks out (no GPS)
7. Visit complete
```

### Workflow 3: Manual Visit with Recurrence
```
1. Scheduler clicks "Add Manual Visit"
2. Selects patient and admission
3. Sets date/time
4. Enables weekly recurrence
5. Selects Monday, Wednesday, Friday
6. Sets 4 weeks duration
7. System creates 12 visits (3 days × 4 weeks)
8. All visits appear in schedule
```

## Troubleshooting

### GPS Not Working
- **Check browser permissions:** Ensure location access is allowed
- **Check patient consent:** Verify GPS consent is granted
- **Check HTTPS:** Geolocation requires secure connection
- **Check device:** Ensure device has GPS capability

### Signature Not Saving
- **Ensure signature is drawn:** Canvas must not be empty
- **Check touch support:** Verify touch events work on device
- **Check canvas size:** Ensure canvas is visible and sized correctly

### Clock Out Blocked
- **Complete required tasks:** All tasks marked "Required" must be completed
- **Capture signature:** Patient signature must be captured
- **Check clock in:** Must clock in before clocking out

### Recurring Visits Not Generating
- **Check recurrence pattern:** Ensure pattern is valid
- **Check end date:** End date must be after start date
- **Check occurrences:** Must be at least 1
- **Check days of week:** Weekly recurrence needs at least one day selected

## Best Practices

### For Caregivers
1. **Clock in immediately upon arrival** to ensure accurate time tracking
2. **Complete tasks as you go** rather than all at end
3. **Add detailed notes** for complex situations
4. **Capture signature before leaving** patient's home
5. **Verify GPS capture** succeeded (green checkmark)

### For Administrators
1. **Obtain written consent** before enabling GPS tracking
2. **Store consent forms** properly
3. **Review EVV exceptions** regularly
4. **Monitor GPS accuracy** issues
5. **Train staff** on proper EVV procedures

### For Developers
1. **Always use UTC timestamps** for consistency
2. **Log all EVV events** to audit trail
3. **Handle offline scenarios** gracefully
4. **Test on mobile devices** regularly
5. **Follow HIPAA guidelines** for all PHI

## API Endpoints (Future)

Suggested API structure for backend implementation:

```
GET    /api/visits/my-visits              - Get visits for caregiver
GET    /api/visits/:id                     - Get visit details
POST   /api/visits/:id/clock-in            - Clock in to visit
POST   /api/visits/:id/clock-out           - Clock out from visit
POST   /api/visits/:id/signature           - Save signature
GET    /api/visits/:id/events              - Get visit events
GET    /api/visits/:id/tasks               - Get visit tasks
POST   /api/visits/:id/tasks/:taskId       - Complete task
POST   /api/visits/manual                  - Create manual visit
GET    /api/patients/:id/consents          - Get patient consents
POST   /api/patients/:id/consents          - Update patient consent
```

## Support

For questions or issues with the Point of Care module:
1. Check this documentation
2. Review the technical documentation in `/POINTOFCARE_MODULE_COMPLETE.md`
3. Check the audit logs for detailed event history
4. Contact your system administrator
