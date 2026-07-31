"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import type { Permission } from "@/types/auth";

interface ProtectedRouteProps {
  requiredPermission: Permission;
  children: ReactNode;
}

export function ProtectedRoute({
  requiredPermission,
  children,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, can } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.replace("/login");
    return null;
  }

  if (!can(requiredPermission)) {
    router.replace("/403");
    return null;
  }

  return <>{children}</>;
}