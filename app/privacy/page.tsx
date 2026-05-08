import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] selection:bg-black selection:text-white">
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
        <header className="mb-16">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-widest uppercase border border-black/10 rounded-full">
            Legal Document
          </div>
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight mb-4 italic">Privacy Policy</h1>
          <p className="text-sm text-neutral-500 font-mono">Last Updated: May 8, 2026</p>
        </header>

        <article className="space-y-12 leading-relaxed text-lg text-neutral-800">
          <section>
            <h2 className="text-2xl font-serif mb-4 text-black border-b border-black/5 pb-2">1. Introduction</h2>
            <p>
              Welcome to Primadex. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you as to how we look after your personal data when you visit our 
              website and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-black border-b border-black/5 pb-2">2. The Data We Collect</h2>
            <p>
              When you authenticate using Google, we collect the following information to verify your identity and provide our services:
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 pl-4 marker:text-black">
              <li>Email address</li>
              <li>Basic Profile Information (Name, Profile Picture)</li>
            </ul>
            <p className="mt-4">
              We do not collect or store any other personal information from your Google account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-black border-b border-black/5 pb-2">3. How We Use Your Data</h2>
            <p>
              We use your data strictly for:
            </p>
            <ul className="mt-4 list-disc list-inside space-y-2 pl-4 marker:text-black">
              <li>User authentication and account verification.</li>
              <li>Personalizing your experience across the Primadex ecosystem.</li>
              <li>Ensuring the security of our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-black border-b border-black/5 pb-2">4. Data Sharing</h2>
            <p>
              Primadex does not sell, trade, or otherwise transfer your personal data to third parties. 
              Your information is stored securely in our centralized database and is only accessed by 
              applications within the Primadex ecosystem that you have explicitly authorized.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4 text-black border-b border-black/5 pb-2">5. Your Rights</h2>
            <p>
              You have the right to request the deletion of your account and associated data at any time. 
              To do so, please contact us at support@primadex.com.
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
