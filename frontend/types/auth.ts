export type UserRole = 'SUPER_ADMIN' | 'REGISTRAR';

export type Permission =
  | 'students:create'
  | 'students:update'
  | 'students:delete'
  | 'students:view'
  | 'contactInfo:create'
  | 'contactInfo:update'
  | 'contactInfo:delete'
  | 'contactInfo:view'
  | 'emergencyContact:create'
  | 'emergencyContact:update'
  | 'emergencyContact:delete'
  | 'emergencyContact:view';

export type RolePermission =
  | Permission
  | '*'
  | `${string}:*`;

export const ROLE_PERMISSIONS: Record<UserRole, RolePermission[]> = {
  SUPER_ADMIN: ['*'],
  REGISTRAR: ['students:*', 'contactInfo:*', 'emergencyContact:*'],
};

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}