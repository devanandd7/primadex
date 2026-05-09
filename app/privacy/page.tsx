import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand-accent/30">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent text-sm font-medium mb-6">
            <Shield size={14} />
            Data Protection
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-white/50 text-lg">Last Updated: May 10, 2026</p>
        </header>

        <div className="space-y-12 prose prose-invert prose-base max-w-none text-white/70 leading-relaxed">
          <section className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Eye className="text-brand-accent" />
              Information We Collect
            </h2>
            <p>
              Primadex collects minimal information necessary to provide our services. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Google Account Info:</strong> Name, email address, and profile picture provided via Google OAuth.</li>
              <li><strong>Usage Data:</strong> Information about which products you browse or purchase.</li>
              <li><strong>Technical Data:</strong> IP address, browser type, and device information for security and performance monitoring.</li>
            </ul>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Lock className="text-brand-accent" />
              How We Use Your Data
            </h2>
            <p>
              Your data is used exclusively to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Authenticating your identity and managing your account.</li>
              <li>Providing access to purchased products and services.</li>
              <li>Improving our platform's user experience through analytics.</li>
              <li>Ensuring the security of our ecosystem.</li>
            </ul>
            <p className="mt-6 text-brand-accent font-medium">
              We never sell your personal data to third parties.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FileText className="text-brand-accent" />
              Data Security & Retention
            </h2>
            <p>
              We implement industry-standard security measures to protect your information. Your data is stored securely in our encrypted MongoDB clusters. 
            </p>
            <p className="mt-4">
              We retain your information as long as your account is active. You can request account deletion at any time by contacting our support team at <span className="text-white font-medium">support@primadex.online</span>.
            </p>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Google User Data</h2>
            <p>
              Primadex's use of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" className="text-brand-accent hover:underline" target="_blank" rel="noopener noreferrer">Google API Service User Data Policy</a>, including the Limited Use requirements.
            </p>
          </section>

          <section className="pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">
              By using Primadex, you agree to the terms outlined in this Privacy Policy.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
