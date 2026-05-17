"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Loader2, Link2, LogOut, CheckCircle, 
  AlertCircle, Image, Video, Trash2, ExternalLink, Sparkles,
  Info, Copy, FileText, ChevronDown, ChevronUp, RefreshCw, RotateCcw
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

// Custom Lucide-styled outline SVG component for LinkedIn
const Linkedin = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" rx="1" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const PLACEHOLDERS_BY_STYLE: Record<string, string> = {
  builder: "E.g., Aaj maine humare product Primadex me custom AI LinkedIn post writer feature add kiya. Isse admin click me highly engaging, optimized post generate kr skte hain. Aaj din bhar isko testing me spend kiya and it's working flawlessly! Ab linkedin pe shares increase honge.",
  launch: "E.g., Primadex is officially live! Humne build kiya hai ek fast, custom, and premium asset manager for modern builders. Key features like visual editor, 3d assets support, instant deploy are ready. Abhi sign up kro primadex.com pe or speed access pao!",
  thought: "E.g., Maine 5 saal SaaS startup building me spent kiya. Log bolte hain building is hard, but true challenge scaling & marketing me hota hai. Aaj share kr rha hu 3 lessons jo maine hard way se seekha...",
  viral: "E.g., Kuch months pehle lagta tha ki product fail ho jayega. Budget khatam ho rha tha and servers crash kr rhe the. But humne feedback liya, shift kiya core value pe. Aaj humare 10k active developers hain..."
};

export default function LinkedInPublisherPage() {
  // Connection state
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form state
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  
  // UI States
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<"idle" | "success" | "error">("idle");
  const [publishedUrl, setPublishedUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showDevDrawer, setShowDevDrawer] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [oauthSuccess, setOauthSuccess] = useState(false);

  // AI Copilot States
  const [optimizing, setOptimizing] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [selectedAiStyle, setSelectedAiStyle] = useState("builder");
  const [selectedLanguage, setSelectedLanguage] = useState("hinglish");
  const [aiOptimizedText, setAiOptimizedText] = useState("");
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [originalTextBeforeAi, setOriginalTextBeforeAi] = useState("");
  const [showRestoreButton, setShowRestoreButton] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [redirectUri, setRedirectUri] = useState("http://localhost:3000/api/admin/linkedin/callback");

  // Determine redirect URI on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setRedirectUri(`${origin}/api/admin/linkedin/callback`);

      // Check URL query parameters for success/error from callback
      const params = new URLSearchParams(window.location.search);
      if (params.get("success") === "true") {
        setOauthSuccess(true);
        // Clear params from address bar
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      const err = params.get("error");
      if (err) {
        setOauthError(decodeURIComponent(err));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    checkConnection();
  }, []);

  // Fetch connection status
  const checkConnection = async () => {
    setCheckingConnection(true);
    try {
      const res = await fetch("/api/admin/linkedin/status");
      const data = await res.json();
      if (data.connected) {
        setIsConnected(true);
        setProfile(data);
      } else {
        setIsConnected(false);
        setProfile(null);
      }
    } catch (e) {
      console.error("Failed to check connection", e);
    } finally {
      setCheckingConnection(false);
    }
  };

  // Disconnect Account
  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your LinkedIn account? This will delete your access credentials from Primadex database.")) return;
    try {
      const res = await fetch("/api/admin/linkedin/disconnect", { method: "POST" });
      if (res.ok) {
        setIsConnected(false);
        setProfile(null);
        setText("");
        clearMedia();
        setPublishStatus("idle");
      } else {
        alert("Failed to disconnect.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle media selection
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith("image/");
    const isVid = file.type.startsWith("video/");

    if (!isImg && !isVid) {
      alert("Unsupported file type! Please upload an image (JPEG/PNG/WebP) or a video (MP4).");
      return;
    }

    // Safety size checks
    if (isImg && file.size > 10 * 1024 * 1024) {
      alert("Image exceeds 10MB limit! Please compress your image.");
      return;
    }
    if (isVid && file.size > 200 * 1024 * 1024) {
      alert("Video exceeds 200MB limit! Please trim or compress your video.");
      return;
    }

    setMediaFile(file);
    setMediaType(isImg ? "image" : "video");
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
    setPublishStatus("idle");
  };

  // Clear attached media
  const clearMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Post Submission
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && !mediaFile) return;

    setPublishing(true);
    setPublishStatus("idle");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("text", text);
    if (mediaFile) {
      formData.append("media", mediaFile);
    }

    try {
      const res = await fetch("/api/admin/linkedin/post", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPublishStatus("success");
        setPublishedUrl(data.url);
        // Clear inputs on success
        setText("");
        clearMedia();
      } else {
        setPublishStatus("error");
        setErrorMessage(data.error || "Failed to publish post to LinkedIn.");
      }
    } catch (err: any) {
      setPublishStatus("error");
      setErrorMessage(err.message || "An unexpected network error occurred.");
    } finally {
      setPublishing(false);
    }
  };

  // AI Copilot Optimization
  const handleAiOptimize = async (style: string, lang: string) => {
    if (!text.trim()) {
      alert("AI Copilot use karne ke liye pehle commentary box me kuch raw text likhiye!");
      return;
    }

    setOptimizing(true);
    setSelectedAiStyle(style);
    setSelectedLanguage(lang);
    
    try {
      const response = await fetch("/api/admin/linkedin/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, style, language: lang })
      });

      const data = await response.json();

      if (response.ok && data.optimizedText) {
        setOriginalTextBeforeAi(text);
        setText(data.optimizedText);
        setShowRestoreButton(true);
        // Clear any old optimization preview states
        setAiOptimizedText("");
        setShowAiPreview(false);
      } else {
        alert(data.error || "AI optimization failed.");
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred during AI optimization.");
    } finally {
      setOptimizing(false);
    }
  };

  const restoreOriginalPost = () => {
    if (originalTextBeforeAi) {
      setText(originalTextBeforeAi);
      setShowRestoreButton(false);
    }
  };

  // Copy Redirect URI to Clipboard
  const copyRedirectUri = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto font-sans">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <Link 
              href="/admin"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-brand-accent transition-colors mb-4 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Master Control
            </Link>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Linkedin className="text-[#0a66c2]" size={36} />
              LinkedIn <span className="text-brand-accent italic font-serif">Publisher</span>
            </h1>
            <p className="text-white/50 mt-2">Publish updates, announcements, and media assets instantly.</p>
          </div>

          <button 
            onClick={checkConnection}
            className="p-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl transition-all border border-white/10 flex items-center justify-center"
            title="Refresh Connection Status"
          >
            <RefreshCw size={18} className={checkingConnection ? "animate-spin text-brand-accent" : ""} />
          </button>
        </div>

        {/* Global Notifications */}
        {oauthSuccess && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle size={20} className="shrink-0" />
            <div>
              <strong className="font-bold">Access Granted!</strong> Your LinkedIn account has been successfully linked.
            </div>
          </div>
        )}

        {oauthError && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle size={20} className="shrink-0" />
            <div>
              <strong className="font-bold">OAuth Connection Failed:</strong> {oauthError}
            </div>
          </div>
        )}

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Area: Controls and Publisher Form */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Connection Status Card */}
            <div className="glass rounded-[32px] p-8 border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform text-[#0a66c2]">
                <Linkedin size={100} />
              </div>

              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0a66c2] glow-accent" />
                Integration Status
              </h2>

              {checkingConnection ? (
                <div className="py-6 flex flex-col items-center justify-center text-white/30 gap-3">
                  <Loader2 className="animate-spin text-brand-accent" size={32} />
                  <p className="text-sm">Verifying secure pipeline...</p>
                </div>
              ) : isConnected ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center overflow-hidden shrink-0">
                      {profile?.avatar ? (
                        <img src={profile.avatar} alt="LinkedIn Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold uppercase text-brand-accent">{profile?.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-lg">{profile?.name}</span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live
                        </span>
                      </div>
                      <p className="text-xs text-white/40 font-mono mt-1 select-all">{profile?.personUrn}</p>
                      <p className="text-xs text-white/30 mt-1">Session active until {new Date(profile?.expiresAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-3 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} />
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-sm flex items-start gap-3">
                    <Info size={20} className="shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold mb-1">LinkedIn Account Not Linked</h4>
                      <p className="text-white/60 leading-relaxed text-xs">
                        Connecting your profile enables Primadex to write posts directly to your timeline. We secure access tokens using high-grade server-side encryption.
                      </p>
                    </div>
                  </div>

                  <a
                    href="/api/admin/linkedin/auth"
                    className="w-full py-4 bg-brand-accent hover:bg-brand-accentHover text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-brand-accent/20 hover:scale-[1.01] active:scale-[0.99] font-semibold text-lg"
                  >
                    <Linkedin size={22} />
                    Connect LinkedIn Account
                  </a>

                  {/* Dev Helper Drawer Toggle */}
                  <div className="pt-2 border-t border-white/5">
                    <button
                      onClick={() => setShowDevDrawer(!showDevDrawer)}
                      className="text-xs text-white/30 hover:text-white/60 font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors focus:outline-none"
                    >
                      {showDevDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      Developer Portal Setup Instructions
                    </button>

                    {showDevDrawer && (
                      <div className="mt-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-xs text-white/50 leading-relaxed">
                          To successfully connect your account online or locally, ensure your registered **LinkedIn Developer Application** supports OIDC and matches this specific redirect URI:
                        </p>
                        
                        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-3 select-all">
                          <code className="text-xs text-brand-accent font-mono truncate flex-1">{redirectUri}</code>
                          <button
                            onClick={copyRedirectUri}
                            className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-all shrink-0 border border-white/10"
                            title="Copy Redirect URI"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        {copiedRedirect && (
                          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider text-right animate-pulse">Copied to clipboard!</p>
                        )}

                        <div className="text-xs text-white/40 space-y-2">
                          <p className="font-bold text-white/60">Steps to verify:</p>
                          <ol className="list-decimal list-inside space-y-1 pl-1">
                            <li>Go to the <a href="https://developer.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-brand-accent underline inline-flex items-center gap-0.5">LinkedIn Developer Portal <ExternalLink size={10} /></a>.</li>
                            <li>Select your Application and navigate to the **Auth** tab.</li>
                            <li>Add the URI above under **Authorized Redirect URLs for your app** and save.</li>
                            <li>Verify OIDC products ("Sign In with LinkedIn" and "Share on LinkedIn") are activated.</li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Posting Form */}
            {isConnected && (
              <form onSubmit={handlePublish} className="glass rounded-[32px] p-8 border border-white/10 space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="text-brand-accent animate-pulse" size={20} />
                    Draft New Post
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-white/30">
                    LinkedIn UGC Protocol
                  </span>
                </div>

                {/* Share commentary text */}
                <div className="space-y-4">
                  {/* AI Copilot Configuration Dashboard */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-brand-accent uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles size={12} className="animate-pulse" />
                          AI Copilot Settings
                        </h4>
                        <p className="text-[10px] text-white/40 mt-1">Pehle style aur language select karein. Commentary box me dynamic Hinglish guide example dikhega!</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Language tabs */}
                        <div className="flex bg-black/40 border border-white/10 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => setSelectedLanguage("hinglish")}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                              selectedLanguage === "hinglish" 
                                ? "bg-brand-accent text-white shadow-md shadow-brand-accent/20" 
                                : "text-white/40 hover:text-white/70"
                            }`}
                          >
                            Hinglish
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedLanguage("english")}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                              selectedLanguage === "english" 
                                ? "bg-brand-accent text-white shadow-md shadow-brand-accent/20" 
                                : "text-white/40 hover:text-white/70"
                            }`}
                          >
                            English
                          </button>
                        </div>

                        {/* Style selection dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowAiMenu(!showAiMenu)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-lg transition-all focus:outline-none"
                          >
                            <span>Style: </span>
                            <span className="text-brand-accent capitalize">
                              {selectedAiStyle === "builder" 
                                ? "Indie Builder" 
                                : selectedAiStyle === "thought" 
                                ? "Thought Leadership" 
                                : selectedAiStyle}
                            </span>
                            <ChevronDown size={10} className={`transition-transform duration-200 ${showAiMenu ? "rotate-180" : ""}`} />
                          </button>

                          {showAiMenu && (
                            <div className="absolute right-0 mt-2 w-60 bg-[#0d0d0d] border border-white/10 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 backdrop-blur-md">
                              <p className="text-[10px] text-white/40 uppercase tracking-wider px-2.5 pb-2 border-b border-white/5 font-bold">Select Style</p>
                              <div className="space-y-1 mt-1.5">
                                {[
                                  { id: "builder", title: "Indie Builder Progress", desc: "Authentic build-in-public ship update." },
                                  { id: "launch", title: "Product Launch Pitch", desc: "High-converting pitch with hooks." },
                                  { id: "thought", title: "Thought Leadership", desc: "Educate with professional insights." },
                                  { id: "viral", title: "Viral Storytelling", desc: "Emotional builder journey style." }
                                ].map((styleOption) => (
                                  <button
                                    key={styleOption.id}
                                    type="button"
                                    onClick={() => { setSelectedAiStyle(styleOption.id); setShowAiMenu(false); }}
                                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-colors flex flex-col gap-0.5 focus:outline-none ${
                                      selectedAiStyle === styleOption.id 
                                        ? "bg-brand-accent/20 text-brand-accent font-bold" 
                                        : "hover:bg-white/5 text-white/70"
                                    }`}
                                  >
                                    <span className="font-bold">{styleOption.title}</span>
                                    <span className="text-[10px] text-white/40 leading-tight">{styleOption.desc}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Trigger optimize */}
                        <button
                          type="button"
                          onClick={() => handleAiOptimize(selectedAiStyle, selectedLanguage)}
                          disabled={optimizing || !text.trim()}
                          className="px-3 py-1.5 bg-brand-accent hover:bg-brand-accentHover text-white text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 shadow-lg shadow-brand-accent/15 focus:outline-none"
                        >
                          {optimizing ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Sparkles size={12} />
                          )}
                          Optimize Post
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Commentary box & dynamic guide placeholder */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center h-7">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">
                        Commentary Box
                      </label>
                      
                      {showRestoreButton && (
                        <button
                          type="button"
                          onClick={restoreOriginalPost}
                          className="px-2.5 py-1 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent hover:text-brand-accentHover border border-brand-accent/25 hover:border-brand-accent/45 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all focus:outline-none cursor-pointer group shadow-lg shadow-brand-accent/5 animate-in slide-in-from-right duration-250 active:scale-95"
                          title="Undo AI changes and restore your original draft"
                        >
                          <RotateCcw size={11} className="transition-transform group-hover:-rotate-45" />
                          Undo AI Changes
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <textarea
                        value={text}
                        onChange={(e) => {
                          setText(e.target.value);
                          if (publishStatus === "success") setPublishStatus("idle");
                          setShowRestoreButton(false);
                        }}
                        placeholder={PLACEHOLDERS_BY_STYLE[selectedAiStyle] || "Apna content likhein..."}
                        className={`w-full h-48 bg-white/[0.02] border focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/40 rounded-2xl p-5 text-sm focus:outline-none transition-all resize-none leading-relaxed text-white/90 placeholder-white/20 ${
                          optimizing 
                            ? "border-brand-accent/40 bg-brand-accent/[0.01] animate-pulse" 
                            : "border-white/10"
                        }`}
                        disabled={publishing || optimizing}
                      />
                      {optimizing && (
                        <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm animate-in fade-in duration-200">
                          <Loader2 className="animate-spin text-brand-accent" size={24} />
                          <span className="text-xs text-white/60 font-bold uppercase tracking-wider">
                            AI is rewriting in {selectedLanguage.toUpperCase()}...
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between text-xs text-white/30 font-mono px-1">
                      <span>Dynamic guides display examples in Hinglish.</span>
                      <span>
                        Input size: {text.length} characters (No limit)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Media Uploader Box */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">
                    Add Media (Image/Video)
                  </label>

                  {mediaPreview ? (
                    <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-black/40 p-4 flex items-center justify-between gap-4 animate-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 rounded-xl border border-white/10 overflow-hidden bg-white/5 shrink-0 flex items-center justify-center relative">
                          {mediaType === "image" ? (
                            <img src={mediaPreview} alt="Media Upload Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Video size={24} className="text-brand-accent" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate text-white/80">{mediaFile?.name}</p>
                          <p className="text-xs text-white/40 font-mono">
                            {((mediaFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB • {mediaType?.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={clearMedia}
                        className="p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all border border-rose-500/20 shrink-0"
                        title="Remove Media"
                        disabled={publishing}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => !publishing && fileInputRef.current?.click()}
                      className="border border-dashed border-white/10 rounded-2xl p-8 hover:border-brand-accent/40 hover:bg-brand-accent/5 transition-all text-center cursor-pointer group/uploader"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleMediaChange}
                        disabled={publishing}
                      />
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-white/5 group-hover/uploader:bg-brand-accent/15 group-hover/uploader:text-brand-accent rounded-xl text-white/40 transition-colors">
                          <Image size={24} className="inline mr-1" />
                          <Video size={24} className="inline ml-1" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white/70">
                            Upload an image or video file
                          </p>
                          <p className="text-xs text-white/30 mt-1 uppercase tracking-widest">
                            JPEG, PNG, WebP (Max 10MB) or MP4 (Max 200MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Response Feedback */}
                {publishStatus === "success" && (
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm space-y-3 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={18} />
                      <strong className="font-bold">Post Published Successfully!</strong>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Your post is live and propagating on the LinkedIn CDN network. You can verify it online using the link below:
                    </p>
                    <a
                      href={publishedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/30 text-emerald-300 font-bold rounded-xl text-xs transition-all hover:scale-[1.01]"
                    >
                      <ExternalLink size={14} />
                      View Post on LinkedIn
                    </a>
                  </div>
                )}

                {publishStatus === "error" && (
                  <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm flex items-start gap-3 animate-in zoom-in-95 duration-200">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Publishing Failed:</strong>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <button
                  type="submit"
                  disabled={publishing || (!text && !mediaFile)}
                  className="w-full py-4 bg-brand-accent hover:bg-brand-accentHover text-white font-bold rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-brand-accent/15"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Distributing UGC Content...</span>
                    </>
                  ) : (
                    <>
                      <Linkedin size={18} />
                      <span>Publish to LinkedIn Timeline</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Area: Interactive LinkedIn Mockup Feed (Wow Design Element) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-36">
            
            <div className="text-xs font-bold text-white/40 uppercase tracking-widest px-2">
              Feed Preview Simulator
            </div>

            {/* LinkedIn Card Shell */}
            <div className="bg-[#181818] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              
              {/* Header: Author Info */}
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center text-white/20">
                    {isConnected && profile?.avatar ? (
                      <img src={profile.avatar} alt="Author Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Linkedin size={20} className="text-white/30" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1 hover:text-blue-400 transition-colors">
                      {isConnected ? profile?.name : "Author Profile Name"}
                      <span className="text-[10px] font-normal text-white/40 font-mono">• 1st</span>
                    </div>
                    <div className="text-[11px] text-white/55 line-clamp-1">
                      {isConnected ? "SaaS Product Owner & Architect" : "Your Professional Job Role"}
                    </div>
                    <div className="text-[10px] text-white/40 flex items-center gap-1 mt-0.5">
                      <span>Just now</span>
                      <span>•</span>
                      <span className="text-[9px]">🌐</span>
                    </div>
                  </div>
                </div>
                
                <span className="text-white/40 text-xs font-bold font-mono tracking-wider cursor-default">•••</span>
              </div>

              {/* Feed Body Content */}
              <div className="px-4 pb-3">
                {text ? (
                  <p className="text-sm text-white/95 whitespace-pre-wrap leading-relaxed select-text font-normal font-sans">
                    {text}
                  </p>
                ) : (
                  <p className="text-sm text-white/30 italic font-normal font-sans">
                    Write some commentary on the left to see the live feed mockup automatically update.
                  </p>
                )}
              </div>

              {/* Feed Attachment Preview */}
              {mediaPreview && (
                <div className="border-t border-b border-white/5 bg-black/60 relative flex items-center justify-center max-h-[300px] overflow-hidden">
                  {mediaType === "image" ? (
                    <img src={mediaPreview} alt="Live Preview Attached" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full py-16 flex flex-col items-center justify-center text-white/40 gap-3">
                      <div className="w-16 h-16 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent animate-pulse">
                        <Video size={28} />
                      </div>
                      <span className="text-xs font-bold font-mono">{mediaFile?.name || "Video File.mp4"}</span>
                      <span className="text-[10px] text-white/20">Video player placeholder (renders raw binary on LinkedIn)</span>
                    </div>
                  )}
                </div>
              )}

              {/* LinkedIn Interaction Mockup Footer */}
              <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-white/45 text-[11px] font-medium font-sans">
                <div className="flex items-center gap-1">
                  <span className="text-blue-400">👍</span>
                  <span className="text-red-400">❤️</span>
                  <span className="text-yellow-400">💡</span>
                  <span className="text-white/55 ml-1">42 reactions</span>
                </div>
                <div>
                  <span>12 comments • 3 shares</span>
                </div>
              </div>

              {/* Action Buttons Mockup */}
              <div className="px-2 py-1 bg-white/[0.01] border-t border-white/5 grid grid-cols-4 gap-1 text-[12px] font-semibold text-white/70 select-none">
                <button type="button" className="py-2.5 hover:bg-white/5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                  <span>👍</span> Like
                </button>
                <button type="button" className="py-2.5 hover:bg-white/5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                  <span>💬</span> Comment
                </button>
                <button type="button" className="py-2.5 hover:bg-white/5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                  <span>🔁</span> Repost
                </button>
                <button type="button" className="py-2.5 hover:bg-white/5 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                  <span>📤</span> Send
                </button>
              </div>

            </div>

            {/* Hint alert */}
            <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex gap-3 text-xs leading-relaxed text-white/45">
              <Info size={16} className="text-brand-accent shrink-0 mt-0.5 animate-pulse" />
              <p>
                LinkedIn feed displays attached media natively. For videos, transcoding may take up to 2-3 minutes. If your video does not appear immediately on LinkedIn, please wait a minute and refresh.
              </p>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
