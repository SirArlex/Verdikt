import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative py-24">
      <div className="container">
        <Reveal>
          <div className="gradient-border overflow-hidden p-px">
            <div className="relative overflow-hidden rounded-[calc(var(--radius)-1px)] bg-card px-8 py-16 text-center sm:px-16">
              <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 mask-fade-b" />
              <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-agent-consensus/20 blur-[80px]" />

              <div className="relative">
                <h2 className="mx-auto max-w-xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  Stop trusting one number. Get a Verdikt.
                </h2>
                <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted-foreground">
                  Run a full multi-agent analysis in seconds — the verdicts, the
                  debate, and the reasoning, all in one view.
                </p>
                <Link href="/analysis" className="mt-8 inline-block">
                  <Button variant="primary" size="lg">
                    Run an analysis
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
