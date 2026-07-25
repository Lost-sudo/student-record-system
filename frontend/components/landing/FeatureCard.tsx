import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  iconBg: string;
  hoverBorder: string;
  hoverShadow: string;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon,
  iconBg,
  hoverBorder,
  hoverShadow,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className={`bg-white rounded-3xl p-8 border border-slate-100 ${hoverBorder} ${hoverShadow} transition-all duration-300 group`}>
      <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:opacity-80 transition-colors`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}