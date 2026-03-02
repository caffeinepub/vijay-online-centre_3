import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { type Variants, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

type Mode = "login" | "register";

function validate(mobile: string, password: string): string | null {
  if (!/^\d{10}$/.test(mobile))
    return "Please enter a valid 10-digit mobile number.";
  if (password.trim().length === 0) return "Password cannot be empty.";
  return null;
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

interface LoginScreenProps {
  onLoginSuccess?: (mobile: string) => void;
  onAdminLogin?: () => void;
}

export function LoginScreen({
  onLoginSuccess,
  onAdminLogin,
}: LoginScreenProps) {
  const { actor } = useActor();
  const [mode, setMode] = useState<Mode>("login");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const error = validate(mobile, password);
    if (error) {
      toast.error(error);
      return;
    }

    if (!actor) {
      toast.error("Service unavailable. Please try again shortly.");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "login") {
        const success = await actor.login({ mobile, password });
        if (success) {
          toast.success("Welcome back! You are now logged in.");
          onLoginSuccess?.(mobile);
        } else {
          toast.error("Invalid credentials. Please try again.");
        }
      } else {
        await actor.register({ mobile, password });
        toast.success("Account created successfully! You can now login.");
        setMode("login");
        setPassword("");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background px-4 py-8">
      {/* Decorative background blobs */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.07]"
          style={{
            background: "oklch(0.34 0.18 264)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute top-1/2 -right-24 w-80 h-80 rounded-full opacity-[0.06]"
          style={{
            background: "oklch(0.55 0.2 255)",
            filter: "blur(70px)",
          }}
        />
        <div
          className="absolute -bottom-20 left-1/4 w-64 h-64 rounded-full opacity-[0.05]"
          style={{
            background: "oklch(0.4 0.15 264)",
            filter: "blur(60px)",
          }}
        />
        {/* Subtle dot grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.025]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="dots"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1.5" cy="1.5" r="1.5" fill="oklch(0.34 0.18 264)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-[420px]"
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="bg-card rounded-2xl shadow-card border border-border/60 overflow-hidden">
          {/* Top accent strip */}
          <div
            className="h-1.5 w-full"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.34 0.18 264), oklch(0.55 0.2 255), oklch(0.45 0.22 290))",
            }}
          />

          <motion.div
            className="px-7 pt-8 pb-9"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Logo + brand */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center text-center mb-8"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-btn"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.28 0.16 264), oklch(0.42 0.2 264))",
                }}
              >
                <img
                  src="/assets/generated/voc-logo-transparent.dim_120x120.png"
                  alt="Vijay Online Centre Logo"
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      const icon = parent.querySelector(
                        ".fallback-icon",
                      ) as HTMLElement;
                      if (icon) icon.style.display = "flex";
                    }
                  }}
                />
                <span
                  className="fallback-icon items-center justify-center"
                  style={{ display: "none" }}
                >
                  <ShieldCheck
                    className="w-9 h-9 text-white"
                    strokeWidth={1.5}
                  />
                </span>
              </div>
              <h1 className="font-display text-2xl font-black tracking-tight leading-tight text-foreground">
                Vijay Online Centre
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground font-body">
                {mode === "login"
                  ? "Welcome back! Please login to continue."
                  : "Create your account to get started."}
              </p>
            </motion.div>

            {/* Mode tabs */}
            <motion.div
              variants={itemVariants}
              className="flex bg-muted rounded-xl p-1 mb-6"
            >
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 py-2 text-sm font-semibold font-body rounded-lg transition-all duration-200 ${
                  mode === "login"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 py-2 text-sm font-semibold font-body rounded-lg transition-all duration-200 ${
                  mode === "register"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Register
              </button>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                {/* Mobile number */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label
                    htmlFor="mobile"
                    className="text-sm font-semibold text-foreground font-body"
                  >
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Smartphone
                        className="w-4 h-4"
                        style={{ color: "oklch(0.52 0.04 255)" }}
                        strokeWidth={2}
                      />
                    </span>
                    <Input
                      id="mobile"
                      type="tel"
                      inputMode="numeric"
                      placeholder="Enter 10-digit mobile number"
                      value={mobile}
                      onChange={(e) =>
                        setMobile(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      className="pl-10 h-12 rounded-xl bg-muted/60 border-border text-foreground placeholder:text-muted-foreground font-body text-sm focus-visible:ring-2 focus-visible:ring-primary/60 transition-all duration-200"
                      autoComplete="tel"
                      maxLength={10}
                      disabled={isLoading}
                    />
                    {mobile.length > 0 && (
                      <span
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium tabular-nums"
                        style={{
                          color:
                            mobile.length === 10
                              ? "oklch(0.55 0.15 145)"
                              : "oklch(0.52 0.04 255)",
                        }}
                      >
                        {mobile.length}/10
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-foreground font-body"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Lock
                        className="w-4 h-4"
                        style={{ color: "oklch(0.52 0.04 255)" }}
                        strokeWidth={2}
                      />
                    </span>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-11 h-12 rounded-xl bg-muted/60 border-border text-foreground placeholder:text-muted-foreground font-body text-sm focus-visible:ring-2 focus-visible:ring-primary/60 transition-all duration-200"
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150 p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
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

              {/* Submit button */}
              <motion.div variants={itemVariants} className="mt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl font-display font-bold text-[15px] tracking-wide transition-all duration-200 shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0 border-0 text-white"
                  style={{
                    background: isLoading
                      ? "oklch(0.42 0.12 264)"
                      : "linear-gradient(135deg, oklch(0.32 0.18 264), oklch(0.44 0.22 264))",
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {mode === "login" ? "Logging in…" : "Creating account…"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {mode === "login" ? "Login" : "Create Account"}
                      <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Switch mode link */}
            <motion.div variants={itemVariants} className="mt-5 text-center">
              <p className="text-sm text-muted-foreground font-body">
                {mode === "login" ? (
                  <>
                    New user?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="font-semibold hover:underline transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
                      style={{ color: "oklch(0.44 0.18 264)" }}
                    >
                      Register here
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="font-semibold hover:underline transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
                      style={{ color: "oklch(0.44 0.18 264)" }}
                    >
                      Login
                    </button>
                  </>
                )}
              </p>
            </motion.div>

            {/* Admin login link — subtle, bottom of card */}
            {onAdminLogin && (
              <motion.div
                variants={itemVariants}
                className="mt-4 pt-4 border-t border-border/40 text-center"
              >
                <button
                  type="button"
                  onClick={onAdminLogin}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 font-body opacity-60 hover:opacity-100"
                >
                  Admin Login →
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Help text below card */}
        <motion.p
          className="text-center text-xs text-muted-foreground font-body mt-4 opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.7 }}
        >
          Secure login · Your data is protected
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
