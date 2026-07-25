"use client";

import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import HeroDashboardCard from "./HeroDashboardCard";
import BackgroundBlobs from "@/components/shared/BackgroundBlobs";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      <BackgroundBlobs />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-indigo-100">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              NEXT-GEN CAMPUS INFRASTRUCTURE
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
              Student records, <br />
              <span className="text-gradient">finally modernized.</span>
            </h1>
            
            <p className="mt-6 text-lg text-slate-500 leading-relaxed max-w-lg">
              Move away from clunky legacy systems. NexusSRS is an API-first, mobile-first platform that turns student data into actionable intelligence, improving retention and reducing administrative overhead.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg" onClick={() => {}}>
                Start Free Pilot
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Link href="#architecture">
                <Button variant="outline" size="lg">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <div className="animate-float-3d w-full max-w-md">
              <HeroDashboardCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}