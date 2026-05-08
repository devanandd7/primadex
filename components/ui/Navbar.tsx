"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Sparkles, LogOut, User, LogIn } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-brand-primary/70 backdrop-blur-xl border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center border border-brand-border">
              <Sparkles size={18} className="text-brand-accent" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-800 text-white text-base">Primadex</div>
              <div className="text-brand-muted text-xs -mt-0.5">One platform, many domains</div>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link href="/products" className="text-brand-muted hover:text-white transition-colors">
              Marketplace
            </Link>
            
            {session ? (
              <div className="flex items-center gap-4">
                {/* Admin Link if applicable */}
                <Link href="/admin" className="text-brand-muted hover:text-white transition-colors">
                  Admin
                </Link>
                
                <div className="flex items-center gap-3 pl-4 border-l border-brand-border">
                  <div className="w-8 h-8 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center overflow-hidden">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <User size={14} className="text-brand-accent" />
                    )}
                  </div>
                  <button 
                    onClick={() => signOut()}
                    className="p-2 text-brand-muted hover:text-white transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent text-white hover:bg-brand-accent/90 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-accent/20"
              >
                <LogIn size={14} />
                Sign In
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

