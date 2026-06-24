import { Reveal } from "@/components/ui/reveal";

const STEPS = [
  {
    n: "01",
    title: "You name a token",
    body: "Paste a token address. That single input fans out to the whole council in parallel.",
  },
  {
    n: "02",
    title: "Four agents analyze independently",
    body: "Trust, Momentum, Volatility, and Liquidity each query their own source and return a score, a decision, a confidence, and a reason.",
  },
  {
    n: "03",
    title: "The moderator weighs the debate",
    body: "An LLM moderator reads all four verdicts, applies the fixed weights, and writes the reasoning in plain language.",
  },
  {
    n: "04",
    title: "One consensus decision lands",
    body: "A weighted score maps to Strong Buy, Buy, Hold, or Avoid — with confidence and a summary you can act on or override.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-24 py-24">
      <div className="container">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">How it works</span>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            From one address to one defensible decision.
          </h2>
        </Reveal>

        <div className="relative mt-16">
          {/* vertical spine */}
          <div className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-agent-trust via-agent-consensus to-agent-momentum md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-10">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.06}>
                <div
                  className={`relative flex items-start gap-6 md:w-1/2 ${
                    i % 2 === 0
                      ? "md:ml-auto md:flex-row md:pl-12"
                      : "md:mr-auto md:flex-row-reverse md:pr-12 md:text-right"
                  }`}
                >
                  <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border border-border bg-card font-mono text-sm font-semibold text-agent-consensus">
                    {step.n}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="font-display text-lg font-semibold">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
