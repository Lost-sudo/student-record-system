import BackgroundBlobs from "@/components/shared/BackgroundBlobs";
import RegisterHeader from "@/components/register/RegisterHeader";
import RegisterForm from "@/components/register/RegisterForm";
import FormDivider from "@/components/shared/FormDivider";
import SSOSection from "@/components/shared/SSOSection";
import AuthFooter from "@/components/shared/AuthFooter";
import AIAssistantButton from "@/components/shared/AIAssistantButton";

export default function RegisterPage() {
  return (
    <main className="bg-slate-900 font-sans min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <BackgroundBlobs />

      <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md relative z-10 border border-slate-700/50">
        <RegisterHeader />
        <RegisterForm />
        <FormDivider text="or sign up with" />
        <SSOSection />
        <AuthFooter 
          text="Already have an account?" 
          linkText="Sign in" 
          href="/login" 
        />
      </div>

      <AIAssistantButton tooltip="Need help creating your account?" />
    </main>
  );
}