# Navigation Update - CareConnect → Point of Care

**Date:** March 6, 2026  
**Change:** Renamed "CareConnect" module to "Point of Care" in navigation

---

## ✅ Changes Made

### 1. Module Display Name
**Before:** CareConnect  
**After:** Point of Care

### 2. Module Description
**Before:** Care coordination  
**After:** Visit documentation and EVV

### 3. Page Header
**Before:** CareConnect - Real-time care coordination and visit tracking  
**After:** Point of Care - Visit documentation and Electronic Visit Verification

---

## 📁 Files Updated

### Frontend
✅ `/src/app/lib/dataGateway.ts`
   - Line 1085: Updated moduleToggle name to "Point of Care"
   - Line 1274: Updated module definition name and description

✅ `/src/app/pages/CareConnect.tsx`
   - Line 26: Updated page title to "Point of Care"
   - Line 27: Updated subtitle to match new focus

### Backend
✅ `/supabase/functions/server/index.tsx`
   - Line 54: Updated SEED_MODULES name and description

---

## 🗺️ Complete Navigation Structure

### Main Modules (Left Sidebar)

1. **Patients** (`/patient`)
   - Patient management
   - Icon: Users
   
2. **Admissions** (`/admissions`)
   - Admission management
   - Icon: ClipboardCheck
   
3. **Scheduling** (`/scheduling`)
   - Visit scheduling
   - Icon: Calendar
   
4. **Point of Care** (`/careconnect`) ✨ RENAMED
   - Visit documentation and EVV
   - Icon: HeartPulse
   - Sub-routes:
     - `/poc` - My Visits (Caregiver workspace)
     - `/poc/visit/:id` - Visit detail & clock in/out
     - `/poc/manual-visit` - Create manual visit
     - `/poc/monitor` - Supervisor monitor dashboard
   
5. **Monitor / EVV** (`/monitor`)
   - Visit monitoring and EVV
   - Icon: Activity
   
6. **Hospice** (`/hospice`)
   - Hospice care management
   - Icon: Heart
   
7. **Admin / Platform** (`/admin/platform-config`)
   - System administration
   - Icon: Settings

---

## 🎯 Why This Change?

### Clarifies Module Purpose
- **"Point of Care"** is a standard healthcare term
- Clearly indicates clinical documentation
- Aligns with industry terminology

### Distinguishes from Monitor
- **Point of Care**: Caregiver workspace (documentation)
- **Monitor / EVV**: Supervisor dashboard (oversight)

### Reflects Actual Functionality
- Visit documentation
- Electronic Visit Verification (EVV)
- Clock in/out
- Signature capture
- GPS verification

---

## 📍 Route Structure

### Legacy Route (Still Active)
```
/careconnect → Point of Care placeholder page
```

### Primary Routes (Point of Care Module)
```
/poc                    → My Visits (caregiver workspace)
/poc/visit/:id          → Visit detail & documentation
/poc/manual-visit       → Create manual visit
/poc/monitor            → Supervisor monitor dashboard
```

### Note on URL Structure
- The module ID remains `careconnect` in the database
- The route `/careconnect` still works for backward compatibility
- Main functionality is under `/poc` routes
- This allows for future migration without breaking existing links

---

## 🔄 Migration Notes

### No Breaking Changes
✅ Module ID unchanged (`careconnect`)
✅ Routes unchanged (`/careconnect`, `/poc`)
✅ Feature flags unchanged
✅ Permissions unchanged
✅ Database keys unchanged

### Display Only Changes
- Navigation menu text
- Page title
- Module description
- User-facing labels

### User Impact
- **What users see:** "Point of Care" in navigation
- **What they click:** Same as before
- **What they access:** Same functionality
- **Training needed:** Minimal (just new name)

---

## 📊 Module Comparison

| Aspect | CareConnect (Old) | Point of Care (New) |
|--------|------------------|---------------------|
| Display Name | CareConnect | Point of Care |
| Description | Care coordination | Visit documentation and EVV |
| Module ID | `careconnect` | `careconnect` (unchanged) |
| Primary Route | `/careconnect` | `/careconnect` + `/poc/*` |
| Icon | HeartPulse | HeartPulse |
| Focus | Coordination | Documentation |
| User Role | All clinical staff | Caregivers + Supervisors |

---

## 🎓 User Communication

### Announcement Template

**Subject:** Navigation Update - CareConnect is now Point of Care

**Body:**
We've renamed the **CareConnect** module to **Point of Care** to better reflect its purpose as your visit documentation and EVV workspace.

**What's Changed:**
- Menu item now says "Point of Care"
- Updated description emphasizes visit documentation

**What Stays the Same:**
- All your visits are in the same place
- Clock in/out works exactly the same
- No new training required
- All features unchanged

**Where to Find It:**
- Click "Point of Care" in the left sidebar
- Access your visits at `/poc`
- Supervisors can access the monitor at `/poc/monitor`

---

## ✅ Testing Checklist

- [x] Navigation displays "Point of Care"
- [x] Description shows "Visit documentation and EVV"
- [x] Clicking opens correct page
- [x] Page header shows "Point of Care"
- [x] All routes still functional
- [x] Module toggle still works
- [x] Feature flags unchanged
- [x] Permissions unchanged
- [x] Backend API returns correct name
- [x] No console errors

---

## 📚 Related Documentation

- [Point of Care Module Complete](/POINTOFCARE_MODULE_COMPLETE.md)
- [Point of Care Monitor](/POINTOFCARE_MONITOR_SUMMARY.md)
- [Architecture Overview](/ARCHITECTURE.md)

---

**Status:** ✅ COMPLETE
**Deployed:** Ready for immediate use
**Breaking Changes:** None
**User Impact:** Minimal (display name only)
