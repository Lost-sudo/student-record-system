import Link from "next/link";

interface LogoProps {
  textWhite?: boolean;
}

export default function Logo({ textWhite = false }: LogoProps) {
  const textColor = textWhite ? "text-white" : "text-slate-800";
  const accentColor = textWhite ? "text-indigo-400" : "text-indigo-600";

  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      </div>
      <span className={`text-lg font-bold ${textColor}`}>
        Nexus<span className={accentColor}>SRS</span>
      </span>
    </Link>
  );
}