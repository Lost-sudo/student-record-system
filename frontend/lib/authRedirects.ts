import type { UserRole } from "@/types/auth";

export const getDashboardForRole = (role: UserRole): string => {
  switch (role) {
    case "SUPER_ADMIN":
      return "/dashboard";
    case "REGISTRAR":
      return "/registrar";
    default:
      return "/";
  }
};