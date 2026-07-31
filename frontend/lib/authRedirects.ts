import type { UserRole } from "@/types/auth";

export const getDashboardForRole = (role: UserRole): string => {
  switch (role) {
    case "SUPER_ADMIN":
      return "/admin/dashboard";
    case "REGISTRAR":
      return "/registrar/dashboard";
    default:
      return "/";
  }
};