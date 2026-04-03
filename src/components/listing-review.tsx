"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

interface Issue {
  field: string;
  severity: "error" | "warning" | "tip";
  message: string;
}

interface ValidationResult {
  status: "good" | "needs_fixes" | "suspicious";
  score: number;
  issues: Issue[];
  corrections: Record<string, string>;
  summary: string;
  price_assessment: string;
}

interface ListingReviewProps {
  listing: {
    title: string;
    make: string;
    model: string;
    year: string;
    price: string;
    mileage: string;
    fuelType: string;
    transmission: string;
    bodyType: string;
    color: string;
    city: string;
    description: string;
    images: string[];
  };
  onCorrections: (corrections: Record<string, string>) => void;
  onApprove: () => void;
}

export function ListingReview({ listing, onCorrections, onApprove }: ListingReviewProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState("");

  const handleReview = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/validate-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listing),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        setError("Review failed. You can still publish.");
      }
    } catch {
      setError("Review failed. You can still publish.");
    }
    setLoading(false);
  };

  const applyCorrections = () => {
    if (result?.corrections) {
      onCorrections(result.corrections);
    }
  };

  const severityIcon = (s: string) => {
    switch (s) {
      case "error": return <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />;
      default: return <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "good": return "border-green-700/50 bg-green-900/10";
      case "needs_fixes": return "border-yellow-700/50 bg-yellow-900/10";
      case "suspicious": return "border-red-700/50 bg-red-900/10";
      default: return "border-border bg-card";
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 8) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

  if (!result && !loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" />
        <h3 className="font-bold text-foreground mb-2">AI Quality Review</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Before publishing, let AI check your listing for errors, missing info, and pricing.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={handleReview} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Review My Listing
          </Button>
          <Button variant="outline" onClick={onApprove}>
            Skip & Publish
          </Button>
        </div>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
        <Loader2 className="h-8 w-8 mx-auto mb-3 text-primary animate-spin" />
        <h3 className="font-bold text-foreground mb-1">🤖 Reviewing your listing...</h3>
        <p className="text-muted-foreground text-sm">Checking details, price, mileage, and photo match</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className={`rounded-xl border p-6 ${statusColor(result.status)}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {result.status === "good" ? (
            <CheckCircle className="h-6 w-6 text-green-400" />
          ) : result.status === "suspicious" ? (
            <XCircle className="h-6 w-6 text-red-400" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
          )}
          <div>
            <h3 className="font-bold text-foreground">
              {result.status === "good" ? "Listing looks great!" :
               result.status === "suspicious" ? "Listing needs attention" :
               "A few things to fix"}
            </h3>
            <p className="text-sm text-muted-foreground">{result.summary}</p>
          </div>
        </div>
        <div className="text-center">
          <span className={`text-3xl font-extrabold ${scoreColor(result.score)}`}>{result.score}</span>
          <span className="text-muted-foreground text-xs block">/10</span>
        </div>
      </div>

      {/* Price Assessment */}
      {result.price_assessment && (
        <div className="rounded-lg bg-secondary/50 p-3 mb-4">
          <p className="text-sm"><span className="font-medium text-foreground">💰 Price:</span> <span className="text-muted-foreground">{result.price_assessment}</span></p>
        </div>
      )}

      {/* Issues */}
      {result.issues && result.issues.length > 0 && (
        <div className="space-y-2 mb-4">
          {result.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-secondary/30 p-3">
              {severityIcon(issue.severity)}
              <div>
                <span className="text-xs text-muted-foreground uppercase">{issue.field}</span>
                <p className="text-sm text-foreground">{issue.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {result.corrections && Object.keys(result.corrections).length > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={applyCorrections}>
            <Sparkles className="h-4 w-4" />
            Apply AI Fixes ({Object.keys(result.corrections).length})
          </Button>
        )}
        <Button size="sm" onClick={onApprove} className="gap-2">
          <CheckCircle className="h-4 w-4" />
          {result.status === "good" ? "Publish Listing" : "Publish Anyway"}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReview}>
          Re-check
        </Button>
      </div>
    </div>
  );
}
