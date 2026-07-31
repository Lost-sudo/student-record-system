"use client";

import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import Button from "@/components/ui/Button";

export default function SSOSection() {
  const handleSSO = (provider: string) => {
    toast.info(`Redirecting to ${provider}...`, {
      description: "You will be redirected to complete sign-in.",
    });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSSO("University SSO")}
      >
        <FcGoogle className="w-5 h-5" />
        <span className="text-sm font-medium">University SSO</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSSO("Apple ID")}
      >
        <FaApple className="w-5 h-5 text-slate-200" />
        <span className="text-sm font-medium">Apple ID</span>
      </Button>
    </div>
  );
}