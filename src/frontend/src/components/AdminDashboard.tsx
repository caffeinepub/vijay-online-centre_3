import { type ServiceRequest, ServiceStatus } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import {
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface AdminDashboardProps {
  onLogout: () => void;
}

function formatTimestamp(ts: bigint): string {
  try {
    const ms = Number(ts / 1_000_000n);
    const date = new Date(ms);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "Unknown date";
  }
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  if (status === ServiceStatus.pending) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-body"
        style={{
          background: "oklch(0.97 0.05 80)",
          color: "oklch(0.5 0.18 70)",
          border: "1px solid oklch(0.88 0.1 80)",
        }}
      >
        <Clock className="w-3 h-3" strokeWidth={2.5} />
        Pending
      </span>
    );
  }
  if (status === ServiceStatus.processing) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-body"
        style={{
          background: "oklch(0.96 0.04 230)",
          color: "oklch(0.38 0.18 240)",
          border: "1px solid oklch(0.85 0.09 230)",
        }}
      >
        <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
        Processing
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-body"
      style={{
        background: "oklch(0.97 0.04 25)",
        color: "oklch(0.5 0.22 25)",
        border: "1px solid oklch(0.88 0.09 25)",
      }}
    >
      <XCircle className="w-3 h-3" strokeWidth={2.5} />
      Request Rejected
    </span>
  );
}

function RequestSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

interface RequestCardProps {
  request: ServiceRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isUpdating: boolean;
}

function RequestCard({
  request,
  onAccept,
  onReject,
  isUpdating,
}: RequestCardProps) {
  const isPending = request.status === ServiceStatus.pending;
  const fullAddress = [
    request.address,
    request.district,
    request.state,
    request.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <motion.div
      layout
      className="bg-card rounded-2xl border border-border/60 p-5 transition-shadow duration-200 hover:shadow-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-black text-[15px] text-foreground">
              {request.customerName || "—"}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground font-body mt-0.5">
            📱 +91 {request.mobile}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Info grid */}
      <div className="space-y-2 text-sm font-body">
        {/* Service */}
        <div className="flex items-start gap-2">
          <span
            className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs"
            style={{ background: "oklch(0.94 0.04 264)" }}
          >
            📋
          </span>
          <div>
            <span className="font-semibold text-foreground">
              {request.serviceName}
            </span>
            {request.serviceHindiName && (
              <span className="text-muted-foreground ml-1.5 text-xs">
                ({request.serviceHindiName})
              </span>
            )}
          </div>
        </div>

        {/* Address */}
        {fullAddress && (
          <div className="flex items-start gap-2">
            <span
              className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs"
              style={{ background: "oklch(0.94 0.04 264)" }}
            >
              📍
            </span>
            <span className="text-muted-foreground leading-snug">
              {fullAddress}
            </span>
          </div>
        )}

        {/* Documents */}
        <div className="flex items-start gap-2">
          <span
            className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs"
            style={{ background: "oklch(0.94 0.04 264)" }}
          >
            📎
          </span>
          {request.documents.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {request.documents.map((doc) => (
                <span
                  key={doc}
                  className="inline-block px-2 py-0.5 rounded-md text-xs font-medium font-body"
                  style={{
                    background: "oklch(0.93 0.03 264)",
                    color: "oklch(0.35 0.14 264)",
                  }}
                >
                  {doc}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs italic">
              No documents uploaded
            </span>
          )}
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-2">
          <span
            className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs"
            style={{ background: "oklch(0.94 0.04 264)" }}
          >
            🗓️
          </span>
          <span className="text-muted-foreground text-xs">
            {formatTimestamp(request.submittedAt)}
          </span>
        </div>

        {/* Additional details */}
        {(request.fatherName || request.dob || request.aadhaar) && (
          <div className="pt-1 mt-1 border-t border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
            {request.fatherName && (
              <div>
                <span className="font-semibold text-foreground/80">
                  Father/Husband:{" "}
                </span>
                {request.fatherName}
              </div>
            )}
            {request.dob && (
              <div>
                <span className="font-semibold text-foreground/80">DOB: </span>
                {request.dob}
              </div>
            )}
            {request.aadhaar && (
              <div>
                <span className="font-semibold text-foreground/80">
                  Aadhaar:{" "}
                </span>
                {request.aadhaar.replace(/(\d{4})/g, "$1 ").trim()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex gap-2.5 mt-4 pt-3 border-t border-border/40">
          <Button
            type="button"
            onClick={() => onAccept(request.id)}
            disabled={isUpdating}
            className="flex-1 h-9 rounded-xl text-sm font-semibold font-body border-0 text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: isUpdating
                ? "oklch(0.55 0.1 150)"
                : "linear-gradient(135deg, oklch(0.40 0.2 150), oklch(0.52 0.22 155))",
              boxShadow: isUpdating
                ? "none"
                : "0 3px 12px -3px oklch(0.45 0.2 150 / 0.45)",
            }}
          >
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                Accept
              </span>
            )}
          </Button>
          <Button
            type="button"
            onClick={() => onReject(request.id)}
            disabled={isUpdating}
            className="flex-1 h-9 rounded-xl text-sm font-semibold font-body border-0 text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: isUpdating
                ? "oklch(0.55 0.1 25)"
                : "linear-gradient(135deg, oklch(0.48 0.22 25), oklch(0.58 0.24 28))",
              boxShadow: isUpdating
                ? "none"
                : "0 3px 12px -3px oklch(0.52 0.22 25 / 0.45)",
            }}
          >
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <span className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                Reject
              </span>
            )}
          </Button>
        </div>
      )}

      {!isPending && (
        <div className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground font-body italic">
          {request.status === ServiceStatus.processing
            ? "✅ This request has been accepted and is being processed."
            : "❌ This request has been rejected."}
        </div>
      )}
    </motion.div>
  );
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { actor } = useActor();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = useCallback(
    async (silent = false) => {
      if (!actor) return;
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      try {
        const data = await actor.getAllServiceRequests();
        // Sort newest first
        const sorted = [...data].sort((a, b) => {
          const ta = Number(a.submittedAt / 1_000_000n);
          const tb = Number(b.submittedAt / 1_000_000n);
          return tb - ta;
        });
        setRequests(sorted);
      } catch {
        toast.error("Failed to load service requests.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [actor],
  );

  useEffect(() => {
    if (actor) {
      fetchRequests(false);
    }
  }, [actor, fetchRequests]);

  // Poll every 30 seconds
  useEffect(() => {
    if (!actor) return;
    const interval = setInterval(() => {
      fetchRequests(true);
    }, 30_000);
    return () => clearInterval(interval);
  }, [actor, fetchRequests]);

  async function handleAccept(id: string) {
    if (!actor) return;
    setUpdatingId(id);
    try {
      const success = await actor.updateRequestStatus(
        id,
        ServiceStatus.processing,
      );
      if (success) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: ServiceStatus.processing } : r,
          ),
        );
        toast.success("Request accepted — status updated to Processing.");
      } else {
        toast.error("Failed to update request status.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleReject(id: string) {
    if (!actor) return;
    setUpdatingId(id);
    try {
      const success = await actor.updateRequestStatus(
        id,
        ServiceStatus.rejected,
      );
      if (success) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: ServiceStatus.rejected } : r,
          ),
        );
        toast.success("Request rejected — customer will see updated status.");
      } else {
        toast.error("Failed to update request status.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("adminSession");
    onLogout();
    toast.success("Logged out from admin panel.");
  }

  // Stats
  const totalCount = requests.length;
  const pendingCount = requests.filter(
    (r) => r.status === ServiceStatus.pending,
  ).length;
  const processingCount = requests.filter(
    (r) => r.status === ServiceStatus.processing,
  ).length;
  const rejectedCount = requests.filter(
    (r) => r.status === ServiceStatus.rejected,
  ).length;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.96 0.01 290)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-sm"
        style={{
          background: "oklch(0.99 0 0 / 0.95)",
          borderColor: "oklch(0.88 0.04 280)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.28 0.22 280), oklch(0.42 0.25 295))",
              }}
            >
              <ShieldCheck className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <span className="font-display font-black text-[14px] tracking-tight text-foreground block truncate leading-none">
                Vijay Online Centre
              </span>
              <span
                className="text-[10px] font-bold font-body tracking-widest uppercase"
                style={{ color: "oklch(0.42 0.18 280)" }}
              >
                Admin Panel
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => fetchRequests(true)}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-1.5 text-xs font-semibold font-body text-muted-foreground hover:text-foreground transition-colors duration-150 p-2 rounded-lg hover:bg-muted/60 disabled:opacity-50"
              aria-label="Refresh requests"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                strokeWidth={2.5}
              />
              <span className="hidden sm:block">Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold font-body text-muted-foreground hover:text-destructive transition-colors duration-150 p-2 rounded-lg hover:bg-destructive/10"
              aria-label="Logout"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden xs:block">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {/* Page title */}
        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-2xl font-black text-foreground tracking-tight">
            Service Requests
          </h1>
          <p className="text-sm text-muted-foreground font-body mt-0.5">
            Manage and respond to customer applications
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          {[
            {
              label: "Total",
              count: totalCount,
              icon: Users,
              color: "oklch(0.35 0.18 264)",
              bg: "oklch(0.95 0.03 264)",
              border: "oklch(0.87 0.07 264)",
            },
            {
              label: "Pending",
              count: pendingCount,
              icon: Clock,
              color: "oklch(0.5 0.18 70)",
              bg: "oklch(0.97 0.05 80)",
              border: "oklch(0.88 0.1 80)",
            },
            {
              label: "Processing",
              count: processingCount,
              icon: CheckCircle2,
              color: "oklch(0.38 0.18 240)",
              bg: "oklch(0.96 0.04 230)",
              border: "oklch(0.85 0.09 230)",
            },
            {
              label: "Rejected",
              count: rejectedCount,
              icon: XCircle,
              color: "oklch(0.5 0.22 25)",
              bg: "oklch(0.97 0.04 25)",
              border: "oklch(0.88 0.09 25)",
            },
          ].map(({ label, count, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}20` }}
              >
                <Icon
                  className="w-4.5 h-4.5"
                  style={{ color }}
                  strokeWidth={2}
                />
              </div>
              <div>
                <p
                  className="font-display font-black text-xl leading-none"
                  style={{ color }}
                >
                  {isLoading ? "—" : count}
                </p>
                <p
                  className="text-xs font-semibold font-body mt-0.5"
                  style={{ color }}
                >
                  {label}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Requests List */}
        {isLoading ? (
          <div className="space-y-4">
            {(["sk-a", "sk-b", "sk-c"] as const).map((k) => (
              <RequestSkeleton key={k} />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-24 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 text-4xl"
              style={{ background: "oklch(0.95 0.04 280)" }}
            >
              <FileText
                className="w-9 h-9"
                style={{ color: "oklch(0.42 0.18 280)" }}
                strokeWidth={1.5}
              />
            </div>
            <h3 className="font-display font-black text-xl text-foreground mb-2">
              No requests yet
            </h3>
            <p className="text-muted-foreground font-body text-sm max-w-xs">
              Customer service requests will appear here once they start
              submitting applications.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  isUpdating={updatingId === request.id}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>

      {/* Footer */}
      <footer
        className="border-t py-4 px-4"
        style={{ borderColor: "oklch(0.88 0.04 280)" }}
      >
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
