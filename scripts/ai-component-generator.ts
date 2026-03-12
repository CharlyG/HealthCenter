/**
 * AI-Assisted Component Generator
 * Generates healthcare components based on specifications
 */

interface ComponentSpec {
  name: string;
  type: 'card' | 'tracker' | 'list-item' | 'form' | 'dashboard';
  dataFields: {
    name: string;
    type: string;
    required: boolean;
  }[];
  variants?: ('default' | 'compact')[];
  features?: {
    alerts?: boolean;
    progress?: boolean;
    actions?: boolean;
    status?: boolean;
  };
}

/**
 * Generate a healthcare component from specification
 */
export function generateComponent(spec: ComponentSpec): string {
  const interfaceName = `${spec.name}Data`;
  const componentName = spec.name;
  
  // Generate TypeScript interface
  const dataInterface = generateInterface(interfaceName, spec.dataFields);
  
  // Generate props interface
  const propsInterface = generatePropsInterface(componentName, spec);
  
  // Generate component structure
  const componentCode = generateComponentStructure(componentName, interfaceName, spec);
  
  // Combine all parts
  return `/**
 * ${componentName}
 * Auto-generated healthcare component
 * 
 * COMPLIANT WITH:
 * - HEALTHCARE_COMPONENTS.md - Standard patterns
 * - SCREEN_GENERATION.md - Uses semantic tokens
 * - WCAG 2.1 AA - Accessible components
 */
import React from 'react';
import { ${getRequiredIcons(spec)} } from 'lucide-react';
import { textColor, surface, borderColor, space, typography, status } from '../../../design-system/semantic/tokens';
${spec.features?.status ? "import { StatusBadge } from '../StatusBadge';" : ''}

${dataInterface}

${propsInterface}

export const ${componentName} = React.memo(({ 
  data, 
  variant = 'default'${spec.features?.actions ? ',\n  onAction' : ''} 
}: ${componentName}Props) => {
  ${generateComponentLogic(spec)}
  
  if (variant === 'compact') {
    return (
      ${generateCompactVariant(spec)}
    );
  }
  
  return (
    ${generateDefaultVariant(spec)}
  );
});

${componentName}.displayName = '${componentName}';
`;
}

function generateInterface(name: string, fields: ComponentSpec['dataFields']): string {
  const fieldLines = fields.map(f => 
    `  ${f.name}${f.required ? '' : '?'}: ${f.type};`
  ).join('\n');
  
  return `export interface ${name} {\n${fieldLines}\n}`;
}

function generatePropsInterface(componentName: string, spec: ComponentSpec): string {
  return `interface ${componentName}Props {
  data: ${componentName}Data;
  variant?: 'default' | 'compact';${spec.features?.actions ? '\n  onAction?: () => void;' : ''}
}`;
}

function generateComponentLogic(spec: ComponentSpec): string {
  let logic = '';
  
  if (spec.features?.progress) {
    logic += `
  const percentage = (data.completed / data.total) * 100;
  const statusColor = percentage >= 90 ? status.success : percentage >= 75 ? status.warning : status.danger;`;
  }
  
  if (spec.features?.status) {
    logic += `
  const getStatusColor = () => {
    switch (data.status) {
      case 'active': return status.success;
      case 'pending': return status.warning;
      case 'error': return status.danger;
      default: return status.info;
    }
  };`;
  }
  
  return logic;
}

function generateCompactVariant(spec: ComponentSpec): string {
  return `<div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: space.sm,
        backgroundColor: surface.elevated,
        border: \`1px solid \${borderColor.default}\`,
        borderRadius: '0.375rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
          <span style={{ fontSize: typography.body.size, fontWeight: 500, color: textColor.primary }}>
            {data.${spec.dataFields[0].name}}
          </span>
        </div>
        ${spec.features?.status ? '<StatusBadge status={data.status} size="sm" />' : ''}
      </div>`;
}

function generateDefaultVariant(spec: ComponentSpec): string {
  return `<div style={{
        backgroundColor: surface.elevated,
        border: \`1px solid \${borderColor.default}\`,
        borderRadius: '0.5rem',
        padding: space.md,
      }}>
        <h4 style={{ 
          fontSize: typography.cardTitle.size, 
          fontWeight: typography.cardTitle.weight,
          color: textColor.primary,
          margin: 0,
          marginBottom: space.md
        }}>
          {data.${spec.dataFields[0].name}}
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
          ${generateFieldDisplays(spec.dataFields.slice(1))}
        </div>
        
        ${spec.features?.progress ? generateProgressBar() : ''}
        ${spec.features?.actions ? generateActionButton() : ''}
      </div>`;
}

function generateFieldDisplays(fields: ComponentSpec['dataFields']): string {
  return fields.map(field => `
          <div>
            <div style={{ fontSize: typography.helper.size, color: textColor.secondary }}>
              ${toTitleCase(field.name)}
            </div>
            <div style={{ fontSize: typography.body.size, color: textColor.primary }}>
              {data.${field.name}}
            </div>
          </div>`
  ).join('');
}

function generateProgressBar(): string {
  return `
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: surface.subtle,
          borderRadius: '4px',
          overflow: 'hidden',
          marginTop: space.md
        }}>
          <div style={{
            width: \`\${percentage}%\`,
            height: '100%',
            backgroundColor: statusColor.text,
            transition: 'width 0.3s ease'
          }} />
        </div>`;
}

function generateActionButton(): string {
  return `
        {onAction && (
          <button
            onClick={onAction}
            style={{
              width: '100%',
              padding: \`\${space.sm} \${space.md}\`,
              marginTop: space.md,
              fontSize: typography.body.size,
              fontWeight: 500,
              color: 'white',
              backgroundColor: status.info.text,
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Take Action
          </button>
        )}`;
}

function getRequiredIcons(spec: ComponentSpec): string {
  const icons = [];
  if (spec.features?.alerts) icons.push('AlertCircle');
  if (spec.features?.progress) icons.push('TrendingUp');
  if (spec.features?.status) icons.push('CheckCircle2');
  return icons.join(', ') || 'Info';
}

function toTitleCase(str: string): string {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}

// Example usage
export function generateExampleComponents() {
  // Example 1: Visit Compliance Tracker
  const visitComplianceSpec: ComponentSpec = {
    name: 'VisitComplianceTracker',
    type: 'tracker',
    dataFields: [
      { name: 'patientName', type: 'string', required: true },
      { name: 'scheduledVisits', type: 'number', required: true },
      { name: 'completedVisits', type: 'number', required: true },
      { name: 'missedVisits', type: 'number', required: true },
      { name: 'status', type: "'compliant' | 'at-risk' | 'non-compliant'", required: true },
    ],
    variants: ['default', 'compact'],
    features: {
      progress: true,
      status: true,
    },
  };
  
  // Example 2: Diagnosis Card
  const diagnosisSpec: ComponentSpec = {
    name: 'DiagnosisCard',
    type: 'card',
    dataFields: [
      { name: 'code', type: 'string', required: true },
      { name: 'description', type: 'string', required: true },
      { name: 'isPrimary', type: 'boolean', required: true },
      { name: 'dateAdded', type: 'string', required: true },
      { name: 'status', type: "'active' | 'resolved'", required: true },
    ],
    variants: ['default', 'compact'],
    features: {
      status: true,
      actions: true,
    },
  };
  
  return {
    visitCompliance: generateComponent(visitComplianceSpec),
    diagnosis: generateComponent(diagnosisSpec),
  };
}

// CLI Interface
if (require.main === module) {
  const examples = generateExampleComponents();
  console.log('=== Generated Components ===\n');
  console.log('1. VisitComplianceTracker:\n');
  console.log(examples.visitCompliance);
  console.log('\n\n2. DiagnosisCard:\n');
  console.log(examples.diagnosis);
}

export default generateComponent;
