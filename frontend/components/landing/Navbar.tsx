"use client";

import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useLogout } from "@/api/stores/authStore";

export default function Navbar() {
  const { isAuthenticated, isLoading } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/70 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#architecture"
              className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors"
            >
              Architecture
            </Link>
            <Link
              href="#security"
              className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors"
            >
              Security
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors"
            >
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isLoading ? null : isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                fullWidth={false}
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                Logout
              </Button>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-block text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors"
              >
                Log In
              </Link>
            )}
            <Button
              variant="primary"
              size="sm"
              fullWidth={false}
              onClick={() =>
                toast.info("Demo request received!", {
                  description: "Our team will reach out shortly.",
                })
              }
            >
              Request Demo
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
