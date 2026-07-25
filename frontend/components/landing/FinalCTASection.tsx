"use client";

import Button from "@/components/ui/Button";
import BackgroundBlobs from "@/components/shared/BackgroundBlobs";
import { toast } from "sonner";

export default function FinalCTASection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Reusing blob, but localized to top-left via standard absolute positioning */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
          Ready to upgrade your <br />institution&apos;s infrastructure?
        </h2>
        <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto">
          Join the movement of modern colleges treating student data as a strategic asset rather than a bureaucratic burden.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="dark" size="lg" onClick={() => toast.success("Scheduled!", { description: "Check your email for the calendar invite." })}>
            Schedule a Demo
          </Button>
          <Button variant="outline" size="lg" onClick={() => toast("Opening docs...")}>
            Read Documentation
          </Button>
        </div>
      </div>
    </section>
  );
}