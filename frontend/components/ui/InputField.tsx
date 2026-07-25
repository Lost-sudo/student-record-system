import { ReactNode } from "react";

interface InputFieldProps {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  error?: string;
  hint?: string; // NEW: For inline help text like password requirements
  registration?: object;
  action?: ReactNode;
}

export default function InputField({
  id,
  label,
  type = "text",
  placeholder,
  icon,
  suffix,
  error,
  hint,
  registration,
  action,
}: InputFieldProps) {
  return (
    <div>
      {(label || action) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label htmlFor={id} className="block text-sm font-medium text-slate-700">
              {label}
            </label>
          )}
          {action}
        </div>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          aria-invalid={error ? "true" : "false"}
          className={`w-full py-2.5 bg-slate-50 border rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white transition duration-200 ${
            icon ? "pl-11" : "pl-4"
          } ${suffix ? "pr-12" : "pr-4"} ${
            error ? "border-red-400 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
          }`}
          {...registration}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">{suffix}</div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
          {error}
        </p>
      )}

      {/* NEW: Inline hint text (only shows if there's no error) */}
      {!error && hint && (
        <p className="mt-1.5 text-xs text-slate-400 pl-1">{hint}</p>
      )}
    </div>
  );
}