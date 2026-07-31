import { useAuth } from "@/providers/AuthProvider";


export function usePermissions() {
  const { can, hasRole, role, permissions, isAuthenticated, isLoading } = useAuth();

  return {
    can,
    hasRole,
    role,
    permissions,
    isAuthenticated,
    isLoading,
  };
}