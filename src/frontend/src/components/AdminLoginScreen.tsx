import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldAlert,
  User,
} from "lucide-react";
import { type Variants, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

interface AdminLoginScreenProps {
  onAdminLogin: () => void;
  onBackToUser: () => void;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export function AdminLoginScreen({
  onAdminLogin,
  onBackToUser,
}: AdminLoginScreenProps) {
  const { actor } = useActor();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!userId.trim()) {
      toast.error("Please enter your User ID.");
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter your password.");
      return;
    }
    if (!actor) {
      toast.error("Service unavailable. Please try again shortly.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await actor.adminLogin({ userId, password });
      if (success) {
        localStorage.setItem("adminSession", "true");
        toast.success("Admin login successful. Welcome!");
        onAdminLogin();
      } else {
        toast.error("Invalid admin credentials. Access denied.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-8"
      style={{ background: "oklch(0.96 0.01 290)" }}
    >
      {/* Decorative background */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.08]"
          style={{
            background: "oklch(0.35 0.2 280)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 -left-24 w-80 h-80 rounded-full opacity-[0.06]"
          style={{
            background: "oklch(0.45 0.22 295)",
            filter: "blur(70px)",
          }}
        />
        {/* Diagonal stripes for admin feel */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.018]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="admin-dots"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="oklch(0.35 0.2 280)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admin-dots)" />
        </svg>
      </div>

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-[420px]"
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div
          className="rounded-2xl shadow-2xl border overflow-hidden"
          style={{
            background: "oklch(1 0 0)",
            borderColor: "oklch(0.85 0.04 280)",
            boxShadow:
              "0 8px 40px -8px oklch(0.35 0.2 280 / 0.2), 0 2px 8px -2px oklch(0.35 0.2 280 / 0.1)",
          }}
        >
          {/* Top accent strip — purple/indigo to distinguish from user */}
          <div
            className="h-1.5 w-full"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.32 0.22 280), oklch(0.45 0.25 295), oklch(0.38 0.2 310))",
            }}
          />

          <motion.div
            className="px-7 pt-8 pb-9"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* ADMIN ACCESS badge */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center mb-6"
            >
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold font-body tracking-widest uppercase"
                style={{
                  background: "oklch(0.96 0.04 280)",
                  color: "oklch(0.32 0.22 280)",
                  border: "1px solid oklch(0.82 0.08 280)",
                }}
              >
                <ShieldAlert className="w-3.5 h-3.5" strokeWidth={2.5} />
                Admin Access Only
              </div>
            </motion.div>

            {/* Logo + brand */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center text-center mb-8"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.28 0.22 280), oklch(0.42 0.25 295))",
                  boxShadow: "0 6px 20px -4px oklch(0.35 0.22 280 / 0.5)",
                }}
              >
                <KeyRound className="w-9 h-9 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="font-display text-2xl font-black tracking-tight leading-tight text-foreground">
                Admin Portal
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground font-body">
                Vijay Online Centre — Restricted Access
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                {/* User ID */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label
                    htmlFor="adminUserId"
                    className="text-sm font-semibold text-foreground font-body"
                  >
                    Admin User ID
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <User
                        className="w-4 h-4"
                        style={{ color: "oklch(0.45 0.1 280)" }}
                        strokeWidth={2}
                      />
                    </span>
                    <Input
                      id="adminUserId"
                      type="text"
                      placeholder="Enter admin user ID"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className="pl-10 h-12 rounded-xl font-body text-sm transition-all duration-200"
                      style={{
                        background: "oklch(0.96 0.01 280)",
                        borderColor: "oklch(0.86 0.04 280)",
                      }}
                      autoComplete="username"
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label
                    htmlFor="adminPassword"
                    className="text-sm font-semibold text-foreground font-body"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Lock
                        className="w-4 h-4"
                        style={{ color: "oklch(0.45 0.1 280)" }}
                        strokeWidth={2}
                      />
                    </span>
                    <Input
                      id="adminPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-11 h-12 rounded-xl font-body text-sm transition-all duration-200"
                      style={{
                        background: "oklch(0.96 0.01 280)",
                        borderColor: "oklch(0.86 0.04 280)",
                      }}
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150 p-0.5 rounded focus-visible:outline-none focus-visible:ring-2"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" strokeWidth={2} />
                      ) : (
                        <Eye className="w-4 h-4" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Submit */}
              <motion.div variants={itemVariants} className="mt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl font-display font-bold text-[15px] tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 border-0 text-white"
                  style={{
                    background: isLoading
                      ? "oklch(0.42 0.12 280)"
                      : "linear-gradient(135deg, oklch(0.30 0.22 280), oklch(0.42 0.25 295))",
                    boxShadow: isLoading
                      ? "none"
                      : "0 4px 16px -4px oklch(0.35 0.22 280 / 0.5)",
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" strokeWidth={2} />
                      Access Admin Panel
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Back to user login */}
            <motion.div variants={itemVariants} className="mt-5 text-center">
              <button
                type="button"
                onClick={onBackToUser}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 font-body"
              >
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                Back to User Login
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Security notice */}
        <motion.p
          className="text-center text-xs text-muted-foreground font-body mt-4 opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.7 }}
        >
          🔒 This area is restricted to authorised administrators only
        </motion.p>
      </motion.div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground font-body opacity-50">
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
