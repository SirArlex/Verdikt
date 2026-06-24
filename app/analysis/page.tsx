import { AnalysisClient } from "@/components/analysis/analysis-client";

export const metadata = {
  title: "Run analysis — Verdikt",
};

export default function AnalysisPage() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-24">
      <div className="pointer-events-none absolute inset-0 bg-grid mask-fade-b opacity-30" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-agent-trust/10 blur-[120px]" />

      <div className="container relative max-w-4xl">
        <div className="mb-8 text-center">
          <span className="eyebrow">Live council</span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Convene the council
          </h1>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground">
            Enter a trading pair. Four agents analyze it independently, then a
            moderator resolves a single verdict.
          </p>
        </div>

        <AnalysisClient />
      </div>
    </section>
  );
}
