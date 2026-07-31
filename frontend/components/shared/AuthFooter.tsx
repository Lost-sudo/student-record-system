import Link from "next/link";

interface AuthFooterProps {
  text: string;
  linkText: string;
  href: string;
}

export default function AuthFooter({ text, linkText, href }: AuthFooterProps) {
  return (
    <p className="text-center text-sm text-slate-300 mt-6">
      {text}{" "}
      <Link href={href} className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
        {linkText}
      </Link>
    </p>
  );
}