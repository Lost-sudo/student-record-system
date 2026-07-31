import { GraduationCap, School, BookOpen, FileText } from "lucide-react";

const partners = [
  { icon: GraduationCap, name: "EduCorp" },
  { icon: School, name: "UniGlobal" },
  { icon: BookOpen, name: "HigherEd" },
  { icon: FileText, name: "AcademiaX" },
];

export default function SocialProofBar() {
  return (
    <section className="border-y border-slate-700 bg-slate-800/50 backdrop-blur-sm py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
          Trusted by forward-thinking institutions globally
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 opacity-60">
          {partners.map(({ icon: Icon, name }) => (
            <div key={name} className="flex items-center gap-2 text-slate-200">
              <Icon className="w-6 h-6" />
              <span className="font-bold text-lg">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}