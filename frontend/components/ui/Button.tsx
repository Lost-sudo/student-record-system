import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "dark";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = true,
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
    fullWidth ? "w-full" : "w-auto"
  }`;

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3.5 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white shadow-lg shadow-indigo-200 hover:shadow-xl focus:ring-indigo-500",
    outline:
      "border border-slate-200 hover:border-slate-300 hover:bg-white text-slate-700 focus:ring-slate-300",
    dark: "bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl focus:ring-slate-500",
  };

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin h-5 w-5" />}
      {children}
    </button>
  );
}