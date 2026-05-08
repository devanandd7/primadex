"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Zap, Globe } from "lucide-react";

export default function SignInPage() {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 md:p-12 shadow-2xl relative overflow-hidden group">
          {/* Internal Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
              <Zap className="w-8 h-8 text-white fill-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3 italic font-serif">Primadex <span className="text-blue-500">Auth</span></h1>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-[280px]">
              Access the centralized intelligence ecosystem for all your projects.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleGoogleSignIn}
              className="w-full group/btn relative flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-bold hover:bg-neutral-200 transition-all duration-300 overflow-hidden"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
              <motion.div 
                className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"
              />
            </button>
            
            <div className="flex items-center gap-4 py-4">
              <div className="h-[1px] flex-1 bg-white/10" />
              <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">Secure Gateway</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                <ShieldCheck className="w-5 h-5 text-blue-500 mb-2" />
                <span className="text-[10px] text-neutral-500 font-medium">Encrypted</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center text-center">
                <Zap className="w-5 h-5 text-yellow-500 mb-2" />
                <span className="text-[10px] text-neutral-500 font-medium">Instant</span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-[10px] text-neutral-500 text-center leading-relaxed">
              By continuing, you agree to our <a href="/terms" className="text-white hover:underline underline-offset-4">Terms</a> and <a href="/privacy" className="text-white hover:underline underline-offset-4">Privacy Policy</a>.
            </p>
            <div className="flex items-center gap-2 text-[10px] text-neutral-600 font-mono">
              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              SYSTEMS OPERATIONAL
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-neutral-500 hover:text-white text-xs inline-flex items-center gap-2 transition-colors group">
            Back to home
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
