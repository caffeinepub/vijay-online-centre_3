import { ServiceStatus } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Service } from "@/data/services";
import { useActor } from "@/hooks/useActor";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";
import { type Variants, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ServiceFormProps {
  service: Service;
  onBack: () => void;
  mobile: string;
}

interface FormFields {
  fullName: string;
  mobileNumber: string;
  fatherName: string;
  dob: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  aadhaar: string;
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

function StatusDisplay({ status }: { status: ServiceStatus | null }) {
  if (status === null) return null;

  if (status === ServiceStatus.pending) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3 mt-4"
        style={{
          background: "oklch(0.97 0.05 80)",
          border: "1px solid oklch(0.88 0.1 80)",
        }}
      >
        <Clock
          className="w-5 h-5 flex-shrink-0"
          style={{ color: "oklch(0.5 0.18 70)" }}
          strokeWidth={2}
        />
        <div>
          <p
            className="text-sm font-bold font-body"
            style={{ color: "oklch(0.45 0.18 70)" }}
          >
            Application Pending
          </p>
          <p
            className="text-xs font-body mt-0.5"
            style={{ color: "oklch(0.55 0.12 70)" }}
          >
            Your application is under review. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  if (status === ServiceStatus.processing) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3 mt-4"
        style={{
          background: "oklch(0.96 0.04 230)",
          border: "1px solid oklch(0.85 0.09 230)",
        }}
      >
        <CheckCircle
          className="w-5 h-5 flex-shrink-0"
          style={{ color: "oklch(0.38 0.18 240)" }}
          strokeWidth={2}
        />
        <div>
          <p
            className="text-sm font-bold font-body"
            style={{ color: "oklch(0.35 0.18 240)" }}
          >
            Being Processed
          </p>
          <p
            className="text-xs font-body mt-0.5"
            style={{ color: "oklch(0.45 0.12 240)" }}
          >
            Your application is being processed. We will contact you soon.
          </p>
        </div>
      </div>
    );
  }

  // rejected
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 mt-4"
      style={{
        background: "oklch(0.97 0.04 25)",
        border: "1px solid oklch(0.88 0.09 25)",
      }}
    >
      <XCircle
        className="w-5 h-5 flex-shrink-0"
        style={{ color: "oklch(0.5 0.22 25)" }}
        strokeWidth={2}
      />
      <div>
        <p
          className="text-sm font-bold font-body"
          style={{ color: "oklch(0.45 0.22 25)" }}
        >
          Request Rejected
        </p>
        <p
          className="text-xs font-body mt-0.5"
          style={{ color: "oklch(0.55 0.15 25)" }}
        >
          Your request was rejected. Please contact us for more information.
        </p>
      </div>
    </div>
  );
}

export function ServiceForm({ service, onBack, mobile }: ServiceFormProps) {
  const { actor } = useActor();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedMobile, setSubmittedMobile] = useState("");
  const [requestStatus, setRequestStatus] = useState<ServiceStatus | null>(
    null,
  );
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [fields, setFields] = useState<FormFields>({
    fullName: "",
    mobileNumber: mobile,
    fatherName: "",
    dob: "",
    address: "",
    district: "",
    state: "Uttar Pradesh",
    pincode: "",
    aadhaar: "",
  });

  function update(key: keyof FormFields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
    };
  }

  const checkStatus = useCallback(
    async (mob: string) => {
      if (!actor || !mob) return;
      setIsCheckingStatus(true);
      try {
        const requests = await actor.getMyServiceRequests(mob);
        // Find the most recent request for this service
        const serviceRequests = requests.filter(
          (r) => r.serviceName === service.name,
        );
        if (serviceRequests.length > 0) {
          // Sort by timestamp descending, pick most recent
          const sorted = [...serviceRequests].sort(
            (a, b) =>
              Number(b.submittedAt / 1_000_000n) -
              Number(a.submittedAt / 1_000_000n),
          );
          setRequestStatus(sorted[0].status);
        }
      } catch {
        // Silently fail status check
      } finally {
        setIsCheckingStatus(false);
      }
    },
    [actor, service.name],
  );

  // After submission, poll status
  useEffect(() => {
    if (!submitted || !submittedMobile) return;
    checkStatus(submittedMobile);
  }, [submitted, submittedMobile, checkStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!/^\d{10}$/.test(fields.mobileNumber)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (fields.pincode && !/^\d{6}$/.test(fields.pincode)) {
      toast.error("Please enter a valid 6-digit pincode.");
      return;
    }
    if (fields.aadhaar && !/^\d{12}$/.test(fields.aadhaar)) {
      toast.error("Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    if (!actor) {
      toast.error("Service unavailable. Please try again shortly.");
      return;
    }

    setIsSubmitting(true);
    try {
      await actor.submitServiceRequest({
        customerName: fields.fullName.trim(),
        mobile: fields.mobileNumber,
        fatherName: fields.fatherName.trim(),
        dob: fields.dob,
        address: fields.address.trim(),
        district: fields.district.trim(),
        state: fields.state.trim(),
        pincode: fields.pincode,
        aadhaar: fields.aadhaar,
        serviceName: service.name,
        serviceHindiName: service.hindiName ?? "",
        documents: [],
      });
      setSubmittedMobile(fields.mobileNumber);
      setSubmitted(true);
      toast.success(
        `Application submitted! We will contact you on ${fields.mobileNumber}.`,
      );
    } catch {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        className="min-h-screen bg-background flex flex-col items-center justify-center px-4"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="bg-card rounded-2xl border border-border/60 shadow-card p-8 max-w-sm w-full text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.32 0.18 264), oklch(0.44 0.22 264))",
            }}
          >
            <CheckCircle className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-2xl font-black text-foreground mb-2">
            Application Submitted!
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-1">
            <span className="font-semibold text-foreground">
              {service.icon} {service.name}
            </span>
          </p>
          <p className="text-muted-foreground font-body text-sm mb-4">
            We will contact you on{" "}
            <span className="font-semibold text-foreground">
              +91 {submittedMobile}
            </span>
          </p>

          {/* Status section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold font-body text-muted-foreground uppercase tracking-wider">
                Application Status
              </p>
              <button
                type="button"
                onClick={() => checkStatus(submittedMobile)}
                disabled={isCheckingStatus}
                className="flex items-center gap-1 text-xs font-semibold font-body transition-colors disabled:opacity-50"
                style={{ color: "oklch(0.44 0.18 264)" }}
              >
                <RefreshCw
                  className={`w-3 h-3 ${isCheckingStatus ? "animate-spin" : ""}`}
                  strokeWidth={2.5}
                />
                Refresh
              </button>
            </div>
            <StatusDisplay status={requestStatus} />
          </div>

          <Button
            onClick={onBack}
            className="w-full h-12 rounded-xl font-display font-bold text-[15px] text-white border-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.32 0.18 264), oklch(0.44 0.22 264))",
            }}
          >
            Back to Services
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-sm"
        style={{ background: "oklch(0.97 0.008 240 / 0.95)" }}
      >
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold font-body text-muted-foreground hover:text-foreground transition-colors duration-150 -ml-1 p-1.5 rounded-lg hover:bg-muted/60"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            Back to Services
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-12">
        {/* Service heading */}
        <motion.div
          className="pt-6 pb-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-btn flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.28 0.16 264), oklch(0.42 0.2 264))",
              }}
            >
              {service.icon}
            </div>
            <div>
              <h1 className="font-display text-xl font-black text-foreground leading-tight">
                {service.name}
              </h1>
              {service.hindiName && (
                <p className="text-muted-foreground font-body text-sm mt-0.5">
                  {service.hindiName}
                </p>
              )}
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground font-body">
            Fill in the details below to submit your application. All fields
            marked with <span className="text-destructive">*</span> are
            required.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          className="bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          {/* Top gradient bar */}
          <div
            className="h-1 w-full"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.34 0.18 264), oklch(0.55 0.2 255), oklch(0.45 0.22 290))",
            }}
          />

          <form onSubmit={handleSubmit} noValidate>
            <motion.div
              className="px-5 py-6 space-y-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Full Name */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label
                  htmlFor="fullName"
                  className="text-sm font-semibold text-foreground font-body"
                >
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fields.fullName}
                  onChange={update("fullName")}
                  className="h-12 rounded-xl bg-muted/50 border-border font-body text-sm focus-visible:ring-2 focus-visible:ring-primary/60"
                  autoComplete="name"
                  required
                  disabled={isSubmitting}
                />
              </motion.div>

              {/* Mobile Number */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label
                  htmlFor="mobileNumber"
                  className="text-sm font-semibold text-foreground font-body"
                >
                  Mobile Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  value={fields.mobileNumber}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      mobileNumber: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    }))
                  }
                  className="h-12 rounded-xl bg-muted/50 border-border font-body text-sm focus-visible:ring-2 focus-visible:ring-primary/60"
                  autoComplete="tel"
                  maxLength={10}
                  disabled={isSubmitting}
                />
              </motion.div>

              {/* Two-column: Father's Name & DOB */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fatherName"
                    className="text-sm font-semibold text-foreground font-body"
                  >
                    Father's / Husband's Name
                  </Label>
                  <Input
                    id="fatherName"
                    type="text"
                    placeholder="Father's / Husband's name"
                    value={fields.fatherName}
                    onChange={update("fatherName")}
                    className="h-12 rounded-xl bg-muted/50 border-border font-body text-sm focus-visible:ring-2 focus-visible:ring-primary/60"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="dob"
                    className="text-sm font-semibold text-foreground font-body"
                  >
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={fields.dob}
                    onChange={update("dob")}
                    className="h-12 rounded-xl bg-muted/50 border-border font-body text-sm focus-visible:ring-2 focus-visible:ring-primary/60"
                    disabled={isSubmitting}
                  />
                </div>
              </motion.div>

              {/* Address */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label
                  htmlFor="address"
                  className="text-sm font-semibold text-foreground font-body"
                >
                  Address
                </Label>
                <Textarea
                  id="address"
                  placeholder="House No., Street, Village/Town"
                  value={fields.address}
                  onChange={update("address")}
                  className="rounded-xl bg-muted/50 border-border font-body text-sm focus-visible:ring-2 focus-visible:ring-primary/60 resize-none min-h-[80px]"
                  disabled={isSubmitting}
                />
              </motion.div>

              {/* Three-column: District, State, Pincode */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="district"
                    className="text-sm font-semibold text-foreground font-body"
                  >
                    District
                  </Label>
                  <Input
                    id="district"
                    type="text"
                    placeholder="District"
                    value={fields.district}
                    onChange={update("district")}
                    className="h-12 rounded-xl bg-muted/50 border-border font-body text-sm focus-visible:ring-2 focus-visible:ring-primary/60"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="state"
                    className="text-sm font-semibold text-foreground font-body"
                  >
                    State
                  </Label>
                  <Input
                    id="state"
                    type="text"
                    placeholder="State"
                    value={fields.state}
                    onChange={update("state")}
                    className="h-12 rounded-xl bg-muted/50 border-border font-body text-sm focus-visible:ring-2 focus-visible:ring-primary/60"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="pincode"
                    className="text-sm font-semibold text-foreground font-body"
                  >
                    Pincode
                  </Label>
                  <Input
                    id="pincode"
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit"
                    value={fields.pincode}
                    onChange={(e) =>
                      setFields((prev) => ({
                        ...prev,
                        pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    className="h-12 rounded-xl bg-muted/50 border-border font-body text-sm focus-visible:ring-2 focus-visible:ring-primary/60"
                    maxLength={6}
                    disabled={isSubmitting}
                  />
                </div>
              </motion.div>

              {/* Aadhaar Number */}
              <motion.div variants={itemVariants} className="space-y-1.5">
                <Label
                  htmlFor="aadhaar"
                  className="text-sm font-semibold text-foreground font-body"
                >
                  Aadhaar Number
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    (12 digits)
                  </span>
                </Label>
                <Input
                  id="aadhaar"
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter 12-digit Aadhaar number"
                  value={fields.aadhaar}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      aadhaar: e.target.value.replace(/\D/g, "").slice(0, 12),
                    }))
                  }
                  className="h-12 rounded-xl bg-muted/50 border-border font-body text-sm focus-visible:ring-2 focus-visible:ring-primary/60"
                  maxLength={12}
                  disabled={isSubmitting}
                />
              </motion.div>

              {/* Submit */}
              <motion.div variants={itemVariants} className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl font-display font-bold text-[15px] tracking-wide transition-all duration-200 shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0 border-0 text-white"
                  style={{
                    background: isSubmitting
                      ? "oklch(0.42 0.12 264)"
                      : "linear-gradient(135deg, oklch(0.32 0.18 264), oklch(0.44 0.22 264))",
                  }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" strokeWidth={2} />
                      Submit Application
                    </span>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </form>
        </motion.div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground font-body mt-4 opacity-60 px-2">
          Your information is secure and will only be used for the purpose of
          this application.
        </p>
      </main>
    </div>
  );
}
