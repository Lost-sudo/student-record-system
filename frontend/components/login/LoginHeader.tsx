import { GraduationCap } from "lucide-react";

export default function Header() {
  return (
    <div className="text-center mb-8">
      <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl rotate-6 flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 hover:rotate-0 transition-transform duration-300">
        <GraduationCap className="w-8 h-8 text-white -rotate-6" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
        Welcome Back
      </h1>
      <p className="text-slate-500 mt-2 text-sm">
        Sign in to your Student Portal
      </p>
    </div>
  );
}