/**
 * Navigation Summary Blueprint
 * 
 * Complete navigation architecture defining the relationship between all navigation patterns.
 * Creates a cohesive experience preventing fragmented UX common in healthcare software.
 */

import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  LayoutDashboard,
  Users,
  Layers,
  Command,
  PanelRight,
  Zap,
  Link2,
  Pin,
  Focus,
  ChevronRight,
} from 'lucide-react';

export function NavigationBlueprint() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Navigation Architecture Blueprint
        </h1>
        <p className="text-gray-600">
          Complete navigation model creating a cohesive experience across the healthcare platform
        </p>
      </div>

      {/* Navigation Hierarchy */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Navigation Hierarchy</h2>
        <div className="space-y-6">
          {/* Level 1: Global */}
          <HierarchyLevel
            level={1}
            title="Global Navigation Layer"
            description="Persistent, always-accessible navigation"
            components={[
              { name: 'Unified Sidebar', purpose: 'Primary module navigation' },
              { name: 'Quick Access Bar', purpose: 'Top-level actions and tools' },
              { name: 'Command Palette', purpose: 'Keyboard-first global search' },
            ]}
          />

          {/* Level 2: Context */}
          <HierarchyLevel
            level={2}
            title="Context Navigation Layer"
            description="Dynamic, context-aware navigation"
            components={[
              { name: 'Patient Context Header', purpose: 'Patient-level information and tabs' },
              {
                name: 'Admission Context Bar',
                purpose: 'Admission-level information and tabs',
              },
              { name: 'Breadcrumb Trail', purpose: 'Hierarchical path visualization' },
            ]}
          />

          {/* Level 3: Page */}
          <HierarchyLevel
            level={3}
            title="Page Navigation Layer"
            description="Page-specific navigation patterns"
            components={[
              { name: 'Tab Navigation', purpose: 'Related subsections within page' },
              { name: 'Context Drawer', purpose: 'Related information sidebar' },
              { name: 'Jump Links', purpose: 'Cross-module quick navigation' },
            ]}
          />

          {/* Level 4: Utilities */}
          <HierarchyLevel
            level={4}
            title="Utility Navigation Layer"
            description="Supporting navigation utilities"
            components={[
              { name: 'Recent & Pinned', purpose: 'Quick access to frequent items' },
              { name: 'Focus Mode', purpose: 'Distraction-free workflows' },
              { name: 'Navigation Badges', purpose: 'Actionable work indicators' },
            ]}
          />
        </div>
      </Card>

      {/* Navigation Patterns */}
      <div className="grid grid-cols-3 gap-6">
        <PatternCard
          icon={LayoutDashboard}
          title="Workspace-First Model"
          description="Daily launch point with role-based queues, critical issues, and quick actions"
          useCases={['Daily work prioritization', 'Role-specific dashboards', 'Quick stats']}
        />

        <PatternCard
          icon={Layers}
          title="Dual-Level Navigation"
          description="Global sidebar for modules, context headers for patient/admission workflows"
          useCases={['Patient workflows', 'Admission workflows', 'Deep navigation']}
        />

        <PatternCard
          icon={Command}
          title="Command Palette"
          description="Keyboard-optimized global search and quick actions (Ctrl+K)"
          useCases={[
            'Fast patient search',
            'Quick actions (P/A/V/D/Q/B)',
            'Recent items',
          ]}
        />

        <PatternCard
          icon={PanelRight}
          title="Context Drawer"
          description="Right-side panel for related information without navigation"
          useCases={[
            'Patient summary',
            'Medication details',
            'Caregiver profile',
            'Order history',
          ]}
        />

        <PatternCard
          icon={Zap}
          title="Cross-Module Jump Links"
          description="Direct contextual links reducing multi-step navigation"
          useCases={[
            'Visit → Patient Chart',
            'Alert → Medication Profile',
            'QA Item → Document',
          ]}
        />

        <PatternCard
          icon={Pin}
          title="Recent & Pinned"
          description="Quick access to frequently used patients, admissions, and queues"
          useCases={['Recent patients', 'Pinned work queues', 'Pinned reports']}
        />

        <PatternCard
          icon={Focus}
          title="Focus Mode"
          description="Minimized chrome for intensive workflows while preserving context"
          useCases={[
            'Clinical documentation',
            'Assessments',
            'Orders',
            'Care plan editing',
          ]}
        />

        <PatternCard
          icon={Users}
          title="Role-Based Views"
          description="Navigation filtered by user role (7 roles supported)"
          useCases={[
            'Clinician view',
            'QA reviewer view',
            'Billing specialist view',
            'Admin view',
          ]}
        />

        <PatternCard
          icon={Link2}
          title="Breadcrumb Trail"
          description="Hierarchical path showing current location in deep workflows"
          useCases={[
            'Patient > Admission > Clinical Doc > PT Note',
            'Deep navigation context',
          ]}
        />
      </div>

      {/* Navigation Rules */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Navigation Rules & Best Practices</h2>
        <div className="grid grid-cols-2 gap-6">
          <RuleSection
            title="Use Sidebar Navigation For:"
            rules={[
              'Major module areas (Clinical, Billing, Hospice)',
              'Patient/admission context sections',
              'Global operational queues',
              'Administration functions',
            ]}
          />

          <RuleSection
            title="Use Tab Navigation For:"
            rules={[
              'Related subsections within a page',
              'Grouped views inside a module',
              'Dashboard variants (list vs. grid)',
              'Do NOT overuse - max 5-7 tabs',
            ]}
          />

          <RuleSection
            title="Use Context Drawer For:"
            rules={[
              'Viewing related info without navigation',
              'Patient/admission summaries',
              'Medication/order details',
              'Caregiver profiles',
            ]}
          />

          <RuleSection
            title="Use Jump Links For:"
            rules={[
              'Cross-module navigation shortcuts',
              'Contextual related workflows',
              'Reducing multi-step journeys',
              'Connecting fragmented workflows',
            ]}
          />

          <RuleSection
            title="Badge Usage Rules:"
            rules={[
              'ONLY for actionable work',
              'Red: Immediate action required',
              'Amber: Needs attention soon',
              'Blue: Informational actionable',
              'Pulse animation for urgent items',
            ]}
          />

          <RuleSection
            title="Focus Mode Triggers:"
            rules={[
              'Clinical documentation editing',
              'Assessment completion',
              'Order entry workflows',
              'Care plan editing',
            ]}
          />
        </div>
      </Card>

      {/* Navigation Flow Examples */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Common Navigation Flows</h2>
        <div className="space-y-4">
          <NavigationFlow
            title="Clinician Daily Workflow"
            steps={[
              'Open Workspace Dashboard',
              'View "Today\'s Schedule" card',
              'Click first visit (9:00 AM SN Visit)',
              'Patient Context Header appears',
              'Admission Context Bar appears',
              'Click "Documentation" tab',
              'Enter Focus Mode',
              'Complete documentation',
              'Save & Exit Focus Mode',
              'Back to Workspace',
            ]}
          />

          <NavigationFlow
            title="QA Reviewer Workflow"
            steps={[
              'Open Workspace Dashboard',
              'View "QA Review Queue" (15 items)',
              'Click queue to open QA Workspace',
              'Filter by "Overdue > 48hrs"',
              'Click first document',
              'Document Review Interface opens',
              'Use Jump Link → View Patient Chart (context drawer)',
              'Review patient history',
              'Close drawer, continue QA',
              'Approve or Return for Correction',
            ]}
          />

          <NavigationFlow
            title="Billing Specialist Workflow"
            steps={[
              'Open Workspace Dashboard',
              'View "Pending Claims" (6 items)',
              'Use Command Palette (Ctrl+K)',
              'Search "Medicare claims"',
              'Open claim detail',
              'Use Jump Link → Admission Dashboard',
              'Context drawer: View visit timeline',
              'Verify all visits documented',
              'Use Jump Link → Clinical Documentation',
              'Confirm supporting docs',
              'Submit claim',
            ]}
          />
        </div>
      </Card>

      {/* Mobile Adaptation */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Mobile & Tablet Adaptations</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Tablet (768px - 1024px)</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Sidebar collapses to icons only</li>
              <li>• Patient/admission headers remain sticky</li>
              <li>• Context drawer overlays at 100% width</li>
              <li>• Command palette remains functional</li>
              <li>• Tab navigation scrolls horizontally</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Mobile (&lt; 768px)</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Sidebar becomes drawer (hamburger menu)</li>
              <li>• Bottom navigation for quick actions</li>
              <li>• Patient/admission headers compress</li>
              <li>• Context drawer becomes full-screen modal</li>
              <li>• Focus mode is default (less chrome)</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h2 className="text-xl font-bold mb-4">Navigation Architecture Summary</h2>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Key Principles</h3>
            <ul className="space-y-1 text-gray-700">
              <li>✓ Workspace-first (daily launch point)</li>
              <li>✓ Role-based filtering (7 roles)</li>
              <li>✓ Dual-level (global + context)</li>
              <li>✓ Low cognitive load (max 2-3 clicks)</li>
              <li>✓ Keyboard-optimized (Ctrl+K, shortcuts)</li>
              <li>✓ Context preservation (sticky headers)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Components</h3>
            <ul className="space-y-1 text-gray-700">
              <li>✓ 10 navigation components</li>
              <li>✓ 6 operational domain groups</li>
              <li>✓ 35+ navigation items</li>
              <li>✓ 7 predefined badge types</li>
              <li>✓ 7 context-specific jump link sets</li>
              <li>✓ Responsive (desktop, tablet, mobile)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function HierarchyLevel({
  level,
  title,
  description,
  components,
}: {
  level: number;
  title: string;
  description: string;
  components: { name: string; purpose: string }[];
}) {
  return (
    <div className="pl-6 border-l-4 border-blue-600">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
          Level {level}
        </Badge>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="space-y-2">
        {components.map((comp) => (
          <div key={comp.name} className="flex items-start gap-2 text-sm">
            <ChevronRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-gray-900">{comp.name}</span>
              <span className="text-gray-600"> — {comp.purpose}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatternCard({
  icon: Icon,
  title,
  description,
  useCases,
}: {
  icon: any;
  title: string;
  description: string;
  useCases: string[];
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div>
        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
          Use Cases
        </div>
        <ul className="space-y-1">
          {useCases.map((useCase, i) => (
            <li key={i} className="text-sm text-gray-700 flex items-start gap-1">
              <span className="text-blue-600">•</span>
              {useCase}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function RuleSection({ title, rules }: { title: string; rules: string[] }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <ul className="space-y-1">
        {rules.map((rule, i) => (
          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
            <span className="text-blue-600 flex-shrink-0">✓</span>
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavigationFlow({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="bg-gray-50 border rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">
              {i + 1}
            </div>
            <div className="text-sm text-gray-700 pt-0.5">{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
