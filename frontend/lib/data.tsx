import { LayoutDashboard, Users, BarChart3, Settings, AlertCircle, AlertTriangle } from "lucide-react";
import { StudentActivity, Notification, NavItem, Student, ArchivedStudent } from './types';

export const activities: StudentActivity[] = [
  { color: 'bg-emerald-400', name: 'John Doe', id: 'STU-2026-0042', action: 'Created', type: 'created', by: 'Admin', time: '2 hours ago' },
  { color: 'bg-blue-400', name: 'Jane Smith', id: 'STU-2025-0112', action: 'Updated (Added Emergency Contact)', type: 'updated', by: 'Registrar', time: '4 hours ago' },
  { color: 'bg-red-400', name: 'Bob Johnson', id: 'STU-2024-0005', action: 'Archived', type: 'archived', by: 'Registrar', time: '1 day ago' },
  { color: 'bg-emerald-400', name: 'Priya Patel', id: 'STU-2026-0041', action: 'Created', type: 'created', by: 'Admin', time: '1 day ago' },
  { color: 'bg-blue-400', name: 'Marcus Lee', id: 'STU-2025-0111', action: 'Updated (Changed Program)', type: 'updated', by: 'Admin', time: '2 days ago' },
  { color: 'bg-blue-400', name: 'Sofia Garcia', id: 'STU-2025-0110', action: 'Updated (Email Verified)', type: 'updated', by: 'System', time: '2 days ago' },
];

export const notifications: Notification[] = [
  { icon: <AlertCircle className="w-5 h-5 text-red-400" />, title: '23 students missing Emergency Contacts', description: 'Action required', timestamp: '2h ago' },
  { icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />, title: '15 students missing Personal Contact Info', description: 'Action required', timestamp: '5h ago' },
  { icon: <AlertTriangle className="w-5 h-5 text-orange-400" />, title: '8 Emergency Contacts have missing phone/email', description: 'Action required', timestamp: '1d ago' },
];

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/registrar', icon: <LayoutDashboard className="w-5 h-5 text-indigo-400" /> },
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

export const archivedStudentsData: ArchivedStudent[] = [
  { id: 'STU-2024-0005', name: 'Bob Johnson', email: 'bob.johnson@srs.edu', program: 'Engineering', reason: 'graduated', archivedDate: '2025-07-31', archivedBy: 'Registrar', avatar: 'BJ' },
  { id: 'STU-2023-0089', name: 'Maria Santos', email: 'maria.santos@srs.edu', program: 'Business Administration', reason: 'transferred', archivedDate: '2025-07-28', archivedBy: 'Admin', avatar: 'MS' },
  { id: 'STU-2024-0012', name: 'James Chen', email: 'james.chen@srs.edu', program: 'Computer Science', reason: 'withdrawn', archivedDate: '2025-07-25', archivedBy: 'Registrar', avatar: 'JC' },
  { id: 'STU-2023-0045', name: 'Aisha Mohammed', email: 'aisha.mohammed@srs.edu', program: 'Medicine', reason: 'graduated', archivedDate: '2025-07-20', archivedBy: 'Admin', avatar: 'AM' },
  { id: 'STU-2024-0023', name: 'Thomas Anderson', email: 'thomas.anderson@srs.edu', program: 'Arts', reason: 'deleted', archivedDate: '2025-07-18', archivedBy: 'Registrar', avatar: 'TA' },
  { id: 'STU-2023-0067', name: 'Yuki Tanaka', email: 'yuki.tanaka@srs.edu', program: 'Engineering', reason: 'transferred', archivedDate: '2025-07-15', archivedBy: 'Admin', avatar: 'YT' },
  { id: 'STU-2024-0034', name: 'Olivia Brown', email: 'olivia.brown@srs.edu', program: 'Business Administration', reason: 'graduated', archivedDate: '2025-07-12', archivedBy: 'Registrar', avatar: 'OB' },
  { id: 'STU-2023-0078', name: 'Raj Kapoor', email: 'raj.kapoor@srs.edu', program: 'Computer Science', reason: 'withdrawn', archivedDate: '2025-07-10', archivedBy: 'Admin', avatar: 'RK' },
  { id: 'STU-2024-0045', name: 'Sophie Martin', email: 'sophie.martin@srs.edu', program: 'Medicine', reason: 'graduated', archivedDate: '2025-07-08', archivedBy: 'Registrar', avatar: 'SM' },
  { id: 'STU-2023-0091', name: 'Daniel Kim', email: 'daniel.kim@srs.edu', program: 'Arts', reason: 'transferred', archivedDate: '2025-07-05', archivedBy: 'Admin', avatar: 'DK' },
  { id: 'STU-2024-0056', name: 'Isabella Rossi', email: 'isabella.rossi@srs.edu', program: 'Engineering', reason: 'withdrawn', archivedDate: '2025-07-03', archivedBy: 'Registrar', avatar: 'IR' },
  { id: 'STU-2023-0102', name: 'Michael O\'Brien', email: 'michael.obrien@srs.edu', program: 'Business Administration', reason: 'deleted', archivedDate: '2025-07-01', archivedBy: 'Admin', avatar: 'MO' },
];