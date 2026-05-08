"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid secret");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="glass-morphism rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-accent/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />

          <div className="relative z-10">
            <div className="w-16 h-16 bg-brand-accent/10 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-brand-accent/20">
              <Lock className="text-brand-accent" size={32} />
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2 tracking-tight">Admin Portal</h1>
            <p className="text-gray-400 text-center mb-8 text-sm">Enter your administrative secret to continue</p>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter Secret Key"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/50 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Unlock Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
