import { ReactNode } from "react";

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
  icon: ReactNode;
  title: string;
  description: string;
  timestamp: string;
}

export interface NavItem {
  label: string;
  href?: string;
  icon: ReactNode;
  submenu?: SubMenuItem[];
}

export interface SubMenuItem {
  label: string;
  href: string;
}

export interface Student {
    id: string;
    name: string;
    email: string;
    program: string;
    status: "active" | "inactive" | "pending";
    enrolled: string;
    avatar: string;
}

export interface ArchivedStudent {
    id: string;
    name: string;
    email: string;
    program: string;
    avatar: string;
    gender: string;
    archivedAt: string;
}

export interface ArchivedFilterState {
    search: string;
    gender: string;
    program: string;
}

export interface FilterState {
    search: string;
    status: string;
    program: string;
}

export interface Breadcrumb {
    label: string;
    href?: string;
}