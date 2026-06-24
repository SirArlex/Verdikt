import { Reveal } from "@/components/ui/reveal";
import { AGENTS } from "@/lib/agents";

export function AgentEcosystem() {
  return (
    <section id="agents" className="relative scroll-mt-24 py-24">
      <div className="container">
        <Reveal className="max-w-2xl">
          <span className="eyebrow">The council</span>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Four specialists. Each owns one question.
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Every agent holds a fixed weight in the final vote. Reputation
            dominates; the market-structure agents temper it.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {AGENTS.map((agent, i) => (
            <Reveal key={agent.id} delay={i * 0.08}>
              <div
                className="glass glass-hover group relative h-full overflow-hidden rounded-2xl p-7"
                style={
                  {
                    // expose the agent hue to children via a local var
                    ["--c" as string]: `var(${agent.colorVar})`,
                  } as React.CSSProperties
                }
              >
                {/* corner glow in the agent's own color */}
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl transition-opacity duration-300 group-hover:opacity-40"
                  style={{ background: "hsl(var(--c))" }}
                />

                <div className="flex items-start justify-between">
                  <span
                    className="grid h-12 w-12 place-items-center rounded-xl border"
                    style={{
                      borderColor: "hsl(var(--c) / 0.4)",
                      background: "hsl(var(--c) / 0.1)",
                    }}
                  >
                    <agent.icon
                      className="h-5 w-5"
                      style={{ color: "hsl(var(--c))" }}
                    />
                  </span>

                  <div className="text-right">
                    <div
                      className="font-mono text-2xl font-semibold tabular-nums"
                      style={{ color: "hsl(var(--c))" }}
                    >
                      {Math.round(agent.weight * 100)}%
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      weight
                    </div>
                  </div>
                </div>

                <h3 className="mt-6 font-display text-xl font-semibold">
                  {agent.name}
                </h3>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {agent.role} · {agent.source}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {agent.blurb}
                </p>

                {/* weight bar */}
                <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${agent.weight * 100}%`,
                      background: "hsl(var(--c))",
                    }}
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
