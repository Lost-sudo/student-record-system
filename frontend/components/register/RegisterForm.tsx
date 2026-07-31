"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import { useRegister } from "@/api/stores/authStore";
import { ApiError } from "@/types/ApiError";

interface RegisterFormValues {
  email: string;
  username: string;
  password: string;
  terms: boolean;
}

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormValues>({
    defaultValues: { email: "", username: "", password: "", terms: false },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    registerMutation.mutate(
      {email: data.email, username: data.username, password: data.password},
      {
        onSuccess: () => {
          toast.success("Register successful!", {
            description: "Redirecting to your dashboard..."
          });
          reset();
        },
        onError: (error) => {
          const axiosError = error as ApiError;

          const errorMessage = 
            axiosError.response?.data?.message || "The email or username is already registered. Please try again.";

          toast.error("Registration failed.", {
            description: errorMessage
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

      {/* Username */}
      <InputField
        id="username"
        label="Username"
        type="text"
        placeholder="johndoe_2025"
        icon={<User className="w-5 h-5 text-slate-400" />}
        error={errors.username?.message}
        registration={register("username", {
          required: "Username is required",
          minLength: {
            value: 3,
            message: "Username must be at least 3 characters",
          },
          pattern: {
            value: /^[a-zA-Z0-9_]+$/,
            message: "Only letters, numbers, and underscores allowed",
          },
        })}
      />

      {/* Password */}
      <InputField
        id="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        placeholder="Min. 8 characters"
        icon={<Lock className="w-5 h-5 text-slate-400" />}
        hint="Must contain a number and a special character"
        error={errors.password?.message}
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-indigo-400 transition-colors duration-200 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        }
        registration={register("password", {
          required: "Password is required",
          minLength: {
            value: 8,
            message: "Password must be at least 8 characters",
          },
          // pattern: {
          //   value: /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/,
          //   message: "Password must include a number and a special character",
          // },
        })}
      />

      {/* Terms and Conditions */}
      <div className="flex items-start gap-3 pt-1">
        <input
          type="checkbox"
          id="terms"
          className="mt-0.5 w-4 h-4 text-indigo-400 bg-slate-700 border-slate-500 rounded focus:ring-indigo-400 focus:ring-2 cursor-pointer"
          {...register("terms", {
            required: "You must accept the terms to continue",
          })}
        />
        <label htmlFor="terms" className="text-sm text-slate-300 cursor-pointer">
          I agree to the{" "}
          <Link href="#" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Privacy Policy
          </Link>
        </label>
      </div>
      {errors.terms && (
        <p className="text-sm text-red-400 flex items-center gap-1 -mt-3">
          <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
          {errors.terms.message}
        </p>
      )}

      {/* Submit */}
      <Button type="submit" isLoading={registerMutation.isPending}>
        Create Account
      </Button>
    </form>
  );
}