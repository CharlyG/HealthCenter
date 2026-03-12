# Workspace System - Quick Start Guide

## 🚀 How to Use

### **For Users:**

1. **Login** with your role-assigned account
2. **Dashboard loads automatically** showing your personalized workspace
3. **5 zones guide your workflow:**
   - 🚨 Critical Issues → Fix urgent problems
   - 📅 Today's Work → Complete scheduled tasks
   - 🔄 Resume Work → Continue where you left off
   - ⚡ Quick Actions → Common tasks one click away
   - 📊 Operational Insights → Key metrics at a glance

### **For Developers:**

#### **To add a new workspace:**

1. Create `/src/app/pages/workspaces/NewRoleWorkspace.tsx`
2. Import zone components:
   ```tsx
   import {
     WorkspaceZone,
     CriticalIssuesZone,
     TodaysWorkZone,
     ResumeWorkZone,
     QuickActionsZone,
     OperationalInsightsZone,
   } from '../../components/workspace/WorkspaceZones';
   ```

3. Define data for each zone:
   ```tsx
   const criticalIssues = [
     {
       id: '1',
       title: 'Issue Title',
       description: 'Description',
       severity: 'critical' | 'high' | 'medium',
       category: 'Category Name',
       count: 5,
       daysOverdue: 2, // optional
       onClick: () => navigate('/path'),
     },
   ];
   ```

4. Render zones:
   ```tsx
   return (
     <div className="size-full bg-gray-50 overflow-y-auto">
       <div className="max-w-7xl mx-auto p-6">
         <WorkspaceZone title="🚨 Critical Issues">
           <CriticalIssuesZone issues={criticalIssues} />
         </WorkspaceZone>
         {/* ... other zones */}
       </div>
     </div>
   );
   ```

5. Add to role map in `RoleAwareWorkspace.tsx`:
   ```tsx
   const roleWorkspaceMap = {
     new_role: NewRoleWorkspace,
   };
   ```

#### **To connect backend data:**

```tsx
const [loading, setLoading] = useState(true);
const [issues, setIssues] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await apiHelper.fetchCriticalIssues();
      setIssues(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

---

## 📋 Zone Component Reference

### **CriticalIssuesZone**
```tsx
<CriticalIssuesZone issues={[
  {
    id: string,
    title: string,
    description: string,
    severity: 'critical' | 'high' | 'medium',
    category: string,
    count?: number,
    daysOverdue?: number,
    onClick?: () => void,
  }
]} />
```

### **TodaysWorkZone**
```tsx
<TodaysWorkZone items={[
  {
    id: string,
    title: string,
    subtitle: string,
    time?: string,
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
    icon: ReactNode,
    labels?: Array<{ text: string, variant: BadgeVariant }>,
    onClick?: () => void,
  }
]} />
```

### **ResumeWorkZone**
```tsx
<ResumeWorkZone items={[
  {
    id: string,
    title: string,
    subtitle: string,
    lastAccessed: string,
    icon: ReactNode,
    onClick?: () => void,
  }
]} />
```

### **QuickActionsZone**
```tsx
<QuickActionsZone actions={[
  {
    id: string,
    label: string,
    icon: ReactNode,
    variant?: 'default' | 'outline' | 'secondary',
    onClick: () => void,
  }
]} />
```

### **OperationalInsightsZone**
```tsx
<OperationalInsightsZone metrics={[
  {
    id: string,
    label: string,
    value: number | string,
    subtitle?: string,
    variant?: 'default' | 'success' | 'warning' | 'danger',
    icon?: ReactNode,
    onClick?: () => void,
  }
]} />
```

---

## 🎨 Color System

### **Severity Colors (Critical Issues):**
- `critical` → Red (bg-red-50, text-red-600)
- `high` → Orange (bg-orange-50, text-orange-600)
- `medium` → Yellow (bg-yellow-50, text-yellow-600)

### **Metric Colors (Operational Insights):**
- `default` → Blue (bg-blue-50, text-blue-900)
- `success` → Green (bg-green-50, text-green-900)
- `warning` → Yellow (bg-yellow-50, text-yellow-900)
- `danger` → Red (bg-red-50, text-red-900)

### **Badge Variants:**
- `default` → Blue
- `secondary` → Gray
- `success` → Green
- `warning` → Yellow
- `destructive` → Red
- `outline` → Transparent with border

---

## 🔧 Common Patterns

### **Loading State:**
```tsx
if (loading) {
  return (
    <div className="size-full flex items-center justify-center bg-gray-50">
      <Loader2 className="size-12 text-blue-600 animate-spin" />
      <p className="text-sm text-gray-600">Loading workspace...</p>
    </div>
  );
}
```

### **Empty State (Critical Issues):**
```tsx
if (issues.length === 0) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-6 text-center">
        <CheckCircle2 className="size-12 mx-auto mb-3 text-green-600" />
        <p className="text-lg font-semibold text-green-900">No Critical Issues</p>
      </CardContent>
    </Card>
  );
}
```

### **Navigation with Filters:**
```tsx
onClick={() => navigate('/scheduling?filter=open-shifts&date=tomorrow')}
```

---

## 📦 File Structure

```
/src/app/
├── components/
│   └── workspace/
│       └── WorkspaceZones.tsx        # 5 zone components
├── pages/
│   ├── Dashboard.tsx                 # Entry point
│   └── workspaces/
│       ├── RoleAwareWorkspace.tsx    # Role router
│       ├── IntakeAdmissionsWorkspace.tsx
│       ├── SchedulerWorkspace.tsx
│       ├── ClinicianWorkspace.tsx
│       ├── QAWorkspace.tsx
│       ├── BillingWorkspace.tsx
│       └── HospiceMedicalDirectorWorkspace.tsx
└── context/
    └── AuthContext.tsx               # Role detection
```

---

## 🧪 Testing Checklist

### **Visual Testing:**
- [ ] All 5 zones render
- [ ] Colors match design system
- [ ] Icons display correctly
- [ ] Badges have correct variants
- [ ] Cards have hover states

### **Interaction Testing:**
- [ ] Click handlers work (or log to console)
- [ ] Navigation URLs are correct
- [ ] Filters in URLs work
- [ ] Quick actions trigger correctly

### **Responsive Testing:**
- [ ] Desktop (1920px): Wide layout
- [ ] Tablet (768px): Responsive grids
- [ ] Mobile (375px): Single column

### **Data Testing:**
- [ ] Loading state shows
- [ ] Empty states show when appropriate
- [ ] Counts display correctly
- [ ] Dollar amounts formatted
- [ ] Dates formatted

### **Role Testing:**
- [ ] Each role loads correct workspace
- [ ] Role selector works (demo mode)
- [ ] Role from user_metadata detected
- [ ] Unknown roles handled gracefully

---

## 🐛 Troubleshooting

### **Workspace not loading:**
- Check `user.user_metadata.role` exists
- Verify role in `roleWorkspaceMap`
- Check console for errors

### **Navigation not working:**
- Verify routes exist in `/src/app/App.tsx`
- Check navigate() paths are correct
- Ensure useNavigate() imported

### **Icons not showing:**
- Import from `lucide-react`
- Check icon name spelling
- Verify icon is exported from package

### **Colors wrong:**
- Check severity/variant values
- Verify Tailwind classes valid
- Ensure theme.css loaded

---

## 💡 Best Practices

### **Content:**
- Keep titles concise (< 50 chars)
- Use actionable descriptions
- Show counts whenever possible
- Include timeframes ("today", "this week")

### **Navigation:**
- Always provide onClick handlers
- Use query params for filters
- Navigate to specific views, not generic pages

### **Performance:**
- Use loading states for >500ms operations
- Memoize expensive calculations
- Lazy load workspace components

### **Accessibility:**
- Add ARIA labels to interactive elements
- Ensure keyboard navigation works
- Use semantic HTML
- Provide alt text for icons

---

## 🎯 Quick Win Checklist

For a new workspace, ensure:
- [ ] At least 3 critical issues defined
- [ ] At least 3 today's work items
- [ ] 4 recent items (if available)
- [ ] 6 quick actions
- [ ] 4 operational metrics
- [ ] Loading state implemented
- [ ] Empty states handled
- [ ] All navigation URLs correct
- [ ] Colors follow design system
- [ ] Icons are meaningful

---

**Last Updated:** March 6, 2026  
**Version:** 1.0  
**Status:** Production-Ready ✅
