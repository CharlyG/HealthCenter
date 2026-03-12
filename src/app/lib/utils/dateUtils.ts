/**
 * Utility functions for date operations
 */

/**
 * Check if a date is valid
 */
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function calculateAge(dob: string | Date | null | undefined): number {
  if (!dob) return 0;
  
  const birthDate = typeof dob === 'string' ? new Date(dob) : dob;
  
  if (!isValidDate(birthDate)) {
    return 0;
  }
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function formatDate(date: string | Date | null | undefined, format: 'short' | 'long' | 'iso' = 'short'): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValidDate(d)) {
    return 'Invalid Date';
  }
  
  if (format === 'iso') {
    return d.toISOString().split('T')[0];
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValidDate(d)) {
    return 'Invalid Date';
  }
  
  return d.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (!isValidDate(d)) {
    return 'Invalid Date';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(d);
}