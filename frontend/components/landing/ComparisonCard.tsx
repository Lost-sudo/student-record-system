import { ReactNode } from "react";

interface ComparisonCardProps {
  title: string;
  icon: ReactNode;
  iconBg: string;
  borderClass: string;
  shadowClass?: string;
  items: string[];
  isDark?: boolean;
  isNegative?: boolean;
}

export default function ComparisonCard({
  title,
  icon,
  iconBg,
  borderClass,
  shadowClass,
  items,
  isDark = false,
  isNegative = false,
}: ComparisonCardProps) {
  const textColor = isDark ? "text-slate-300" : "text-slate-400";
  const listIconColor = isNegative ? "text-red-400" : "text-indigo-400";
  const ListIcon = isNegative
    ? () => (
        <svg className={`w-5 h-5 ${listIconColor} mt-0.5 shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    : () => (
        <svg className={`w-5 h-5 ${listIconColor} mt-0.5 shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );

  return (
    <div className={`${borderClass} backdrop-blur-sm rounded-3xl p-8 ${shadowClass}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>{icon}</div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className={`flex items-start gap-3 ${textColor}`}>
            <ListIcon />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}