"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, X, Loader2, CheckCircle, Upload, Image as ImageIcon, 
  Video, Briefcase, Tag, DollarSign, Layers, Link as LinkIcon,
  ChevronLeft, LayoutGrid, Sparkles, GripVertical, Shield, FileText
} from "lucide-react";
import { motion, Reorder, useDragControls } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import TemplateDownloader from "@/components/admin/TemplateDownloader";
import { CATEGORIES } from "@/lib/templates";

const INPUT_CLASS =
  "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-brand-accent/50 focus:ring-1 focus:ring-brand-accent/30 transition-all text-sm";
const LABEL_CLASS = "block text-sm font-semibold text-white/70 mb-2 ml-1";

const GalleryItem = ({ img, onRemove }: { img: string; onRemove: () => void }) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={img}
      dragListener={false}
      dragControls={controls}
      className="relative group w-24 h-24 rounded-xl overflow-hidden border border-white/10 bg-[#0c1326]"
    >
      <img src={img} alt="Product" className="w-full h-full object-cover select-none pointer-events-none" />
      
      {/* Drag Handle */}
      <div 
        onPointerDown={(e) => controls.start(e)}
        className="absolute inset-0 cursor-grab active:cursor-grabbing flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={20} className="text-white/40" />
      </div>

      {/* Delete Button - Isolated */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg"
      >
        <X size={14} />
      </button>
    </Reorder.Item>
  );
};

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isGeneratingBlog, setIsGeneratingBlog] = useState(false);
  const [success, setSuccess] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    longDescription: "",
    category: "saas",
    type: "paid",
    price: "",
    currency: "INR",
    images: [] as string[],
    videoUrl: "",
    features: [""],
    techStack: [""],
    badge: "",
    isFeatured: false,
    isActive: true,
    downloadUrl: "",
    demoUrl: "",
    docsUrl: "",
    razorpayPlanId: "",
    // Category Specific — v3.0 schema
    // SaaS / Subscription
    security: "",
    support: "",
    onboarding: "",
    integrations: [""],
    // Digital Assets / Scripts
    fileFormats: [""],
    compatibility: "",
    techSpecs: "",
    license: "",
    githubUrl: "",
    // Desktop / Mobile App
    platform: "",
    storageRequired: "",
    internetRequired: "",
    autoUpdates: "",
    hardwareNeeds: "",
    minimumOs: "",
    worksOffline: "",
    inAppPurchases: "",
    permissions: "",
    // IoT / Hardware / Physical
    whatsInTheBox: "",
    worksWith: "",
    setupTime: "",
    power: "",
    connectivity: "",
    dimensions: "",
    weight: "",
    material: "",
    warranty: "",
    certifications: "",
    // Medical
    intendedUse: "",
    accuracy: "",
    importantNotice: "",
    // Subscription
    billingCycle: "",
    cancelAnytime: "",
    freeTierIncluded: "",
    // Commercials
    refundPolicy: "",
    trialInfo: "",
    // Marketing
    blogPost: "",
  });

  const updateArr = (field: "features" | "techStack" | "integrations" | "fileFormats", idx: number, val: string) => {
    setForm((f) => {
      const arr = [...(f[field] as string[])];
      arr[idx] = val;
      return { ...f, [field]: arr };
    });
  };

  const addArr = (field: "features" | "techStack" | "integrations" | "fileFormats") =>
    setForm((f) => ({ ...f, [field]: [...(f[field] as string[]), ""] }));

  const removeArr = (field: "features" | "techStack" | "integrations" | "fileFormats", idx: number) =>
    setForm((f) => ({ ...f, [field]: (f[field] as string[]).filter((_, i) => i !== idx) }));

  useEffect(() => {
    // Check if we are coming from AI Import
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("source") === "ai") {
      const storedData = sessionStorage.getItem("ai_import_data");
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          setForm(prev => ({
            ...prev,
            name: data.name || "",
            description: data.description || "",
            longDescription: data.longDescription || "",
            category: data.category || "Templates",
            price: data.price || 0,
            type: data.type || "free",
            features: data.features || [],
            techStack: data.techStack || [],
            badge: data.badge || ""
          }));
          // Clean up
          sessionStorage.removeItem("ai_import_data");
        } catch (e) {
          console.error("Failed to parse AI data", e);
        }
      }
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    // Convert FileList to Array for easy processing
    const fileArray = Array.from(files);
    
    try {
      // Process uploads in sequence to avoid overloading or connection resets
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        
        if (data.url) {
          setForm(f => ({ ...f, images: [...f.images, data.url] }));
        } else {
          console.error("Upload error for file:", file.name, data.error);
        }
      }
    } catch (err) {
      console.error("Batch upload failed", err);
    } finally {
      setUploading(false);
      // Clear input so same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: any = {
        ...form,
        price: parseFloat(form.price) || 0,
        features: form.features.filter(Boolean),
        techStack: form.techStack.filter(Boolean),
        integrations: form.integrations.filter(Boolean),
        fileFormats: form.fileFormats.filter(Boolean),
      };

      if (productId) {
        payload._id = productId;
      }

      const res = await fetch("/api/products", {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product");

      if (data.product?._id) {
        setProductId(data.product._id);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save product";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBlog = async () => {
    if (!form.name || !form.description) {
      alert("Please enter a Name and Short Description first to give the AI some context.");
      return;
    }
    
    setIsGeneratingBlog(true);
    
    // Construct the context prompt based on the filled form
    const aiContext = `Product Name: ${form.name}
    Category: ${form.category}
    Short Description: ${form.description}
    Features: ${form.features.join(", ")}
    `;

    const formData = new FormData();
    formData.append("mode", "generate_blog");
    formData.append("input", aiContext);
    
    if (form.images.length > 0) {
      form.images.forEach(imgUrl => formData.append("images", imgUrl));
    }

    try {
      const res = await fetch("/api/admin/ai-analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setForm((prev) => ({ ...prev, blogPost: data.content }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGeneratingBlog(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col lg:flex-row gap-12 mb-16">
            {/* Left Column: Form */}
            <div className="flex-1 space-y-10">
              <header>
                <h1 className="text-4xl font-bold tracking-tight mb-3">Add New Asset</h1>
                <p className="text-white/50">List your premium software, IOT devices, or medical tech on Primadex.</p>
              </header>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3">
                  <X size={18} /> {error}
                </div>
              )}

              <div className="space-y-12">
                {/* Section 1: Core Information */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-brand-accent mb-2">
                  <Briefcase size={20} />
                  <h2 className="font-bold uppercase tracking-widest text-xs">Core Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={LABEL_CLASS}>Product Title</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Primadex Cloud Core"
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className={`${INPUT_CLASS} appearance-none cursor-pointer`}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#0c1326]">
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>Badge / Status</label>
                    <input
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      placeholder="New, Alpha, Premium..."
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Elevator Pitch (Short Description)</label>
                  <textarea
                    required
                    maxLength={300}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Briefly explain what this does..."
                    rows={2}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Full Narrative (Long Description)</label>
                  <textarea
                    required
                    value={form.longDescription}
                    onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                    placeholder="Go into detail about features, benefits, and technical aspects..."
                    rows={6}
                    className={INPUT_CLASS}
                  />
                </div>
              </section>

              {/* Section 2: Specialized Details (Conditional) */}
              {(form.category === "saas" || form.category === "subscription") ? (
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-brand-accent mb-2">
                    <Shield size={20} />
                    <h2 className="font-bold uppercase tracking-widest text-xs">SaaS & Service Details</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={LABEL_CLASS}>Security & Compliance</label>
                      <input
                        value={form.security}
                        onChange={(e) => setForm({ ...form, security: e.target.value })}
                        placeholder="e.g. SOC2, GDPR, 256-bit AES"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Support Model</label>
                      <input
                        value={form.support}
                        onChange={(e) => setForm({ ...form, support: e.target.value })}
                        placeholder="e.g. 24/7 Email & Chat"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={LABEL_CLASS}>Onboarding Steps</label>
                      <textarea
                        value={form.onboarding}
                        onChange={(e) => setForm({ ...form, onboarding: e.target.value })}
                        placeholder="Step 1: Sign up, Step 2: Configure..."
                        rows={2}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className={LABEL_CLASS}>Integrations (Available APIs/Tools)</label>
                      <div className="flex flex-wrap gap-2">
                        {form.integrations.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              value={item}
                              onChange={(e) => updateArr("integrations", i, e.target.value)}
                              placeholder="Slack"
                              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-brand-accent/50"
                            />
                            <button type="button" onClick={() => removeArr("integrations", i)} className="text-white/20 hover:text-red-400"><X size={14} /></button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addArr("integrations")} className="px-3 py-1.5 border border-dashed border-white/20 rounded-lg text-white/40 text-xs hover:text-white transition-colors">Add Tool</button>
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                <section className="space-y-6">
                  <div className="flex items-center gap-2 text-brand-accent mb-2">
                    <Layers size={20} />
                    <h2 className="font-bold uppercase tracking-widest text-xs">Technical Specifications</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={LABEL_CLASS}>Compatibility</label>
                      <input
                        value={form.compatibility}
                        onChange={(e) => setForm({ ...form, compatibility: e.target.value })}
                        placeholder="e.g. Blender 4.0, Node 20"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>License Type</label>
                      <input
                        value={form.license}
                        onChange={(e) => setForm({ ...form, license: e.target.value })}
                        placeholder="e.g. Commercial, MIT"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={LABEL_CLASS}>Technical Specs (Polys, Latency, etc.)</label>
                      <input
                        value={form.techSpecs}
                        onChange={(e) => setForm({ ...form, techSpecs: e.target.value })}
                        placeholder="e.g. 50k Polygons, 4K Textures"
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className={LABEL_CLASS}>File Formats Included</label>
                      <div className="flex flex-wrap gap-2">
                        {form.fileFormats.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              value={item}
                              onChange={(e) => updateArr("fileFormats", i, e.target.value)}
                              placeholder=".obj"
                              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-brand-accent/50"
                            />
                            <button type="button" onClick={() => removeArr("fileFormats", i)} className="text-white/20 hover:text-red-400"><X size={14} /></button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addArr("fileFormats")} className="px-3 py-1.5 border border-dashed border-white/20 rounded-lg text-white/40 text-xs hover:text-white transition-colors">Add Format</button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Section 2: Media & Assets */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-brand-accent mb-2">
                  <ImageIcon size={20} />
                  <h2 className="font-bold uppercase tracking-widest text-xs">Media & Assets</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className={LABEL_CLASS}>Product Gallery (Drag Handle to Reorder)</label>
                    <div className="flex flex-wrap gap-3">
                      <Reorder.Group 
                        axis="x" 
                        values={form.images} 
                        onReorder={(newOrder) => setForm(f => ({ ...f, images: newOrder }))}
                        className="flex flex-wrap gap-3"
                      >
                        {form.images.map((img, i) => {
                          // Define drag controls inside the map to give each item its own handle
                          // Actually, we can use the standard drag handle pattern
                          return (
                            <GalleryItem 
                              key={img} 
                              img={img} 
                              onRemove={() => removeImage(i)} 
                            />
                          );
                        })}
                      </Reorder.Group>
                      
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-24 h-24 rounded-xl border border-dashed border-white/20 hover:border-brand-accent/50 hover:bg-brand-accent/5 transition-all flex flex-col items-center justify-center gap-2 text-white/40 hover:text-brand-accent"
                      >
                        {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
                        <span className="text-[10px] uppercase font-bold">Upload</span>
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        accept="image/*"
                        multiple
                      />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>YouTube Video Link</label>
                    <div className="relative">
                      <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input
                        value={form.videoUrl}
                        onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                        className={`${INPUT_CLASS} pl-12`}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Commercials */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-brand-accent mb-2">
                  <DollarSign size={20} />
                  <h2 className="font-bold uppercase tracking-widest text-xs">Commercials</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-1 bg-white/5 rounded-2xl">
                  {(["free", "paid", "subscription"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        form.type === t
                          ? "bg-brand-accent text-white shadow-lg"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {form.type !== "free" && (
                    <div>
                      <label className={LABEL_CLASS}>Price (INR)</label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="499"
                        className={INPUT_CLASS}
                      />
                    </div>
                  )}

                  {form.type === "subscription" && (
                    <div>
                      <label className={LABEL_CLASS}>Razorpay Plan ID</label>
                      <input
                        value={form.razorpayPlanId}
                        onChange={(e) => setForm({ ...form, razorpayPlanId: e.target.value })}
                        placeholder="plan_xxxxx"
                        className={INPUT_CLASS}
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Section 4: Specifications */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-brand-accent mb-2">
                  <Layers size={20} />
                  <h2 className="font-bold uppercase tracking-widest text-xs">Specifications</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className={LABEL_CLASS}>Key Features</label>
                    {form.features.map((feat, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={feat}
                          onChange={(e) => updateArr("features", i, e.target.value)}
                          placeholder="e.g. Cloud Sync"
                          className={INPUT_CLASS}
                        />
                        {form.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArr("features", i)}
                            className="p-3 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArr("features")}
                      className="flex items-center gap-2 text-brand-accent text-xs font-bold uppercase tracking-wider hover:bg-brand-accent/10 px-4 py-2 rounded-lg transition-all"
                    >
                      <Plus size={14} /> Add Feature
                    </button>
                  </div>

                  {!["saas", "desktop-app", "mobile-app", "subscription"].includes(form.category) && (
                    <div className="space-y-3">
                      <label className={LABEL_CLASS}>Tech Stack</label>
                      <div className="flex flex-wrap gap-2">
                        {form.techStack.map((tech, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <input
                              value={tech}
                              onChange={(e) => updateArr("techStack", i, e.target.value)}
                              placeholder="Next.js"
                              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs w-24 focus:outline-none focus:border-brand-accent/50"
                            />
                            {form.techStack.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeArr("techStack", i)}
                                className="text-red-500/50 hover:text-red-500"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addArr("techStack")}
                          className="px-3 py-1.5 border border-dashed border-white/20 rounded-lg text-white/40 text-xs hover:border-brand-accent hover:text-brand-accent transition-all"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Section 5: External Links */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-brand-accent mb-2">
                  <LinkIcon size={20} />
                  <h2 className="font-bold uppercase tracking-widest text-xs">External Links</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={LABEL_CLASS}>Demo URL</label>
                    <input
                      value={form.demoUrl}
                      onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                      placeholder="https://demo.primadex.online"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Docs URL</label>
                    <input
                      value={form.docsUrl}
                      onChange={(e) => setForm({ ...form, docsUrl: e.target.value })}
                      placeholder="https://docs.primadex.online"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Refund Policy</label>
                    <input
                      value={form.refundPolicy}
                      onChange={(e) => setForm({ ...form, refundPolicy: e.target.value })}
                      placeholder="e.g. 7-day refund if it doesn't work as described"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Trial / Demo Info</label>
                    <input
                      value={form.trialInfo}
                      onChange={(e) => setForm({ ...form, trialInfo: e.target.value })}
                      placeholder="e.g. 7-day free trial — no credit card needed"
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </section>

              </div>
            </div>

          {/* Right Column: Preview Card */}
          <div className="w-full lg:w-96">
            <div className="sticky top-32">
              <h2 className="font-bold uppercase tracking-widest text-xs text-white/40 mb-4 ml-1">Live Preview</h2>
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-white/5 relative">
                  {form.images[0] ? (
                    <img src={form.images[0]} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  {form.badge && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-brand-accent text-white text-[10px] font-bold uppercase tracking-tighter rounded-full">
                      {form.badge}
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold line-clamp-1">{form.name || "Product Title"}</h3>
                    <p className="text-sm text-white/50 line-clamp-2 mt-1">{form.description || "Description will appear here..."}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {form.type === "free" ? "FREE" : `₹${form.price || "0"}`}
                    </span>
                    <div className="flex gap-1">
                      {form.techStack.slice(0, 3).filter(Boolean).map((t, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-white/5 rounded-md text-white/60">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button disabled className="w-full py-3 bg-white/10 rounded-xl text-white/30 text-sm font-bold uppercase tracking-wider">
                      Preview Only
                    </button>
                  </div>
                </div>
              </div>

              {/* Template Downloader Widget */}
              <TemplateDownloader selectedCategory={form.category} />

              <div className="mt-6 p-6 bg-brand-accent/5 border border-brand-accent/10 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-brand-accent/20 rounded-lg text-brand-accent">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Pro Tip</h4>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">
                      Use high-quality 16:9 images for the first slide to maximize engagement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Marketing / Blog Post (FULL WIDTH) */}
        <section className="mt-16 pt-16 border-t border-white/5 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-brand-accent">
                <div className="p-2 bg-brand-accent/20 rounded-xl">
                  <FileText size={20} />
                </div>
                <h2 className="font-bold text-2xl text-white">Marketing / Blog Post</h2>
              </div>
              <button 
                type="button"
                onClick={handleGenerateBlog}
                disabled={isGeneratingBlog}
                className="px-6 py-3 bg-brand-accent/20 hover:bg-brand-accent hover:text-white text-brand-accent font-bold rounded-2xl transition-all flex items-center gap-2 border border-brand-accent/30 disabled:opacity-50"
              >
                {isGeneratingBlog ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing...</>
                ) : (
                  <><Sparkles size={18} /> AI Generate from Form Details</>
                )}
              </button>
            </div>
            <p className="text-white/50">Optionally add a promotional blog post for this asset. Markdown is fully supported.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px] mt-8">
              <div className="bg-black/40 rounded-[32px] border border-white/10 flex flex-col overflow-hidden shadow-2xl h-full">
                <div className="bg-white/5 py-4 px-6 border-b border-white/10 text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                  <FileText size={16} /> Raw Markdown
                </div>
                <textarea
                  value={form.blogPost}
                  onChange={(e) => setForm({ ...form, blogPost: e.target.value })}
                  placeholder="# Why this asset is amazing..."
                  className="flex-1 w-full bg-transparent p-6 text-sm text-white/80 font-mono resize-none focus:outline-none thin-scrollbar leading-relaxed"
                />
              </div>
              <div className="bg-white/5 rounded-[32px] border border-white/10 flex flex-col overflow-hidden shadow-2xl h-full">
                <div className="bg-white/5 py-4 px-6 border-b border-white/10 text-xs font-bold uppercase tracking-widest text-brand-accent flex items-center gap-2">
                  <Sparkles size={16} /> Live Preview
                </div>
                <div className="flex-1 p-8 overflow-y-auto prose prose-invert prose-base max-w-none text-white/90 thin-scrollbar prose-headings:text-white prose-a:text-brand-accent">
                  {form.blogPost ? (
                    <ReactMarkdown>{form.blogPost}</ReactMarkdown>
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/20 italic">
                      Generate or write markdown to see preview...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Submit Action */}
          <div className="mt-16 pt-8 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-2xl transition-all flex items-center gap-3 shadow-2xl shadow-brand-accent/20 active:scale-[0.98] disabled:opacity-50 text-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : <><Sparkles size={24} /> {productId ? "Update Asset" : "Publish Asset"}</>}
            </button>
          </div>
        </form>
      </main>

      {success && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c1326] border border-white/10 p-12 rounded-[40px] text-center max-w-sm w-full animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-green-500/30">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Success!</h2>
            <p className="text-white/50 mb-8 leading-relaxed">Your asset has been saved successfully.</p>
            <div className="w-12 h-1 bg-brand-accent mx-auto rounded-full animate-pulse" />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
