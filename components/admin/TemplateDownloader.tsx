"use client";

import { useState } from "react";
import { CATEGORIES, generateTemplate } from "@/lib/templates";
import { Download, Copy, Check, FileText, ChevronDown } from "lucide-react";

export default function TemplateDownloader({ selectedCategory }: { selectedCategory?: string }) {
  const [category, setCategory] = useState(selectedCategory || "saas");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const template = generateTemplate(category);
  const catLabel = CATEGORIES.find((c) => c.id === category)?.label || category;

  const handleDownload = () => {
    const blob = new Blob([template], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `primadex-template-${category}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-[24px] space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-brand-accent/10 rounded-xl border border-brand-accent/20">
          <FileText size={18} className="text-brand-accent" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">Download Listing Template</h3>
          <p className="text-white/40 text-xs mt-0.5">Get the v3.0 template for your product type</p>
        </div>
      </div>

      {/* Category picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm hover:border-brand-accent/30 transition-all"
        >
          <span>{catLabel}</span>
          <ChevronDown size={16} className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute z-50 mt-2 w-full bg-[#0d1525] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setCategory(c.id); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${category === c.id ? "text-brand-accent font-bold" : "text-white/70"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-brand-accent/20"
        >
          <Download size={16} />
          Download .md
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center justify-center gap-2 px-5 py-3 border rounded-xl font-bold text-sm transition-all ${copied ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Preview */}
      <details className="group">
        <summary className="text-xs text-white/30 cursor-pointer hover:text-white/60 transition-colors select-none">
          Preview template ›
        </summary>
        <pre className="mt-3 p-4 bg-black/30 rounded-xl text-white/50 text-[10px] leading-relaxed overflow-x-auto max-h-48 scrollbar-thin">
          {template.slice(0, 800)}...
        </pre>
      </details>
    </div>
  );
}
