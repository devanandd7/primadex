"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, RefreshCw, ExternalLink, AlertTriangle, CheckCircle2, Terminal } from "lucide-react";

export default function TeachBoardAdmin() {
  const [config, setConfig] = useState({
    currentVersion: "1.0.0",
    downloadUrl: "",
    updateInfo: "",
    isHardUpdate: false,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/app-config?appId=teachboard");
      const data = await res.json();
      if (data && data.currentVersion) {
        setConfig(data);
      }
    } catch (err) {
      console.error("Failed to fetch config");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/admin/app-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, appId: "teachboard" }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Configuration updated successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to update configuration." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white p-6 md:p-12 font-sans selection:bg-blue-500">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">System Controller</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">TeachBoard <span className="text-neutral-500 font-light">Management</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchConfig}
              className="p-3 bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors border border-white/5"
            >
              <RefreshCw className={`w-5 h-5 ${fetching ? 'animate-spin' : ''}`} />
            </button>
            <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-blue-400 leading-none mb-1">Status</p>
                <p className="text-xs font-mono font-bold leading-none">V{config.currentVersion}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <form onSubmit={handleSave} className="space-y-8 bg-neutral-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-400 ml-1">Version Identifier</label>
                  <input 
                    type="text"
                    value={config.currentVersion}
                    onChange={e => setConfig({...config, currentVersion: e.target.value})}
                    placeholder="e.g. 1.0.1"
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-neutral-700 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-neutral-400 ml-1">Deployment URL</label>
                  <input 
                    type="url"
                    value={config.downloadUrl}
                    onChange={e => setConfig({...config, downloadUrl: e.target.value})}
                    placeholder="https://..."
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-neutral-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-400 ml-1">Release Notes / Update Info</label>
                <textarea 
                  value={config.updateInfo}
                  onChange={e => setConfig({...config, updateInfo: e.target.value})}
                  rows={4}
                  placeholder="Describe what's new in this version..."
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-neutral-700 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  onClick={() => setConfig({...config, isHardUpdate: !config.isHardUpdate})}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col gap-3 ${config.isHardUpdate ? 'bg-red-500/10 border-red-500/50' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Hard Update</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${config.isHardUpdate ? 'bg-red-500' : 'bg-neutral-800'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.isHardUpdate ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500">Users will be forced to update before continuing usage.</p>
                </div>

                <div 
                  onClick={() => setConfig({...config, isActive: !config.isActive})}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col gap-3 ${config.isActive ? 'bg-green-500/10 border-green-500/50' : 'bg-black/20 border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Deployment Active</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${config.isActive ? 'bg-green-500' : 'bg-neutral-800'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.isActive ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500">Enable or disable version checking for this application.</p>
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  {message.text}
                </div>
              )}

              <button 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-500 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Commit Deployment
              </button>
            </form>
          </motion.div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-neutral-900/50 p-8 rounded-3xl border border-white/5 space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-500" />
                Live Preview
              </h3>
              
              <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold leading-none mb-1">TeachBoard</h4>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">New Version Available</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-[11px] font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded inline-block">v{config.currentVersion}</p>
                  <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                    {config.updateInfo || "No release notes provided."}
                  </p>
                </div>

                <div className="pt-2">
                  <div className="w-full py-2 bg-blue-600 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 opacity-80">
                    <ExternalLink className="w-3 h-3" />
                    Update Now
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Security Scoped</span>
                  <span className="text-green-500 font-mono">Protected</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Database Target</span>
                  <span className="text-blue-500 font-mono">app_configs</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-600/5 border border-blue-500/20 rounded-3xl italic text-xs text-neutral-400 leading-relaxed">
              "This console manages the deployment state for the TeachBoard desktop application. Changes are broadcasted globally across all client installations."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
