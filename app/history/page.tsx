import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAnalyses, isSupabaseConfigured } from "@/services/supabase";
import { HistoryList } from "@/components/history/history-list";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "History — Verdikt",
};

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const analyses = await getAnalyses(50);

  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-24">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-25" />

      <div className="container relative max-w-4xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Past verdicts</span>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Verdict history
            </h1>
            <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
              Every verdict, saved with its full agent breakdown.
            </p>
          </div>
          <Link href="/analysis">
            <Button variant="primary">
              New analysis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {!isSupabaseConfigured && (
          <div className="glass mb-6 rounded-2xl border-agent-volatility/30 p-5">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-agent-volatility">
                Supabase not configured.
              </span>{" "}
              Add your Supabase URL and anon key to{" "}
              <code className="font-mono">.env.local</code> and run{" "}
              <code className="font-mono">supabase/schema.sql</code> to persist verdicts.
            </p>
          </div>
        )}

        <HistoryList analyses={analyses} />
      </div>
    </section>
  );
}
