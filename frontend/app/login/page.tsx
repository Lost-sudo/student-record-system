import BackgroundBlobs from "@/components/shared/BackgroundBlobs";
import LoginHeader from "@/components/login/LoginHeader";
import LoginForm from "@/components/login/LoginForm";
import FormDivider from "@/components/shared/FormDivider";
import SSOSection from "@/components/shared/SSOSection";
import AuthFooter from "@/components/shared/AuthFooter";
import AIAssistantButton from "@/components/shared/AIAssistantButton";

export default function LoginPage() {
  return (
    <main className="bg-slate-900 font-sans min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <BackgroundBlobs />

      <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md relative z-10 border border-slate-700/50">
        <LoginHeader />
        <LoginForm />
        <FormDivider />
        <SSOSection />
        <AuthFooter
          text="Don't have an account?"
          linkText="Sign up"
          href="/register"
        />
      </div>

      <AIAssistantButton />
    </main>
  );
}