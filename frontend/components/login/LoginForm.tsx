"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import { useRouter } from "next/navigation";
import { useLogin } from "@/api/stores/authStore";
import { ApiError } from "@/types/ApiError";

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: LoginFormValues) => {
    loginMutation.mutate(
      {email: data.email, password: data.password},
      {
        onSuccess: () => {
          toast.success('Login successful!', {
            description: "Redirecting to your dashboard..."
          });
          reset();

          router.push("/");
        },
        onError: (error) => {
          const axiosError = error as ApiError;

          const errorMessage = 
            axiosError.response?.data?.message || "Invalid email or password. Please try again.";

          toast.error("Login failed", {
            description: errorMessage,
          });
        }
      }
    )
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Email */}
      <InputField
        id="email"
        label="College Email Address"
        type="email"
        placeholder="john.doe@university.edu"
        icon={<Mail className="w-5 h-5 text-slate-400" />}
        error={errors.email?.message}
        registration={register("email", {
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Please enter a valid email address",
          },
        })}
      />

      {/* Password */}
      <InputField
        id="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        icon={<Lock className="w-5 h-5 text-slate-400" />}
        error={errors.password?.message}
        action={
          <button
            type="button"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            onClick={() =>
              toast("Password reset link sent!", {
                description: "Check your email inbox.",
              })
            }
          >
            Forgot password?
          </button>
        }
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-indigo-400 transition-colors duration-200 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        }
        registration={register("password", {
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        })}
      />

      {/* Remember Me */}
      <div className="flex items-center pt-2">
        <label className="flex items-center space-x-2.5 cursor-pointer group">
          <input
            type="checkbox"
            className="w-4 h-4 text-indigo-400 bg-slate-700 border-slate-500 rounded focus:ring-indigo-400 focus:ring-2 cursor-pointer"
            {...register("rememberMe")}
          />
          <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
            Remember me
          </span>
        </label>
      </div>

      {/* Submit */}
      <Button type="submit" isLoading={loginMutation.isPending}>
        Sign In
      </Button>
    </form>
  );
}