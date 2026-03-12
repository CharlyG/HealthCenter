/**
 * ComplianceExport — Generates a printable/downloadable compliance report.
 * Renders a structured HTML report and triggers browser print dialog.
 */
import React, { useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Printer, Download, FileText } from 'lucide-react';
import type { MonitorVisit, MonitorMetrics } from './MonitorTypes';
import type { EvvError } from './MonitorTypes';

interface ComplianceExportProps {
  visits: MonitorVisit[];
  metrics: MonitorMetrics;
  evvErrors: EvvError[];
  date: string;
}

export default function ComplianceExport({ visits, metrics, evvErrors, date }: ComplianceExportProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>EVV Compliance Report — ${date}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #1f2937; font-size: 12px; }
          h1 { font-size: 20px; margin-bottom: 4px; color: #111827; }
          h2 { font-size: 14px; margin-top: 24px; margin-bottom: 8px; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
          .subtitle { color: #6b7280; font-size: 12px; margin-bottom: 20px; }
          .header-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
          .kpi-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
          .kpi-value { font-size: 24px; font-weight: 700; color: #111827; }
          .kpi-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
          th { background: #f9fafb; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; font-size: 10px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
          .badge-green { background: #d1fae5; color: #065f46; }
          .badge-red { background: #fee2e2; color: #991b1b; }
          .badge-blue { background: #dbeafe; color: #1e40af; }
          .badge-gray { background: #f3f4f6; color: #4b5563; }
          .badge-amber { background: #fef3c7; color: #92400e; }
          .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 10px; text-align: center; }
          .hipaa-notice { background: #fef2f2; border: 1px solid #fecaca; padding: 8px 12px; border-radius: 6px; font-size: 10px; color: #991b1b; margin-bottom: 20px; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="hipaa-notice">
          <strong>HIPAA NOTICE:</strong> This report contains Protected Health Information (PHI). 
          Handle in accordance with your organization's HIPAA policies and 42 CFR Part 2 regulations.
        </div>
        
        <h1>EVV Compliance Report</h1>
        <div class="subtitle">Date: ${date} &bull; Generated: ${new Date().toLocaleString()} &bull; CONFIDENTIAL</div>
        
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-value">${metrics.totalVisits}</div>
            <div class="kpi-label">Total Visits</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${metrics.completed}</div>
            <div class="kpi-label">Completed</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value">${metrics.evvTransmitted}</div>
            <div class="kpi-label">EVV Transmitted</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-value" style="color: ${metrics.complianceRate >= 90 ? '#059669' : metrics.complianceRate >= 75 ? '#d97706' : '#dc2626'}">
              ${metrics.complianceRate}%
            </div>
            <div class="kpi-label">Compliance Rate</div>
          </div>
        </div>
        
        <h2>Visit Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>MRN</th>
              <th>Caregiver</th>
              <th>Discipline</th>
              <th>Time</th>
              <th>Status</th>
              <th>EVV</th>
              <th>Doc</th>
              <th>Conflicts</th>
            </tr>
          </thead>
          <tbody>
            ${visits.map(v => `
              <tr>
                <td><strong>${v.patientName}</strong></td>
                <td>${v.patientMrn}</td>
                <td>${v.caregiverName}</td>
                <td>${v.discipline}</td>
                <td>${v.actualStartTime || v.scheduledTime}${v.actualEndTime ? ' – ' + v.actualEndTime : ''}</td>
                <td><span class="badge ${
                  v.status === 'completed' ? 'badge-green' :
                  v.status === 'in_progress' ? 'badge-blue' :
                  v.status === 'missing_clock_out' ? 'badge-red' : 'badge-gray'
                }">${v.status.replace(/_/g, ' ')}</span></td>
                <td><span class="badge ${
                  v.evvStatus === 'transmitted' || v.evvStatus === 'verified' ? 'badge-green' :
                  v.evvStatus === 'evv_error' || v.evvStatus === 'exception' ? 'badge-red' :
                  v.evvStatus === 'clocked_in' ? 'badge-blue' : 'badge-gray'
                }">${v.evvStatus.replace(/_/g, ' ')}</span></td>
                <td><span class="badge ${
                  v.docStatus === 'completed' ? 'badge-green' :
                  v.docStatus === 'in_progress' ? 'badge-blue' :
                  v.docStatus === 'pending' ? 'badge-amber' : 'badge-gray'
                }">${v.docStatus}</span></td>
                <td>${v.conflicts.length > 0 ? v.conflicts.map(c => c.replace(/_/g, ' ')).join(', ') : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${evvErrors.length > 0 ? `
          <h2>EVV Errors (${evvErrors.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Patient</th>
                <th>Caregiver</th>
                <th>Description</th>
                <th>Severity</th>
                <th>Suggested Fix</th>
              </tr>
            </thead>
            <tbody>
              ${evvErrors.map(e => `
                <tr>
                  <td><strong>${e.errorCode}</strong></td>
                  <td>${e.visit.patientName}</td>
                  <td>${e.visit.caregiverName}</td>
                  <td>${e.errorDescription}</td>
                  <td><span class="badge ${e.severity === 'high' ? 'badge-red' : e.severity === 'medium' ? 'badge-amber' : 'badge-gray'}">${e.severity}</span></td>
                  <td style="max-width: 200px">${e.suggestedFix}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
        
        <div class="footer">
          Generated by PointOfCare Monitor &bull; ${new Date().toISOString()} &bull; 
          This report is for authorized personnel only
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }, [visits, metrics, evvErrors, date]);

  const handleExportCSV = useCallback(() => {
    const headers = ['Patient', 'MRN', 'Admission', 'Caregiver', 'Discipline', 'Visit Type', 'Scheduled Time', 'Clock In', 'Clock Out', 'Status', 'EVV Status', 'Doc Status', 'Conflicts'];
    const rows = visits.map(v => [
      v.patientName,
      v.patientMrn,
      v.admissionLabel,
      v.caregiverName,
      v.discipline,
      v.visitType,
      v.scheduledTime,
      v.actualStartTime || '',
      v.actualEndTime || '',
      v.status,
      v.evvStatus,
      v.docStatus,
      v.conflicts.join('; '),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evv-compliance-report-${date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [visits, date]);

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={handlePrint}
      >
        <Printer className="size-3.5" />
        Print Report
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-xs"
        onClick={handleExportCSV}
      >
        <Download className="size-3.5" />
        Export CSV
      </Button>
      <div ref={printRef} className="hidden" />
    </div>
  );
}
