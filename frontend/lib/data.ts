import { StudentActivity, Notification, NavItem } from './types';

export const activities: StudentActivity[] = [
  { color: 'bg-emerald-400', name: 'John Doe', id: 'STU-2026-0042', action: 'Created', type: 'created', by: 'Admin', time: '2 hours ago' },
  { color: 'bg-blue-400', name: 'Jane Smith', id: 'STU-2025-0112', action: 'Updated (Added Emergency Contact)', type: 'updated', by: 'Registrar', time: '4 hours ago' },
  { color: 'bg-red-400', name: 'Bob Johnson', id: 'STU-2024-0005', action: 'Archived', type: 'archived', by: 'Registrar', time: '1 day ago' },
  { color: 'bg-emerald-400', name: 'Priya Patel', id: 'STU-2026-0041', action: 'Created', type: 'created', by: 'Admin', time: '1 day ago' },
  { color: 'bg-blue-400', name: 'Marcus Lee', id: 'STU-2025-0111', action: 'Updated (Changed Program)', type: 'updated', by: 'Admin', time: '2 days ago' },
  { color: 'bg-blue-400', name: 'Sofia Garcia', id: 'STU-2025-0110', action: 'Updated (Email Verified)', type: 'updated', by: 'System', time: '2 days ago' },
];

export const notifications: Notification[] = [
  { icon: '🔴', title: '23 students missing Emergency Contacts', description: 'Action required', timestamp: '2h ago' },
  { icon: '🟡', title: '15 students missing Personal Contact Info', description: 'Action required', timestamp: '5h ago' },
  { icon: '🟠', title: '8 Emergency Contacts have missing phone/email', description: 'Action required', timestamp: '1d ago' },
];

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '#', icon: '📊' },
  { 
    label: 'Student Records', 
    icon: '👥',
    submenu: [
      { label: 'All Active Students', href: '#' },
      { label: 'Archived / Deleted', href: '#' },
    ]
  },
  { label: 'Reports & Analytics', href: '#', icon: '📈' },
];

export const adminNavItems: NavItem[] = [
  { 
    label: 'Administration', 
    icon: '⚙️',
    submenu: [
      { label: 'User Management', href: '#' },
      { label: 'System Settings', href: '#' },
    ]
  },
];