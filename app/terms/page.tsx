import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] selection:bg-black selection:text-white">
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
        <header className="mb-16">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-widest uppercase border border-black/10 rounded-full">
            Legal Document
          </div>
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight mb-4">Terms of Service</h1>
          <p className="text-sm text-neutral-500 font-mono">Last Updated: May 8, 2026</p>
        </header>

        <article className="space-y-12 leading-relaxed text-lg text-neutral-800">
          <section>
            <h2 className="text-2xl font-serif mb-4 text-black border-b border-black/5 pb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Primadex, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-black border-b border-black/5 pb-2">2. Description of Service</h2>
            <p>
              Primadex provides a centralized authentication and resource management ecosystem. 
              We allow users to manage their identity across multiple integrated applications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-black border-b border-black/5 pb-2">3. User Conduct</h2>
            <p>
              You agree to use Primadex only for lawful purposes. You are responsible for all activities 
              that occur under your account. We reserve the right to terminate accounts that violate 
              our policies or engage in fraudulent activity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-black border-b border-black/5 pb-2">4. Intellectual Property</h2>
            <p>
              All content, trademarks, and data on Primadex are the property of Primadex. 
              Unauthorized use of any material on the platform is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-black border-b border-black/5 pb-2">5. Limitation of Liability</h2>
            <p>
              Primadex is provided "as is" without any warranties. We are not liable for any direct, 
              indirect, or incidental damages arising from your use of the service.
            </p>
          </section>
        </article>

        <footer className="mt-24 pt-12 border-t border-black/10 text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} Primadex. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
