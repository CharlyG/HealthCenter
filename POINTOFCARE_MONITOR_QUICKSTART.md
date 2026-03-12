# Point of Care Monitor - Quick Start Guide

## 🚀 Quick Access

**Direct URL:** `/poc/monitor`

**From Caregiver Dashboard:** 
- Navigate to `/poc` (My Visits)
- Click "Monitor Dashboard" button (Admin/Supervisor only)

---

## 📊 Overview

The **Point of Care Monitor** is a supervisor dashboard that provides:
- ✅ Real-time visit status monitoring
- ✅ Automated conflict detection
- ✅ EVV transmission management
- ✅ Exception resolution workflow

---

## 🎯 Main Features

### 1. Status Dashboard (Top Metrics)

**5 Key Metrics:**
- **Scheduled** - Upcoming visits not yet started
- **In Progress** - Visits currently active (clocked in)
- **Completed** - Visits finished (clocked out)
- **Transmitted** - Successfully sent to EVV vendor (verified)
- **EVV Errors** - Transmission failures requiring attention

### 2. Filtering

**Date Range:**
- Start Date - Filter visits from this date
- End Date - Filter visits up to this date

**Status Filter:**
- All Statuses
- Scheduled only
- In Progress only
- Completed only

**EVV Status Filter:**
- All EVV Statuses
- Pending (not yet transmitted)
- Verified (successfully transmitted)
- Exception (transmission failed)

---

## 📑 Three-Tab Interface

### Tab 1: All Visits

**Purpose:** View complete list of all visits

**Displays:**
- Patient name
- Clinician name
- Date & time
- Visit type
- Status badge
- EVV status badge

**Actions:**
- **Transmit button** - For completed visits pending EVV transmission
- **Resolve button** - For visits with EVV exceptions

### Tab 2: Conflicts

**Purpose:** View automatically detected issues

**Conflict Types:**

**🔴 Missing Clock Out**
- Description: Visit clocked in >8 hours ago without clock out
- Why it matters: Indicates potential forgotten clock out
- Action needed: Contact clinician to clock out or manually resolve

**🟠 Overlapping Visits**
- Description: Same clinician has overlapping visit times
- Why it matters: Indicates scheduling conflict or data error
- Action needed: Verify actual visit times and reschedule if needed

**🟡 Unscheduled Visits**
- Description: Visit created without scheduled time
- Why it matters: Tracks ad-hoc/emergency visits for reporting
- Action needed: Review and add scheduled time if appropriate

**Empty State:**
- ✅ No conflicts detected
- All visits are properly documented

### Tab 3: Resolution Center

**Purpose:** Manage EVV transmission exceptions

**What You'll See:**
- List of all visits with EVV exceptions
- Visit details (patient, clinician, date/time)
- Exception badges (red background)

**Actions:**
1. **Retry** - Attempt transmission again
2. **Resolve** - Open resolution workflow

**Resolution Workflow:**
1. Click "Resolve" on any exception
2. Select resolution type:
   - **Manual Override** - Mark as verified without retransmission
     - Use when: You've verified visit completion through other means
   - **Resubmit** - Retry transmission to EVV vendor
     - Use when: Temporary network issue or vendor downtime
   - **Document Only** - Log exception without changing status
     - Use when: Exception requires further investigation
3. Add resolution notes (required)
4. Click "Resolve Exception"

**Result:**
- Visit status updated
- Audit log created
- Exception removed from list

---

## 🔄 EVV Transmission

### Transmission Process

**When to Transmit:**
- Visit status is "Completed"
- EVV status is "Pending"
- Both clock in and clock out events exist

**How to Transmit:**
1. Find completed visit in "All Visits" tab
2. Click "Transmit" button
3. System validates visit data
4. Sends to configured EVV vendor
5. Updates EVV status (Verified or Exception)
6. Writes to ExternalOperationLog

**What Gets Sent:**
```javascript
{
  visitId: "visit-123",
  patientId: "patient-456",
  clinicianId: "clinician-789",
  scheduledDate: "2026-03-06",
  scheduledTime: "09:00",
  clockIn: {
    timestamp: "2026-03-06T14:05:00.000Z",
    latitude: 39.7817,
    longitude: -89.6501,
    accuracy: 10
  },
  clockOut: {
    timestamp: "2026-03-06T15:30:00.000Z",
    latitude: 39.7817,
    longitude: -89.6501,
    accuracy: 12
  },
  visitType: "Skilled Nursing",
  discipline: "RN"
}
```

### Transmission Modes

**Mock Mode (Testing):**
- 80% success rate
- Simulates transmission without calling vendor API
- Logs to ExternalOperationLog
- Safe for training and development

**Live Mode (Production):**
- 90% success rate
- Calls actual vendor API
- Requires valid credentials in Platform Config
- Real EVV submission

**To Configure:**
1. Navigate to `/admin/platform-config`
2. Select "Integrations" tab
3. Find "EVV" category
4. Select vendor (Santrax, HHAeXchange, etc.)
5. Set state: Mock or Live
6. Enter credentials (if Live)
7. Test connection

---

## 📋 ExternalOperationLog

**Every transmission creates a log entry:**

```javascript
{
  user_id: "user-123",              // Who initiated transmission
  integration_category: "evv",       // Always EVV
  vendor: "Santrax",                 // Configured vendor
  operation: "visit_transmission",   // Operation type
  success: true,                     // Transmission result
  details: "Visit visit-123 transmitted successfully. Transmission ID: EVV-1709733600000",
  timestamp: "2026-03-06T15:30:00.000Z"  // UTC timestamp
}
```

**View Logs:**
- Navigate to `/admin/platform-config`
- Select "Audit Trail" tab
- Filter by "External Operations"

---

## 🚨 Handling EVV Errors

### Common Errors

**"EVV integration is not configured"**
- Cause: No EVV vendor selected in Platform Config
- Solution: Go to Platform Config → Integrations → Configure EVV

**"Visit must have both clock in and clock out events"**
- Cause: Incomplete visit data
- Solution: Verify clinician clocked in AND out

**"Transmission failed - check vendor credentials"**
- Cause: Invalid credentials or vendor API down
- Solution: Test connection in Platform Config, update credentials if needed

**"Network timeout or invalid credentials"**
- Cause: Cannot reach vendor API
- Solution: Retry later or check network connectivity

### Resolution Options

**1. Manual Override**
- **When to use:** You've verified visit completion through other means (phone call, paper documentation)
- **Effect:** Marks visit as verified without retransmitting
- **Audit:** Logs resolution with your notes

**2. Resubmit**
- **When to use:** Temporary issue (network, vendor downtime)
- **Effect:** Retries transmission immediately
- **Audit:** Creates new transmission log entry

**3. Document Only**
- **When to use:** Exception requires investigation or special handling
- **Effect:** Logs exception without changing status
- **Audit:** Preserves exception state with your notes

---

## 💡 Best Practices

### Daily Workflow

**Morning (Start of Day):**
1. Open monitor dashboard
2. Check status metrics
3. Review "Conflicts" tab
4. Resolve any missing clock outs from previous day

**Throughout Day:**
5. Monitor "In Progress" count
6. Watch for new conflicts

**End of Day:**
7. Transmit all completed visits
8. Resolve any EVV exceptions
9. Document any manual overrides

### Conflict Resolution

**Missing Clock Out:**
1. Contact clinician to verify visit end time
2. Have clinician clock out through app if possible
3. If not possible, document actual end time and resolve manually

**Overlapping Visits:**
1. Verify actual visit times with clinician
2. Check if data entry error
3. Reschedule future visits to avoid conflicts

**Unscheduled Visits:**
1. Review visit details
2. Add scheduled time if appropriate
3. Ensure proper authorization exists

### EVV Transmission

**✅ Do:**
- Transmit completed visits same day when possible
- Review transmission results
- Document all manual overrides with detailed notes
- Keep EVV integration credentials updated

**❌ Don't:**
- Transmit incomplete visits (missing clock in/out)
- Use manual override without proper verification
- Ignore repeated transmission failures
- Skip resolution notes

---

## 🔐 Security & Compliance

### HIPAA Compliance
- ✅ All transmissions logged with user ID and timestamp
- ✅ GPS coordinates encrypted in transit and at rest
- ✅ Audit trail of all resolutions
- ✅ Role-based access (Admin/Supervisor only)

### Access Control
- **Required Role:** Admin or Supervisor
- **Permissions:** Read visits, transmit EVV, resolve exceptions
- **Audit:** All actions logged to audit trail

### Data Privacy
- Patient PHI visible only to authorized users
- GPS coordinates masked in logs
- Signature images secured
- Transmission logs sanitized

---

## 📞 Troubleshooting

### Monitor Won't Load
1. Check user role (must be Admin or Supervisor)
2. Verify module is enabled in Platform Config
3. Check browser console for errors
4. Contact system administrator

### Transmit Button Disabled
- Visit must be "Completed" status
- EVV status must be "Pending"
- Clock in and clock out must exist
- EVV integration must be configured

### Conflicts Not Showing
- Ensure date range covers visit dates
- Check if conflicts actually exist
- Verify conflict detection is running
- Refresh page to reload data

### Resolution Not Working
- Ensure resolution type is selected
- Add required notes
- Check network connectivity
- Verify permissions

---

## 📚 Related Documentation

- [Point of Care Module Complete](/POINTOFCARE_MODULE_COMPLETE.md) - Full module docs
- [Monitor Implementation](/POINTOFCARE_MONITOR_COMPLETE.md) - Technical details
- [Platform Config Guide](/PLATFORM_CONFIG_STATUS.md) - Integration settings
- [Architecture Overview](/ARCHITECTURE.md) - System architecture

---

## 🎓 Training Scenarios

### Scenario 1: Daily Monitoring
**Goal:** Monitor all visits for the day

1. Open `/poc/monitor`
2. Set date range to today
3. Review status metrics
4. Check "All Visits" tab
5. Note any pending transmissions
6. Review "Conflicts" tab
7. Address any issues

### Scenario 2: Transmit Completed Visit
**Goal:** Send visit to EVV vendor

1. Go to "All Visits" tab
2. Find completed visit with "Pending" EVV status
3. Click "Transmit" button
4. Wait for confirmation
5. Verify status changed to "Verified"
6. Check ExternalOperationLog in Platform Config

### Scenario 3: Resolve EVV Exception
**Goal:** Handle transmission failure

1. Go to "Resolution Center" tab
2. Review exception details
3. Click "Resolve" button
4. Select "Manual Override"
5. Add notes: "Contacted vendor, confirmed receipt via email"
6. Click "Resolve Exception"
7. Verify visit removed from exceptions list

### Scenario 4: Handle Missing Clock Out
**Goal:** Fix incomplete visit

1. Review "Conflicts" tab
2. Find "Missing Clock Out" conflict
3. Contact clinician
4. Have clinician clock out in app
5. Return to monitor
6. Verify conflict resolved
7. Transmit visit if needed

---

## ✨ Tips & Tricks

**Keyboard Shortcuts:**
- Press `Ctrl+R` or `Cmd+R` to refresh data

**Bulk Operations (Future):**
- Select multiple visits for batch transmission

**Custom Filters:**
- Use date range for weekly/monthly reports
- Filter by clinician for individual monitoring

**Report Generation (Future):**
- Export EVV compliance report
- Track transmission success rates
- Analyze conflict trends

---

**Need Help?** Contact your system administrator or refer to the full documentation at `/POINTOFCARE_MONITOR_COMPLETE.md`
