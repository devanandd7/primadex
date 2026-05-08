export type ProductType = "free" | "paid" | "subscription";
export type ProductCategory = "saas" | "iot" | "medical" | "education" | "subscription" | "other";

export type Product = {
  _id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: ProductCategory | string;
  type: ProductType | string;
  price: number;
  currency?: "INR" | string;

  images?: string[];
  features?: string[];
  techStack?: string[];
  badge?: string;

  isFeatured?: boolean;
  isActive?: boolean;
  isSubscription?: boolean;

  downloadUrl?: string;
  demoUrl?: string;
  docsUrl?: string;
  razorpayPlanId?: string;

  createdAt?: number;
};

// In-memory store for development/demo.
// Later you can replace these helpers with MongoDB + real `Product` model.
let products: Product[] = [
  {
    _id: "prd_zenith_ai_tutor",
    name: "Zenith AI Tutor",
    description: "Adaptive learning companion powered by modern NLP.",
    longDescription:
      "Zenith helps learners practice with personalized explanations, progress tracking, and quizzes.",
    category: "education",
    type: "subscription",
    price: 1499,
    currency: "INR",
    images: ["/placeholder-product.jpg"],
    features: ["Personalized practice", "Quizzes & feedback", "Progress dashboards"],
    techStack: ["Next.js", "React", "AI APIs"],
    badge: "Premium",
    isFeatured: true,
    isActive: true,
    razorpayPlanId: "plan_premium_zenith",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
  {
    _id: "prd_medlink_patient_portal",
    name: "MedLink Patient Portal",
    description: "Fast patient access to schedules, reports, and messaging.",
    longDescription:
      "MedLink streamlines communication between patients and providers with a secure, modern portal.",
    category: "medical",
    type: "paid",
    price: 4999,
    currency: "INR",
    images: ["/placeholder-product.jpg"],
    features: ["Appointments", "Report viewer", "Secure messaging"],
    techStack: ["Next.js", "MongoDB", "Secure Auth"],
    badge: "Popular",
    isFeatured: true,
    isActive: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 9,
  },
  {
    _id: "prd_iotrack_sensors",
    name: "IoT-Rack Sensors Dashboard",
    description: "Realtime telemetry dashboards for smart devices.",
    longDescription:
      "Monitor device metrics in realtime, build alerts, and export reports for operations teams.",
    category: "iot",
    type: "subscription",
    price: 2999,
    currency: "INR",
    images: ["/placeholder-product.jpg"],
    features: ["Realtime charts", "Alert rules", "Export to CSV"],
    techStack: ["Next.js", "Node.js", "WebSockets"],
    badge: "Live Data",
    isFeatured: true,
    isActive: true,
    razorpayPlanId: "plan_iottrack",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
  {
    _id: "prd_saaskit_ops",
    name: "SaaSKit Operations Suite",
    description: "Billing, analytics, and customer workflows in one place.",
    longDescription:
      "SaaSKit helps teams ship faster with dashboards, automation workflows, and conversion insights.",
    category: "saas",
    type: "paid",
    price: 1999,
    currency: "INR",
    images: ["/placeholder-product.jpg"],
    features: ["Analytics widgets", "Workflow automation", "Customer segments"],
    techStack: ["Next.js", "MongoDB", "Analytics"],
    badge: "Built for Scale",
    isFeatured: true,
    isActive: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    _id: "prd_free_template_starter",
    name: "Primadex Starter Template",
    description: "A clean UI kit starter for launching your next product.",
    longDescription: "Includes ready-to-use components, styles, and example product pages.",
    category: "other",
    type: "free",
    price: 0,
    currency: "INR",
    images: ["/placeholder-product.jpg"],
    features: ["Fast setup", "Clean design tokens", "Production-ready structure"],
    techStack: ["React", "Tailwind CSS"],
    badge: "Free Download",
    isFeatured: false,
    isActive: true,
    downloadUrl: "https://example.com/download",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    _id: "prd_subscribe_management",
    name: "Subscription Management Hub",
    description: "Track plans, upgrades, and lifecycle events effortlessly.",
    longDescription:
      "A subscription-first dashboard for product teams: plan management, user metrics, and upgrade flows.",
    category: "subscription",
    type: "subscription",
    price: 2499,
    currency: "INR",
    images: ["/placeholder-product.jpg"],
    features: ["Plan lifecycle", "Upgrade analytics", "Customer metrics"],
    techStack: ["Next.js", "Stripe/Razorpay-ready"],
    badge: "Recurring Value",
    isFeatured: false,
    isActive: true,
    razorpayPlanId: "plan_subhub",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
];

function normalizeId(id: string) {
  return id.trim();
}

export function getFeaturedProducts(limit = 6) {
  return products
    .filter((p) => p.isActive !== false && p.isFeatured === true)
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .slice(0, limit);
}

export function getProductsByCategory(category?: string) {
  const cat = category?.trim();
  if (!cat || cat === "all") return products.filter((p) => p.isActive !== false);
  return products.filter((p) => p.isActive !== false && p.category === cat);
}

export function getProductById(id: string) {
  const pid = normalizeId(id);
  return products.find((p) => p._id === pid) ?? null;
}

export function addProduct(input: Omit<Product, "_id" | "createdAt"> & Partial<Pick<Product, "_id">>) {
  const id =
    (typeof input._id === "string" && input._id.trim()) ||
    `prd_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;

  const product: Product = {
    ...input,
    _id: normalizeId(id),
    createdAt: Date.now(),
    images: input.images ?? [],
    features: input.features ?? [],
    techStack: input.techStack ?? [],
    price: typeof input.price === "number" ? input.price : Number(input.price ?? 0),
    currency: input.currency ?? "INR",
  };

  products = [product, ...products];
  return product;
}

