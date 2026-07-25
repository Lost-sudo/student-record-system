interface FormDividerProps {
  text?: string;
}

export default function FormDivider({ text = "or continue with" }: FormDividerProps) {
  return (
    <div className="my-6 flex items-center">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="px-4 text-sm text-slate-400 font-medium">{text}</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}