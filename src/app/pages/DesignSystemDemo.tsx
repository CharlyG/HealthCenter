/**
 * Design System Demo Page
 * 
 * Demonstrates the design system tokens and components
 */

import React from 'react';

// Import Button component
import { Button } from '../design-system/components/Button';

// Import semantic tokens
import { 
  textColor, 
  surface, 
  borderColor, 
  space,
  typography,
  status,
  borderRadius,
  shadows
} from '../design-system/semantic/tokens';

export default function DesignSystemDemo() {
  // Prevent any hydration issues
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-sm text-gray-500">Loading design system...</div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: surface.default,
      minHeight: '100vh',
      padding: space.pagePadding
    }}>
      {/* Page Header */}
      <div style={{ marginBottom: space.sectionLg }}>
        <h1 style={{
          fontSize: typography.pageTitle.size,
          fontWeight: typography.pageTitle.weight,
          color: textColor.primary,
          marginBottom: space.md
        }}>
          Design System Demo
        </h1>
        <p style={{
          fontSize: typography.body.size,
          color: textColor.secondary
        }}>
          Production-grade healthcare platform design system
        </p>
      </div>

      {/* Tokens Section */}
      <div style={{ marginBottom: space.sectionMd }}>
        <h2 style={{
          fontSize: typography.sectionTitle.size,
          fontWeight: typography.sectionTitle.weight,
          color: textColor.primary,
          marginBottom: space.lg
        }}>
          Foundation Tokens
        </h2>

        {/* Color Tokens */}
        <div style={{ 
          backgroundColor: surface.elevated,
          borderRadius: borderRadius.medium,
          padding: space.xl,
          marginBottom: space.gapLg,
          boxShadow: shadows.card
        }}>
          <h3 style={{
            fontSize: typography.cardTitle.size,
            fontWeight: typography.cardTitle.weight,
            color: textColor.primary,
            marginBottom: space.md
          }}>
            Semantic Colors
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: space.gapMd }}>
            {/* Success */}
            <div style={{
              backgroundColor: status.success.bg,
              border: `1px solid ${status.success.border}`,
              borderRadius: borderRadius.default,
              padding: space.md
            }}>
              <div style={{
                fontSize: typography.label.size,
                fontWeight: typography.label.weight,
                color: status.success.text,
                marginBottom: space.sm
              }}>
                Success
              </div>
              <div style={{
                fontSize: typography.helper.size,
                color: textColor.muted
              }}>
                Used for positive states
              </div>
            </div>

            {/* Warning */}
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
                Warning
              </div>
              <div style={{
                fontSize: typography.helper.size,
                color: textColor.muted
              }}>
                Used for caution states
              </div>
            </div>

            {/* Danger */}
            <div style={{
              backgroundColor: status.danger.bg,
              border: `1px solid ${status.danger.border}`,
              borderRadius: borderRadius.default,
              padding: space.md
            }}>
              <div style={{
                fontSize: typography.label.size,
                fontWeight: typography.label.weight,
                color: status.danger.text,
                marginBottom: space.sm
              }}>
                Danger
              </div>
              <div style={{
                fontSize: typography.helper.size,
                color: textColor.muted
              }}>
                Used for error states
              </div>
            </div>

            {/* Info */}
            <div style={{
              backgroundColor: status.info.bg,
              border: `1px solid ${status.info.border}`,
              borderRadius: borderRadius.default,
              padding: space.md
            }}>
              <div style={{
                fontSize: typography.label.size,
                fontWeight: typography.label.weight,
                color: status.info.text,
                marginBottom: space.sm
              }}>
                Info
              </div>
              <div style={{
                fontSize: typography.helper.size,
                color: textColor.muted
              }}>
                Used for informational states
              </div>
            </div>
          </div>
        </div>

        {/* Typography Tokens */}
        <div style={{ 
          backgroundColor: surface.elevated,
          borderRadius: borderRadius.medium,
          padding: space.xl,
          marginBottom: space.gapLg,
          boxShadow: shadows.card
        }}>
          <h3 style={{
            fontSize: typography.cardTitle.size,
            fontWeight: typography.cardTitle.weight,
            color: textColor.primary,
            marginBottom: space.md
          }}>
            Typography Scale
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: space.gapMd }}>
            <div>
              <div style={{
                fontSize: typography.pageTitle.size,
                fontWeight: typography.pageTitle.weight,
                color: textColor.primary
              }}>
                Page Title (20px)
              </div>
            </div>
            <div>
              <div style={{
                fontSize: typography.sectionTitle.size,
                fontWeight: typography.sectionTitle.weight,
                color: textColor.primary
              }}>
                Section Title (18px)
              </div>
            </div>
            <div>
              <div style={{
                fontSize: typography.cardTitle.size,
                fontWeight: typography.cardTitle.weight,
                color: textColor.primary
              }}>
                Card Title (16px)
              </div>
            </div>
            <div>
              <div style={{
                fontSize: typography.body.size,
                fontWeight: typography.body.weight,
                color: textColor.primary
              }}>
                Body Text (14px) - Default text for most content
              </div>
            </div>
            <div>
              <div style={{
                fontSize: typography.compactTable.size,
                fontWeight: typography.compactTable.weight,
                color: textColor.secondary
              }}>
                Compact Table (13px) - Dense information display
              </div>
            </div>
            <div>
              <div style={{
                fontSize: typography.helper.size,
                fontWeight: typography.helper.weight,
                color: textColor.muted
              }}>
                Helper Text (13px) - Supporting information
              </div>
            </div>
            <div>
              <div style={{
                fontSize: typography.microLabel.size,
                fontWeight: typography.microLabel.weight,
                color: textColor.muted,
                textTransform: 'uppercase',
                letterSpacing: typography.microLabel.letterSpacing
              }}>
                Micro Label (11px) - Dense metadata
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Components Section */}
      <div style={{ marginBottom: space.sectionMd }}>
        <h2 style={{
          fontSize: typography.sectionTitle.size,
          fontWeight: typography.sectionTitle.weight,
          color: textColor.primary,
          marginBottom: space.lg
        }}>
          Components
        </h2>

        {/* Buttons */}
        <div style={{ 
          backgroundColor: surface.elevated,
          borderRadius: borderRadius.medium,
          padding: space.xl,
          marginBottom: space.gapLg,
          boxShadow: shadows.card
        }}>
          <h3 style={{
            fontSize: typography.cardTitle.size,
            fontWeight: typography.cardTitle.weight,
            color: textColor.primary,
            marginBottom: space.md
          }}>
            Button Variants
          </h3>

          {/* Button Sizes */}
          <div style={{ marginBottom: space.gapLg }}>
            <div style={{
              fontSize: typography.label.size,
              fontWeight: typography.label.weight,
              color: textColor.secondary,
              marginBottom: space.md
            }}>
              Sizes
            </div>
            <div style={{ display: 'flex', gap: space.gapMd, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" size="sm">Small Button</Button>
              <Button variant="primary" size="base">Default Button</Button>
              <Button variant="primary" size="lg">Large Button</Button>
            </div>
          </div>

          {/* Button Variants */}
          <div style={{ marginBottom: space.gapLg }}>
            <div style={{
              fontSize: typography.label.size,
              fontWeight: typography.label.weight,
              color: textColor.secondary,
              marginBottom: space.md
            }}>
              Variants
            </div>
            <div style={{ display: 'flex', gap: space.gapMd, flexWrap: 'wrap' }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>

          {/* Button States */}
          <div>
            <div style={{
              fontSize: typography.label.size,
              fontWeight: typography.label.weight,
              color: textColor.secondary,
              marginBottom: space.md
            }}>
              States
            </div>
            <div style={{ display: 'flex', gap: space.gapMd, flexWrap: 'wrap' }}>
              <Button variant="primary">Normal</Button>
              <Button variant="primary" loading>Loading</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </div>
        </div>

        {/* Surfaces */}
        <div style={{ 
          backgroundColor: surface.elevated,
          borderRadius: borderRadius.medium,
          padding: space.xl,
          boxShadow: shadows.card
        }}>
          <h3 style={{
            fontSize: typography.cardTitle.size,
            fontWeight: typography.cardTitle.weight,
            color: textColor.primary,
            marginBottom: space.md
          }}>
            Surface Tokens
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: space.gapMd }}>
            <div style={{
              backgroundColor: surface.default,
              border: `1px solid ${borderColor.default}`,
              borderRadius: borderRadius.default,
              padding: space.lg
            }}>
              <div style={{
                fontSize: typography.label.size,
                fontWeight: typography.label.weight,
                color: textColor.primary,
                marginBottom: space.sm
              }}>
                Default Surface
              </div>
              <div style={{
                fontSize: typography.helper.size,
                color: textColor.muted
              }}>
                Main background
              </div>
            </div>

            <div style={{
              backgroundColor: surface.subtle,
              border: `1px solid ${borderColor.default}`,
              borderRadius: borderRadius.default,
              padding: space.lg
            }}>
              <div style={{
                fontSize: typography.label.size,
                fontWeight: typography.label.weight,
                color: textColor.primary,
                marginBottom: space.sm
              }}>
                Subtle Surface
              </div>
              <div style={{
                fontSize: typography.helper.size,
                color: textColor.muted
              }}>
                Grouped sections
              </div>
            </div>

            <div style={{
              backgroundColor: surface.elevated,
              border: `1px solid ${borderColor.default}`,
              borderRadius: borderRadius.default,
              padding: space.lg,
              boxShadow: shadows.card
            }}>
              <div style={{
                fontSize: typography.label.size,
                fontWeight: typography.label.weight,
                color: textColor.primary,
                marginBottom: space.sm
              }}>
                Elevated Surface
              </div>
              <div style={{
                fontSize: typography.helper.size,
                color: textColor.muted
              }}>
                Cards, panels
              </div>
            </div>

            <div style={{
              backgroundColor: surface.selected,
              border: `1px solid ${borderColor.default}`,
              borderRadius: borderRadius.default,
              padding: space.lg
            }}>
              <div style={{
                fontSize: typography.label.size,
                fontWeight: typography.label.weight,
                color: textColor.primary,
                marginBottom: space.sm
              }}>
                Selected Surface
              </div>
              <div style={{
                fontSize: typography.helper.size,
                color: textColor.muted
              }}>
                Selected items
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Info */}
      <div style={{ 
        backgroundColor: surface.subtle,
        borderRadius: borderRadius.medium,
        padding: space.xl,
        border: `1px solid ${borderColor.default}`
      }}>
        <h3 style={{
          fontSize: typography.cardTitle.size,
          fontWeight: typography.cardTitle.weight,
          color: textColor.primary,
          marginBottom: space.md
        }}>
          Design System Architecture
        </h3>
        <div style={{
          fontSize: typography.body.size,
          color: textColor.secondary,
          marginBottom: space.md
        }}>
          This healthcare platform uses a 6-layer design system architecture:
        </div>
        <ol style={{
          fontSize: typography.body.size,
          color: textColor.secondary,
          paddingLeft: space.lg,
          display: 'flex',
          flexDirection: 'column',
          gap: space.sm
        }}>
          <li>Foundation Tokens - Raw design values</li>
          <li>Semantic Tokens - Usage-based tokens</li>
          <li>Component Tokens - Component-specific values</li>
          <li>Reusable Components - UI building blocks</li>
          <li>Healthcare Patterns - Domain-specific patterns</li>
          <li>Screen Shells - Page layout templates</li>
        </ol>
      </div>
    </div>
  );
}