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
  icon: string;
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

export type ArchiveReason = 'graduated' | 'transferred' | 'withdrawn' | 'deleted';

export interface ArchivedStudent {
    id: string;
    name: string;
    email: string;
    program: string;
    avatar: string;
    reason: ArchiveReason;
    archivedDate: string;
    archivedBy: string;
}

export interface ArchivedFilterState {
    search: string;
    reason: string;
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