# Sticky Footer and Action Bar Rules

Guidelines for sticky footers and action bars in long editing workflows.

## Overview

Sticky footers keep primary actions visible while users scroll through long forms or content, improving workflow efficiency and reducing errors.

## When to Use Sticky Footer

### Use Sticky Footer For:
- ✅ Long forms (15+ fields)
- ✅ Multi-section editing workflows
- ✅ Clinical documentation
- ✅ Assessment forms
- ✅ QA review workflows
- ✅ Approval workflows
- ✅ Any form requiring scrolling

### Don't Use Sticky Footer For:
- ❌ Short forms (<5 fields)
- ❌ Modal dialogs (use modal footer)
- ❌ Single-section forms
- ❌ Read-only views

## Sticky Footer Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  [Form Content - User scrolls here]                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Sticky Footer (always visible)                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [Cancel]              [Save Draft] [Validate] [Submit]  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Action Patterns

### 1. Clinical Documentation Pattern

**Use for**: Visit notes, assessments, clinical documentation

```tsx
<StickyFooter>
  <FooterLeft>
    <Button variant="link" onClick={onCancel}>
      Cancel
    </Button>
  </FooterLeft>
  
  <FooterRight>
    <SaveStatus status={saveStatus} />
    <Button variant="secondary" onClick={saveDraft}>
      Save Draft
    </Button>
    <Button variant="primary" onClick={handleSubmit}>
      Submit for Review
    </Button>
  </FooterRight>
</StickyFooter>
```

### 2. QA Review Pattern

**Use for**: Document review, QA workflows

```tsx
<StickyFooter>
  <FooterLeft>
    <Button variant="link" onClick={onCancel}>
      Cancel
    </Button>
  </FooterLeft>
  
  <FooterRight>
    <Button variant="danger" onClick={returnForCorrection}>
      Return for Correction
    </Button>
    <Button variant="secondary" onClick={requestClarification}>
      Request Clarification
    </Button>
    <Button variant="success" onClick={approve}>
      Approve
    </Button>
  </FooterRight>
</StickyFooter>
```

### 3. Approval Workflow Pattern

**Use for**: Order approval, certification approval

```tsx
<StickyFooter>
  <FooterLeft>
    <Button variant="link" onClick={onCancel}>
      Cancel
    </Button>
  </FooterLeft>
  
  <FooterCenter>
    <ValidationSummary errors={errors} warnings={warnings} />
  </FooterCenter>
  
  <FooterRight>
    <Button variant="secondary" onClick={validate}>
      Validate
    </Button>
    <Button variant="danger" onClick={reject}>
      Reject
    </Button>
    <Button variant="success" onClick={approve} disabled={hasErrors}>
      Approve
    </Button>
  </FooterRight>
</StickyFooter>
```

### 4. Multi-Step Wizard Pattern

**Use for**: Admission setup, multi-step forms

```tsx
<StickyFooter>
  <FooterLeft>
    <StepIndicator current={currentStep} total={totalSteps} />
  </FooterLeft>
  
  <FooterRight>
    {currentStep > 1 && (
      <Button variant="secondary" onClick={goBack}>
        Back
      </Button>
    )}
    {currentStep < totalSteps ? (
      <Button variant="primary" onClick={goNext}>
        Next
      </Button>
    ) : (
      <>
        <Button variant="secondary" onClick={saveDraft}>
          Save Draft
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </>
    )}
  </FooterRight>
</StickyFooter>
```

### 5. Simple Edit Pattern

**Use for**: Edit patient, edit admission, edit order

```tsx
<StickyFooter>
  <FooterLeft>
    <Button variant="link" onClick={onClose}>
      Close
    </Button>
  </FooterLeft>
  
  <FooterRight>
    <SaveStatus status={saveStatus} lastSaved={lastSaved} />
    <Button variant="primary" onClick={saveNow}>
      Save Now
    </Button>
  </FooterRight>
</StickyFooter>
```

## Component API

### StickyFooter Component

```tsx
interface StickyFooterProps {
  /** Footer content */
  children: React.ReactNode;
  
  /** Show validation summary */
  showValidation?: boolean;
  
  /** Validation errors */
  errors?: ValidationError[];
  
  /** Validation warnings */
  warnings?: ValidationWarning[];
  
  /** Footer background color */
  background?: 'default' | 'elevated';
  
  /** Add top border */
  bordered?: boolean;
  
  /** Add shadow */
  shadow?: boolean;
  
  /** Z-index override */
  zIndex?: number;
}

export const StickyFooter: React.FC<StickyFooterProps> = ({
  children,
  showValidation,
  errors = [],
  warnings = [],
  background = 'elevated',
  bordered = true,
  shadow = true,
  zIndex = layer.sticky
}) => {
  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex,
        backgroundColor: background === 'elevated' ? surface.elevated : surface.default,
        borderTop: bordered ? `1px solid ${borderColor.default}` : 'none',
        boxShadow: shadow ? shadows.lg : 'none',
        padding: `${space.lg} ${space.pagePadding}`
      }}
    >
      {showValidation && (errors.length > 0 || warnings.length > 0) && (
        <ValidationBanner errors={errors} warnings={warnings} />
      )}
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space.gapMd
      }}>
        {children}
      </div>
    </div>
  );
};
```

### FooterLeft, FooterCenter, FooterRight Components

```tsx
export const FooterLeft: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: space.gapMd }}>
    {children}
  </div>
);

export const FooterCenter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
    {children}
  </div>
);

export const FooterRight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: space.gapMd }}>
    {children}
  </div>
);
```

### SaveStatus Component

```tsx
interface SaveStatusProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

export const SaveStatus: React.FC<SaveStatusProps> = ({ status, lastSaved, error }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <SpinnerIcon />,
          text: 'Saving...',
          color: textColor.muted
        };
      case 'saved':
        return {
          icon: <CheckIcon />,
          text: lastSaved ? `Saved ${formatRelativeTime(lastSaved)}` : 'Saved',
          color: status.success.text
        };
      case 'error':
        return {
          icon: <ErrorIcon />,
          text: error || 'Failed to save',
          color: status.danger.text
        };
      default:
        return null;
    }
  };
  
  const config = getStatusConfig();
  if (!config) return null;
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: space.sm,
      fontSize: typography.helper.size,
      color: config.color
    }}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};
```

### ValidationBanner Component

```tsx
interface ValidationBannerProps {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  onErrorClick?: (error: ValidationError) => void;
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({
  errors,
  warnings,
  onErrorClick
}) => {
  if (errors.length === 0 && warnings.length === 0) return null;
  
  return (
    <div style={{ marginBottom: space.md }}>
      {errors.length > 0 && (
        <div style={{
          backgroundColor: status.danger.bg,
          border: `1px solid ${status.danger.border}`,
          borderRadius: borderRadius.default,
          padding: space.md,
          marginBottom: space.sm
        }}>
          <div style={{
            fontSize: typography.label.size,
            fontWeight: typography.label.weight,
            color: status.danger.text,
            marginBottom: space.sm
          }}>
            {errors.length} error{errors.length !== 1 ? 's' : ''} found
          </div>
          <ul style={{ paddingLeft: space.lg, margin: 0 }}>
            {errors.map((error, i) => (
              <li
                key={i}
                style={{
                  fontSize: typography.helper.size,
                  color: status.danger.text,
                  cursor: onErrorClick ? 'pointer' : 'default'
                }}
                onClick={() => onErrorClick?.(error)}
              >
                {error.field}: {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {warnings.length > 0 && (
        <div style={{
          backgroundColor: status.warning.bg,
          border: `1px solid ${status.warning.border}`,
          borderRadius: borderRadius.default,
          padding: space.md
        }}>
          <div style={{
            fontSize: typography.label.size,
            fontWeight: typography.label.weight,
            color: status.warning.text,
            marginBottom: space.sm
          }}>
            {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
          </div>
          <ul style={{ paddingLeft: space.lg, margin: 0 }}>
            {warnings.map((warning, i) => (
              <li
                key={i}
                style={{
                  fontSize: typography.helper.size,
                  color: status.warning.text
                }}
              >
                {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

## Layout Considerations

### 1. Avoid Covering Content

**Problem**: Sticky footer covers important content

**Solution**: Add padding to bottom of form

```tsx
<form style={{ paddingBottom: '100px' }}>
  {/* Form content */}
</form>

<StickyFooter>
  {/* Actions */}
</StickyFooter>
```

### 2. Mobile Responsiveness

**Mobile considerations**:
- Reduce padding on mobile
- Stack buttons vertically if needed
- Consider floating action button alternative

```tsx
<StickyFooter>
  <div className="hidden md:flex">
    {/* Desktop layout */}
  </div>
  
  <div className="flex md:hidden flex-col gap-2">
    {/* Mobile layout - stacked */}
  </div>
</StickyFooter>
```

### 3. Print Styles

**Hide sticky footer in print**:

```css
@media print {
  .sticky-footer {
    position: static;
    box-shadow: none;
    border-top: 1px solid #e5e5e5;
  }
}
```

## Action Priority

### Button Order (Right to Left)

1. **Primary Action** (rightmost)
   - Submit, Approve, Save, Next
   - variant="primary"

2. **Secondary Actions**
   - Save Draft, Validate, Back
   - variant="secondary"

3. **Destructive Actions**
   - Reject, Delete, Return for Correction
   - variant="danger"

4. **Cancel/Close** (leftmost)
   - variant="link" or "ghost"

**Example**:
```
[Cancel]                    [Save Draft] [Validate] [Submit]
 ↑ Link/Ghost                    ↑ Secondary         ↑ Primary
```

## Keyboard Shortcuts

### Standard Shortcuts

```tsx
// Ctrl+S / Cmd+S - Save
useKeyboardShortcut({
  key: 's',
  ctrl: true,
  callback: handleSave
});

// Ctrl+Enter / Cmd+Enter - Submit
useKeyboardShortcut({
  key: 'Enter',
  ctrl: true,
  callback: handleSubmit
});

// Escape - Cancel
useKeyboardShortcut({
  key: 'Escape',
  callback: handleCancel
});
```

### Show Keyboard Hints

```tsx
<Button variant="primary" onClick={handleSubmit}>
  Submit
  <kbd className="ml-2 text-xs opacity-60">Ctrl+Enter</kbd>
</Button>
```

## State Management

### Unsaved Changes Warning

```tsx
function DocumentEditor() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Warn before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
  
  return (
    <>
      <DocumentForm onChange={() => setHasUnsavedChanges(true)} />
      
      <StickyFooter>
        <FooterLeft>
          <Button variant="link" onClick={() => {
            if (hasUnsavedChanges) {
              if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                onCancel();
              }
            } else {
              onCancel();
            }
          }}>
            Cancel
          </Button>
        </FooterLeft>
        
        <FooterRight>
          <Button variant="secondary" onClick={saveDraft}>
            Save Draft
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </FooterRight>
      </StickyFooter>
    </>
  );
}
```

## Accessibility

### Focus Management

```tsx
// Focus first error when validation fails
const handleSubmit = async () => {
  const errors = await validateForm();
  
  if (errors.length > 0) {
    // Focus first error field
    const firstErrorField = document.getElementById(errors[0].field);
    firstErrorField?.focus();
    
    // Announce error count to screen readers
    announceToScreenReader(`${errors.length} errors found. Please correct them and try again.`);
  }
};
```

### Keyboard Navigation

```tsx
// All buttons must be keyboard accessible
<StickyFooter>
  <button tabIndex={0}>Cancel</button>
  <button tabIndex={0}>Save Draft</button>
  <button tabIndex={0}>Submit</button>
</StickyFooter>
```

### ARIA Labels

```tsx
<StickyFooter aria-label="Form actions">
  <FooterRight>
    <Button
      variant="primary"
      onClick={handleSubmit}
      aria-label="Submit form for review"
    >
      Submit
    </Button>
  </FooterRight>
</StickyFooter>
```

## Best Practices

### DO ✅

- Keep footer height consistent (60-80px)
- Use clear, action-oriented button labels
- Show save status clearly
- Display validation summary inline
- Support keyboard shortcuts
- Warn about unsaved changes
- Position primary action on the right
- Use consistent button variants
- Test on mobile devices

### DON'T ❌

- Cover important content
- Use too many actions (max 4-5)
- Hide validation errors
- Auto-submit without confirmation
- Forget about mobile layout
- Skip keyboard accessibility
- Place destructive actions on the right
- Use unclear button labels
- Forget loading/disabled states

---

**Version**: 1.0  
**Last Updated**: March 11, 2026
