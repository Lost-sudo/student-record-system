import { LayoutDashboard, Users, BarChart3, Settings } from "lucide-react";
import { StudentActivity, Notification, NavItem, Student } from './types';

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
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5 text-indigo-400" /> },
  { 
    label: 'Student Records', 
    icon: <Users className="w-5 h-5 text-cyan-400" />,
    submenu: [
      { label: 'All Active Students', href: '/students' },
      { label: 'Archived / Deleted', href: '/students/archived' },
    ]
  },
  { label: 'Reports & Analytics', href: '#', icon: <BarChart3 className="w-5 h-5 text-purple-400" /> },
];

export const adminNavItems: NavItem[] = [
  { 
    label: 'Administration', 
    icon: <Settings className="w-5 h-5 text-slate-400" />,
    submenu: [
      { label: 'User Management', href: '#' },
      { label: 'System Settings', href: '#' },
    ]
  },
];

export const studentsData: Student[] = [
  { id: 'STU-2026-0042', name: 'John Doe', email: 'john.doe@srs.edu', program: 'Computer Science', status: 'active', enrolled: '2026-01-15', avatar: 'JD' },
  { id: 'STU-2025-0112', name: 'Jane Smith', email: 'jane.smith@srs.edu', program: 'Business Administration', status: 'active', enrolled: '2025-09-01', avatar: 'JS' },
  { id: 'STU-2024-0005', name: 'Bob Johnson', email: 'bob.johnson@srs.edu', program: 'Engineering', status: 'active', enrolled: '2024-01-10', avatar: 'BJ' },
  { id: 'STU-2026-0041', name: 'Priya Patel', email: 'priya.patel@srs.edu', program: 'Medicine', status: 'active', enrolled: '2026-01-12', avatar: 'PP' },
  { id: 'STU-2025-0111', name: 'Marcus Lee', email: 'marcus.lee@srs.edu', program: 'Computer Science', status: 'active', enrolled: '2025-09-01', avatar: 'ML' },
  { id: 'STU-2025-0110', name: 'Sofia Garcia', email: 'sofia.garcia@srs.edu', program: 'Arts', status: 'active', enrolled: '2025-09-01', avatar: 'SG' },
  { id: 'STU-2026-0040', name: 'Ahmed Hassan', email: 'ahmed.hassan@srs.edu', program: 'Engineering', status: 'active', enrolled: '2026-01-10', avatar: 'AH' },
  { id: 'STU-2025-0109', name: 'Emma Wilson', email: 'emma.wilson@srs.edu', program: 'Business Administration', status: 'active', enrolled: '2025-09-01', avatar: 'EW' },
  { id: 'STU-2026-0039', name: 'Li Wei', email: 'li.wei@srs.edu', program: 'Computer Science', status: 'active', enrolled: '2026-01-08', avatar: 'LW' },
  { id: 'STU-2025-0108', name: 'Carlos Rodriguez', email: 'carlos.rodriguez@srs.edu', program: 'Medicine', status: 'active', enrolled: '2025-09-01', avatar: 'CR' },
  { id: 'STU-2026-0038', name: 'Fatima Al-Sayed', email: 'fatima.alsayed@srs.edu', program: 'Arts', status: 'active', enrolled: '2026-01-05', avatar: 'FA' },
  { id: 'STU-2025-0107', name: 'David Kim', email: 'david.kim@srs.edu', program: 'Engineering', status: 'active', enrolled: '2025-09-01', avatar: 'DK' },
];