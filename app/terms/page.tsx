import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { FileText, Shield, Scale, AlertCircle } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand-accent/30">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <header className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent text-sm font-medium mb-6">
            <Scale size={14} />
            Legal Agreement
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-white/50 text-lg">Last Updated: May 10, 2026</p>
        </header>

        <div className="space-y-12 prose prose-invert prose-base max-w-none text-white/70 leading-relaxed">
          <section className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FileText className="text-brand-accent" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Primadex, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. This agreement applies to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="text-brand-accent" />
              2. User Accounts
            </h2>
            <p>
              When you create an account with us (via Google OAuth), you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Scale className="text-brand-accent" />
              3. Intellectual Property
            </h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of Primadex and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Primadex.
            </p>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertCircle className="text-brand-accent" />
              4. Termination
            </h2>
            <p>
              We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-12">
            <h2 className="text-2xl font-bold text-white mb-6">5. Limitation of Liability</h2>
            <p>
              In no event shall Primadex, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-white/40">
              &copy; {new Date().getFullYear()} Primadex. All rights reserved.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

