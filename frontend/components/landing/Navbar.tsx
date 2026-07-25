"use client";

import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</Link>
            <Link href="#architecture" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Architecture</Link>
            <Link href="#security" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Security</Link>
            <Link href="#" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-block text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
              Log In
            </Link>
            <Button 
              variant="primary" 
              size="sm" 
              fullWidth={false}
              onClick={() => toast.info("Demo request received!", { description: "Our team will reach out shortly." })}
            >
              Request Demo
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}