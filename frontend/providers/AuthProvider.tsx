"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import { useUserData } from "@/api/stores/authStore";
import type { UserRole, Permission, UserData } from "@/types/auth";
import { ROLE_PERMISSIONS } from "@/types/auth";
import { expandPermissions, hasPermission } from "@/lib/permissions";

interface AuthContextValue {
  user: UserData | null;
  role: UserRole | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  can: (permission: Permission) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useUserData();

  const value = useMemo<AuthContextValue>(() => {
    const role = user?.role ?? null;
    const rolePerms = role ? ROLE_PERMISSIONS[role] : [];
    const permissions = expandPermissions(rolePerms);

    return {
      user: user ?? null,
      role,
      permissions,
      isAuthenticated: !!user,
      isLoading,
      can: (permission: Permission) => hasPermission(permissions, permission),
      hasRole: (roleOrRoles: UserRole | UserRole[]) => {
        if (!role) return false;
        const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
        return roles.includes(role);
      },
    };
  }, [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}