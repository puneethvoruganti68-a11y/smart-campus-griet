// ==========================================
// Smart Campus - Constants & Configuration
// ==========================================

import { IssueCategory, IssuePriority, IssueStatus, AnalyticsTimeRange } from './types';

// ==========================================
// Branding
// ==========================================

export const BRAND = {
  name: 'Smart Campus',
  institution: 'Gokaraju Rangaraju Institute of Engineering and Technology',
  shortName: 'GRIET',
  tagline: 'Report. Route. Resolve. Improve.',
  heroTitle: 'Your Campus. Your Voice. Faster Resolution.',
  heroSubtitle: 'Report campus problems in seconds. Smart Campus identifies the issue, routes it to the right team, and keeps you updated until it\'s resolved.',
  motto: 'Making GRIET smarter, one issue at a time.',
  altMotto: 'Your campus. Your voice. Faster resolution.',
} as const;

// ==========================================
// Colors
// ==========================================

export const COLORS = {
  primary: '#1e3a5f',
  primaryLight: '#2563eb',
  primaryLighter: '#3b82f6',
  success: '#16a34a',
  successLight: '#22c55e',
  warning: '#d97706',
  warningLight: '#f59e0b',
  danger: '#dc2626',
  dangerLight: '#ef4444',
  info: '#0ea5e9',
  infoLight: '#38bdf8',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1e293b',
  textSecondary: '#475569',
  muted: '#64748b',
  border: '#e2e8f0',
} as const;

// ==========================================
// Category Configuration
// ==========================================

export const CATEGORY_CONFIG: Record<IssueCategory, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  plumbing: {
    label: 'Plumbing',
    icon: 'Droplets',
    color: '#0ea5e9',
    bgColor: '#f0f9ff',
    description: 'Water supply, drainage, leaks, taps, pipes',
  },
  electrical: {
    label: 'Electrical',
    icon: 'Zap',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    description: 'Wiring, switches, power outlets, lighting',
  },
  it_av: {
    label: 'IT / AV Equipment',
    icon: 'Monitor',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    description: 'Projectors, computers, network, AV systems',
  },
  cleanliness: {
    label: 'Cleanliness',
    icon: 'Sparkles',
    color: '#10b981',
    bgColor: '#ecfdf5',
    description: 'Cleaning, sanitation, waste management',
  },
  security: {
    label: 'Security',
    icon: 'Shield',
    color: '#ef4444',
    bgColor: '#fef2f2',
    description: 'Safety, access control, surveillance',
  },
  transport: {
    label: 'Transport',
    icon: 'Bus',
    color: '#6366f1',
    bgColor: '#eef2ff',
    description: 'Campus buses, parking, vehicle access',
  },
  furniture: {
    label: 'Furniture',
    icon: 'Armchair',
    color: '#78716c',
    bgColor: '#f5f5f4',
    description: 'Desks, chairs, benches, cabinets',
  },
  civil: {
    label: 'Civil / Infrastructure',
    icon: 'Building2',
    color: '#0d9488',
    bgColor: '#f0fdfa',
    description: 'Building structure, walls, doors, windows',
  },
  housekeeping: {
    label: 'Housekeeping',
    icon: 'Home',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    description: 'Room maintenance, hostel upkeep',
  },
  other: {
    label: 'Other',
    icon: 'HelpCircle',
    color: '#64748b',
    bgColor: '#f8fafc',
    description: 'Miscellaneous issues',
  },
};

// ==========================================
// Priority Configuration
// ==========================================

export const PRIORITY_CONFIG: Record<IssuePriority, {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  order: number;
}> = {
  low: {
    label: 'Low',
    color: '#22c55e',
    bgColor: '#f0fdf4',
    textColor: '#166534',
    icon: 'ArrowDown',
    order: 1,
  },
  medium: {
    label: 'Medium',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    textColor: '#92400e',
    icon: 'ArrowRight',
    order: 2,
  },
  high: {
    label: 'High',
    color: '#f97316',
    bgColor: '#fff7ed',
    textColor: '#9a3412',
    icon: 'ArrowUp',
    order: 3,
  },
  critical: {
    label: 'Critical',
    color: '#ef4444',
    bgColor: '#fef2f2',
    textColor: '#991b1b',
    icon: 'AlertTriangle',
    order: 4,
  },
};

// ==========================================
// Status Configuration
// ==========================================

export const STATUS_CONFIG: Record<IssueStatus, {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  order: number;
}> = {
  reported: {
    label: 'Reported',
    color: '#6366f1',
    bgColor: '#eef2ff',
    textColor: '#3730a3',
    icon: 'FileText',
    order: 1,
  },
  assigned: {
    label: 'Assigned',
    color: '#0ea5e9',
    bgColor: '#f0f9ff',
    textColor: '#075985',
    icon: 'UserCheck',
    order: 2,
  },
  accepted: {
    label: 'Accepted',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    textColor: '#5b21b6',
    icon: 'CheckCircle',
    order: 3,
  },
  in_progress: {
    label: 'In Progress',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    textColor: '#92400e',
    icon: 'Loader',
    order: 4,
  },
  completed: {
    label: 'Completed',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    textColor: '#166534',
    icon: 'CheckCircle2',
    order: 5,
  },
  rejected: {
    label: 'Rejected',
    color: '#ef4444',
    bgColor: '#fef2f2',
    textColor: '#991b1b',
    icon: 'XCircle',
    order: 6,
  },
  duplicate: {
    label: 'Duplicate',
    color: '#64748b',
    bgColor: '#f8fafc',
    textColor: '#334155',
    icon: 'Copy',
    order: 7,
  },
  reopened: {
    label: 'Reopened',
    color: '#d97706',
    bgColor: '#fffbeb',
    textColor: '#92400e',
    icon: 'RotateCcw',
    order: 8,
  },
};

// ==========================================
// Category → Department Mapping
// ==========================================

export const CATEGORY_DEPARTMENT_MAP: Record<IssueCategory, string> = {
  plumbing: 'dept_maintenance',
  electrical: 'dept_electrical',
  it_av: 'dept_it',
  cleanliness: 'dept_housekeeping',
  security: 'dept_security',
  transport: 'dept_transport',
  furniture: 'dept_maintenance',
  civil: 'dept_maintenance',
  housekeeping: 'dept_housekeeping',
  other: 'dept_admin',
};

// ==========================================
// Buildings
// ==========================================

export const BUILDINGS = [
  { id: 'first_block', name: 'First Block', floors: ['Ground', '1st', '2nd', '3rd', '4th'] },
  { id: 'second_block', name: 'Second Block', floors: ['Ground', '1st', '2nd', '3rd', '4th'] },
  { id: 'third_block', name: 'Third Block', floors: ['Ground', '1st', '2nd', '3rd', '4th'] },
  { id: 'fourth_block', name: 'Fourth Block', floors: ['Ground', '1st', '2nd', '3rd', '4th'] },
] as const;

// ==========================================
// Analytics Time Ranges
// ==========================================

export const TIME_RANGES: AnalyticsTimeRange[] = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7days' },
  { label: '30 Days', value: '30days' },
  { label: 'All Time', value: 'all' },
];

// ==========================================
// Chart Colors
// ==========================================

export const CHART_COLORS = {
  primary: '#2563eb',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0ea5e9',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
  orange: '#f97316',
  palette: [
    '#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6',
    '#0ea5e9', '#ec4899', '#6366f1', '#14b8a6', '#f97316',
  ],
};

// ==========================================
// Ticket Number Generation
// ==========================================

let ticketCounter = 1060;
export function generateTicketNumber(): string {
  ticketCounter++;
  return `SC-${ticketCounter.toString().padStart(4, '0')}`;
}

// ==========================================
// Date Helpers
// ==========================================

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
