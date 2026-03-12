/**
 * CaregiverFieldMap — Interactive schematic map showing caregiver positions
 * relative to patient locations with real-time visit status indicators.
 * Uses SVG-based rendering (no external map provider needed).
 *
 * Features:
 * - Color-coded caregiver pins by visit status
 * - Connecting lines between caregiver and patient locations
 * - Hover tooltip with visit details
 * - Legend and KPI summary
 * - Simulate Clock In / Clock Out controls
 */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  MapPin, User, Navigation, Clock, CheckCircle, AlertTriangle,
  Play, Square, Zap, Phone, ChevronRight, Home, Activity,
  Timer, Signal, ArrowRight, Smartphone,
} from 'lucide-react';
import type { MonitorVisit, VisitStatus, EvvStatus } from './MonitorTypes';
import { VISIT_STATUS_CONFIG, EVV_STATUS_CONFIG } from './MonitorTypes';
import { useNavigate } from 'react-router';

// ─── Simulated GPS coordinates (grid-based) ────────────────────────────────

interface MapNode {
  id: string;
  label: string;
  type: 'caregiver' | 'patient';
  x: number; // 0-100 percentage
  y: number;
  visitId?: string;
}

// Generate deterministic positions from IDs
function hashPosition(id: string, seed: number): number {
  let hash = seed;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function generateMapNodes(visits: MonitorVisit[]): MapNode[] {
  const nodes: MapNode[] = [];
  const usedPositions = new Set<string>();

  const getUniquePos = (id: string, seedX: number, seedY: number): { x: number; y: number } => {
    let x = 10 + (hashPosition(id, seedX) % 80);
    let y = 10 + (hashPosition(id, seedY) % 75);
    let key = `${Math.round(x / 5)}-${Math.round(y / 5)}`;
    let attempts = 0;
    while (usedPositions.has(key) && attempts < 20) {
      x = 10 + ((x + 7) % 80);
      y = 10 + ((y + 11) % 75);
      key = `${Math.round(x / 5)}-${Math.round(y / 5)}`;
      attempts++;
    }
    usedPositions.add(key);
    return { x, y };
  };

  // Track caregivers and patients we've already placed
  const placedCaregivers = new Set<string>();
  const placedPatients = new Set<string>();

  for (const visit of visits) {
    // Patient node
    if (!placedPatients.has(visit.patientId)) {
      const pos = getUniquePos(visit.patientId, 42, 97);
      nodes.push({
        id: `pat-${visit.patientId}`,
        label: visit.patientName,
        type: 'patient',
        x: pos.x,
        y: pos.y,
        visitId: visit.id,
      });
      placedPatients.add(visit.patientId);
    }

    // Caregiver node (only if assigned)
    if (visit.caregiverId && !placedCaregivers.has(visit.caregiverId)) {
      // Place caregiver near their patient but offset
      const patNode = nodes.find(n => n.id === `pat-${visit.patientId}`);
      let cx = patNode ? patNode.x + (hashPosition(visit.caregiverId, 13) % 15) - 7 : 50;
      let cy = patNode ? patNode.y + (hashPosition(visit.caregiverId, 29) % 15) - 7 : 50;
      cx = Math.max(5, Math.min(95, cx));
      cy = Math.max(5, Math.min(90, cy));

      // If in_progress, place very close (at patient)
      if (visit.status === 'in_progress' || visit.status === 'missing_clock_out') {
        cx = patNode ? patNode.x + 2 : cx;
        cy = patNode ? patNode.y - 3 : cy;
      }

      nodes.push({
        id: `cg-${visit.caregiverId}`,
        label: visit.caregiverName,
        type: 'caregiver',
        x: cx,
        y: cy,
        visitId: visit.id,
      });
      placedCaregivers.add(visit.caregiverId);
    }
  }

  return nodes;
}

// ─── Status to color mapping ────────────────────────────────────────────────

function getStatusColor(status: VisitStatus): string {
  switch (status) {
    case 'completed': return '#10b981';
    case 'in_progress': return '#3b82f6';
    case 'scheduled': return '#9ca3af';
    case 'missing_clock_out': return '#ef4444';
    case 'missed': return '#f97316';
    case 'cancelled': return '#6b7280';
    default: return '#9ca3af';
  }
}

function getEvvColor(evvStatus: EvvStatus): string {
  switch (evvStatus) {
    case 'transmitted':
    case 'verified': return '#10b981';
    case 'clocked_in': return '#3b82f6';
    case 'evv_error':
    case 'exception': return '#ef4444';
    default: return '#9ca3af';
  }
}

// ─── Caregiver Sidebar Card ────────────────────────────────────────────────

interface CaregiverCardProps {
  visit: MonitorVisit;
  isSelected: boolean;
  onClick: () => void;
  onSimulateClockIn: () => void;
  onSimulateClockOut: () => void;
}

const CaregiverCard = React.memo(function CaregiverCard({
  visit, isSelected, onClick, onSimulateClockIn, onSimulateClockOut,
}: CaregiverCardProps) {
  const statusCfg = VISIT_STATUS_CONFIG[visit.status];
  const canClockIn = visit.status === 'scheduled';
  const canClockOut = visit.status === 'in_progress' || visit.status === 'missing_clock_out';

  return (
    <div
      className={cn(
        'px-3 py-2.5 border rounded-xl cursor-pointer transition-all',
        isSelected
          ? 'border-blue-300 bg-blue-50/80 shadow-sm ring-1 ring-blue-200'
          : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm',
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: getStatusColor(visit.status) + '20' }}>
          <User className="size-3.5" style={{ color: getStatusColor(visit.status) }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 truncate">{visit.caregiverName}</p>
          <p className="text-[10px] text-gray-400 truncate">{visit.patientName}</p>
        </div>
        <span className={cn('shrink-0 w-2 h-2 rounded-full', statusCfg.dot)} />
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="outline" className="text-[9px] h-4 px-1 rounded">
          {visit.discipline}
        </Badge>
        <span className={cn('text-[9px] font-semibold', statusCfg.color)}>{statusCfg.label}</span>
        <span className="text-[9px] text-gray-400 tabular-nums">{visit.scheduledTime}</span>
      </div>

      {/* Simulate buttons */}
      {(canClockIn || canClockOut) && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
          {canClockIn && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-[10px] gap-1 flex-1 bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              onClick={(e) => { e.stopPropagation(); onSimulateClockIn(); }}
            >
              <Play className="size-3" />
              Sim. Clock In
            </Button>
          )}
          {canClockOut && (
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-[10px] gap-1 flex-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              onClick={(e) => { e.stopPropagation(); onSimulateClockOut(); }}
            >
              <Square className="size-3" />
              Sim. Clock Out
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

// ─── Map Tooltip ────────────────────────────────────────────────────────────

function MapTooltip({ visit, x, y, containerRef }: {
  visit: MonitorVisit; x: number; y: number; containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const statusCfg = VISIT_STATUS_CONFIG[visit.status];
  const evvCfg = EVV_STATUS_CONFIG[visit.evvStatus];

  return (
    <div
      className="absolute z-30 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-56 pointer-events-none"
      style={{
        left: `${Math.min(x, 75)}%`,
        top: `${Math.max(y - 2, 0)}%`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
          <span className="text-[9px] font-bold text-blue-700">
            {visit.patientName.split(', ').map(w => w?.[0] || '').join('')}
          </span>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-800">{visit.patientName}</p>
          <p className="text-[9px] text-gray-400">{visit.patientMrn}</p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-500">Caregiver</span>
          <span className="font-medium text-gray-700">{visit.caregiverName}</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-500">Status</span>
          <span className={cn('font-semibold', statusCfg.color)}>{statusCfg.label}</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-500">EVV</span>
          <span className={cn('font-semibold', evvCfg.color)}>{evvCfg.label}</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-500">Time</span>
          <span className="font-medium text-gray-700 tabular-nums">
            {visit.actualStartTime || visit.scheduledTime}
            {visit.actualEndTime ? ` – ${visit.actualEndTime}` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Street grid background ────────────────────────────────────────────────

function StreetGrid() {
  return (
    <g>
      {/* Major roads */}
      {[20, 40, 60, 80].map(x => (
        <line key={`v-${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#e5e7eb" strokeWidth="2" />
      ))}
      {[20, 45, 70, 90].map(y => (
        <line key={`h-${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#e5e7eb" strokeWidth="2" />
      ))}
      {/* Minor roads */}
      {[10, 30, 50, 70, 90].map(x => (
        <line key={`vm-${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4,4" />
      ))}
      {[10, 30, 55, 80].map(y => (
        <line key={`hm-${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4,4" />
      ))}
      {/* Area labels */}
      <text x="10%" y="8%" fontSize="10" fill="#d1d5db" fontWeight="600" fontFamily="sans-serif">NORTH DISTRICT</text>
      <text x="60%" y="8%" fontSize="10" fill="#d1d5db" fontWeight="600" fontFamily="sans-serif">EAST DISTRICT</text>
      <text x="10%" y="98%" fontSize="10" fill="#d1d5db" fontWeight="600" fontFamily="sans-serif">SOUTH DISTRICT</text>
      <text x="60%" y="98%" fontSize="10" fill="#d1d5db" fontWeight="600" fontFamily="sans-serif">DOWNTOWN</text>
    </g>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface CaregiverFieldMapProps {
  visits: MonitorVisit[];
  onSimulateClockIn: (visit: MonitorVisit) => void;
  onSimulateClockOut: (visit: MonitorVisit) => void;
  onViewVisit: (visit: MonitorVisit) => void;
}

export default function CaregiverFieldMap({
  visits, onSimulateClockIn, onSimulateClockOut, onViewVisit,
}: CaregiverFieldMapProps) {
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Assigned visits (have caregiver)
  const assignedVisits = useMemo(() =>
    visits.filter(v => v.caregiverId && v.status !== 'cancelled'),
    [visits]
  );

  // Map nodes
  const nodes = useMemo(() => generateMapNodes(assignedVisits), [assignedVisits]);

  // Build connections (caregiver → patient)
  const connections = useMemo(() => {
    const conns: { from: MapNode; to: MapNode; visit: MonitorVisit }[] = [];
    for (const v of assignedVisits) {
      const cgNode = nodes.find(n => n.id === `cg-${v.caregiverId}`);
      const patNode = nodes.find(n => n.id === `pat-${v.patientId}`);
      if (cgNode && patNode) conns.push({ from: cgNode, to: patNode, visit: v });
    }
    return conns;
  }, [nodes, assignedVisits]);

  const selectedVisit = useMemo(() =>
    assignedVisits.find(v => v.id === selectedVisitId) || null,
    [assignedVisits, selectedVisitId]
  );

  // Legend counts
  const counts = useMemo(() => ({
    inProgress: assignedVisits.filter(v => v.status === 'in_progress').length,
    completed: assignedVisits.filter(v => v.status === 'completed').length,
    scheduled: assignedVisits.filter(v => v.status === 'scheduled').length,
    alert: assignedVisits.filter(v => v.status === 'missing_clock_out' || v.conflicts.length > 0).length,
  }), [assignedVisits]);

  const hoveredVisit = useMemo(() => {
    if (!hoveredNode) return null;
    const node = nodes.find(n => n.id === hoveredNode);
    if (!node?.visitId) return null;
    return assignedVisits.find(v => v.id === node.visitId) || null;
  }, [hoveredNode, nodes, assignedVisits]);

  const hoveredNodeObj = useMemo(() =>
    hoveredNode ? nodes.find(n => n.id === hoveredNode) : null,
    [hoveredNode, nodes]
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* ═══ Left: Map ════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-gray-50/50" ref={containerRef}>
        {/* Map legend */}
        <div className="shrink-0 px-5 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Navigation className="size-4 text-blue-500" />
              Caregiver Field Map
            </h3>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500" /> In Progress ({counts.inProgress})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Completed ({counts.completed})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-gray-400" /> Scheduled ({counts.scheduled})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" /> Alert ({counts.alert})
              </span>
              <span className="flex items-center gap-1 ml-2">
                <Home className="size-3 text-amber-500" /> Patient Home
              </span>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {assignedVisits.length} active visits
          </Badge>
        </div>

        {/* SVG Map */}
        <div className="flex-1 relative overflow-hidden">
          <svg
            className="size-full"
            viewBox="0 0 800 500"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background */}
            <rect width="800" height="500" fill="#fafafa" />
            <StreetGrid />

            {/* Connection lines */}
            {connections.map(conn => {
              const isActive = conn.visit.status === 'in_progress' || conn.visit.status === 'missing_clock_out';
              const isSelected = conn.visit.id === selectedVisitId;
              return (
                <line
                  key={`line-${conn.from.id}-${conn.to.id}`}
                  x1={`${conn.from.x}%`}
                  y1={`${conn.from.y}%`}
                  x2={`${conn.to.x}%`}
                  y2={`${conn.to.y}%`}
                  stroke={isSelected ? '#3b82f6' : isActive ? getStatusColor(conn.visit.status) : '#d1d5db'}
                  strokeWidth={isSelected ? 3 : isActive ? 2 : 1}
                  strokeDasharray={isActive ? '' : '4,4'}
                  opacity={isSelected ? 1 : 0.6}
                />
              );
            })}

            {/* Patient pins */}
            {nodes.filter(n => n.type === 'patient').map(node => {
              const visit = assignedVisits.find(v => v.id === node.visitId);
              const isSelected = visit?.id === selectedVisitId;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x * 8}, ${node.y * 5})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => visit && setSelectedVisitId(visit.id === selectedVisitId ? null : visit.id)}
                >
                  {/* House icon background */}
                  <rect
                    x="-10" y="-10" width="20" height="20" rx="6"
                    fill={isSelected ? '#fef3c7' : '#fff7ed'}
                    stroke={isSelected ? '#f59e0b' : '#fed7aa'}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  {/* Home icon */}
                  <path d="M0,-5 L5,0 L4,0 L4,5 L-4,5 L-4,0 L-5,0 Z" fill="#f59e0b" opacity="0.8" />
                  {/* Label */}
                  <text
                    x="0" y="18" textAnchor="middle"
                    fontSize="7" fill="#92400e" fontWeight="600" fontFamily="sans-serif"
                  >
                    {node.label.split(', ')[0]}
                  </text>
                </g>
              );
            })}

            {/* Caregiver pins */}
            {nodes.filter(n => n.type === 'caregiver').map(node => {
              const visit = assignedVisits.find(v => `cg-${v.caregiverId}` === node.id);
              if (!visit) return null;
              const color = getStatusColor(visit.status);
              const isSelected = visit.id === selectedVisitId;
              const isAlert = visit.status === 'missing_clock_out';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x * 8}, ${node.y * 5})`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedVisitId(visit.id === selectedVisitId ? null : visit.id)}
                >
                  {/* Pulse ring for active/alert */}
                  {(visit.status === 'in_progress' || isAlert) && (
                    <circle
                      cx="0" cy="0" r="14"
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      opacity="0.3"
                    >
                      <animate attributeName="r" from="14" to="22" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Pin circle */}
                  <circle
                    cx="0" cy="0"
                    r={isSelected ? 12 : 10}
                    fill={color}
                    stroke="white"
                    strokeWidth="3"
                    filter="url(#shadow)"
                  />
                  {/* Initials */}
                  <text
                    x="0" y="1" textAnchor="middle" dominantBaseline="middle"
                    fontSize="7" fill="white" fontWeight="700" fontFamily="sans-serif"
                  >
                    {node.label.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </text>
                  {/* Discipline badge */}
                  <rect x="6" y="-14" width="18" height="11" rx="4" fill="white" stroke={color} strokeWidth="1" />
                  <text x="15" y="-7" textAnchor="middle" fontSize="6" fill={color} fontWeight="700" fontFamily="sans-serif">
                    {visit.discipline}
                  </text>
                </g>
              );
            })}

            {/* Shadow filter */}
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
              </filter>
            </defs>
          </svg>

          {/* Hover tooltip */}
          {hoveredVisit && hoveredNodeObj && (
            <MapTooltip
              visit={hoveredVisit}
              x={hoveredNodeObj.x}
              y={hoveredNodeObj.y}
              containerRef={containerRef}
            />
          )}
        </div>
      </div>

      {/* ═══ Right: Sidebar ════════════════════════════════════════════════════ */}
      <div className="w-72 shrink-0 border-l border-gray-200 bg-white flex flex-col">
        <div className="shrink-0 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Activity className="size-4 text-emerald-500" />
              Field Caregivers
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] gap-1"
              onClick={() => navigate('/poc/caregiver-field-app')}
            >
              <Smartphone className="size-3" />
              Field App
            </Button>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {assignedVisits.length} caregivers • Click to highlight on map
          </p>
        </div>

        <ScrollArea className="flex-1 px-3 py-3">
          <div className="space-y-2">
            {assignedVisits.map(v => (
              <CaregiverCard
                key={v.id}
                visit={v}
                isSelected={v.id === selectedVisitId}
                onClick={() => setSelectedVisitId(v.id === selectedVisitId ? null : v.id)}
                onSimulateClockIn={() => onSimulateClockIn(v)}
                onSimulateClockOut={() => onSimulateClockOut(v)}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Selected visit detail */}
        {selectedVisit && (
          <div className="shrink-0 px-4 py-3 border-t border-gray-200 bg-blue-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-700">Selected Visit</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] gap-1 text-blue-600"
                onClick={() => onViewVisit(selectedVisit)}
              >
                Details <ChevronRight className="size-3" />
              </Button>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Patient</span>
                <span className="font-medium text-gray-700">{selectedVisit.patientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Caregiver</span>
                <span className="font-medium text-gray-700">{selectedVisit.caregiverName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-gray-700 tabular-nums">
                  {selectedVisit.actualStartTime || selectedVisit.scheduledTime}
                  {selectedVisit.actualEndTime ? ` – ${selectedVisit.actualEndTime}` : ''}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}