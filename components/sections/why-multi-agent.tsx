import { Reveal } from "@/components/ui/reveal";
import { Check } from "lucide-react";

const POINTS = [
  {
    k: "Independence",
    v: "Each agent reads its own data source and reaches its own verdict before anyone compares notes — so errors don't cascade.",
  },
  {
    k: "Weighted trust",
    v: "Not every voice counts equally. Reputation carries more weight than a momentary price spike, and the weights are explicit.",
  },
  {
    k: "Visible reasoning",
    v: "Every score ships with a sentence of justification. You can audit the call, not just receive it.",
  },
  {
    k: "Built-in dissent",
    v: "When the Volatility Agent disagrees with the crowd, that disagreement shows up in the final confidence — not buried.",
  },
];

export function WhyMultiAgent() {
  return (
    <section className="relative py-24">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="container grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <span className="eyebrow">Why a council</span>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            A decision survives more scrutiny when it has to survive a debate.
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
            ConsensusAI borrows the one thing single-model systems throw away:
            structured disagreement. Four narrow specialists are easier to
            trust — and easier to correct — than one model pretending to know
            everything.
          </p>
        </Reveal>

        <div className="grid gap-3">
          {POINTS.map((p, i) => (
            <Reveal key={p.k} delay={i * 0.08}>
              <div className="glass flex gap-4 rounded-2xl p-5">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-agent-consensus/15">
                  <Check className="h-3.5 w-3.5 text-agent-consensus" />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold">{p.k}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {p.v}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
