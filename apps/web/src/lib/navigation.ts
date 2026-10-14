import type { Permission } from '@atlas/shared';
import {
  Activity,
  AlertTriangle,
  Bell,
  Bot,
  Boxes,
  FileText,
  Globe2,
  Landmark,
  LayoutDashboard,
  Map,
  Radar,
  Scale,
  Search,
  Settings,
  Users,
  Workflow,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Permission required to see the entry (UX affordance; server enforces). */
  permission?: Permission;
}

const primary: NavItem[] = [
  { href: '/overview', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/investigations', label: 'Investigations', icon: Search, permission: 'investigation.read' },
  { href: '/intelligence', label: 'Intelligence', icon: Radar },
  { href: '/entities', label: 'Entities', icon: Users, permission: 'entity.read' },
  { href: '/graph', label: 'Knowledge Graph', icon: Boxes, permission: 'investigation.read' },
  { href: '/map', label: 'Map', icon: Map, permission: 'entity.read' },
  { href: '/timeline', label: 'Timeline', icon: Activity, permission: 'investigation.read' },
  { href: '/evidence', label: 'Evidence', icon: Landmark, permission: 'evidence.read' },
  { href: '/intelligence/alerts', label: 'Alerts', icon: AlertTriangle, permission: 'alert.read' },
  { href: '/watchlists', label: 'Watchlists', icon: Globe2, permission: 'watchlist.read' },
  { href: '/reports', label: 'Reports', icon: FileText, permission: 'report.read' },
  { href: '/intelligence/workflows', label: 'Workflows', icon: Workflow, permission: 'workflow.read' },
  { href: '/assistant', label: 'AI Assistant', icon: Bot, permission: 'investigation.read' },
  { href: '/search', label: 'Search', icon: Search },
];

const administration: NavItem[] = [
  {
    href: '/admin',
    label: 'Administration',
    icon: Settings,
    permission: 'settings.manage',
  },
];

const secondary: NavItem[] = [
  { href: '/workspace', label: 'Workspace', icon: Globe2 },
  { href: '/activity', label: 'Activity', icon: Scale },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    permission: 'settings.manage',
  },
];

export const navSections: Array<{ title: string; items: NavItem[] }> = [
  { title: 'COMMAND', items: primary },
  { title: 'OPERATIONS', items: secondary },
  { title: 'ADMINISTRATION', items: administration },
];

export function pageTitleFor(pathname: string): string {
  const all = [...primary, ...secondary, ...administration];
  const match = all
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((left, right) => right.href.length - left.href.length)[0];
  return match?.label ?? 'ATLAS';
}