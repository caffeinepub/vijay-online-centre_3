import { Input } from "@/components/ui/input";
import {
  CATEGORIES,
  CATEGORY_COLORS,
  SERVICES,
  type Service,
} from "@/data/services";
import { LogOut, Search, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, type Variants, motion } from "motion/react";
import { useMemo, useState } from "react";
import { ServiceForm } from "./ServiceForm";

interface DashboardProps {
  mobile: string;
  onLogout: () => void;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut", delay: i * 0.03 },
  }),
};

export function Dashboard({ mobile, onLogout }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SERVICES.filter((s) => {
      const matchesCategory =
        activeCategory === "All" || s.category === activeCategory;
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.hindiName.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  if (selectedService) {
    return (
      <ServiceForm
        service={selectedService}
        onBack={() => setSelectedService(null)}
        mobile={mobile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-sm"
        style={{ background: "oklch(0.97 0.008 240 / 0.95)" }}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.28 0.16 264), oklch(0.42 0.2 264))",
              }}
            >
              <ShieldCheck
                className="w-4.5 h-4.5 text-white"
                strokeWidth={1.5}
              />
            </div>
            <span className="font-display font-black text-[15px] tracking-tight text-foreground truncate">
              Vijay Online Centre
            </span>
          </div>

          {/* User info + logout */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="hidden sm:block text-xs font-body text-muted-foreground">
              +91 {mobile}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs font-semibold font-body text-muted-foreground hover:text-destructive transition-colors duration-150 p-2 rounded-lg hover:bg-destructive/10"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden xs:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {/* Welcome banner */}
        <motion.div
          className="mb-6 rounded-2xl overflow-hidden relative"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            background:
              "linear-gradient(135deg, oklch(0.28 0.16 264) 0%, oklch(0.38 0.2 264) 50%, oklch(0.45 0.22 280) 100%)",
          }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
            <svg
              width="100%"
              height="100%"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              role="presentation"
            >
              <defs>
                <pattern
                  id="banner-dots"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="2" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#banner-dots)" />
            </svg>
          </div>

          <div className="relative px-5 py-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">👋</span>
            </div>
            <div>
              <p className="text-white/70 font-body text-xs font-medium tracking-wider uppercase mb-0.5">
                Welcome back
              </p>
              <h2 className="font-display text-lg font-black text-white leading-tight">
                +91 {mobile}
              </h2>
              <p className="text-white/70 font-body text-xs mt-0.5">
                {SERVICES.length} services available
              </p>
            </div>
          </div>
        </motion.div>

        {/* Services Section */}
        <section aria-label="Services">
          {/* Section header + search */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div>
                <h3 className="font-display text-xl font-black text-foreground tracking-tight">
                  Our Services
                </h3>
                <p className="text-muted-foreground font-body text-sm mt-0.5">
                  Select a service to get started
                </p>
              </div>
              {/* Search */}
              <div className="relative sm:ml-auto w-full sm:w-72">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "oklch(0.52 0.04 255)" }}
                  strokeWidth={2}
                />
                <Input
                  type="search"
                  placeholder="Search services…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-9 h-11 rounded-xl bg-card border-border font-body text-sm focus-visible:ring-2 focus-visible:ring-primary/60 transition-all"
                  aria-label="Search services"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>

            {/* Category filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold font-body transition-all duration-200 ${
                    activeCategory === cat
                      ? "text-white shadow-btn"
                      : "bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                  style={
                    activeCategory === cat
                      ? {
                          background:
                            "linear-gradient(135deg, oklch(0.32 0.18 264), oklch(0.44 0.22 264))",
                        }
                      : undefined
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Results count */}
          {(searchQuery || activeCategory !== "All") && (
            <motion.p
              className="text-xs text-muted-foreground font-body mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Showing {filteredServices.length} of {SERVICES.length} services
            </motion.p>
          )}

          {/* Services Grid */}
          <AnimatePresence mode="wait">
            {filteredServices.length === 0 ? (
              <motion.div
                key="empty"
                className="flex flex-col items-center justify-center py-20 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 text-3xl">
                  🔍
                </div>
                <h4 className="font-display font-bold text-lg text-foreground mb-1">
                  No services found
                </h4>
                <p className="text-muted-foreground font-body text-sm max-w-xs">
                  Try a different search term or browse all categories.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="mt-4 text-sm font-semibold font-body transition-colors duration-150 hover:underline"
                  style={{ color: "oklch(0.44 0.18 264)" }}
                >
                  Clear filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                initial="hidden"
                animate="visible"
              >
                {filteredServices.map((service, i) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    index={i}
                    onClick={() => setSelectedService(service)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 px-4">
        <p className="text-center text-xs text-muted-foreground font-body opacity-50">
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

interface ServiceCardProps {
  service: Service;
  index: number;
  onClick: () => void;
}

function ServiceCard({ service, index, onClick }: ServiceCardProps) {
  const badgeClass =
    CATEGORY_COLORS[service.category] ?? "bg-gray-100 text-gray-700";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      custom={index}
      variants={cardVariants}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="group text-left w-full bg-card rounded-xl border border-border/60 p-4 transition-all duration-200 hover:shadow-card-hover hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      style={{ minHeight: "88px" }}
    >
      <div className="flex items-start gap-3">
        {/* Icon circle */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.94 0.02 264), oklch(0.90 0.04 264))",
          }}
        >
          {service.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-[13.5px] text-foreground leading-snug line-clamp-2">
            {service.name}
          </p>
          {service.hindiName && (
            <p className="text-muted-foreground font-body text-xs mt-0.5 leading-snug line-clamp-1">
              {service.hindiName}
            </p>
          )}
          <div className="mt-2">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold font-body ${badgeClass}`}
            >
              {service.category}
            </span>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 5h6M5.5 2.5L8 5l-2.5 2.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </motion.button>
  );
}
