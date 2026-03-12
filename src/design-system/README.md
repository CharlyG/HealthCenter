# Healthcare Platform Design System

Production-grade design system for high-density, accessible healthcare applications.

## Overview

This design system provides a comprehensive foundation for building consistent, accessible, and performant healthcare applications. It is optimized for:

- **High information density** - Display maximum relevant data without clutter
- **Accessibility** - WCAG 2.1 AA compliant
- **Consistency** - Reusable patterns across all modules
- **Performance** - Optimized for large datasets and complex workflows
- **Fast workflows** - Keyboard shortcuts, minimal clicks

---

## Quick Start

### 1. Import Tokens

```tsx
import { text, surface, border, button } from '@/design-system/tokens';

function MyComponent() {
  return (
    <div style={{
      color: text.primary,
      background: surface.elevated,
      border: `1px solid ${border.default}`,
      padding: button.size.md.paddingX
    }}>
      Content
    </div>
  );
}
```

### 2. Use Semantic Tokens (Not Foundation Tokens)

```tsx
// ✅ CORRECT - Use semantic tokens
import { text, surface } from '@/design-system/tokens';

const textColor = text.primary;
const bgColor = surface.elevated;

// ❌ WRONG - Don't use foundation tokens directly
import { colors } from '@/design-system/foundations';

const textColor = colors.neutral[900];  // NO!
const bgColor = colors.neutral[0];      // NO!
```

### 3. Build Small, Reusable Components

```tsx
// ✅ GOOD - Small, focused component
function PatientCard({ patient }: { patient: Patient }) {
  return (
    <Card>
      <CardHeader>{patient.name}</CardHeader>
      <CardContent>
        <Text>{patient.mrn}</Text>
      </CardContent>
    </Card>
  );
}

// ❌ BAD - Large, monolithic component
function PatientDashboard() {
  // 800 lines of mixed concerns
}
```

---

## Design System Structure

```
/design-system/
  /foundations/          ← Layer 1: Raw design values
    colors.ts
    typography.ts
    spacing.ts
    radius.ts
    borders.ts
    shadows.ts
    elevation.ts
    motion.ts
    
  /tokens/              ← Layer 2 & 3: Semantic and component tokens
    semantic.ts
    component.ts
    
  /components/          ← Layer 4: Reusable UI components
    /primitives/        (Button, Input, etc.)
    /layout/            (Card, Panel, Grid, etc.)
    /patterns/          (Table, Form, etc.)
    
  /documentation/       ← Architecture and pattern docs
    ARCHITECTURE.md
    PATTERNS.md
    PERFORMANCE.md
```

---

## Token System

### Foundation Tokens (Layer 1)

Raw design values - **DO NOT use directly in components**.

**Categories**:
- Colors (neutral, primary, semantic)
- Typography (font families, sizes, weights)
- Spacing (4px grid system)
- Radius (border radius scale)
- Borders (widths and styles)
- Shadows (elevation system)
- Z-index (stacking contexts)
- Motion (transitions and animations)

### Semantic Tokens (Layer 2)

Usage-based tokens - **Use these in components**.

**Categories**:
- `text.*` - Text colors
- `surface.*` - Surface backgrounds
- `border.*` - Border colors
- `background.*` - Interactive backgrounds
- `state.*` - State colors (success, warning, danger, info)
- `focusRing.*` - Focus indication
- `healthcare.*` - Healthcare-specific colors
- `chart.*` - Data visualization colors

**Examples**:

```tsx
import { text, surface, border, state } from '@/design-system/tokens';

// Text
text.primary    // Main content
text.secondary  // Less emphasized
text.muted      // Helper text
text.disabled   // Disabled state
text.link       // Link color

// Surfaces
surface.default   // Page background
surface.elevated  // Cards, panels
surface.hover     // Hover state
surface.selected  // Selected state

// States
state.success.bg     // Success background
state.success.text   // Success text
state.warning.bg     // Warning background
state.danger.icon    // Danger icon color
```

### Component Tokens (Layer 3)

Component-specific tokens built on semantic tokens.

**Categories**:
- `button.*` - Button sizing and variants
- `input.*` - Input sizing and states
- `card.*` - Card variants
- `table.*` - Table styling
- `badge.*` - Badge variants
- `modal.*` - Modal sizing
- `drawer.*` - Drawer sizing
- `tooltip.*` - Tooltip styling
- `toast.*` - Toast variants
- `form.*` - Form field spacing

**Examples**:

```tsx
import { button, input, card } from '@/design-system/tokens';

// Button
button.size.md.height     // 36px
button.size.md.paddingX   // 16px
button.variant.primary.bg // Primary background

// Input
input.size.md.height      // 36px
input.state.focus.border  // Focus border color

// Card
card.padding              // 16px
card.radius               // 8px
```

---

## Core Principles

### 1. Information Density

**Goal**: Display maximum relevant data without overwhelming users.

**Techniques**:
- Compact spacing (12px cell padding)
- Smaller font sizes (13px base)
- Efficient table layouts
- Progressive disclosure (hide complexity until needed)
- High-density queue views

### 2. Calm Visual Hierarchy

**Goal**: Clear structure without visual noise.

**Techniques**:
- Subtle shadows (avoid heavy drop shadows)
- Minimal borders (use sparingly)
- Consistent color palette
- Clear typography scale
- Purposeful use of color (semantic only)

### 3. Fast Workflows

**Goal**: Minimize clicks, optimize for productivity.

**Techniques**:
- Keyboard shortcuts (Ctrl+K for search, Ctrl+S for save)
- Inline actions (edit/delete without modal)
- Bulk operations (multi-select)
- Quick filters (one-click filtering)
- Auto-save for long forms

### 4. Consistency

**Goal**: Reuse patterns, avoid one-off solutions.

**Rules**:
- Use standard page shells
- Reuse queue item patterns
- Consistent status badges
- Standard form layouts
- Uniform table patterns

### 5. Accessibility

**Goal**: WCAG 2.1 AA compliant.

**Requirements**:
- Keyboard navigation support
- Screen reader friendly
- ARIA labels and roles
- Focus management
- Color contrast compliance (4.5:1 for text)
- Status not indicated by color alone

### 6. Performance

**Goal**: Fast load times, smooth interactions.

**Rules**:
- Small components (< 200 lines)
- Memoized expensive computations
- Lazy loading for heavy content
- Server-side pagination/filtering/sorting
- Virtualization for long lists (> 200 items)

---

## Common Patterns

### Tables

Use for operational data with sorting, filtering, and actions.

```tsx
<Table>
  <TableHeader sticky>
    <TableRow>
      <TableHeaderCell sortable>Name</TableHeaderCell>
      <TableHeaderCell sortable>Date</TableHeaderCell>
      <TableHeaderCell>Status</TableHeaderCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map(row => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.date}</TableCell>
        <TableCell><StatusBadge status={row.status} /></TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Forms

Use sections for long forms, auto-save for clinical forms.

```tsx
<Form onSubmit={handleSubmit}>
  <FormSection title="Patient Information">
    <FormField label="Name" required>
      <Input {...register('name')} />
    </FormField>
  </FormSection>
  
  <FormSection title="Insurance">
    {/* Insurance fields */}
  </FormSection>
  
  <StickyFormFooter>
    <Button type="submit">Save</Button>
    <SaveStatus status={saveStatus} />
  </StickyFormFooter>
</Form>
```

### Queue Items

Consistent pattern for all operational queues.

```tsx
<QueueItem
  title="John Doe"
  identifiers={[
    { label: 'MRN', value: '123456' },
    { label: 'Admission', value: 'A-789' }
  ]}
  status="Pending Review"
  priority="High"
  assignedTo="Sarah Johnson"
  actions={[
    { label: 'Review', onClick: handleReview },
    { label: 'Assign', onClick: handleAssign }
  ]}
/>
```

---

## Documentation

### Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- Design system layers
- Token system details
- Component architecture rules
- Performance guidelines
- State management patterns
- Page composition patterns

### Patterns

See [PATTERNS.md](./PATTERNS.md) for:
- Table patterns (standard, compact, comparison, timeline)
- List and queue patterns
- Form patterns (structure, fields, layouts)
- Navigation patterns (tabs, breadcrumbs, pagination)
- Data display patterns (stat cards, info panels, timelines)

---

## Design Tokens Reference

### Colors

```tsx
// Neutral scale
neutral[0]    // #FFFFFF
neutral[100]  // #F5F5F5
neutral[200]  // #E5E5E5 (default border)
neutral[500]  // #737373 (muted text)
neutral[900]  // #171717 (primary text)

// Primary
primary[500]  // #3B82F6 (main brand)
primary[600]  // #2563EB (brand hover)

// Semantic
success[600]  // #16A34A
warning[600]  // #D97706
danger[600]   // #DC2626
info[600]     // #2563EB
```

### Typography

```tsx
fontSize.xs   // 11px - Micro labels
fontSize.sm   // 12px - Helper text
fontSize.base // 13px - Table cells
fontSize.md   // 14px - Body text
fontSize.lg   // 15px - Card titles
fontSize.xl   // 16px - Section titles
fontSize['2xl'] // 18px - Page titles

fontWeight.normal   // 400
fontWeight.medium   // 500
fontWeight.semibold // 600
fontWeight.bold     // 700
```

### Spacing

```tsx
spacing[1]  // 4px
spacing[2]  // 8px
spacing[3]  // 12px
spacing[4]  // 16px
spacing[6]  // 24px
spacing[8]  // 32px
spacing[12] // 48px
```

### Semantic Spacing

```tsx
semanticSpacing.componentMd    // 12px - Standard padding
semanticSpacing.cardPadding    // 16px - Card padding
semanticSpacing.sectionMd      // 32px - Section gaps
semanticSpacing.formFieldGap   // 16px - Form field gap
```

---

## Component Library

### Primitives

- Button
- Input
- Select
- Checkbox
- Radio
- Switch
- Textarea

### Layout

- Card
- Panel
- Grid
- Stack
- Container
- Divider

### Data Display

- Table
- List
- Badge
- Avatar
- Tooltip
- Stat Card

### Feedback

- Alert
- Toast
- Modal
- Drawer
- Progress Bar
- Loading Spinner

### Navigation

- Tabs
- Breadcrumbs
- Pagination
- Menu

---

## Best Practices

### ✅ DO

- Use semantic tokens in components
- Build small, focused components (< 200 lines)
- Memoize expensive computations
- Use server-side pagination/filtering
- Follow standard page shells
- Reuse healthcare-specific patterns
- Support keyboard navigation
- Provide ARIA labels

### ❌ DON'T

- Use foundation tokens directly in components
- Build large monolithic components
- Client-side filter large datasets
- Create one-off page layouts
- Use color as the only status indicator
- Skip accessibility features
- Ignore performance guidelines

---

## Migration Guide

### From Custom Styles to Design System

1. **Identify components using hardcoded colors**

   ```tsx
   // ❌ Before
   <div style={{ color: '#171717', background: '#FFFFFF' }}>
   
   // ✅ After
   import { text, surface } from '@/design-system/tokens';
   <div style={{ color: text.primary, background: surface.default }}>
   ```

2. **Replace custom spacing with tokens**

   ```tsx
   // ❌ Before
   <div style={{ padding: '16px', margin: '24px' }}>
   
   // ✅ After
   import { spacing } from '@/design-system/foundations';
   <div style={{ padding: spacing[4], margin: spacing[6] }}>
   ```

3. **Use component tokens for complex components**

   ```tsx
   // ❌ Before
   <button style={{
     height: '36px',
     padding: '8px 16px',
     background: '#3B82F6',
     borderRadius: '6px'
   }}>
   
   // ✅ After
   import { button } from '@/design-system/tokens';
   <button style={{
     height: button.size.md.height,
     padding: `${button.size.md.paddingY} ${button.size.md.paddingX}`,
     background: button.variant.primary.bg,
     borderRadius: button.radius
   }}>
   ```

---

## Support

For questions or issues:
1. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for architectural guidance
2. Check [PATTERNS.md](./PATTERNS.md) for pattern examples
3. Review token reference above
4. Contact the design system team

---

**Last Updated**: March 11, 2026  
**Version**: 1.0  
**Maintained by**: Healthcare Platform Team
