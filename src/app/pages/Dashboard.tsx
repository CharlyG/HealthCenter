/**
 * Dashboard - Role-Aware Home/Workspace
 * Dynamically shows the appropriate workspace based on user role
 */
import { lazy, Suspense } from 'react';

// Lazy load the workspace to avoid loading all workspaces upfront
const RoleAwareWorkspace = lazy(() => import('./workspaces/RoleAwareWorkspace'));

function LoadingFallback() {
  return (
    <div className="size-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm text-gray-500">Loading workspace...</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RoleAwareWorkspace />
    </Suspense>
  );
}
