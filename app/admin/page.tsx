"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, LayoutGrid, Package, Settings, LogOut, 
  ChevronRight, BarChart3, Users, Globe, ExternalLink,
  Edit2, Trash2, Eye, Video, Sparkles, FileText, Download, Upload, Zap,
  Search, Filter, MoreHorizontal
} from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { IProduct } from "@/lib/models/Product";
import TemplateDownloader from "@/components/admin/TemplateDownloader";
import ReactMarkdown from "react-markdown";

export default function AdminDashboard() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMode, setLoadingMode] = useState<"none" | "import" | "generate" | "generate_blog">("none");
  const [aiInput, setAiInput] = useState("");
  const [generatedDoc, setGeneratedDoc] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingMode("import");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "analyze");

    try {
      const res = await fetch("/api/admin/ai-analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Save to sessionStorage to pre-fill the add-product form
      sessionStorage.setItem("ai_import_data", JSON.stringify(data));
      window.location.href = "/admin/add-product?source=ai";
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingMode("none");
    }
  };

  const handleAiGenerate = async (mode: "generate" | "generate_blog" = "generate") => {
    if (!aiInput) return;
    setLoadingMode(mode);
    const formData = new FormData();
    formData.append("mode", mode);
    formData.append("input", aiInput);

    try {
      const res = await fetch("/api/admin/ai-analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setGeneratedDoc(data.content);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingMode("none");
    }
  };

  const downloadDoc = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedDoc], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = "ai-asset-details.md";
    document.body.appendChild(element);
    element.click();
  };

  const quickInsert = async () => {
    if (!generatedDoc) return;
    setLoadingMode("import");

    try {
      // We can use a blob to simulate a file upload or just send the text directly if we update the API
      // For now, let's just send the text directly by updating the API to accept text input for analysis
      const formData = new FormData();
      formData.append("mode", "analyze_text");
      formData.append("text", generatedDoc);

      const res = await fetch("/api/admin/ai-analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      sessionStorage.setItem("ai_import_data", JSON.stringify(data));
      window.location.href = "/admin/add-product?source=ai";
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingMode("none");
    }
  };

  useEffect(() => {
    fetch("/api/products?category=all")
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Master <span className="text-brand-accent italic font-serif">Control</span></h1>
            <p className="text-white/50 mt-2">Centralized management for the Primadex ecosystem.</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={handleLogout}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-2xl transition-all border border-white/10"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Admin Navigation Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link href="/admin" className="group">
            <div className="p-6 bg-brand-accent/20 border border-brand-accent/40 rounded-[32px] hover:bg-brand-accent/30 transition-all relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <Package size={80} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-brand-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-accent/20">
                  <LayoutGrid size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">Primadex Assets</h3>
                <p className="text-xs text-white/50 leading-relaxed">Manage products, AI analysis, and asset listings.</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/teachboard" className="group">
            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-[32px] hover:bg-blue-500/20 transition-all relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-blue-500">
                <Video size={80} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                  <Video size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-1">TeachBoard Admin</h3>
                <p className="text-xs text-white/50 leading-relaxed">Control software versions, deployments, and hard updates for desktop users.</p>
              </div>
            </div>
          </Link>

          <div className="p-6 bg-white/5 border border-white/5 rounded-[32px] opacity-40 grayscale relative overflow-hidden h-full cursor-not-allowed">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Users size={24} className="text-white/40" />
              </div>
              <h3 className="text-xl font-bold mb-1 text-white/40">User Management</h3>
              <p className="text-xs text-white/30 leading-relaxed italic">Module coming soon in next release.</p>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-white/5 mb-12" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Package className="text-brand-accent" />
              Product <span className="text-neutral-500 font-light">Inventory</span>
            </h2>
          </div>
          
          <Link 
            href="/admin/add-product"
            className="px-6 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-brand-accent/20"
          >
            <Plus size={20} />
            New Asset
          </Link>
        </div>

        {/* AI Quick Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Quick Import */}
          <div className="bg-gradient-to-br from-brand-accent/10 to-transparent border border-brand-accent/20 rounded-[32px] p-8 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-accent/10 blur-[80px] group-hover:bg-brand-accent/20 transition-all" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brand-accent/20 rounded-2xl text-brand-accent">
                  <Zap size={24} />
                </div>
                <h2 className="text-2xl font-bold">Quick Asset Import</h2>
              </div>
              <p className="text-white/50 mb-8 text-sm leading-relaxed">
                Upload your <span className="text-white font-mono">.md</span> or <span className="text-white font-mono">.txt</span> file. Gemini will analyze the content and pre-fill the entire product form for you.
              </p>
              
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-3xl hover:border-brand-accent/40 hover:bg-brand-accent/5 transition-all cursor-pointer group/label">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  {loadingMode === "import" ? (
                    <div className="animate-spin text-brand-accent mb-3"><Sparkles size={32} /></div>
                  ) : (
                    <Upload className="w-10 h-10 text-white/20 group-hover/label:text-brand-accent mb-3 transition-colors" />
                  )}
                  <p className="mb-2 text-sm text-white/40">
                    <span className="font-bold text-white/70">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-white/20 uppercase tracking-widest font-bold">Markdown or Text only</p>
                </div>
                <input type="file" className="hidden" accept=".md,.txt" onChange={handleFileUpload} />
              </label>

              <div className="mt-6">
                <TemplateDownloader />
              </div>
            </div>
          </div>

          {/* AI Generator */}
          <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-2xl text-white">
                <Sparkles size={24} />
              </div>
              <h2 className="text-2xl font-bold">AI Detail Generator</h2>
            </div>
            
            <div className="flex-1 space-y-4">
              <textarea 
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Paste raw notes, a link, or a brief idea about the asset..."
                className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-brand-accent/50 transition-all resize-none"
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => handleAiGenerate("generate")}
                  disabled={loadingMode !== "none" || !aiInput}
                  className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-brand-accent hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingMode === "generate" ? "Processing..." : "Generate Professional MD"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Huge Full-Width Preview Section */}
        {generatedDoc && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-brand-accent/20 rounded-xl text-brand-accent">
                  <Sparkles size={20} />
                </div>
                AI Result
              </h2>
              <div className="flex gap-4">
                <button 
                  onClick={quickInsert} 
                  className="px-6 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-accent/20 flex items-center gap-2"
                >
                  <Zap size={18} /> Quick Insert
                </button>
                <button 
                  onClick={downloadDoc} 
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10 flex items-center gap-2"
                >
                  <Download size={18} /> Download MD
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
              <div className="bg-black/40 rounded-[32px] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
                <div className="bg-white/5 py-4 px-6 border-b border-white/10 text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                  <FileText size={16} /> Raw Markdown
                </div>
                <textarea 
                  value={generatedDoc}
                  onChange={(e) => setGeneratedDoc(e.target.value)}
                  className="flex-1 w-full bg-transparent p-6 text-sm text-white/80 font-mono resize-none focus:outline-none thin-scrollbar leading-relaxed"
                />
              </div>
              <div className="bg-white/5 rounded-[32px] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
                <div className="bg-white/5 py-4 px-6 border-b border-white/10 text-xs font-bold uppercase tracking-widest text-brand-accent flex items-center gap-2">
                  <Eye size={16} /> Live Render
                </div>
                <div className="flex-1 p-8 overflow-y-auto prose prose-invert prose-base max-w-none text-white/90 thin-scrollbar prose-headings:text-white prose-a:text-brand-accent">
                  <ReactMarkdown>{generatedDoc}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assets List */}
        <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
          <div className="p-8 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <LayoutGrid size={24} className="text-brand-accent" />
              Recent Assets
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-white/30 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                  <th className="px-8 py-5">Product</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Pricing</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-10 text-center text-white/20">Loading assets...</td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="text-white/20 flex flex-col items-center gap-4">
                        <Package size={48} />
                        <p>No assets found. Start by adding a new one.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product: any) => (
                    <tr key={product._id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/10">
                            {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <div className="font-bold">{product.name}</div>
                            <div className="text-xs text-white/40 line-clamp-1 max-w-[200px]">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full text-white/50 border border-white/5">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold">{product.type === "free" ? "Free" : `₹${product.price}`}</div>
                        <div className="text-[10px] text-white/40 uppercase font-bold">{product.type}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.isActive ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-white/20"}`} />
                          <span className={product.isActive ? "text-green-400" : "text-white/20"}>
                            {product.isActive ? "Active" : "Draft"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2.5 bg-white/5 hover:bg-brand-accent/20 hover:text-brand-accent rounded-xl transition-all border border-white/10 group-hover:border-brand-accent/30">
                            <Edit2 size={18} />
                          </button>
                          <Link href={`/products/${product._id}`} className="p-2.5 bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 rounded-xl transition-all border border-white/10 group-hover:border-blue-500/30">
                            <Eye size={18} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
