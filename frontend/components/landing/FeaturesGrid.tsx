import { Smartphone, Lightbulb, Terminal, Zap, MessageSquare, ShieldCheck } from "lucide-react";
import FeatureCard from "./FeatureCard";

const features = [
  {
    icon: <Smartphone className="w-6 h-6 text-indigo-600" />,
    iconBg: "bg-indigo-100 group-hover:bg-indigo-200",
    hoverBorder: "hover:border-indigo-100",
    hoverShadow: "hover:shadow-xl hover:shadow-indigo-50",
    title: "Consumer-Grade UX",
    description: "Mobile-first design that feels like a modern app, not a 2000s bureaucratic portal. Students actually want to use it.",
  },
  {
    icon: <Lightbulb className="w-6 h-6 text-purple-600" />,
    iconBg: "bg-purple-100 group-hover:bg-purple-200",
    hoverBorder: "hover:border-purple-100",
    hoverShadow: "hover:shadow-xl hover:shadow-purple-50",
    title: "AI-Driven Advising",
    description: "Predictive analytics flag at-risk students before midterms. Smart degree audits suggest optimal schedules automatically.",
  },
  {
    icon: <Terminal className="w-6 h-6 text-cyan-600" />,
    iconBg: "bg-cyan-100 group-hover:bg-cyan-200",
    hoverBorder: "hover:border-cyan-100",
    hoverShadow: "hover:shadow-xl hover:shadow-cyan-50",
    title: "API-First Microservices",
    description: "Seamlessly connects to your LMS, billing, and housing. If registration crashes, billing stays online.",
  },
  {
    icon: <Zap className="w-6 h-6 text-green-600" />,
    iconBg: "bg-green-100 group-hover:bg-green-200",
    hoverBorder: "hover:border-green-100",
    hoverShadow: "hover:shadow-xl hover:shadow-green-50",
    title: "Real-Time Processing",
    description: "No more overnight batch jobs. Drop a class, and your financial aid, GPA, and degree audit update instantly.",
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-amber-600" />,
    iconBg: "bg-amber-100 group-hover:bg-amber-200",
    hoverBorder: "hover:border-amber-100",
    hoverShadow: "hover:shadow-xl hover:shadow-amber-50",
    title: "Conversational UI",
    description: "\"How many credits do I need?\" Students ask questions in natural language and get instant, accurate answers.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-red-600" />,
    iconBg: "bg-red-100 group-hover:bg-red-200",
    hoverBorder: "hover:border-red-100",
    hoverShadow: "hover:shadow-xl hover:shadow-red-50",
    title: "Zero Trust Security",
    description: "Granular FERPA compliance controls and blockchain-verified digital credentials for alumni.",
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Built for the modern student experience
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Replace siloed databases with an intelligent ecosystem designed to boost retention and delight users.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}