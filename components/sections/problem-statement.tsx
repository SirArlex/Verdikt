import { Reveal } from "@/components/ui/reveal";
import { AlertTriangle, EyeOff, Zap } from "lucide-react";

const PROBLEMS = [
  {
    icon: Zap,
    title: "Single signals overfit",
    body: "One indicator catches one pattern. The moment the market changes shape, that edge quietly turns into noise.",
  },
  {
    icon: EyeOff,
    title: "Black-box scores hide risk",
    body: "A lone 0–100 number tells you what to do, never why. When it's wrong, there's nothing to inspect or override.",
  },
  {
    icon: AlertTriangle,
    title: "No disagreement, no safety",
    body: "Real analysts argue before they commit. A system with no dissent has no way to flag the trade it shouldn't take.",
  },
];

export function ProblemStatement() {
  return (
    <section className="relative py-24">
      <div className="container">
        <Reveal>
          <span className="eyebrow">The problem</span>
          <h2 className="mt-5 max-w-2xl font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Most trading agents bet everything on a single point of view.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PROBLEMS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <div className="glass glass-hover h-full rounded-2xl p-7">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-secondary/40">
                  <p.icon className="h-5 w-5 text-muted-foreground" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
