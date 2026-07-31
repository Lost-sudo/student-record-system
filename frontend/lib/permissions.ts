import type { Permission, RolePermission, UserRole } from '@/types/auth';
import { ROLE_PERMISSIONS } from '@/types/auth';

const ALL_PERMISSIONS: Permission[] = [
  'students:create',
  'students:update',
  'students:delete',
  'students:view',
  'contactInfo:create',
  'contactInfo:update',
  'contactInfo:delete',
  'contactInfo:view',
  'emergencyContact:create',
  'emergencyContact:update',
  'emergencyContact:delete',
  'emergencyContact:view',
];

export function expandPermissions(perms: RolePermission[]): Permission[] {
  const expanded = new Set<Permission>();

  for (const perm of perms) {
    if (perm === '*') {
      for (const p of ALL_PERMISSIONS) {
        expanded.add(p);
      }
    } else if (perm.endsWith(':*')) {
      const prefix = perm.slice(0, -2);
      for (const p of ALL_PERMISSIONS) {
        if (p.startsWith(prefix + ':')) {
          expanded.add(p);
        }
      }
    } else {
      expanded.add(perm as Permission);
    }
  }

  return Array.from(expanded);
}

export function hasPermission(
  userPermissions: RolePermission[],
  required: Permission
): boolean {
  const expanded = expandPermissions(userPermissions);
  return expanded.includes(required);
}

export function getPermissionsForRole(role: UserRole): RolePermission[] {
  return ROLE_PERMISSIONS[role];
}