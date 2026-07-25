"use client";

import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface AIAssistantButtonProps {
  tooltip?: string;
}

export default function AIAssistantButton({ tooltip = "Need help logging in? Ask our AI Assistant!" }: AIAssistantButtonProps) {
  return (
    <div className="absolute bottom-6 right-6 z-20 group">
      <div className="absolute bottom-full right-0 mb-3 w-48 bg-slate-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
        {tooltip}
        <div className="absolute top-full right-4 w-2 h-2 bg-slate-800 transform rotate-45 -translate-y-1" />
      </div>
      <button
        type="button"
        onClick={() => toast("AI Assistant", { description: "Hello! How can I help you today?" })}
        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}