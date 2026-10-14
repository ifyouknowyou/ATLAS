import type { Permission } from '@atlas/shared';
import {
  Activity,
  Bell,
  Bot,
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
  { href: '/search', label: 'Search', icon: Search },
  {
    href: '/investigations',
    label: 'Investigations',
    icon: Search,
    permission: 'investigation.read',
  },
  {
    href: '/entities',
    label: 'Entities',
    icon: Users,
    permission: 'entity.read',
  },
  {
    href: '/graph',
    label: 'Graph',
    icon: Radar,
    permission: 'investigation.read',
  },
  { href: '/map', label: 'Map', icon: Map, permission: 'entity.read' },
  {
    href: '/timeline',
    label: 'Timeline',
    icon: Activity,
    permission: 'investigation.read',
  },
  {
    href: '/evidence',
    label: 'Evidence',
    icon: Landmark,
    permission: 'evidence.read',
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: FileText,
    permission: 'report.read',
  },
  {
    href: '/assistant',
    label: 'AI Assistant',
    icon: Bot,
    permission: 'investigation.read',
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
  { title: 'INTELLIGENCE', items: primary },
  { title: 'OPERATIONS', items: secondary },
];

export function pageTitleFor(pathname: string): string {
  const all = [...primary, ...secondary];
  const match = all.find((item) => pathname.startsWith(item.href));
  return match?.label ?? 'ATLAS';
}