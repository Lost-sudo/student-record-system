export interface StudentActivity {
  color: string;
  name: string;
  id: string;
  action: string;
  type: 'created' | 'updated' | 'archived';
  by: string;
  time: string;
}

export interface Notification {
  icon: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: string;
  submenu?: SubMenuItem[];
}

export interface SubMenuItem {
  label: string;
  href: string;
}